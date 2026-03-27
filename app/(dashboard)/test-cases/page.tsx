"use client";

/**
 * Test Cases Page
 *
 * Lists test scenarios with run, delete, and status display.
 */

import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CheckCircle2,
  Loader2,
  Play,
  RefreshCw,
  Search,
  TestTube2,
  Trash2,
  XCircle,
} from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  getOrCreateDefaultProject,
  getProjectScenarios,
  deleteScenario,
  runScenario,
  type StoredScenario,
  type ExecutionResult,
} from "@/lib/services";

const STATUS_MAP: Record<
  string,
  { variant: "default" | "destructive" | "secondary"; label: string }
> = {
  VALIDATED: { variant: "default", label: "Passed" },
  FAILED: { variant: "destructive", label: "Failed" },
  CREATED: { variant: "secondary", label: "Created" },
  RUNNING: { variant: "secondary", label: "Running" },
};

export default function TestCasesPage() {
  const [scenarios, setScenarios] = useState<StoredScenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [runningId, setRunningId] = useState<string | null>(null);
  const [deletingScenario, setDeletingScenario] =
    useState<StoredScenario | null>(null);
  const [executionResult, setExecutionResult] =
    useState<ExecutionResult | null>(null);

  const fetchScenarios = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const project = await getOrCreateDefaultProject();
      const { content } = await getProjectScenarios(project.id);
      setScenarios(content);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScenarios();
  }, [fetchScenarios]);

  const handleRun = async (scenario: StoredScenario) => {
    setRunningId(scenario.id);
    try {
      const result = await runScenario(scenario.id);
      setExecutionResult(result);
      fetchScenarios();
    } catch {
      setError("Failed to run scenario");
    } finally {
      setRunningId(null);
    }
  };

  const handleDelete = async () => {
    if (!deletingScenario) return;
    try {
      await deleteScenario(deletingScenario.id);
      setScenarios((prev) =>
        prev.filter((s) => s.id !== deletingScenario.id),
      );
    } catch {
      setError("Failed to delete scenario");
    } finally {
      setDeletingScenario(null);
    }
  };

  const filtered = scenarios.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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
        <TestTube2 className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">Test Cases</h1>
        <div className="ml-auto">
          <Button variant="outline" size="icon" onClick={fetchScenarios}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search test cases…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="p-4 text-destructive">{error}</CardContent>
        </Card>
      )}

      {filtered.length === 0 && !error && (
        <Card className="flex flex-col items-center justify-center py-16">
          <TestTube2 className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">No test cases</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Use the AI Chat to create test scenarios.
          </p>
        </Card>
      )}

      <div className="grid gap-3">
        {filtered.map((scenario) => {
          const status =
            STATUS_MAP[scenario.status] ?? STATUS_MAP.CREATED;
          return (
            <Card key={scenario.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-sm font-medium">
                    {scenario.name}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    v{scenario.version ?? 1} · Updated{" "}
                    {new Date(scenario.updatedAt).toLocaleDateString()}
                  </CardDescription>
                </div>
                <Badge variant={status.variant}>{status.label}</Badge>
              </CardHeader>
              <CardContent className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRun(scenario)}
                  disabled={runningId === scenario.id}
                >
                  {runningId === scenario.id ? (
                    <>
                      <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                      Running…
                    </>
                  ) : (
                    <>
                      <Play className="mr-1 h-3.5 w-3.5" /> Run
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setDeletingScenario(scenario)}
                >
                  <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Delete Confirmation */}
      <Dialog
        open={!!deletingScenario}
        onOpenChange={(open) => {
          if (!open) setDeletingScenario(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Test Case</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;
              {deletingScenario?.name}&rdquo;?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingScenario(null)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Execution Result Dialog */}
      <Dialog
        open={!!executionResult}
        onOpenChange={(open) => {
          if (!open) setExecutionResult(null);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Execution Result
              {executionResult?.status === "PASSED" ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-destructive" />
              )}
            </DialogTitle>
          </DialogHeader>
          {executionResult && (
            <div className="space-y-2 text-sm">
              <p>
                Status:{" "}
                <Badge
                  variant={
                    executionResult.status === "PASSED"
                      ? "default"
                      : "destructive"
                  }
                >
                  {executionResult.status}
                </Badge>
              </p>
              <p>Steps: {executionResult.steps.length}</p>
              {executionResult.errorMessage && (
                <p className="text-destructive">
                  {executionResult.errorMessage}
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
