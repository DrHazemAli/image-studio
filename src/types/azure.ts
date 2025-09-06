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
  deployments: AzureDeployment[];
}

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

export interface ImageGenerationRequest {
  prompt: string;
  output_format: string;
  n: number;
  size: string;
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