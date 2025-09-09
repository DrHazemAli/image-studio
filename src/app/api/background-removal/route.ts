import { NextRequest, NextResponse } from 'next/server';
import { AzureImageProvider } from '@/lib/azure-provider';
import { AzureConfig, BackgroundRemovalRequest } from '@/types/azure';
import { AppConfig } from '@/types/app-config';
import azureConfigData from '../../config/azure-config.json';
import appConfigData from '../../config/app-config.json';
import { replaceEnvTags } from '@/lib/env';

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.AZURE_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Azure API key not configured' },
        { status: 500 }
      );
    }

    const requestBody = await request.json();
    const {
      image,
      model,
      quality,
      edgeRefinement,
      transparencyMode,
      outputFormat,
    } = requestBody;

    // Validate required parameters
    if (!image) {
      return NextResponse.json(
        { error: 'Image data is required' },
        { status: 400 }
      );
    }

    // Validate image format (should be base64)
    if (!image.startsWith('data:image/')) {
      return NextResponse.json(
        { error: 'Image must be in base64 format with data URI' },
        { status: 400 }
      );
    }

    // Load app configuration for defaults and validation
    const appConfig = appConfigData as AppConfig;

    const bgRemovalConfig = appConfig.features.backgroundRemoval;

    // Check if background removal feature is enabled
    if (!bgRemovalConfig.enabled) {
      return NextResponse.json(
        { error: 'Background removal feature is disabled' },
        { status: 403 }
      );
    }

    // Validate requested model against available models
    const requestedModel = model || bgRemovalConfig.defaultModel;
    const availableModels = bgRemovalConfig.models;
    const modelConfig = availableModels.find((m) => m.id === requestedModel);

    if (!modelConfig) {
      return NextResponse.json(
        {
          error: `Model '${requestedModel}' is not available`,
          availableModels: availableModels.map((m) => m.id),
        },
        { status: 400 }
      );
    }

    // Check if model requires approval
    if (modelConfig.requiresApproval) {
      // In a real app, you'd check user permissions or approval status here
      console.warn(
        `Model '${requestedModel}' requires approval but proceeding for demo`
      );
    }

    const config = azureConfigData as AzureConfig;
    // Add primary API key to config
    config.primaryApiKey = apiKey;
    
    // loop to endpoints and replace the baseurl with the env tag
    config.endpoints.forEach((endpoint) => {
      endpoint.baseUrl = replaceEnvTags(endpoint.baseUrl);
    });
    const provider = new AzureImageProvider(config);

    // Validate provider configuration
    const validation = provider.validateConfiguration();
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Invalid Azure configuration', details: validation.errors },
        { status: 500 }
      );
    }

    // Prepare background removal request with app config defaults
    const backgroundRemovalRequest: BackgroundRemovalRequest = {
      image,
      model: requestedModel as 'florence-2' | 'gpt-image-1',
      quality: quality || bgRemovalConfig.defaultSettings.quality,
      edgeRefinement:
        edgeRefinement !== undefined
          ? edgeRefinement
          : bgRemovalConfig.defaultSettings.edgeRefinement,
      transparencyMode:
        transparencyMode || bgRemovalConfig.defaultSettings.transparencyMode,
      output_format:
        outputFormat || bgRemovalConfig.defaultSettings.outputFormat,
    };

    // Perform background removal
    const result = await provider.removeBackground(backgroundRemovalRequest);

    // Return successful response with model information
    return NextResponse.json({
      success: true,
      data: result.response,
      modelUsed: {
        id: requestedModel,
        name: modelConfig.name,
        provider: modelConfig.provider,
        quality: modelConfig.quality,
        speed: modelConfig.speed,
      },
      settings: backgroundRemovalRequest,
      requestLog: result.requestLog,
      responseLog: result.responseLog,
    });
  } catch (error) {
    console.error('Background removal error:', error);

    // Handle specific Azure API errors
    if (error instanceof Error) {
      if (error.message.includes('Azure AI background removal error')) {
        // Extract status code and message from Azure error
        const statusMatch = error.message.match(/(\d{3})/);
        const statusCode = statusMatch ? parseInt(statusMatch[1]) : 500;

        return NextResponse.json(
          {
            error: 'Background removal failed',
            details: error.message,
            success: false,
          },
          { status: statusCode }
        );
      }

      if (error.message.includes('No deployment found')) {
        return NextResponse.json(
          {
            error: 'Selected AI model is not available',
            details: error.message,
            success: false,
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
        success: false,
      },
      { status: 500 }
    );
  }
}
