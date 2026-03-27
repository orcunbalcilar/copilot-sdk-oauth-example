"use client";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import type { ScheduledExecution, ScheduledExecutionRun } from "@/lib/services";

interface RunHistoryDialogProps {
  schedule: ScheduledExecution | null;
  runs: ScheduledExecutionRun[];
  loading: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RunHistoryDialog({
  schedule,
  runs,
  loading,
  onOpenChange,
}: RunHistoryDialogProps) {
  return (
    <Dialog open={!!schedule} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Run History — {schedule?.name}</DialogTitle>
          <DialogDescription>Recent execution runs.</DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : runs.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No runs yet.</p>
        ) : (
          <div className="max-h-96 space-y-3 overflow-auto">
            {runs.map((run) => (
              <Card key={run.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{new Date(run.startedAt).toLocaleString()}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{run.totalScenarios} total</span>
                      <span className="text-green-600">{run.passedScenarios} passed</span>
                      <span className="text-red-600">{run.failedScenarios} failed</span>
                    </div>
                  </div>
                  <Badge variant={run.failedScenarios === 0 ? "default" : "destructive"}>
                    {run.completedAt ? (run.failedScenarios === 0 ? "Passed" : "Failed") : "Running"}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
