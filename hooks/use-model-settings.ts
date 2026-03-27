"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import type { ModelSettings, ProviderConfig } from "@/lib/chat-settings";

const STORAGE_KEY = "restflow-model-settings";

interface UseModelSettingsReturn {
  providers: ProviderConfig[];
  isLoading: boolean;
  error: string | null;
  settings: ModelSettings;
  updateSettings: (patch: Partial<ModelSettings>) => void;
}

export function useModelSettings(
  initial: ModelSettings,
): UseModelSettingsReturn {
  const [providers, setProviders] = useState<ProviderConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<ModelSettings>(initial);
  const initialized = useRef(false);

  useEffect(() => {
    async function fetchProviders() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/chat?action=providers");
        if (!res.ok) throw new Error("Failed to fetch providers");
        const data = await res.json();
        setProviders(data.providers);

        if (!initialized.current) {
          initialized.current = true;
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved) {
            const parsed = JSON.parse(saved) as Partial<ModelSettings>;
            const provider = data.providers.find(
              (p: ProviderConfig) => p.id === parsed.providerId,
            );
            if (provider) {
              setSettings((prev) => ({
                ...prev,
                providerId: provider.id,
                modelId: parsed.modelId ?? provider.defaultModel,
              }));
              return;
            }
          }
          const defaultProvider = data.providers.find(
            (p: ProviderConfig) => p.id === data.defaultProvider,
          );
          if (defaultProvider) {
            setSettings((prev) => ({
              ...prev,
              providerId: defaultProvider.id,
              modelId: defaultProvider.defaultModel,
            }));
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        setIsLoading(false);
      }
    }
    fetchProviders();
  }, []);

  useEffect(() => {
    if (settings.providerId && initialized.current) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          providerId: settings.providerId,
          modelId: settings.modelId,
        }),
      );
    }
  }, [settings.providerId, settings.modelId]);

  const updateSettings = useCallback((patch: Partial<ModelSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  return { providers, isLoading, error, settings, updateSettings };
}
