export interface AzureDeployment {
  id: string;
  name: string;
  deploymentName: string;
  maxSize: string;
  supportedFormats: string[];
  description: string;
}

export interface AzureEndpoint {
  id: string;
  name: string;
  baseUrl: string;
  apiVersion: string;
  apiKey?: string; // Optional per-endpoint API key
  resourceName?: string; // Optional per-endpoint resource name
  deployments: AzureDeployment[];
  status?: "valid" | "invalid" | "pending" | "idle"; // Current validation status
  validated_at?: string | null; // ISO timestamp of last validation
}

export interface AzureConfig {
  primary: {
    status?: "valid" | "invalid" | "pending" | "idle";
    validated_at?: string | null;
  };
  endpoints: AzureEndpoint[];
  primaryApiKey: string; // Primary API key used as fallback
  primaryEndpoint: string; // Primary endpoint URL used as fallback
  defaultSettings: {
    outputFormat: string;
    size: string;
    n: number;
  };
  ui: {
    theme: string;
    showConsole: boolean;
    animationsEnabled: boolean;
  };
}

export interface ImageGenerationRequest {
  prompt: string;
  output_format: string;
  n: number;
  size: string;
}

export interface ImageEditRequest {
  prompt: string;
  image: string; // base64 encoded image
  mask?: string; // base64 encoded mask (optional for some models)
  output_format?: string;
  n?: number;
  size?: string;
}

export interface BackgroundRemovalRequest {
  image: string; // base64 encoded image
  model?: "florence-2" | "gpt-image-1";
  quality?: "standard" | "high";
  edgeRefinement?: boolean;
  transparencyMode?: "full" | "soft";
  output_format?: string;
}

export interface ImageGenerationResponse {
  data: Array<{
    b64_json: string;
    url?: string;
  }>;
  created: number;
}

export interface GenerationState {
  isGenerating: boolean;
  progress: number;
  error: string | null;
  result: ImageGenerationResponse | null;
  requestLog: Record<string, unknown> | null;
  responseLog: Record<string, unknown> | null;
}

// Model types matching azure-models.json schema exactly
export interface ModelSize {
  size: string;
  label: string;
  aspect: string;
  description: string;
}

export interface ModelFeatures {
  textRendering?: boolean;
  preciseInstructions?: boolean;
  imageInput?: boolean;
  streaming?: boolean;
  compression?: boolean;
  highQuality?: boolean;
  styleControl?: boolean;
  contentFiltering?: boolean;
  highResolution?: boolean;
  fastGeneration?: boolean;
  photorealistic?: boolean;
  contextAware?: boolean;
  styleTransfer?: boolean;
  editingCapabilities?: boolean;
  visionLanguage?: boolean;
  imageUnderstanding?: boolean;
}

// Azure model schema - matches azure-models.json exactly
export interface AzureModel {
  id: string;
  name: string;
  description: string;
  provider: string;
  apiVersion: string;
  capabilities: string[];
  supportedSizes: ModelSize[];
  supportedFormats: string[];
  qualityLevels?: string[];
  styleOptions?: string[];
  maxTokens?: number;
  maxImages: number;
  imageInput?: boolean;
  requiresApproval: boolean;
  premium?: boolean;
  primary?: boolean;
  features: ModelFeatures;
  // Additional fields for runtime use (not in base schema)
  status?: "valid" | "invalid" | "pending" | "idle";
  validated_at?: string | null;
  deploymentName?: string;
  enabled?: boolean;
}

export interface ModelEndpoint {
  id: string;
  name: string;
  baseUrl: string;
  type: string;
  deployments: ModelDeployment[];
}

export interface ModelDeployment {
  modelId: string;
  deploymentName: string;
  enabled: boolean;
  note?: string;
}

export interface ModelPreset {
  name: string;
  description: string;
  recommendedModel: string;
  settings: Record<string, unknown>;
}

export interface ModelTool {
  icon: string;
  name: string;
  description: string;
  supportedModels: string[];
}

// Azure models config schema - matches azure-models.json exactly
export interface AzureModelsConfig {
  imageModels: {
    generation: {
      [provider: string]: AzureModel[];
    };
  };
  endpoints: ModelEndpoint[];
  tools: {
    [toolId: string]: ModelTool;
  };
  presets: {
    [presetId: string]: ModelPreset;
  };
}

// Legacy alias for backward compatibility
export type UnifiedModel = AzureModel;
export type ModelsConfig = AzureModelsConfig;
