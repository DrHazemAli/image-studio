/**
 * Application Configuration Types
 * Defines the structure for the unified app configuration system
 */

export interface AppConfig {
  app: {
    name: string;
    version: string;
    description: string;
    environment: 'development' | 'production' | 'staging';
  };

  features: {
    floatingImageToolbar: {
      enabled: boolean;
      defaultPosition: { x: number; y: number };
      collapsible: boolean;
      smartPositioning: boolean;
    };

    backgroundRemoval: {
      enabled: boolean;
      defaultModel: string;
      models: BackgroundRemovalModel[];
      defaultSettings: {
        quality: 'standard' | 'high';
        edgeRefinement: boolean;
        transparencyMode: 'full' | 'soft';
        outputFormat: string;
      };
      advanced: {
        enableBatchProcessing: boolean;
        maxConcurrentRequests: number;
        retryAttempts: number;
        timeoutMs: number;
      };
    };

    imageGeneration: {
      enabled: boolean;
      defaultModel: string;
      defaultSize: string;
      defaultOutputFormat: string;
    };

    imageEditing: {
      enabled: boolean;
      tools: {
        crop: { enabled: boolean };
        resize: { enabled: boolean };
        filters: { enabled: boolean };
        adjustments: { enabled: boolean };
        transform: { enabled: boolean };
        blendMode: { enabled: boolean };
      };
    };
  };

  ui: {
    theme: {
      default: 'light' | 'dark' | 'system';
      options: ('light' | 'dark' | 'system')[];
    };
    animations: {
      enabled: boolean;
      duration: 'fast' | 'normal' | 'slow';
      easing: string;
    };
    toolbar: {
      position: 'left' | 'right' | 'top' | 'bottom';
      collapsible: boolean;
      showShortcuts: boolean;
    };
    canvas: {
      defaultZoom: number;
      zoomStep: number;
      minZoom: number;
      maxZoom: number;
      gridEnabled: boolean;
      snapToGrid: boolean;
    };
    panels: {
      showConsole: boolean;
      showLayers: boolean;
      showHistory: boolean;
      showAssets: boolean;
    };
  };

  performance: {
    imageProcessing: {
      maxImageSize: number;
      compressionQuality: number;
      enableWebWorkers: boolean;
    };
    canvas: {
      renderingMode: 'webgl' | 'canvas2d';
      enableImageCache: boolean;
      maxCacheSize: number;
    };
    api: {
      requestTimeout: number;
      retryDelay: number;
      maxRetries: number;
    };
  };

  security: {
    fileUpload: {
      maxFileSize: number;
      allowedFormats: string[];
      validateImageHeaders: boolean;
    };
    api: {
      enableCors: boolean;
      rateLimit: {
        enabled: boolean;
        windowMs: number;
        maxRequests: number;
      };
    };
  };

  integrations: {
    azure: {
      enabled: boolean;
      configFile: string;
      modelsFile: string;
    };
    analytics: {
      enabled: boolean;
      provider: string | null;
    };
  };

  debugging: {
    enableConsoleLogging: boolean;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    enablePerformanceMonitoring: boolean;
  };
}

export interface BackgroundRemovalModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  capabilities: string[];
  recommended: boolean;
  speed: 'fast' | 'medium' | 'slow';
  quality: 'standard' | 'high' | 'premium';
  requiresApproval?: boolean;
}

/**
 * Configuration service for managing app settings
 */
export class AppConfigService {
  private static config: AppConfig | null = null;
  private static loadingPromise: Promise<AppConfig> | null = null;

  /**
   * Load app configuration from the JSON file
   */
  static async loadConfig(): Promise<AppConfig> {
    // Return cached config if available
    if (this.config) {
      return this.config;
    }

    // Return existing loading promise if one is in progress
    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    // Create new loading promise
    this.loadingPromise = this.fetchConfig();

    try {
      const result = await this.loadingPromise;
      return result;
    } finally {
      // Clear loading promise when done
      this.loadingPromise = null;
    }
  }

  /**
   * Internal method to fetch config from API
   */
  private static async fetchConfig(): Promise<AppConfig> {
    try {
      // In client-side, we'll fetch from the config endpoint
      const response = await fetch('/api/app-config');
      if (!response.ok) {
        throw new Error(`Failed to load app config: ${response.statusText}`);
      }

      this.config = await response.json();
      return this.config!;
    } catch (error) {
      console.error('Error loading app configuration:', error);

      // Return default config as fallback
      return this.getDefaultConfig();
    }
  }

  /**
   * Get cached configuration (requires loadConfig to be called first)
   */
  static getConfig(): AppConfig | null {
    return this.config;
  }

  /**
   * Get background removal configuration
   */
  static getBackgroundRemovalConfig():
    | AppConfig['features']['backgroundRemoval']
    | null {
    return this.config?.features.backgroundRemoval || null;
  }

  /**
   * Get available background removal models
   */
  static getBackgroundRemovalModels(): BackgroundRemovalModel[] {
    return this.config?.features.backgroundRemoval.models || [];
  }

  /**
   * Get default background removal model
   */
  static getDefaultBackgroundRemovalModel(): string {
    return this.config?.features.backgroundRemoval.defaultModel || 'florence-2';
  }

  /**
   * Check if a feature is enabled
   */
  static isFeatureEnabled(feature: keyof AppConfig['features']): boolean {
    return this.config?.features[feature]?.enabled || false;
  }

  /**
   * Default configuration fallback
   */
  private static getDefaultConfig(): AppConfig {
    return {
      app: {
        name: 'Azure Image Studio',
        version: '1.0.1',
        description: 'AI-powered image generation and editing platform',
        environment: 'development',
      },
      features: {
        floatingImageToolbar: {
          enabled: true,
          defaultPosition: { x: 100, y: 100 },
          collapsible: true,
          smartPositioning: true,
        },
        backgroundRemoval: {
          enabled: true,
          defaultModel: 'florence-2',
          models: [
            {
              id: 'florence-2',
              name: 'Florence 2.0',
              provider: 'Microsoft Azure',
              description: "Microsoft's advanced vision-language model",
              capabilities: ['background-removal'],
              recommended: true,
              speed: 'fast',
              quality: 'high',
            },
          ],
          defaultSettings: {
            quality: 'standard',
            edgeRefinement: true,
            transparencyMode: 'full',
            outputFormat: 'png',
          },
          advanced: {
            enableBatchProcessing: false,
            maxConcurrentRequests: 1,
            retryAttempts: 2,
            timeoutMs: 30000,
          },
        },
        imageGeneration: {
          enabled: true,
          defaultModel: 'FLUX.1-Kontext-pro',
          defaultSize: '1024x1024',
          defaultOutputFormat: 'png',
        },
        imageEditing: {
          enabled: true,
          tools: {
            crop: { enabled: true },
            resize: { enabled: true },
            filters: { enabled: true },
            adjustments: { enabled: true },
            transform: { enabled: true },
            blendMode: { enabled: true },
          },
        },
      },
      ui: {
        theme: {
          default: 'system',
          options: ['light', 'dark', 'system'],
        },
        animations: {
          enabled: true,
          duration: 'normal',
          easing: 'ease-out',
        },
        toolbar: {
          position: 'left',
          collapsible: true,
          showShortcuts: true,
        },
        canvas: {
          defaultZoom: 100,
          zoomStep: 25,
          minZoom: 10,
          maxZoom: 500,
          gridEnabled: false,
          snapToGrid: false,
        },
        panels: {
          showConsole: false,
          showLayers: false,
          showHistory: true,
          showAssets: true,
        },
      },
      performance: {
        imageProcessing: {
          maxImageSize: 4096,
          compressionQuality: 0.9,
          enableWebWorkers: true,
        },
        canvas: {
          renderingMode: 'webgl',
          enableImageCache: true,
          maxCacheSize: 100,
        },
        api: {
          requestTimeout: 30000,
          retryDelay: 1000,
          maxRetries: 3,
        },
      },
      security: {
        fileUpload: {
          maxFileSize: 10485760,
          allowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'bmp'],
          validateImageHeaders: true,
        },
        api: {
          enableCors: true,
          rateLimit: {
            enabled: true,
            windowMs: 900000,
            maxRequests: 100,
          },
        },
      },
      integrations: {
        azure: {
          enabled: true,
          configFile: 'azure-config.json',
          modelsFile: 'azure-models.json',
        },
        analytics: {
          enabled: false,
          provider: null,
        },
      },
      debugging: {
        enableConsoleLogging: false,
        logLevel: 'info',
        enablePerformanceMonitoring: false,
      },
    };
  }
}
