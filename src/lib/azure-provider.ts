import {
  AzureConfig,
  AzureEndpoint,
  AzureDeployment,
  ImageGenerationRequest,
  ImageEditRequest,
  BackgroundRemovalRequest,
  ImageGenerationResponse,
} from '@/types/azure';

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
      errors,
    };
  }

  getEndpoints(): AzureEndpoint[] {
    return this.config.endpoints;
  }

  getDeployments(): AzureDeployment[] {
    return this.config.endpoints.flatMap((endpoint) => endpoint.deployments);
  }

  getDeploymentById(
    deploymentId: string
  ): { endpoint: AzureEndpoint; deployment: AzureDeployment } | null {
    for (const endpoint of this.config.endpoints) {
      const deployment = endpoint.deployments.find(
        (d) => d.id === deploymentId
      );
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
      size: request.size,
    };

    const requestLog = {
      url,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer [REDACTED]`,
      },
      body: requestPayload,
      timestamp: new Date().toISOString(),
    };

    onProgress?.(10);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(requestPayload),
      });

      onProgress?.(70);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Azure API error: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const data: ImageGenerationResponse = await response.json();

      onProgress?.(100);

      const responseLog = {
        status: response.status,
        statusText: response.statusText,
        body: {
          ...data,
          data: data.data.map((item) => ({
            ...item,
            b64_json: '[BASE64_DATA_TRUNCATED]',
          })),
        },
        timestamp: new Date().toISOString(),
      };

      return {
        response: data,
        requestLog,
        responseLog,
      };
    } catch (error) {
      onProgress?.(0);
      throw error;
    }
  }

  async editImage(
    deploymentId: string,
    request: ImageEditRequest,
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

    // Use the edits endpoint for image editing/inpainting
    const url = `${endpoint.baseUrl}/openai/deployments/${deployment.deploymentName}/images/edits?api-version=${endpoint.apiVersion}`;

    // Create FormData for multipart/form-data request
    const formData = new FormData();

    // Convert base64 image to blob
    const imageBlob = new Blob(
      [Buffer.from(request.image.split(',')[1], 'base64')],
      { type: 'image/png' }
    );
    formData.append('image', imageBlob, 'image.png');

    // Add mask if provided
    if (request.mask) {
      const maskBlob = new Blob(
        [Buffer.from(request.mask.split(',')[1], 'base64')],
        { type: 'image/png' }
      );
      formData.append('mask', maskBlob, 'mask.png');
    }

    // Add other parameters
    formData.append('prompt', request.prompt);
    if (request.output_format)
      formData.append('response_format', request.output_format);
    if (request.n) formData.append('n', request.n.toString());
    if (request.size) formData.append('size', request.size);

    const requestLog = {
      url,
      method: 'POST',
      headers: {
        Authorization: `Bearer [REDACTED]`,
      },
      body: {
        prompt: request.prompt,
        hasImage: true,
        hasMask: !!request.mask,
        output_format: request.output_format,
        n: request.n,
        size: request.size,
      },
      timestamp: new Date().toISOString(),
    };

    onProgress?.(10);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          // Don't set Content-Type for FormData, let the browser set it
        },
        body: formData,
      });

      onProgress?.(70);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Azure API error: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const data: ImageGenerationResponse = await response.json();

      onProgress?.(100);

      const responseLog = {
        status: response.status,
        statusText: response.statusText,
        body: {
          ...data,
          data: data.data.map((item) => ({
            ...item,
            b64_json: '[BASE64_DATA_TRUNCATED]',
          })),
        },
        timestamp: new Date().toISOString(),
      };

      return {
        response: data,
        requestLog,
        responseLog,
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

  /**
   * Remove background from an image using Azure AI models
   * Uses the image editing capabilities with a specialized prompt for background removal
   */
  async removeBackground(
    request: BackgroundRemovalRequest,
    onProgress?: (progress: number) => void
  ): Promise<{
    response: ImageGenerationResponse;
    requestLog: Record<string, unknown>;
    responseLog: Record<string, unknown>;
  }> {
    const modelId = request.model || 'florence-2';

    // Find deployment for the selected model
    const deploymentInfo = this.getDeploymentByModelId(modelId);
    if (!deploymentInfo) {
      throw new Error(`No deployment found for model "${modelId}"`);
    }

    const { endpoint, deployment } = deploymentInfo;

    // For background removal, we use the image editing endpoint with a specialized prompt
    const url = `${endpoint.baseUrl}/openai/deployments/${deployment.deploymentName}/images/edits?api-version=${endpoint.apiVersion}`;

    // Create FormData for multipart/form-data request
    const formData = new FormData();

    // Convert base64 image to blob
    const imageBlob = new Blob(
      [Buffer.from(request.image.split(',')[1], 'base64')],
      { type: 'image/png' }
    );
    formData.append('image', imageBlob, 'image.png');

    // Create a background removal prompt
    const backgroundRemovalPrompt = request.edgeRefinement
      ? 'Remove the background completely, keeping only the main subject with precise edges and smooth transparency'
      : 'Remove the background completely, keeping only the main subject with natural transparency';

    formData.append('prompt', backgroundRemovalPrompt);
    formData.append('response_format', 'b64_json');
    formData.append('n', '1');
    formData.append('size', '1024x1024');

    const requestLog = {
      url,
      method: 'POST',
      headers: {
        Authorization: `Bearer [REDACTED]`,
      },
      body: {
        prompt: backgroundRemovalPrompt,
        hasImage: true,
        model: modelId,
        quality: request.quality,
        edgeRefinement: request.edgeRefinement,
        transparencyMode: request.transparencyMode,
        output_format: request.output_format,
      },
      timestamp: new Date().toISOString(),
    };

    onProgress?.(20);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          // Don't set Content-Type for FormData, let the browser set it
        },
        body: formData,
      });

      onProgress?.(60);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Azure AI background removal error: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const data: ImageGenerationResponse = await response.json();

      onProgress?.(100);

      const responseLog = {
        status: response.status,
        statusText: response.statusText,
        body: {
          ...data,
          data: data.data.map((item) => ({
            ...item,
            b64_json: '[BASE64_DATA_TRUNCATED]',
          })),
        },
        timestamp: new Date().toISOString(),
      };

      return {
        response: data,
        requestLog,
        responseLog,
      };
    } catch (error) {
      onProgress?.(0);
      throw error;
    }
  }

  /**
   * Get deployment info by model ID
   */
  private getDeploymentByModelId(
    modelId: string
  ): { endpoint: AzureEndpoint; deployment: AzureDeployment } | null {
    for (const endpoint of this.config.endpoints) {
      const deployment = endpoint.deployments.find((d) => d.id === modelId);
      if (deployment) {
        return { endpoint, deployment };
      }
    }
    return null;
  }
}
