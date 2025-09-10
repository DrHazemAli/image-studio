import { NextRequest, NextResponse } from 'next/server';
import { AzureModel } from '@/types/azure';

/**
 * GET /api/azure/model-catalog
 * Fetches available models from Azure Model Catalog
 */
export async function GET(request: NextRequest) {
  try {
    // Model Catalog API does not require authentication
   
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider');
    const modelType = searchParams.get('type') || 'image-generation';

    // Azure Model Catalog endpoint
    const catalogEndpoint = 'https://ml.azure.com/api/models/catalog';
    
    try {
      const response = await fetch(`${catalogEndpoint}?type=${modelType}${provider ? `&provider=${provider}` : ''}`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Azure-Image-Studio/1.0',
        },
        cache: 'no-store', // Always fetch fresh data
      });

      if (!response.ok) {
        throw new Error(`Azure Model Catalog API returned ${response.status}`);
      }

      const catalogData = await response.json();
      
      // Transform Azure catalog data to our unified model format
      const transformedModels = catalogData.models?.map((model: any) => ({
        id: model.id || model.name,
        name: model.displayName || model.name,
        description: model.description || `${model.name} model from Azure Model Catalog`,
        provider: model.publisher || provider || 'Azure',
        apiVersion: model.apiVersion || '2025-04-01-preview',
        capabilities: model.capabilities || ['text-to-image'],
        supportedSizes: model.supportedSizes || [
          {
            size: '1024x1024',
            label: 'Square (1:1)',
            aspect: '1:1',
            description: 'Standard resolution',
          },
        ],
        supportedFormats: model.supportedFormats || ['png', 'jpeg'],
        qualityLevels: model.qualityLevels,
        styleOptions: model.styleOptions,
        maxTokens: model.maxTokens,
        maxImages: model.maxImages || 1,
        imageInput: model.imageInput || false,
        requiresApproval: model.requiresApproval || false,
        premium: model.premium || false,
        features: {
          textRendering: model.features?.textRendering,
          preciseInstructions: model.features?.preciseInstructions,
          imageInput: model.features?.imageInput,
          streaming: model.features?.streaming,
          compression: model.features?.compression,
          highQuality: model.features?.highQuality,
          styleControl: model.features?.styleControl,
          contentFiltering: model.features?.contentFiltering,
          highResolution: model.features?.highResolution,
          fastGeneration: model.features?.fastGeneration,
          photorealistic: model.features?.photorealistic,
          contextAware: model.features?.contextAware,
          styleTransfer: model.features?.styleTransfer,
          editingCapabilities: model.features?.editingCapabilities,
          visionLanguage: model.features?.visionLanguage,
          imageUnderstanding: model.features?.imageUnderstanding,
        },
        status: 'idle',
        validated_at: null,
      })) || [];

      return NextResponse.json({
        success: true,
        models: transformedModels,
        total: transformedModels.length,
        provider,
        modelType,
        message: 'Models fetched from Azure Model Catalog successfully',
      });

    } catch (fetchError) {
      console.warn('Failed to fetch from Azure Model Catalog, returning fallback data:', fetchError);
      
      // Fallback: Return predefined model templates based on provider
      const fallbackModels = getFallbackModels(provider);
      
      return NextResponse.json({
        success: true,
        models: fallbackModels,
        total: fallbackModels.length,
        provider,
        modelType,
        source: 'fallback',
        message: 'Azure Model Catalog unavailable, using fallback model templates',
      });
    }

  } catch (error) {
    console.error('Model catalog GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

/**
 * Fallback model templates when Azure Model Catalog is unavailable
 */
function getFallbackModels(provider?: string | null) {
  const modelTemplates = {
    openai: [
      {
        id: 'dalle-3',
        name: 'DALL-E 3',
        description: 'High-quality image generation with natural and vivid styles',
        provider: 'Azure OpenAI',
        apiVersion: '2024-10-21',
        capabilities: ['text-to-image'],
        supportedSizes: [
          { size: '1024x1024', label: 'Square (1:1)', aspect: '1:1', description: 'Standard size' },
          { size: '1024x768', label: 'Standard (4:3)', aspect: '4:3', description: 'Default size' },
        ],
        supportedFormats: ['png', 'jpeg'],
        styleOptions: ['natural', 'vivid'],
        qualityLevels: ['standard', 'hd'],
        maxImages: 1,
        requiresApproval: false,
        features: {
          highQuality: true,
          styleControl: true,
          contentFiltering: true,
        },
        status: 'idle',
        validated_at: null,
      },
      {
        id: 'gpt-image-1',
        name: 'GPT-Image-1',
        description: 'Latest model with enhanced capabilities including image editing and inpainting',
        provider: 'Azure OpenAI',
        apiVersion: '2025-04-01-preview',
        capabilities: ['text-to-image', 'image-editing', 'inpainting', 'outpainting', 'image-to-image'],
        supportedSizes: [
          { size: '1024x1024', label: 'Square (1:1)', aspect: '1:1', description: 'Fastest generation' },
          { size: '1024x1536', label: 'Portrait (2:3)', aspect: '2:3', description: 'Vertical orientation' },
          { size: '1536x1024', label: 'Landscape (3:2)', aspect: '3:2', description: 'Horizontal orientation' },
        ],
        supportedFormats: ['png', 'jpeg'],
        qualityLevels: ['low', 'medium', 'high'],
        maxImages: 10,
        requiresApproval: true,
        premium: true,
        features: {
          textRendering: true,
          preciseInstructions: true,
          imageInput: true,
          streaming: true,
          compression: true,
        },
        status: 'idle',
        validated_at: null,
      },
    ],
    blackForestLabs: [
      {
        id: 'flux-1-1-pro',
        name: 'FLUX 1.1 Pro',
        description: 'Advanced text-to-image generation with superior quality',
        provider: 'Black Forest Labs',
        apiVersion: '2024-12-01',
        capabilities: ['text-to-image'],
        supportedSizes: [
          { size: '1024x1024', label: 'Square (1:1)', aspect: '1:1', description: 'Standard resolution' },
          { size: '1440x1440', label: 'Large Square', aspect: '1:1', description: 'High resolution' },
          { size: '2752x1536', label: 'Ultra Landscape (16:9)', aspect: '16:9', description: 'Ultra HD landscape' },
        ],
        supportedFormats: ['png', 'jpeg'],
        maxTokens: 5000,
        maxImages: 1,
        requiresApproval: false,
        features: {
          highResolution: true,
          fastGeneration: true,
          photorealistic: true,
        },
        status: 'idle',
        validated_at: null,
      },
      {
        id: 'FLUX.1-Kontext-pro',
        name: 'FLUX.1 Kontext Pro',
        description: 'Context-aware image generation and editing with image input support',
        provider: 'Black Forest Labs',
        apiVersion: '2024-12-01',
        capabilities: ['text-to-image', 'image-to-image', 'context-aware-editing', 'style-transfer'],
        supportedSizes: [
          { size: '1024x1024', label: 'Square (1:1)', aspect: '1:1', description: 'Standard resolution' },
          { size: '2048x2048', label: 'Ultra Square (1:1)', aspect: '1:1', description: 'Ultra HD square' },
        ],
        supportedFormats: ['png', 'jpeg'],
        maxTokens: 5000,
        maxImages: 1,
        imageInput: true,
        requiresApproval: false,
        primary: true,
        features: {
          contextAware: true,
          imageInput: true,
          styleTransfer: true,
          editingCapabilities: true,
        },
        status: 'idle',
        validated_at: null,
      },
    ],
    microsoft: [
      {
        id: 'florence-2',
        name: 'Florence 2.0',
        description: 'Microsoft\'s advanced vision-language model for image understanding and generation',
        provider: 'Microsoft Azure',
        apiVersion: '2024-12-01',
        capabilities: ['text-to-image', 'image-editing', 'inpainting'],
        supportedSizes: [
          { size: '1024x1024', label: 'Square (1:1)', aspect: '1:1', description: 'Standard size' },
          { size: '1024x768', label: 'Standard (4:3)', aspect: '4:3', description: 'Default size' },
        ],
        supportedFormats: ['png', 'jpeg'],
        maxImages: 1,
        requiresApproval: false,
        features: {
          visionLanguage: true,
          imageUnderstanding: true,
          editingCapabilities: true,
        },
        status: 'idle',
        validated_at: null,
      },
    ],
  };

  if (provider && modelTemplates[provider as keyof typeof modelTemplates]) {
    return modelTemplates[provider as keyof typeof modelTemplates];
  }

  // Return all models if no provider specified
  return Object.values(modelTemplates).flat();
}