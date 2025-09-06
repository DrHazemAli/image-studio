import { AzureConfig, AzureEndpoint, AzureDeployment, ImageGenerationRequest, ImageGenerationResponse } from '@/types/azure';

export class AzureImageProvider {
  private config: AzureConfig;
  private apiKey: string;

  constructor(config: AzureConfig, apiKey: string) {
    this.config = config;
    this.apiKey = apiKey;
  }

  validateConfiguration(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.apiKey || this.apiKey.trim() === '') {
      errors.push('Azure API key is missing');
    }

    if (!this.config.endpoints || this.config.endpoints.length === 0) {
      errors.push('No Azure endpoints configured');
    }

    this.config.endpoints.forEach((endpoint, index) => {
      if (!endpoint.baseUrl) {
        errors.push(`Endpoint ${index + 1}: Base URL is missing`);
      }
      if (!endpoint.apiVersion) {
        errors.push(`Endpoint ${index + 1}: API version is missing`);
      }
      if (!endpoint.deployments || endpoint.deployments.length === 0) {
        errors.push(`Endpoint ${index + 1}: No deployments configured`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  getEndpoints(): AzureEndpoint[] {
    return this.config.endpoints;
  }

  getDeployments(): AzureDeployment[] {
    return this.config.endpoints.flatMap(endpoint => endpoint.deployments);
  }

  getDeploymentById(deploymentId: string): { endpoint: AzureEndpoint; deployment: AzureDeployment } | null {
    for (const endpoint of this.config.endpoints) {
      const deployment = endpoint.deployments.find(d => d.id === deploymentId);
      if (deployment) {
        return { endpoint, deployment };
      }
    }
    return null;
  }

  async generateImage(
    deploymentId: string,
    request: ImageGenerationRequest,
    onProgress?: (progress: number) => void
  ): Promise<{
    response: ImageGenerationResponse;
    requestLog: Record<string, unknown>;
    responseLog: Record<string, unknown>;
  }> {
    const deploymentInfo = this.getDeploymentById(deploymentId);
    if (!deploymentInfo) {
      throw new Error(`Deployment with ID "${deploymentId}" not found`);
    }

    const { endpoint, deployment } = deploymentInfo;
    
    const url = `${endpoint.baseUrl}/openai/deployments/${deployment.deploymentName}/images/generations?api-version=${endpoint.apiVersion}`;
    
    const requestPayload = {
      prompt: request.prompt,
      output_format: request.output_format,
      n: request.n,
      size: request.size
    };

    const requestLog = {
      url,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer [REDACTED]`
      },
      body: requestPayload,
      timestamp: new Date().toISOString()
    };

    onProgress?.(10);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(requestPayload)
      });

      onProgress?.(70);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Azure API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data: ImageGenerationResponse = await response.json();
      
      onProgress?.(100);

      const responseLog = {
        status: response.status,
        statusText: response.statusText,
        body: {
          ...data,
          data: data.data.map(item => ({
            ...item,
            b64_json: '[BASE64_DATA_TRUNCATED]'
          }))
        },
        timestamp: new Date().toISOString()
      };

      return {
        response: data,
        requestLog,
        responseLog
      };

    } catch (error) {
      onProgress?.(0);
      throw error;
    }
  }

  getDefaultSettings() {
    return this.config.defaultSettings;
  }

  updateConfig(newConfig: Partial<AzureConfig>) {
    this.config = { ...this.config, ...newConfig };
  }
}