"use client";

import { useEffect, useState, useCallback, useOptimistic, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, CheckCircle2, Clock, Edit, History, Loader2, Play, Plus, RefreshCw, Trash2, XCircle } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { formatRelativeTime } from "@/lib/time-utils";
import { getSchedules, createSchedule, updateSchedule, deleteSchedule, triggerSchedule, getScheduleRuns, getProjectScenarios, type ScheduledExecution, type ScheduledExecutionRun, type CreateScheduleRequest, type StoredScenario } from "@/lib/services";
import { useProject } from "@/lib/project-context";
import { ScheduleFormDialog } from "./schedule-form-dialog";
import { RunHistoryDialog } from "./run-history-dialog";

type ScheduleAction = { type: "delete"; id: string } | { type: "toggle"; id: string; enabled: boolean };

export default function SchedulesPage() {
  const { selectedProject } = useProject();
  const [schedules, setSchedules] = useState<ScheduledExecution[]>([]);
  const [scenarios, setScenarios] = useState<StoredScenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [optimisticSchedules, updateOptimistic] = useOptimistic(
    schedules,
    (state: ScheduledExecution[], action: ScheduleAction) => {
      if (action.type === "delete") return state.filter((s) => s.id !== action.id);
      return state.map((s) =>
        s.id === action.id ? { ...s, enabled: action.enabled } : s,
      );
    },
  );

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduledExecution | null>(null);
  const [deletingSchedule, setDeletingSchedule] = useState<ScheduledExecution | null>(null);
  const [runsSchedule, setRunsSchedule] = useState<ScheduledExecution | null>(null);
  const [runs, setRuns] = useState<ScheduledExecutionRun[]>([]);
  const [runsLoading, setRunsLoading] = useState(false);
  const [triggeringId, setTriggeringId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!selectedProject) {
      setLoading(false);
      setSchedules([]);
      setScenarios([]);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const [schedulesData, scenariosData] = await Promise.all([
        getSchedules(selectedProject.id),
        getProjectScenarios(selectedProject.id),
      ]);
      setSchedules(schedulesData);
      setScenarios(scenariosData?.content ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load schedules");
    } finally {
      setLoading(false);
    }
  }, [selectedProject]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleToggle = async (schedule: ScheduledExecution) => {
    if (!selectedProject) return;
    const newEnabled = !schedule.enabled;
    startTransition(() => {
      updateOptimistic({ type: "toggle", id: schedule.id, enabled: newEnabled });
    });
    try {
      const updated = await updateSchedule(selectedProject.id, schedule.id, { enabled: newEnabled });
      setSchedules((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    } catch { fetchData(); }
  };

  const handleTrigger = async (schedule: ScheduledExecution) => {
    if (!selectedProject) return;
    setTriggeringId(schedule.id);
    try { await triggerSchedule(selectedProject.id, schedule.id); } catch { /* */ }
    finally { setTriggeringId(null); }
  };

  const handleDelete = async () => {
    if (!selectedProject || !deletingSchedule) return;
    const id = deletingSchedule.id;
    startTransition(() => { updateOptimistic({ type: "delete", id }); });
    setDeletingSchedule(null);
    try {
      await deleteSchedule(selectedProject.id, id);
      setSchedules((prev) => prev.filter((s) => s.id !== id));
    } catch { fetchData(); }
  };

  const handleViewRuns = async (schedule: ScheduledExecution) => {
    if (!selectedProject) return;
    setRunsSchedule(schedule);
    setRunsLoading(true);
    try {
      setRuns(await getScheduleRuns(selectedProject.id, schedule.id));
    } catch { setRuns([]); }
    finally { setRunsLoading(false); }
  };

  const handleCreateOrUpdate = async (data: CreateScheduleRequest) => {
    if (!selectedProject) return;
    if (editingSchedule) {
      const updated = await updateSchedule(selectedProject.id, editingSchedule.id, data);
      setSchedules((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    } else {
      const created = await createSchedule(selectedProject.id, data);
      setSchedules((prev) => [...prev, created]);
    }
    setShowCreateDialog(false);
    setEditingSchedule(null);
  };

  const statusBadge = (s: ScheduledExecution) => {
    if (!s.lastRunStatus) return <Badge variant="secondary">No runs</Badge>;
    const isSuccess = s.lastRunStatus === "SUCCESS";
    return (
      <Badge variant={isSuccess ? "default" : "destructive"} className="gap-1">
        {isSuccess ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
        {s.lastRunStatus.replace("_", " ")}
      </Badge>
    );
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
        <Clock className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">Schedules</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={fetchData} disabled={isPending}>
            <RefreshCw className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
          </Button>
          <Button onClick={() => { setEditingSchedule(null); setShowCreateDialog(true); }}>
            <Plus className="mr-2 h-4 w-4" /> New Schedule
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="p-4 text-destructive">{error}</CardContent>
        </Card>
      )}

      {optimisticSchedules.length === 0 && !error && (
        <Card className="flex flex-col items-center justify-center py-16">
          <Clock className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">No schedules yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a schedule to automate your test executions.
          </p>
          <Button className="mt-4" onClick={() => { setEditingSchedule(null); setShowCreateDialog(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Create Schedule
          </Button>
        </Card>
      )}

      <div className="grid gap-4">
        {optimisticSchedules.map((schedule) => (
          <Card key={schedule.id}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">{schedule.name}</CardTitle>
                  {statusBadge(schedule)}
                  <Badge variant={schedule.enabled ? "default" : "outline"}>
                    {schedule.enabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                {schedule.description && (
                  <CardDescription className="mt-1">{schedule.description}</CardDescription>
                )}
              </div>
              <Switch
                checked={schedule.enabled}
                onCheckedChange={() => handleToggle(schedule)}
                aria-label="Toggle schedule"
              />
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <code className="rounded bg-muted px-1 text-xs">{schedule.cronExpression}</code>
                </span>
                <span>{schedule.scenarioIds.length} scenario(s)</span>
                {schedule.nextRunAt && <span>Next: {formatRelativeTime(schedule.nextRunAt)}</span>}
                {schedule.lastRunAt && <span>Last: {formatRelativeTime(schedule.lastRunAt)}</span>}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => handleTrigger(schedule)} disabled={triggeringId === schedule.id}>
                  {triggeringId === schedule.id ? <><Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> Running…</> : <><Play className="mr-1 h-3.5 w-3.5" /> Run Now</>}
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleViewRuns(schedule)}>
                  <History className="mr-1 h-3.5 w-3.5" /> Runs
                </Button>
                <Button size="sm" variant="outline" onClick={() => { setEditingSchedule(schedule); setShowCreateDialog(true); }}>
                  <Edit className="mr-1 h-3.5 w-3.5" /> Edit
                </Button>
                <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => setDeletingSchedule(schedule)}>
                  <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ScheduleFormDialog
        open={showCreateDialog}
        onOpenChange={(open) => { setShowCreateDialog(open); if (!open) setEditingSchedule(null); }}
        schedule={editingSchedule}
        scenarios={scenarios}
        onSubmit={handleCreateOrUpdate}
      />

      <Dialog open={!!deletingSchedule} onOpenChange={(open) => { if (!open) setDeletingSchedule(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Schedule</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{deletingSchedule?.name}&rdquo;?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingSchedule(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <RunHistoryDialog
        schedule={runsSchedule}
        runs={runs}
        loading={runsLoading}
        onOpenChange={(open) => { if (!open) setRunsSchedule(null); }}
      />
    </div>
  );
}
