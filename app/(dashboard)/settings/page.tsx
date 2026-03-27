"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";
import { useModelSettings } from "@/hooks/use-model-settings";
import { DEFAULT_MODEL_SETTINGS } from "@/lib/chat-settings";
import type { ProviderConfig } from "@/lib/chat-settings";
import { Settings, RotateCcw, Sparkles } from "lucide-react";

function SettingRow(props: {
  readonly label: string;
  readonly description: string;
  readonly children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="space-y-0.5">
        <p className="text-sm font-medium">{props.label}</p>
        <p className="text-xs text-muted-foreground">{props.description}</p>
      </div>
      <div className="shrink-0">{props.children}</div>
    </div>
  );
}

function ProviderSection(props: {
  readonly providers: readonly ProviderConfig[];
  readonly providerId: string;
  readonly modelId: string;
  readonly onProviderChange: (id: string | null) => void;
  readonly onModelChange: (id: string | null) => void;
}) {
  const currentProvider = props.providers.find(
    (p) => p.id === props.providerId,
  );
  const models = currentProvider
    ? Object.entries(currentProvider.models)
    : [];

  return (
    <>
      <SettingRow
        label="LLM Provider"
        description="Select the AI provider for chat completions"
      >
        <Select value={props.providerId} onValueChange={props.onProviderChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select provider" />
          </SelectTrigger>
          <SelectContent>
            {props.providers.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SettingRow>
      <Separator />
      <SettingRow
        label="Model"
        description="Choose the model for generating responses"
      >
        <Select value={props.modelId} onValueChange={props.onModelChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select model" />
          </SelectTrigger>
          <SelectContent>
            {models.map(([id, name]) => (
              <SelectItem key={id} value={id}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SettingRow>
    </>
  );
}

export default function SettingsPage() {
  const ms = useModelSettings(DEFAULT_MODEL_SETTINGS);

  const handleProviderChange = (providerId: string | null) => {
    if (!providerId) return;
    const provider = ms.providers.find((p) => p.id === providerId);
    ms.updateSettings({
      providerId,
      modelId: provider?.defaultModel ?? "",
      enableReasoning: false,
    });
  };

  const handleReset = () => {
    ms.updateSettings(DEFAULT_MODEL_SETTINGS);
  };

  const currentProvider = ms.providers.find(
    (p) => p.id === ms.settings.providerId,
  );

  return (
    <div className="flex h-svh flex-col">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <Settings className="size-5 text-primary" />
          <h1 className="text-base font-semibold tracking-tight">Settings</h1>
        </div>
        <Button variant="ghost" size="sm" onClick={handleReset}>
          <RotateCcw className="mr-1.5 size-3.5" />
          Reset
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl space-y-6 p-6">
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <h2 className="text-sm font-semibold">AI Provider</h2>
            </div>
            {ms.isLoading ? (
              <p className="text-sm text-muted-foreground">
                Loading providers...
              </p>
            ) : ms.error ? (
              <p className="text-sm text-destructive">{ms.error}</p>
            ) : (
              <ProviderSection
                providers={ms.providers}
                providerId={ms.settings.providerId}
                modelId={ms.settings.modelId}
                onProviderChange={handleProviderChange}
                onModelChange={(modelId) =>
                  ms.updateSettings({ modelId: modelId ?? undefined })
                }
              />
            )}
          </Card>

          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <Settings className="size-4 text-primary" />
              <h2 className="text-sm font-semibold">Agent Behavior</h2>
            </div>
            <SettingRow
              label="Extended Thinking"
              description={
                currentProvider?.supportsReasoning
                  ? "Enable reasoning mode for complex tasks"
                  : "Not supported by current provider"
              }
            >
              <Switch
                checked={ms.settings.enableReasoning}
                onCheckedChange={(checked) =>
                  ms.updateSettings({ enableReasoning: checked })
                }
                disabled={!currentProvider?.supportsReasoning}
              />
            </SettingRow>
          </Card>
        </div>
      </div>
    </div>
  );
}
