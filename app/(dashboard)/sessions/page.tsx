"use client";

/**
 * Sessions Page
 *
 * Lists Copilot SDK sessions with resume and delete actions.
 */

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Loader2,
  RefreshCw,
  Sparkles,
  Trash2,
  MessageSquare,
} from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { formatRelativeTime } from "@/lib/time-utils";

interface SessionInfo {
  id: string;
  title?: string;
  createdAt?: string;
  lastActivityAt?: string;
}

export default function SessionsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingSession, setDeletingSession] = useState<SessionInfo | null>(
    null,
  );

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/copilot/sessions");
      if (!res.ok) throw new Error("Failed to fetch sessions");
      const data = await res.json();
      setSessions(data.sessions ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sessions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleResume = (session: SessionInfo) => {
    router.push(`/chat?session=${session.id}`);
  };

  const handleDelete = async () => {
    if (!deletingSession) return;
    try {
      await fetch(`/api/copilot/sessions/${deletingSession.id}`, {
        method: "DELETE",
      });
      setSessions((prev) => prev.filter((s) => s.id !== deletingSession.id));
    } catch {
      setError("Failed to delete session");
    } finally {
      setDeletingSession(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-6 overflow-auto p-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-6" />
        <Sparkles className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">Sessions</h1>
        <div className="ml-auto">
          <Button variant="outline" size="icon" onClick={fetchSessions}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="p-4 text-destructive">{error}</CardContent>
        </Card>
      )}

      {sessions.length === 0 && !error && (
        <Card className="flex flex-col items-center justify-center py-16">
          <MessageSquare className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">No sessions yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Start a chat to create your first session.
          </p>
          <Button className="mt-4" onClick={() => router.push("/chat")}>
            <MessageSquare className="mr-2 h-4 w-4" /> Start Chat
          </Button>
        </Card>
      )}

      <div className="grid gap-4">
        {sessions.map((session) => (
          <Card key={session.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base">
                {session.title || session.id.slice(0, 20)}
              </CardTitle>
              <Badge variant="secondary">
                {formatRelativeTime(session.lastActivityAt)}
              </Badge>
            </CardHeader>
            <CardContent className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleResume(session)}
              >
                <MessageSquare className="mr-1 h-3.5 w-3.5" /> Resume
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-destructive hover:text-destructive"
                onClick={() => setDeletingSession(session)}
              >
                <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog
        open={!!deletingSession}
        onOpenChange={(open) => {
          if (!open) setDeletingSession(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Session</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this session? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingSession(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
