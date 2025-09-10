'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Package,
  Check,
  X,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  ChevronDown,
  AlertTriangle,
  Settings,
  Zap,
  ExternalLink,
  Search,
  Download,
  Loader2,
} from 'lucide-react';
import { AzureModelsConfig, AzureModel, AzureConfig } from '@/types/azure';
import { cn } from '@/lib/utils';
import { config } from '@/lib/settings';
import { AZURE_MODELS_CONFIG_KEY } from '@/lib/constants';

export function ModelsSettings() {
  const [modelsConfig, setModelsConfig] = useState<AzureModelsConfig>({
    imageModels: { generation: {} },
    endpoints: [],
    tools: {},
    presets: {},
  });
  const [azureConfig, setAzureConfig] = useState<AzureConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [selectedProvider, setSelectedProvider] = useState<string>('openai');
  const [showModelCatalog, setShowModelCatalog] = useState(false);
  const [catalogModels, setCatalogModels] = useState<AzureModel[]>([]);
  const [isFetchingCatalog, setIsFetchingCatalog] = useState(false);
  const [catalogError, setCatalogError] = useState<string>('');
  const [isAzureConfigured, setIsAzureConfigured] = useState(false);
  
  // Load models configuration from localStorage and get Azure status from API
  useEffect(() => {
    const loadConfiguration = async () => {
      try {
        // Load default models configuration from API (contains JSON file data)
        const modelsResponse = await fetch('/api/azure/models');
        let defaultModelsConfig: AzureModelsConfig | null = null;
        let azureConfigured = false;
        let hasValidCredentials = false;

        if (modelsResponse.ok) {
          const modelsData = await modelsResponse.json();
          console.log('Default models data received from API:', modelsData);
          defaultModelsConfig = modelsData.models;
          azureConfigured = modelsData.azureConfigured;
          hasValidCredentials = modelsData.hasValidCredentials;

          // Set Azure configuration state
          setIsAzureConfigured(azureConfigured);
          console.log('Azure configured status:', azureConfigured);

          // Set Azure configuration object for validation logic
          if (hasValidCredentials) {
            setAzureConfig({
              primary: { status: azureConfigured ? 'valid' : 'invalid' },
              endpoints: [],
              primaryApiKey: '***********', // Never expose actual key
              primaryEndpoint: '***********', // Never expose actual endpoint
              defaultSettings: { outputFormat: 'png', size: '1024x1024', n: 1 },
              ui: { theme: 'light', showConsole: false, animationsEnabled: true },
            });
          }
        }

        // Try to load custom models from localStorage using config system
        const savedModelsConfig = config(AZURE_MODELS_CONFIG_KEY, null, 'localStorage');
        let finalModelsConfig = defaultModelsConfig;

        if (savedModelsConfig) {
          console.log('Found saved models in localStorage:', savedModelsConfig);
          finalModelsConfig = savedModelsConfig as AzureModelsConfig;
        } else if (defaultModelsConfig) {
          console.log('Using default models config from JSON file');
          finalModelsConfig = defaultModelsConfig;
        }

        if (finalModelsConfig) {
          setModelsConfig(finalModelsConfig);
          // Set the first available provider as selected
          const providers = Object.keys(finalModelsConfig.imageModels.generation);
          console.log('Available providers:', providers);
          if (providers.length > 0) {
            setSelectedProvider(providers[0]);
            console.log('Selected provider:', providers[0]);
            console.log('Models for provider:', finalModelsConfig.imageModels.generation[providers[0]]);
          }
        }
      } catch (error) {
        console.error('Failed to load configurations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadConfiguration();
  }, []);

  // Save models configuration to localStorage
  const saveConfiguration = useCallback(async (modelsConfig: AzureModelsConfig) => {
    console.log('Saving models configuration to localStorage:', modelsConfig);
    setIsSaving(true);
    setSaveStatus('saving');

    try {
      // Validate structure with API first
      const response = await fetch('/api/azure/models', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ models: modelsConfig }),
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log('Models configuration structure validated:', responseData);
        
        // Save to localStorage using config system
        config(AZURE_MODELS_CONFIG_KEY, responseData.models, 'localStorage');
        console.log('Models configuration saved to localStorage successfully');
        
        setSaveStatus('saved');
        // Reset save status after 2 seconds
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        console.error('Failed to validate models configuration:', response.status);
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Failed to save models configuration:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  }, []);

  // Fetch models from Azure Model Catalog
  const fetchModelCatalog = useCallback(async (provider: string) => {
    setIsFetchingCatalog(true);
    setCatalogError('');
    
    try {
      const response = await fetch(`/api/azure/model-catalog?provider=${provider}&type=image-generation`);
      const data = await response.json();
      
      if (data.success) {
        setCatalogModels(data.models || []);
        setShowModelCatalog(true);
      } else {
        setCatalogError(data.error || 'Failed to fetch model catalog');
      }
    } catch (error) {
      console.error('Error fetching model catalog:', error);
      setCatalogError('Failed to connect to Azure Model Catalog');
    } finally {
      setIsFetchingCatalog(false);
    }
  }, []);

  // Add model from catalog or create custom model
  const addModel = useCallback((provider: string, catalogModel?: AzureModel) => {
    const newModel: AzureModel = catalogModel || {
      id: `custom-model-${Date.now()}`,
      name: 'New Custom Model',
      description: 'Custom model description - please update with actual specifications',
      provider: provider,
      apiVersion: '2025-04-01-preview',
      capabilities: ['text-to-image'],
      supportedSizes: [
        {
          size: '1024x1024',
          label: 'Square (1:1)',
          aspect: '1:1',
          description: 'Standard resolution',
        },
      ],
      supportedFormats: ['png', 'jpeg'],
      qualityLevels: ['standard'],
      maxImages: 1,
      requiresApproval: false,
      features: {
        highQuality: true,
      },
      status: 'idle',
      validated_at: null,
      deploymentName: '',
      enabled: true,
    };

    setModelsConfig(prev => {
      const updated = {
        ...prev,
        imageModels: {
          ...prev.imageModels,
          generation: {
            ...prev.imageModels.generation,
            [provider]: [...(prev.imageModels.generation[provider] || []), newModel],
          },
        },
      };
      saveConfiguration(updated);
      return updated;
    });

    // Close catalog modal if open
    if (catalogModel) {
      setShowModelCatalog(false);
    }
  }, [saveConfiguration]);

  // Update model and optionally save to localStorage
  const updateModel = useCallback((provider: string, modelId: string, updates: Partial<AzureModel>, shouldSave: boolean = true) => {
    setModelsConfig(prev => {
      const updated = {
        ...prev,
        imageModels: {
          ...prev.imageModels,
          generation: {
            ...prev.imageModels.generation,
            [provider]: prev.imageModels.generation[provider]?.map(model =>
              model.id === modelId ? { ...model, ...updates } : model
            ) || [],
          },
        },
      };
      
      // Only save if explicitly requested
      if (shouldSave) {
        saveConfiguration(updated);
      }
      return updated;
    });
  }, [saveConfiguration]);

  // Remove model and save to cookies
  const removeModel = useCallback((provider: string, modelId: string) => {
    setModelsConfig(prev => {
      const updated = {
        ...prev,
        imageModels: {
          ...prev.imageModels,
          generation: {
            ...prev.imageModels.generation,
            [provider]: prev.imageModels.generation[provider]?.filter(model =>
              model.id !== modelId
            ) || [],
          },
        },
      };
      
      // Always save the entire configuration to cookies after removal
      saveConfiguration(updated);
      return updated;
    });
  }, [saveConfiguration]);

  // Validate model with Azure endpoint - ensures all models are saved to localStorage
  const validateModel = useCallback(async (model: AzureModel, provider: string) => {
    if (!isAzureConfigured) {
      return { valid: false, message: 'Azure primary API key and endpoint must be configured first' };
    }

    // Set pending status immediately without saving yet
    updateModel(provider, model.id, { 
      status: 'pending', 
      validated_at: new Date().toISOString() 
    }, false);

    try {
      const response = await fetch('/api/azure/models', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          modelId: model.id,
          deploymentName: model.deploymentName || model.id,
          provider: model.provider,
        }),
      });

      const data = await response.json();
      
      const status = data.valid ? 'valid' : 'invalid';
      const message = data.message || (data.valid ? 'Model validated successfully' : 'Model validation failed');
      
      // Update validation status and save entire configuration to localStorage (final save)
      updateModel(provider, model.id, { 
        status,
        validated_at: new Date().toISOString() 
      }, true);
      
      return { valid: data.valid, message };
    } catch (error) {
      // Update with error status and save entire configuration to localStorage (final save)
      updateModel(provider, model.id, { 
        status: 'invalid',
        validated_at: new Date().toISOString() 
      }, true);
      return { valid: false, message: 'Failed to validate model' };
    }
  }, [isAzureConfigured, updateModel]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading models configuration...</p>
        </div>
      </div>
    );
  }

  // Use the state variable set from API response
  const providers = Object.keys(modelsConfig.imageModels.generation);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
            Models Configuration
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage your AI image generation models and their settings
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

      {/* Azure Configuration Warning */}
      {!isAzureConfigured && (
        <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">
                Azure Configuration Required
              </h4>
              <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
                Before you can validate models, you need to configure your Azure API key and endpoint in the Azure settings tab.
              </p>
              <button
                onClick={() => {
                  // This would typically trigger navigation to Azure tab
                  // For now, we'll show a message
                  alert('Please go to the Azure settings tab to configure your API credentials first.');
                }}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-amber-800 dark:text-amber-200 hover:text-amber-900 dark:hover:text-amber-100 border border-amber-300 dark:border-amber-600 hover:border-amber-400 dark:hover:border-amber-500 rounded-md transition-colors"
              >
                <Settings className="w-3 h-3" />
                Configure Azure Settings
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

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
                {modelsConfig.imageModels.generation[provider]?.length || 0}
              </span>
            </button>
          ))}
        </div>

        {/* Models List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">
              {selectedProvider.charAt(0).toUpperCase() + selectedProvider.slice(1)} Models
            </h4>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchModelCatalog(selectedProvider)}
                disabled={isFetchingCatalog}
                className="flex items-center gap-2 px-3 py-1.5 border border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400 rounded-md transition-colors duration-150 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isFetchingCatalog ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Search className="w-3 h-3" />
                )}
                Browse Catalog
              </button>
              <button
                onClick={() => addModel(selectedProvider)}
                className="flex items-center gap-2 px-3 py-1.5 border border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-md transition-colors duration-150 text-sm"
              >
                <Plus className="w-3 h-3" />
                Add Custom
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {(!modelsConfig.imageModels.generation[selectedProvider] || modelsConfig.imageModels.generation[selectedProvider].length === 0) ? (
              <div className="p-8 text-center rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No Models Configured
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Add your first {selectedProvider} model to get started
                </p>
                <button
                  onClick={() => addModel(selectedProvider)}
                  className="px-4 py-2 border border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-md transition-colors duration-150 text-sm"
                >
                  Add Your First Model
                </button>
              </div>
            ) : (
              modelsConfig.imageModels.generation[selectedProvider].map(model => (
                <ModelCard
                  key={model.id}
                  model={model}
                  provider={selectedProvider}
                  isAzureConfigured={isAzureConfigured}
                  onUpdate={(updates) => updateModel(selectedProvider, model.id, updates)}
                  onRemove={() => removeModel(selectedProvider, model.id)}
                  onValidate={() => validateModel(model, selectedProvider)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Model Catalog Modal */}
      {showModelCatalog && (
        <ModelCatalogModal
          provider={selectedProvider}
          models={catalogModels}
          isLoading={isFetchingCatalog}
          error={catalogError}
          onClose={() => setShowModelCatalog(false)}
          onSelectModel={(model) => addModel(selectedProvider, model)}
        />
      )}
    </div>
  );
}

// Model Card Component
function ModelCard({
  model,
  provider,
  isAzureConfigured,
  onUpdate,
  onRemove,
  onValidate,
}: {
  model: AzureModel;
  provider: string;
  isAzureConfigured: boolean;
  onUpdate: (updates: Partial<AzureModel>) => void;
  onRemove: () => void;
  onValidate: () => Promise<{ valid: boolean; message?: string }>;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');

  const handleValidate = async () => {
    if (!isAzureConfigured) {
      setValidationMessage('Azure configuration is required for validation');
      return;
    }

    setIsValidating(true);
    setValidationMessage('');

    try {
      const result = await onValidate();
      setValidationMessage(result.message || 'Validation completed');
    } catch (error) {
      setValidationMessage('Failed to validate model');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h5 className="font-medium text-gray-900 dark:text-white">
                {model.name}
              </h5>
              {model.primary && (
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full">
                  Primary
                </span>
              )}
              {model.status === 'valid' && (
                <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-xs font-medium">Valid</span>
                </div>
              )}
              {model.status === 'invalid' && (
                <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span className="text-xs font-medium">Invalid</span>
                </div>
              )}
              {model.status === 'pending' && (
                <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                  <span className="text-xs font-medium">Validating</span>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {model.description}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-400">
                {model.capabilities.join(', ')}
              </span>
              {model.validated_at && (
                <span className="text-xs text-gray-400">
                  • Last validated: {new Date(model.validated_at).toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleValidate}
            disabled={isValidating || !isAzureConfigured}
            className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50 disabled:border-gray-200 dark:disabled:border-gray-700 disabled:hover:bg-transparent text-gray-700 dark:text-gray-300 disabled:text-gray-400 rounded-lg transition-all duration-200 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-2"
          >
            {isValidating ? (
              <>
                <div className="w-3 h-3 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
                Validating...
              </>
            ) : (
              <>
                <Zap className="w-3 h-3" />
                Validate
              </>
            )}
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-md transition-colors duration-150"
          >
            <ChevronDown
              className={`w-3 h-3 text-gray-500 transition-transform duration-150 ${isExpanded ? 'rotate-180' : ''}`}
            />
          </button>
          <button
            onClick={onRemove}
            className="p-1.5 border border-red-300 dark:border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-md transition-colors duration-150"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Model Name
              </label>
              <input
                type="text"
                value={model.name}
                onChange={e => onUpdate({ name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-colors duration-150"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Model ID
              </label>
              <input
                type="text"
                value={model.id}
                onChange={e => onUpdate({ id: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-colors duration-150"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                API Version
              </label>
              <input
                type="text"
                value={model.apiVersion}
                onChange={e => onUpdate({ apiVersion: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-colors duration-150"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={model.description}
                onChange={e => onUpdate({ description: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-colors duration-150"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Deployment Name
              </label>
              <input
                type="text"
                value={model.deploymentName || ''}
                onChange={e => onUpdate({ deploymentName: e.target.value })}
                placeholder="Enter deployment name"
                className="w-full px-3 py-2 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-colors duration-150"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Max Images
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={model.maxImages}
                onChange={e => onUpdate({ maxImages: parseInt(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-colors duration-150"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={model.primary || false}
                onChange={e => onUpdate({ primary: e.target.checked })}
                className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Primary Model</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={model.requiresApproval}
                onChange={e => onUpdate({ requiresApproval: e.target.checked })}
                className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Requires Approval</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={model.enabled || false}
                onChange={e => onUpdate({ enabled: e.target.checked })}
                className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Enabled</span>
            </label>
          </div>
          
          {/* Validation Status */}
          {validationMessage && (
            <div className={`p-3 rounded-lg text-sm ${
              model.status === 'valid' 
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' 
                : model.status === 'invalid'
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                  : 'bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300'
            }`}>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  model.status === 'valid'
                    ? 'bg-green-500'
                    : model.status === 'invalid'
                      ? 'bg-red-500'
                      : 'bg-gray-300 dark:bg-gray-600'
                }`} />
                <span className="font-medium">
                  {model.status === 'valid' ? 'Valid' : model.status === 'invalid' ? 'Invalid' : 'Validating...'}
                </span>
              </div>
              <p className="mt-1">{validationMessage}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Model Catalog Modal Component
function ModelCatalogModal({
  provider,
  models,
  isLoading,
  error,
  onClose,
  onSelectModel,
}: {
  provider: string;
  models: AzureModel[];
  isLoading: boolean;
  error: string;
  onClose: () => void;
  onSelectModel: (model: AzureModel) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[80vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Azure Model Catalog
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Browse and add {provider} models from Azure Model Catalog
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {error && (
            <div className="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                    Failed to Load Model Catalog
                  </h4>
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Loading models from Azure Catalog...</p>
              </div>
            </div>
          ) : models.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Models Found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                No {provider} models available in the catalog at this time.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {models.map((model) => (
                <div
                  key={model.id}
                  className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors cursor-pointer"
                  onClick={() => onSelectModel(model)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                        <Package className="w-5 h-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-medium text-gray-900 dark:text-white truncate">
                          {model.name}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {model.provider}
                        </p>
                      </div>
                    </div>
                    <button className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors">
                      <Download className="w-3 h-3" />
                      Add
                    </button>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                    {model.description}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <span className="font-medium">Capabilities:</span>
                      <span className="truncate">{model.capabilities.join(', ')}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 dark:text-gray-400">
                        Max Images: {model.maxImages}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        Formats: {model.supportedFormats.join(', ')}
                      </span>
                    </div>
                    {model.requiresApproval && (
                      <div className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded-full">
                        <AlertTriangle className="w-3 h-3" />
                        Requires Approval
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {models.length} model{models.length !== 1 ? 's' : ''} available
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}