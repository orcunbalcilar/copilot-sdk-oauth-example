"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { ModelSettings, ProviderConfig } from "@/lib/chat-settings";
import { useModelCallbacks } from "@/hooks/use-model-callbacks";
import {
  ProviderSection,
  ModelSection,
  TemperatureControl,
  ReasoningToggle,
  TriggerContent,
} from "./model-selector-parts";

export function ModelSelectorDropdown(props: {
  readonly providers: ProviderConfig[];
  readonly settings: ModelSettings;
  readonly onSettingsChange: (patch: Partial<ModelSettings>) => void;
  readonly disabled?: boolean;
  readonly className?: string;
}) {
  const { providers, settings, onSettingsChange } = props;
  const ctx = useModelCallbacks(providers, settings, onSettingsChange);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "inline-flex items-center gap-1.5 h-8 px-2 text-xs",
          "text-muted-foreground hover:text-foreground",
          "rounded-md hover:bg-accent transition-colors cursor-pointer",
          props.className,
        )}
        disabled={props.disabled}
      >
        <TriggerContent currentModelName={ctx.currentModelName} enableReasoning={settings.enableReasoning} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <ProviderSection providers={providers} selected={settings.providerId} onChange={ctx.handleProviderChange} />
        <ModelSection models={ctx.models} selected={settings.modelId} onChange={ctx.handleModelChange} />
        <DropdownMenuSeparator />
        <TemperatureControl value={settings.temperature} onChange={(t) => onSettingsChange({ temperature: t })} />
        <DropdownMenuSeparator />
        <ReasoningToggle enabled={settings.enableReasoning} supported={ctx.currentProvider?.supportsReasoning ?? false} onChange={(r) => onSettingsChange({ enableReasoning: r })} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
