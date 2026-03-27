"use client";

import { Badge } from "@/components/ui/badge";
import type { ModelSettings, ProviderConfig } from "@/lib/chat-settings";
import { ModelSelectorDropdown } from "./model-selector-dropdown";

export function ModelSelector(props: {
  readonly providers: ProviderConfig[];
  readonly settings: ModelSettings;
  readonly onSettingsChange: (patch: Partial<ModelSettings>) => void;
  readonly isLoading?: boolean;
  readonly error?: string | null;
  readonly disabled?: boolean;
  readonly className?: string;
}) {
  if (props.isLoading) {
    return (
      <Badge variant="outline" className="animate-pulse text-xs h-8">
        Loading...
      </Badge>
    );
  }

  if (props.error) {
    return (
      <Badge variant="destructive" className="text-xs h-8">
        {props.error}
      </Badge>
    );
  }

  return (
    <ModelSelectorDropdown
      providers={props.providers}
      settings={props.settings}
      onSettingsChange={props.onSettingsChange}
      disabled={props.disabled}
      className={props.className}
    />
  );
}
