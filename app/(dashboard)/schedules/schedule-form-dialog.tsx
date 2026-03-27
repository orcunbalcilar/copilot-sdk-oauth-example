"use client";

/**
 * Schedule Form Dialog
 *
 * Create/edit dialog for scheduled test executions.
 */

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import type { ScheduledExecution, CreateScheduleRequest } from "@/lib/services";
import type { StoredScenario } from "@/lib/services";

const CRON_PRESETS = [
  { label: "Every 30 minutes", value: "0 */30 * * * *" },
  { label: "Every hour", value: "0 0 * * * *" },
  { label: "Daily at 9:00 AM", value: "0 0 9 * * *" },
  { label: "Weekdays at 9:00 AM", value: "0 0 9 * * 1-5" },
  { label: "Weekly on Monday", value: "0 0 9 * * 1" },
  { label: "Every 6 hours", value: "0 0 */6 * * *" },
  { label: "Custom", value: "custom" },
] as const;

interface ScheduleFormDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly schedule: ScheduledExecution | null;
  readonly scenarios: StoredScenario[];
  readonly onSubmit: (data: CreateScheduleRequest) => Promise<void>;
}

export function ScheduleFormDialog({
  open,
  onOpenChange,
  schedule,
  scenarios,
  onSubmit,
}: ScheduleFormDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [cronPreset, setCronPreset] = useState("0 0 9 * * *");
  const [customCron, setCustomCron] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [importToReportPortal, setImportToReportPortal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [scenarioSearch, setScenarioSearch] = useState("");

  useEffect(() => {
    if (open) {
      if (schedule) {
        setName(schedule.name);
        setDescription(schedule.description ?? "");
        setSelectedIds(schedule.scenarioIds);
        const preset = CRON_PRESETS.find(
          (p) => p.value === schedule.cronExpression,
        );
        if (preset && preset.value !== "custom") {
          setCronPreset(schedule.cronExpression);
          setCustomCron("");
        } else {
          setCronPreset("custom");
          setCustomCron(schedule.cronExpression);
        }
        setEnabled(schedule.enabled);
        setImportToReportPortal(schedule.importToReportPortal);
      } else {
        setName("");
        setDescription("");
        setSelectedIds([]);
        setCronPreset("0 0 9 * * *");
        setCustomCron("");
        setEnabled(true);
        setImportToReportPortal(false);
      }
      setScenarioSearch("");
    }
  }, [open, schedule]);

  const cronExpression = cronPreset === "custom" ? customCron : cronPreset;

  const toggleScenario = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const handleSubmit = async () => {
    if (!name.trim() || selectedIds.length === 0 || !cronExpression.trim())
      return;
    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
        scenarioIds: selectedIds,
        cronExpression,
        enabled,
        importToReportPortal,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredScenarios = scenarios.filter((s) =>
    s.name.toLowerCase().includes(scenarioSearch.toLowerCase()),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-auto">
        <DialogHeader>
          <DialogTitle>
            {schedule ? "Edit Schedule" : "Create Schedule"}
          </DialogTitle>
          <DialogDescription>
            {schedule
              ? "Update the schedule configuration."
              : "Set up an automated test execution schedule."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sched-name">Name</Label>
            <Input
              id="sched-name"
              placeholder="Nightly regression"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sched-desc">Description</Label>
            <Textarea
              id="sched-desc"
              placeholder="Optional description…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Frequency</Label>
            <Select value={cronPreset} onValueChange={(v) => setCronPreset(v ?? "0 0 9 * * *")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CRON_PRESETS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {cronPreset === "custom" && (
              <Input
                placeholder="0 */2 * * *"
                value={customCron}
                onChange={(e) => setCustomCron(e.target.value)}
              />
            )}
            {cronExpression && (
              <p className="text-xs text-muted-foreground">
                Cron:{" "}
                <code className="rounded bg-muted px-1">{cronExpression}</code>
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Scenarios ({selectedIds.length} selected)</Label>
            <Input
              placeholder="Search scenarios…"
              value={scenarioSearch}
              onChange={(e) => setScenarioSearch(e.target.value)}
            />
            <div className="max-h-40 overflow-auto rounded-md border p-2">
              {filteredScenarios.length === 0 ? (
                <p className="py-2 text-center text-sm text-muted-foreground">
                  No scenarios available
                </p>
              ) : (
                filteredScenarios.map((s) => (
                  <label
                    key={s.id}
                    className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 hover:bg-muted"
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(s.id)}
                      onChange={() => toggleScenario(s.id)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <span className="text-sm">{s.name}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="sched-enabled">Enabled</Label>
            <Switch
              id="sched-enabled"
              checked={enabled}
              onCheckedChange={setEnabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="sched-rp">Import to ReportPortal</Label>
            <Switch
              id="sched-rp"
              checked={importToReportPortal}
              onCheckedChange={setImportToReportPortal}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {schedule ? "Save Changes" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
