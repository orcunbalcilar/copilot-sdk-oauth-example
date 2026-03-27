"use client";

import { useCallback, useMemo } from "react";
import type { ModelSettings, ProviderConfig } from "@/lib/chat-settings";

export function useModelCallbacks(
  providers: ProviderConfig[],
  settings: ModelSettings,
  onSettingsChange: (patch: Partial<ModelSettings>) => void,
) {
  const currentProvider = providers.find(
    (p) => p.id === settings.providerId,
  );

  const models = useMemo(
    () =>
      currentProvider
        ? Object.entries(currentProvider.models).map(([id, name]) => ({
            id,
            name,
            supportsReasoning: id.includes("reasoning") || id.includes("r1"),
          }))
        : [],
    [currentProvider],
  );

  const currentModelName =
    models.find((m) => m.id === settings.modelId)?.name ?? settings.modelId;

  const handleProviderChange = useCallback(
    (providerId: string) => {
      const provider = providers.find((p) => p.id === providerId);
      if (!provider) return;
      onSettingsChange({
        providerId,
        modelId: provider.defaultModel,
        enableReasoning: provider.supportsReasoning
          ? settings.enableReasoning
          : false,
      });
    },
    [providers, settings.enableReasoning, onSettingsChange],
  );

  const handleModelChange = useCallback(
    (modelId: string) => {
      const model = models.find((m) => m.id === modelId);
      onSettingsChange({
        modelId,
        enableReasoning: model?.supportsReasoning || false,
      });
    },
    [models, onSettingsChange],
  );

  return {
    currentProvider,
    models,
    currentModelName,
    handleProviderChange,
    handleModelChange,
  };
}
