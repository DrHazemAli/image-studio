import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { AppConfig } from '@/types/app-config';

export async function GET() {
  try {
    // Read the app configuration from the JSON file
    const configPath = path.join(process.cwd(), 'src/app/config/app-config.json');
    
    if (!fs.existsSync(configPath)) {
      // Return default config if file doesn't exist
      const defaultConfig = getDefaultConfig();
      return NextResponse.json(defaultConfig);
    }

    const configData = fs.readFileSync(configPath, 'utf8');
    const config: AppConfig = JSON.parse(configData);

    // Validate configuration structure
    const validation = validateConfig(config);
    if (!validation.isValid) {
      console.warn('App configuration validation warnings:', validation.warnings);
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error reading app configuration:', error);
    
    // Return default config as fallback
    const defaultConfig = getDefaultConfig();
    return NextResponse.json(defaultConfig, { status: 200 }); // Still return 200 with defaults
  }
}

/**
 * Validate app configuration structure
 */
function validateConfig(config: AppConfig): { isValid: boolean; warnings: string[] } {
  const warnings: string[] = [];

  // Check required fields
  if (!config.app?.name) {
    warnings.push('App name is missing');
  }

  if (!config.features?.backgroundRemoval) {
    warnings.push('Background removal configuration is missing');
  } else {
    const bgRemoval = config.features.backgroundRemoval;
    
    if (!bgRemoval.defaultModel) {
      warnings.push('Default background removal model is not specified');
    }

    if (!bgRemoval.models || bgRemoval.models.length === 0) {
      warnings.push('No background removal models configured');
    }

    // Validate default model exists in models list
    if (bgRemoval.defaultModel && bgRemoval.models) {
      const modelExists = bgRemoval.models.some(model => model.id === bgRemoval.defaultModel);
      if (!modelExists) {
        warnings.push(`Default model '${bgRemoval.defaultModel}' not found in models list`);
      }
    }
  }

  return {
    isValid: warnings.length === 0,
    warnings
  };
}

/**
 * Get default configuration
 */
function getDefaultConfig(): AppConfig {
  return {
    app: {
      name: 'Azure Image Studio',
      version: '1.0.1',
      description: 'AI-powered image generation and editing platform',
      environment: 'development'
    },
    features: {
      floatingImageToolbar: {
        enabled: true,
        defaultPosition: { x: 100, y: 100 },
        collapsible: true,
        smartPositioning: true
      },
      backgroundRemoval: {
        enabled: true,
        defaultModel: 'florence-2',
        models: [
          {
            id: 'florence-2',
            name: 'Florence 2.0',
            provider: 'Microsoft Azure',
            description: 'Microsoft\'s advanced vision-language model for image understanding and editing',
            capabilities: ['background-removal', 'image-editing', 'inpainting'],
            recommended: true,
            speed: 'fast',
            quality: 'high'
          },
          {
            id: 'gpt-image-1',
            name: 'GPT-Image-1',
            provider: 'Azure OpenAI',
            description: 'Latest model with enhanced capabilities including image editing and inpainting',
            capabilities: ['background-removal', 'image-editing', 'inpainting', 'outpainting'],
            recommended: false,
            speed: 'medium',
            quality: 'premium',
            requiresApproval: true
          }
        ],
        defaultSettings: {
          quality: 'standard',
          edgeRefinement: true,
          transparencyMode: 'full',
          outputFormat: 'png'
        },
        advanced: {
          enableBatchProcessing: false,
          maxConcurrentRequests: 1,
          retryAttempts: 2,
          timeoutMs: 30000
        }
      },
      imageGeneration: {
        enabled: true,
        defaultModel: 'FLUX.1-Kontext-pro',
        defaultSize: '1024x1024',
        defaultOutputFormat: 'png'
      },
      imageEditing: {
        enabled: true,
        tools: {
          crop: { enabled: true },
          resize: { enabled: true },
          filters: { enabled: true },
          adjustments: { enabled: true },
          transform: { enabled: true },
          blendMode: { enabled: true }
        }
      }
    },
    ui: {
      theme: {
        default: 'system',
        options: ['light', 'dark', 'system']
      },
      animations: {
        enabled: true,
        duration: 'normal',
        easing: 'ease-out'
      },
      toolbar: {
        position: 'left',
        collapsible: true,
        showShortcuts: true
      },
      canvas: {
        defaultZoom: 100,
        zoomStep: 25,
        minZoom: 10,
        maxZoom: 500,
        gridEnabled: false,
        snapToGrid: false
      },
      panels: {
        showConsole: false,
        showLayers: false,
        showHistory: true,
        showAssets: true
      }
    },
    performance: {
      imageProcessing: {
        maxImageSize: 4096,
        compressionQuality: 0.9,
        enableWebWorkers: true
      },
      canvas: {
        renderingMode: 'webgl',
        enableImageCache: true,
        maxCacheSize: 100
      },
      api: {
        requestTimeout: 30000,
        retryDelay: 1000,
        maxRetries: 3
      }
    },
    security: {
      fileUpload: {
        maxFileSize: 10485760,
        allowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'bmp'],
        validateImageHeaders: true
      },
      api: {
        enableCors: true,
        rateLimit: {
          enabled: true,
          windowMs: 900000,
          maxRequests: 100
        }
      }
    },
    integrations: {
      azure: {
        enabled: true,
        configFile: 'azure-config.json',
        modelsFile: 'azure-models.json'
      },
      analytics: {
        enabled: false,
        provider: null
      }
    },
    debugging: {
      enableConsoleLogging: false,
      logLevel: 'info',
      enablePerformanceMonitoring: false
    }
  };
}