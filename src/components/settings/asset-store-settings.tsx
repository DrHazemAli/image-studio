'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Check,
  X,
  Eye,
  EyeOff,
  ExternalLink,
  AlertTriangle,
  Zap,
  Package,
  Image,
  Video,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getUnifiedSetting, updateUnifiedSetting } from '@/lib/settings';
import { AssetStoreConfig } from '@/types/asset-store';

interface AssetStoreSettingsProps {
  onUpdate?: (config: Partial<AssetStoreConfig>) => void;
}

export function AssetStoreSettings({ onUpdate }: AssetStoreSettingsProps) {
  const [config, setConfig] = useState<AssetStoreConfig>(() => ({
    enabled: true,
    providers: {
      unsplash: {
        enabled: false,
        apiKey: '',
        rateLimit: 50,
      },
      pexels: {
        enabled: false,
        apiKey: '',
        rateLimit: 200,
      },
    },
    ui: {
      defaultView: 'grid',
      itemsPerPage: 20,
      showAttribution: true,
    },
    cache: {
      enabled: true,
      maxItems: 1000,
      ttl: 60,
    },
  }));

  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [selectedProvider, setSelectedProvider] = useState<string>('unsplash');
  const [showApiKeys, setShowApiKeys] = useState({
    unsplash: false,
    pexels: false,
  });
  const [validationStatus, setValidationStatus] = useState<{
    [key: string]: 'idle' | 'validating' | 'valid' | 'invalid';
  }>({
    unsplash: 'idle',
    pexels: 'idle',
  });
  const [validationMessages, setValidationMessages] = useState<{
    [key: string]: string;
  }>({
    unsplash: '',
    pexels: '',
  });

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // API keys are handled server-side only - no client-side storage

  // Ensure config has proper structure (API keys always empty from localStorage)
  const ensureConfigStructure = useCallback((config: unknown): AssetStoreConfig => {
    const configObj = config as Record<string, unknown> | null | undefined;
    const providers = (configObj?.providers as Record<string, unknown>) || {};
    const ui = (configObj?.ui as Record<string, unknown>) || {};
    const cache = (configObj?.cache as Record<string, unknown>) || {};
    
    return {
      enabled: Boolean(configObj?.enabled ?? true),
      providers: {
        unsplash: {
          enabled: Boolean((providers.unsplash as Record<string, unknown>)?.enabled ?? false),
          apiKey: '', // API keys are never stored in localStorage, always empty
          rateLimit: Number((providers.unsplash as Record<string, unknown>)?.rateLimit ?? 50),
        },
        pexels: {
          enabled: Boolean((providers.pexels as Record<string, unknown>)?.enabled ?? false),
          apiKey: '', // API keys are never stored in localStorage, always empty
          rateLimit: Number((providers.pexels as Record<string, unknown>)?.rateLimit ?? 200),
        },
      },
      ui: {
        defaultView: (ui.defaultView as 'grid' | 'list') ?? 'grid',
        itemsPerPage: Number(ui.itemsPerPage ?? 20),
        showAttribution: Boolean(ui.showAttribution ?? true),
      },
      cache: {
        enabled: Boolean(cache.enabled ?? true),
        maxItems: Number(cache.maxItems ?? 1000),
        ttl: Number(cache.ttl ?? 60),
      },
    };
  }, []);

  // Reload API keys from cookies
  const reloadApiKeysFromCookies = useCallback(() => {
    const unsplashKey = document.cookie
      .split('; ')
      .find(row => row.startsWith('unsplash_api_key='))
      ?.split('=')[1];
    const pexelsKey = document.cookie
      .split('; ')
      .find(row => row.startsWith('pexels_api_key='))
      ?.split('=')[1];

    setConfig(prev => ({
      ...prev,
      providers: {
        ...prev.providers,
        unsplash: {
          ...prev.providers?.unsplash,
          apiKey: unsplashKey ? decodeURIComponent(unsplashKey) : prev.providers?.unsplash?.apiKey || '',
        },
        pexels: {
          ...prev.providers?.pexels,
          apiKey: pexelsKey ? decodeURIComponent(pexelsKey) : prev.providers?.pexels?.apiKey || '',
        },
      },
    }));
  }, []);

  // Load configuration on mount
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const defaultConfig: AssetStoreConfig = {
          enabled: true,
          providers: {
            unsplash: {
              enabled: false,
              apiKey: '',
              rateLimit: 50,
            },
            pexels: {
              enabled: false,
              apiKey: '',
              rateLimit: 200,
            },
          },
          ui: {
            defaultView: 'grid',
            itemsPerPage: 20,
            showAttribution: true,
          },
          cache: {
            enabled: true,
            maxItems: 1000,
            ttl: 60,
          },
        };

        const savedConfig = getUnifiedSetting('assetStore', defaultConfig, 'localStorage') as AssetStoreConfig;
        const safeConfig = ensureConfigStructure(savedConfig);
        
        // Load API keys from cookies
        const unsplashKey = document.cookie
          .split('; ')
          .find(row => row.startsWith('unsplash_api_key='))
          ?.split('=')[1];
        const pexelsKey = document.cookie
          .split('; ')
          .find(row => row.startsWith('pexels_api_key='))
          ?.split('=')[1];

        const configWithKeys = {
          ...safeConfig,
          providers: {
            ...safeConfig.providers,
            unsplash: {
              ...safeConfig.providers.unsplash,
              apiKey: unsplashKey ? decodeURIComponent(unsplashKey) : '',
            },
            pexels: {
              ...safeConfig.providers.pexels,
              apiKey: pexelsKey ? decodeURIComponent(pexelsKey) : '',
            },
          },
        };
        
        setConfig(configWithKeys);
      } catch (error) {
        console.error('Failed to load asset store config:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, [ensureConfigStructure]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // API keys are handled server-side only

  // Save configuration when it changes
  const saveConfig = useCallback(async (newConfig: AssetStoreConfig) => {
    setSaveStatus('saving');
    
    try {
      // Create config for localStorage WITHOUT API keys
      // API keys are stored only in cookies, not in localStorage
      const configForLocalStorage = {
        enabled: newConfig.enabled,
        providers: {
          unsplash: {
            enabled: newConfig.providers.unsplash.enabled,
            apiKey: '', // Never store API keys in localStorage
            rateLimit: newConfig.providers.unsplash.rateLimit,
          },
          pexels: {
            enabled: newConfig.providers.pexels.enabled,
            apiKey: '', // Never store API keys in localStorage
            rateLimit: newConfig.providers.pexels.rateLimit,
          },
        },
        ui: newConfig.ui,
        cache: newConfig.cache,
      };
      
      // Save to localStorage (without API keys)
      updateUnifiedSetting('assetStore', configForLocalStorage, 'localStorage');
      
      // Save API keys to cookies only
      if (newConfig.providers.unsplash.apiKey) {
        document.cookie = `unsplash_api_key=${encodeURIComponent(newConfig.providers.unsplash.apiKey)}; path=/; max-age=31536000; SameSite=Lax`;
      }
      if (newConfig.providers.pexels.apiKey) {
        document.cookie = `pexels_api_key=${encodeURIComponent(newConfig.providers.pexels.apiKey)}; path=/; max-age=31536000; SameSite=Lax`;
      }
      
      // Keep the full config with API keys in state for UI
      setConfig(newConfig);
      onUpdate?.(newConfig);
      
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to save asset store config:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  }, [onUpdate]);

  // Update specific setting
  const updateSetting = useCallback((path: string, value: unknown) => {
    setConfig(prevConfig => {
      const newConfig = { ...prevConfig };
      const keys = path.split('.');

      let current: Record<string, unknown> = newConfig;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]] as Record<string, unknown>;
      }

      current[keys[keys.length - 1]] = value;
      
      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      // Debounce the save operation
      saveTimeoutRef.current = setTimeout(() => {
        saveConfig(newConfig);
      }, 500);
      
      return newConfig;
    });
  }, [saveConfig]);

  // Validate API key
  const validateApiKey = useCallback(async (provider: 'unsplash' | 'pexels') => {
    if (!config.providers[provider].apiKey) {
      setValidationStatus(prev => ({ ...prev, [provider]: 'invalid' }));
      setValidationMessages(prev => ({ 
        ...prev, 
        [provider]: 'API key is required' 
      }));
      return;
    }

    setValidationStatus(prev => ({ ...prev, [provider]: 'validating' }));
    setValidationMessages(prev => ({ 
      ...prev, 
      [provider]: 'Validating API key...' 
    }));

    try {
      const response = await fetch('/api/asset-store/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          provider,
          apiKey: config.providers[provider].apiKey 
        }),
      });

      const data = await response.json();
      
      if (data.valid) {
        setValidationStatus(prev => ({ ...prev, [provider]: 'valid' }));
        setValidationMessages(prev => ({ 
          ...prev, 
          [provider]: data.message || 'API key is valid' 
        }));
      } else {
        setValidationStatus(prev => ({ ...prev, [provider]: 'invalid' }));
        setValidationMessages(prev => ({ 
          ...prev, 
          [provider]: data.message || 'API key is invalid' 
        }));
      }
    } catch (error) {
      console.error(`Failed to validate ${provider} API key:`, error);
      setValidationStatus(prev => ({ ...prev, [provider]: 'invalid' }));
      setValidationMessages(prev => ({ 
        ...prev, 
        [provider]: 'Failed to validate API key' 
      }));
    }
  }, [config.providers]);

  // Toggle API key visibility
  const toggleApiKeyVisibility = useCallback((provider: 'unsplash' | 'pexels') => {
    setShowApiKeys(prev => ({
      ...prev,
      [provider]: !prev[provider],
    }));
  }, []);

  // Handle API key input changes with immediate state update
  const handleApiKeyChange = useCallback((provider: 'unsplash' | 'pexels', value: string) => {
    setConfig(prev => ({
      ...prev,
      providers: {
        ...prev.providers,
        [provider]: {
          ...prev.providers[provider],
          apiKey: value,
        },
      },
    }));
  }, []);

  // Handle API key save with debouncing
  const handleApiKeySave = useCallback((provider: 'unsplash' | 'pexels', value: string) => {
    const newConfig = { ...config };
    newConfig.providers[provider].apiKey = value;
    
    // Save API key to cookie immediately
    if (value) {
      document.cookie = `${provider}_api_key=${encodeURIComponent(value)}; path=/; max-age=31536000; SameSite=Lax`;
    } else {
      // Remove cookie if API key is empty
      document.cookie = `${provider}_api_key=; path=/; max-age=0`;
    }
    
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Debounce the save operation (for other config changes)
    saveTimeoutRef.current = setTimeout(() => {
      saveConfig(newConfig);
    }, 1000);
  }, [config, saveConfig]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading asset store configuration...</p>
        </div>
      </div>
    );
  }

  const providers = Object.keys(config.providers);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
            Asset Store Configuration
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Configure external asset providers and their API settings
          </p>
        </div>
        <div className="flex items-center gap-2">
          {saveStatus === 'saving' && (
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm">
              <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              Saving...
            </div>
          )}
          {saveStatus === 'saved' && (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
              <Check className="w-3 h-3" />
              Saved
            </div>
          )}
          {saveStatus === 'error' && (
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
              <X className="w-3 h-3" />
              Save Failed
            </div>
          )}
        </div>
      </div>

      {/* Enable/Disable Toggle */}
      <div className="p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">
              Enable Asset Store
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Allow browsing and importing assets from external providers
            </p>
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.enabled}
              onChange={(e) => updateSetting('enabled', e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Enabled</span>
          </label>
        </div>
      </div>

      {config.enabled && (
        <>
          {/* Provider Tabs */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700">
              {providers.map(provider => (
                <button
                  key={provider}
                  onClick={() => setSelectedProvider(provider)}
                  className={cn(
                    'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                    selectedProvider === provider
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  )}
                >
                  {provider.charAt(0).toUpperCase() + provider.slice(1)}
                  <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded-full">
                    {config.providers[provider as keyof typeof config.providers].enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </button>
              ))}
            </div>

            {/* Provider Configuration */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                  {selectedProvider.charAt(0).toUpperCase() + selectedProvider.slice(1)} Configuration
                </h4>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => validateApiKey(selectedProvider as 'unsplash' | 'pexels')}
                    disabled={validationStatus[selectedProvider] === 'validating'}
                    className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50 disabled:border-gray-200 dark:disabled:border-gray-700 disabled:hover:bg-transparent text-gray-700 dark:text-gray-300 disabled:text-gray-400 rounded-lg transition-all duration-200 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    {validationStatus[selectedProvider] === 'validating' ? (
                      <>
                        <div className="w-3 h-3 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
                        Validating...
                      </>
                    ) : (
                      <>
                        <Zap className="w-3 h-3" />
                        Validate API Key
                      </>
                    )}
                  </button>
                </div>
              </div>

              <ProviderCard
                provider={selectedProvider as 'unsplash' | 'pexels'}
                config={{
                  enabled: config.providers[selectedProvider as keyof typeof config.providers]?.enabled ?? false,
                  apiKey: config.providers[selectedProvider as keyof typeof config.providers]?.apiKey ?? '',
                  rateLimit: config.providers[selectedProvider as keyof typeof config.providers]?.rateLimit ?? 50,
                }}
                showApiKey={showApiKeys[selectedProvider as keyof typeof showApiKeys]}
                validationStatus={validationStatus[selectedProvider]}
                validationMessage={validationMessages[selectedProvider]}
                onToggleApiKeyVisibility={() => toggleApiKeyVisibility(selectedProvider as 'unsplash' | 'pexels')}
                onUpdate={(updates) => {
                  // Handle each property in the updates object
                  Object.entries(updates).forEach(([key, value]) => {
                    updateSetting(`providers.${selectedProvider}.${key}`, value);
                  });
                }}
                onApiKeyChange={(value) => handleApiKeyChange(selectedProvider as 'unsplash' | 'pexels', value)}
                onApiKeySave={(value) => handleApiKeySave(selectedProvider as 'unsplash' | 'pexels', value)}
              />
            </div>
          </div>

          {/* UI Settings */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">
              Display Settings
            </h4>

            <div className="p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Default View
                  </label>
                  <select
                    value={config.ui.defaultView}
                    onChange={(e) => updateSetting('ui.defaultView', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-colors duration-150"
                  >
                    <option value="grid">Grid View</option>
                    <option value="list">List View</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Items Per Page
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={config.ui.itemsPerPage}
                    onChange={(e) => updateSetting('ui.itemsPerPage', parseInt(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-colors duration-150"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <input
                  type="checkbox"
                  checked={config.ui.showAttribution}
                  onChange={(e) => updateSetting('ui.showAttribution', e.target.checked)}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Show attribution for assets
                </span>
              </div>
            </div>
          </div>

          {/* Cache Settings */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">
              Cache Settings
            </h4>

            <div className="p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  checked={config.cache.enabled}
                  onChange={(e) => updateSetting('cache.enabled', e.target.checked)}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Enable asset caching
                </span>
              </div>

              {config.cache.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Max Cached Items
                    </label>
                    <input
                      type="number"
                      min="100"
                      max="10000"
                      value={config.cache.maxItems}
                      onChange={(e) => updateSetting('cache.maxItems', parseInt(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-colors duration-150"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Cache TTL (minutes)
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="1440"
                      value={config.cache.ttl}
                      onChange={(e) => updateSetting('cache.ttl', parseInt(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-colors duration-150"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Info Section */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium mb-1">API Key Security</p>
                <p>
                  Your API keys are stored securely in browser cookies and are never sent to our servers. 
                  They are only used to make direct requests to the respective APIs from your browser.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Provider Card Component
function ProviderCard({
  provider,
  config,
  showApiKey,
  validationStatus,
  validationMessage,
  onToggleApiKeyVisibility,
  onUpdate,
  onApiKeyChange,
  onApiKeySave,
}: {
  provider: 'unsplash' | 'pexels';
  config: { enabled: boolean; apiKey: string; rateLimit: number };
  showApiKey: boolean;
  validationStatus: 'idle' | 'validating' | 'valid' | 'invalid';
  validationMessage: string;
  onToggleApiKeyVisibility: () => void;
  onUpdate: (updates: { enabled?: boolean; apiKey?: string; rateLimit?: number }) => void;
  onApiKeyChange: (value: string) => void;
  onApiKeySave: (value: string) => void;
}) {
  const getProviderIcon = () => {
    switch (provider) {
      case 'unsplash':
        return <Image className="w-6 h-6 text-white" />;
      case 'pexels':
        return <Video className="w-6 h-6 text-white" />;
      default:
        return <Package className="w-6 h-6 text-white" />;
    }
  };

  const getProviderColor = () => {
    switch (provider) {
      case 'unsplash':
        return 'from-blue-500 to-purple-500';
      case 'pexels':
        return 'from-green-500 to-teal-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getProviderInfo = () => {
    switch (provider) {
      case 'unsplash':
        return {
          name: 'Unsplash',
          description: 'High-quality free photos',
          rateLimit: '50 requests/hour',
          link: 'https://unsplash.com/developers',
          color: 'blue',
        };
      case 'pexels':
        return {
          name: 'Pexels',
          description: 'Free stock photos and videos',
          rateLimit: '200 requests/hour',
          link: 'https://www.pexels.com/api/',
          color: 'green',
        };
      default:
        return {
          name: 'Unknown',
          description: 'Unknown provider',
          rateLimit: 'Unknown',
          link: '#',
          color: 'gray',
        };
    }
  };

  const info = getProviderInfo();

  // Ensure config values are always defined
  const safeConfig = {
    enabled: config.enabled ?? false,
    apiKey: config.apiKey ?? '',
    rateLimit: config.rateLimit ?? 50,
  };

  return (
    <div className="p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getProviderColor()} flex items-center justify-center`}>
            {getProviderIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h5 className="font-medium text-gray-900 dark:text-white">
                {info.name}
              </h5>
              <span className={`px-2 py-1 text-xs font-medium bg-${info.color}-100 dark:bg-${info.color}-900/50 text-${info.color}-600 dark:text-${info.color}-400 rounded-full`}>
                Free
              </span>
              {safeConfig.enabled && (
                <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-xs font-medium">Enabled</span>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {info.description}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-400">
                Rate Limit: {info.rateLimit}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={safeConfig.enabled}
              onChange={(e) => onUpdate({ enabled: e.target.checked })}
              className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Enable</span>
          </label>
        </div>
      </div>

      {safeConfig.enabled && (
        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              API Key
            </label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={safeConfig.apiKey}
                onChange={(e) => {
                  onApiKeyChange(e.target.value);
                }}
                onBlur={(e) => {
                  onApiKeySave(e.target.value);
                }}
                placeholder={`Your ${info.name} API key`}
                className="w-full px-3 py-2 pr-10 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-colors duration-150"
              />
              <button
                type="button"
                onClick={onToggleApiKeyVisibility}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showApiKey ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            
            {/* Validation Status */}
            <div className="flex items-center gap-2 mt-2">
              {validationStatus === 'valid' && (
                <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <Check className="w-3 h-3" />
                  <span className="text-xs font-medium">Valid</span>
                </div>
              )}
              {validationStatus === 'invalid' && (
                <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                  <X className="w-3 h-3" />
                  <span className="text-xs font-medium">Invalid</span>
                </div>
              )}
              {validationStatus === 'validating' && (
                <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                  <div className="w-3 h-3 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-medium">Validating</span>
                </div>
              )}
              {validationMessage && (
                <span className={`text-xs ${
                  validationStatus === 'valid' ? 'text-green-600 dark:text-green-400' :
                  validationStatus === 'invalid' ? 'text-red-600 dark:text-red-400' :
                  'text-gray-500 dark:text-gray-400'
                }`}>
                  {validationMessage}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Rate Limit: {safeConfig.rateLimit} requests/hour
            </span>
            <a
              href={info.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline text-sm"
            >
              Get API Key
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}