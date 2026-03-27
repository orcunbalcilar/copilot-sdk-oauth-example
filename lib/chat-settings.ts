export interface ProviderConfig {
  id: string;
  name: string;
  models: Record<string, string>;
  defaultModel: string;
  supportsReasoning: boolean;
}

export interface ModelSettings {
  providerId: string;
  modelId: string;
  temperature: number;
  enableReasoning: boolean;
}

export const DEFAULT_MODEL_SETTINGS: ModelSettings = {
  providerId: "",
  modelId: "",
  temperature: 0,
  enableReasoning: false,
};

export interface SkillConfig {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}
