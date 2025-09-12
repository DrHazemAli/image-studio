export interface AzureConfig {
  endpoints: AzureEndpoint[];
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

export interface AzureEndpoint {
  id: string;
  name: string;
  baseUrl: string;
  apiVersion: string;
  deployments: AzureDeployment[];
}

export interface AzureDeployment {
  id: string;
  name: string;
  deploymentName: string;
  maxSize: string;
  supportedFormats: string[];
  description: string;
}

export interface ImageGenerationRequest {
  prompt: string;
  output_format?: string;
  n?: number;
  size?: string;
  quality?: string;
  style?: string;
  seed?: number;
  negativePrompt?: string;
}

export interface ImageEditRequest extends ImageGenerationRequest {
  image: string;
  mask?: string;
}

export interface ImageGenerationResponse {
  created: number;
  data: Array<{
    b64_json?: string;
    url?: string;
    revised_prompt?: string;
  }>;
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  supportsInpaint: boolean;
  primary?: boolean;
  premium?: boolean;
  supportedSizes: SizeOption[];
}

export interface SizeOption {
  size: string;
  label: string;
  aspect: string;
  description: string;
}

export interface GenerationResult {
  success: boolean;
  data?: ImageGenerationResponse;
  error?: string;
  requestLog?: Record<string, unknown>;
  responseLog?: Record<string, unknown>;
}

export interface CliConfig {
  apiKey?: string;
  configPath?: string;
  outputDir?: string;
  defaultModel?: string;
  defaultSize?: string;
  defaultQuality?: string;
  verbose?: boolean;
}

export interface BatchGenerationOptions {
  inputFile: string;
  outputDir: string;
  model: string;
  size: string;
  quality: string;
  delay?: number;
  maxConcurrent?: number;
}

export interface AssetInfo {
  id: string;
  name: string;
  url: string;
  type: "generation" | "upload" | "edit";
  timestamp: Date;
  prompt?: string;
  model?: string;
  size?: string;
  quality?: string;
}
