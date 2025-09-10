'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Globe,
  Key,
  ChevronDown,
  Check,
  X,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Lock,
} from 'lucide-react';
import { AzureConfig, AzureEndpoint } from '@/types/azure';
import { AzurePasswordPrompt } from './azure-password-prompt';
import logger from '@/lib/logger';
export function AzureSettings() {
  const [azureConfig, setAzureConfig] = useState<AzureConfig>({
    primary: {
      status: 'idle',
      validated_at: undefined,
    },
    endpoints: [],
    primaryApiKey: '',
    primaryEndpoint: '',
    defaultSettings: {
      outputFormat: 'b64_json',
      size: '1024x1024',
      n: 1,
    },
    ui: {
      theme: 'light',
      showConsole: false,
      animationsEnabled: true,
    },
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');
  const [validationMessage, setValidationMessage] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(true);



  // Check for existing authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      // Check for auth token in cookies
      const cookies = document.cookie.split(';');
      const authCookie = cookies.find(cookie => cookie.trim().startsWith('authToken='));
      
      if (authCookie) {
        const token = authCookie.split('=')[1];
        setAuthToken(token);
        setIsAuthenticated(true);
      } else {
        setShowPasswordPrompt(true);
      }
      setIsLoading(false);
    };

    if (typeof window !== 'undefined') {
      checkAuth();
    }
  }, []);

  // Load configuration only after authentication
  useEffect(() => {
    if (typeof window !== 'undefined' && isAuthenticated && authToken) {
      const loadConfiguration = async () => {
        try {
          // Load from saved cookies first
          const response = await fetch('/api/azure/config', {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.config) {
              logger.info('Loaded configuration from cookies:', data.config);
              
              // Ensure the loaded config has the proper structure with validation fields
              const configWithValidation = {
                ...data.config,
                primary: {
                  status: (data.config.primary?.status || 'idle') as 'idle' | 'valid' | 'invalid' | 'pending',
                  validated_at: data.config.primary?.validated_at || null,
                },
                endpoints: data.config.endpoints?.map((endpoint: AzureEndpoint) => ({
                  ...endpoint,
                  status: (endpoint.status || 'idle') as 'idle' | 'valid' | 'invalid' | 'pending',
                  validated_at: endpoint.validated_at || null,
                })) || [],
              };
              
              setAzureConfig(configWithValidation);
              return; // Successfully loaded from cookies
            }
          }
        } catch (error) {
          logger.warn('Failed to load config from cookies:', error);
        }

        // Fallback: Load environment variables if no saved config
        try {
          const envResponse = await fetch('/api/azure/env-key', {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          });
          
          if (envResponse.ok) {
            const envData = await envResponse.json();
            setAzureConfig(prev => {
              const updated = { 
                ...prev,
                primary: {
                  status: 'idle' as const,
                  validated_at: null,
                },
                endpoints: prev.endpoints.map(endpoint => ({
                  ...endpoint,
                  status: (endpoint.status || 'idle') as 'idle' | 'valid' | 'invalid' | 'pending',
                  validated_at: endpoint.validated_at || null,
                })),
              };

              // Update with environment variables
              if (envData.apiKey) {
                updated.primaryApiKey = envData.apiKey;
              }
              if (envData.endpoint) {
                updated.primaryEndpoint = envData.endpoint;
              }

              return updated;
            });
          }
        } catch (error) {
          logger.warn('Failed to load environment variables:', error);
        }
      };

      loadConfiguration();
    }
  }, [isAuthenticated, authToken]);

  // Sync local validation status with configuration status
  useEffect(() => {
    if (azureConfig.primary.status === 'valid') {
      setValidationStatus('success');
    } else if (azureConfig.primary.status === 'invalid') {
      setValidationStatus('error');
    } else if (azureConfig.primary.status === 'pending') {
      setValidationStatus('idle');
    }
  }, [azureConfig.primary.status]);

  const updatePrimaryApiKey = (key: string) => {
    setAzureConfig(prev => ({ ...prev, primaryApiKey: key }));
  };


  const updatePrimaryEndpoint = (endpoint: string) => {
    setAzureConfig(prev => ({ ...prev, primaryEndpoint: endpoint }));
  };

  const validateConfiguration = useCallback(async () => {
    if (!azureConfig.primaryApiKey || !azureConfig.primaryEndpoint) {
      setValidationStatus('error');
      setValidationMessage('Please configure API key and endpoint');
      return;
    }

    setIsValidating(true);
    setValidationStatus('idle');

    try {
      const response = await fetch('/api/azure/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: azureConfig.primaryApiKey,
          endpoint: azureConfig.primaryEndpoint,
          resourceName: '', // Primary endpoint doesn't have a specific resource name
        }),
      });

      const data = await response.json();

      if (data.valid) {
        setValidationStatus('success');
        setValidationMessage(
          `Configuration is valid and ready to use. Found ${data.models} models.`
        );
        
        // Update primary and all endpoints with the same validation status and date
        const validationTimestamp = new Date().toISOString();
        const updatedConfig = {
          ...azureConfig,
          primary: {
            status: 'valid' as const,
            validated_at: validationTimestamp,
          },
          endpoints: azureConfig.endpoints.map(endpoint => ({
            ...endpoint,
            status: 'valid' as const,
            validated_at: validationTimestamp,
          })),
        };
        
        // Update the state
        setAzureConfig(updatedConfig);
        
        // Save configuration after successful validation
        try {
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
          };
          
          // Add authorization header if available
          if (isAuthenticated && authToken) {
            headers.Authorization = `Bearer ${authToken}`;
          }
          
          logger.info('Saving primary validation with config:', JSON.stringify(updatedConfig, null, 2));
          
          await fetch('/api/azure/config', {
            method: 'POST',
            headers,
            body: JSON.stringify({ config: updatedConfig }),
          });
        } catch (saveError) {
          logger.warn('Failed to save configuration:', saveError);
        }
      } else {
        setValidationStatus('error');
        setValidationMessage(data.message || 'Invalid API key');
        
        // Update primary and all endpoints with invalid status
        const validationTimestamp = new Date().toISOString();
        const updatedConfig = {
          ...azureConfig,
          primary: {
            status: 'invalid' as const,
            validated_at: validationTimestamp,
          },
          endpoints: azureConfig.endpoints.map(endpoint => ({
            ...endpoint,
            status: 'invalid' as const,
            validated_at: validationTimestamp,
          })),
        };
        
        // Update the state
        setAzureConfig(updatedConfig);
        
        // Save configuration with invalid status
        try {
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
          };
          
          // Add authorization header if available
          if (isAuthenticated && authToken) {
            headers.Authorization = `Bearer ${authToken}`;
          }
          
          logger.info('Saving primary validation error with config:', JSON.stringify(updatedConfig, null, 2));
          
          await fetch('/api/azure/config', {
            method: 'POST',
            headers,
            body: JSON.stringify({ config: updatedConfig }),
          });
        } catch (saveError) {
          logger.warn('Failed to save configuration:', saveError);
        }
      }
    } catch {
      setValidationStatus('error');
      setValidationMessage(
        'Failed to validate configuration. Please check your settings.'
      );
      
      // Update primary and all endpoints with invalid status
      const validationTimestamp = new Date().toISOString();
      const updatedConfig = {
        ...azureConfig,
        primary: {
          status: 'invalid' as const,
          validated_at: validationTimestamp,
        },
        endpoints: azureConfig.endpoints.map(endpoint => ({
          ...endpoint,
          status: 'invalid' as const,
          validated_at: validationTimestamp,
        })),
      };
      
      // Update the state
      setAzureConfig(updatedConfig);
      
      // Save configuration with invalid status
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        
        // Add authorization header if available
        if (isAuthenticated && authToken) {
          headers.Authorization = `Bearer ${authToken}`;
        }
        
        logger.info('Saving primary validation error with config:', JSON.stringify(updatedConfig, null, 2));
        
        await fetch('/api/azure/config', {
          method: 'POST',
          headers,
          body: JSON.stringify({ config: updatedConfig }),
        });
      } catch (saveError) {
        logger.warn('Failed to save configuration:', saveError);
      }
    } finally {
      setIsValidating(false);
    }
  }, [azureConfig, isAuthenticated, authToken]);

  const addEndpoint = () => {
    const deploymentName = `deployment-${Date.now()}`;
    const newEndpoint: AzureEndpoint = {
      id: deploymentName, // ID = deployment name
      name: 'New Endpoint', // Display name
      baseUrl: '',
      apiVersion: '2025-04-01-preview',
      apiKey: '', // Optional per-endpoint API key
      resourceName: '', // Required per-endpoint resource name
      deployments: [],
    };
    setAzureConfig(prev => ({
      ...prev,
      endpoints: [...prev.endpoints, newEndpoint],
    }));
  };

  const updateEndpoint = (id: string, updates: Partial<AzureEndpoint>) => {
    setAzureConfig(prev => ({
      ...prev,
      endpoints: prev.endpoints.map(ep =>
      ep.id === id ? { ...ep, ...updates } : ep
      ),
    }));
  };

  const removeEndpoint = (id: string) => {
    setAzureConfig(prev => ({
      ...prev,
      endpoints: prev.endpoints.filter(ep => ep.id !== id),
    }));
  };

  const validateEndpoint = async (endpoint: AzureEndpoint) => {
    logger.info('validateEndpoint called with endpoint:', endpoint);
    logger.info('Current azureConfig state:', azureConfig);
    
    // Use primary values as fallbacks if endpoint values are empty
    const apiKey = endpoint.apiKey || azureConfig.primaryApiKey;
    const baseUrl = endpoint.baseUrl || azureConfig.primaryEndpoint;
    
    if (!apiKey || !baseUrl) {
      return { valid: false, message: 'API key and endpoint are required (use primary values or set endpoint-specific values)' };
    }

    // Set pending status immediately
    const pendingEndpoint = {
      ...endpoint,
      status: 'pending' as const,
      validated_at: new Date().toISOString(),
    };
    
    // Update the endpoint in the configuration and save to server
    setAzureConfig(prev => {
      logger.info('setAzureConfig prev state:', prev);
      logger.info('Looking for endpoint with id:', endpoint.id);
      logger.info('Current endpoints in state:', prev.endpoints);
      
      const updatedConfig = {
        ...prev,
        endpoints: prev.endpoints.map(ep => 
          ep.id === endpoint.id ? pendingEndpoint : ep
        ),
      };
      
      logger.info('Updated config after mapping:', updatedConfig);
      
      // Save pending status to server (which will set cookies)
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Add authorization header if available
      if (isAuthenticated && authToken) {
        headers.Authorization = `Bearer ${authToken}`;
      }
      
      logger.info('Saving pending status with config:', JSON.stringify(updatedConfig, null, 2));
      
      fetch('/api/azure/config', {
        method: 'POST',
        headers,
        body: JSON.stringify({ config: updatedConfig }),
      }).then(response => {
        logger.info('Pending status save response:', response.status);
        return response.json();
      }).then(data => {
        logger.info('Pending status save data:', data);
      }).catch(saveError => {
        logger.warn('Failed to save pending status to server:', saveError);
      });
      
      return updatedConfig;
    });

    try {
      const response = await fetch('/api/azure/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: apiKey,
          endpoint: baseUrl,
          resourceName: endpoint.resourceName,
          apiVersion: endpoint.apiVersion,
          endpointId: endpoint.id,
          endpointName: endpoint.name,
          deployments: endpoint.deployments,
        }),
      });

      const data = await response.json();
      
      // Update the endpoint in the configuration and save to server
      setAzureConfig(prev => {
        // Find the current endpoint state (which may have been updated)
        const currentEndpoint = prev.endpoints.find(ep => ep.id === endpoint.id) || endpoint;
        
        // Update the endpoint with final validation status
        const finalEndpoint = {
          ...currentEndpoint,
          status: data.valid ? 'valid' as const : 'invalid' as const,
          validated_at: new Date().toISOString(),
        };
        
        const updatedConfig = {
          ...prev,
          endpoints: prev.endpoints.map(ep => 
            ep.id === endpoint.id ? finalEndpoint : ep
          ),
        };
        
        // Save final validation status to server (which will set cookies)
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        
        // Add authorization header if available
        if (isAuthenticated && authToken) {
          headers.Authorization = `Bearer ${authToken}`;
        }
        
        logger.info('Saving final validation with config:', JSON.stringify(updatedConfig, null, 2));
        
        fetch('/api/azure/config', {
          method: 'POST',
          headers,
          body: JSON.stringify({ config: updatedConfig }),
        }).then(response => {
          logger.info('Final validation save response:', response.status);
          return response.json();
        }).then(data => {
          logger.info('Final validation save data:', data);
        }).catch(saveError => {
          logger.warn('Failed to save validation status to server:', saveError);
        });
        
        return updatedConfig;
      });
      
      return data;
    } catch {
      // Update the endpoint in the configuration and save to server
      setAzureConfig(prev => {
        // Find the current endpoint state (which may have been updated)
        const currentEndpoint = prev.endpoints.find(ep => ep.id === endpoint.id) || endpoint;
        
        // Update the endpoint with error status
        const errorEndpoint = {
          ...currentEndpoint,
          status: 'invalid' as const,
          validated_at: new Date().toISOString(),
        };
        
        const updatedConfig = {
          ...prev,
          endpoints: prev.endpoints.map(ep => 
            ep.id === endpoint.id ? errorEndpoint : ep
          ),
        };
        
        // Save error status to server (which will set cookies)
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        
        // Add authorization header if available
        if (isAuthenticated && authToken) {
          headers.Authorization = `Bearer ${authToken}`;
        }
        
        logger.info('Saving error status with config:', JSON.stringify(updatedConfig, null, 2));
        
        fetch('/api/azure/config', {
          method: 'POST',
          headers,
          body: JSON.stringify({ config: updatedConfig }),
        }).then(response => {
          logger.info('Error status save response:', response.status);
          return response.json();
        }).then(data => {
          logger.info('Error status save data:', data);
        }).catch(saveError => {
          logger.warn('Failed to save error status to server:', saveError);
        });
        
        return updatedConfig;
      });
      
      return { valid: false, message: 'Failed to validate endpoint' };
    }
  };

  const handleAuthenticated = (token: string) => {
    // Save token in cookies for easy access
    document.cookie = `authToken=${token}; path=/; max-age=3600; secure=${process.env.NODE_ENV === 'production'}; samesite=lax`;
    setAuthToken(token);
    setIsAuthenticated(true);
    setShowPasswordPrompt(false);
  };

  const handleLockSettings = () => {
    // Clear the auth token cookie
    document.cookie = 'authToken=; path=/; max-age=0';
    setIsAuthenticated(false);
    setAuthToken(null);
    setShowPasswordPrompt(false);
  };

  const handleUnlockSettings = () => {
    setShowPasswordPrompt(true);
  };

  const handleCancelAuth = () => {
    setShowPasswordPrompt(false);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading configuration...</p>
        </div>
      </div>
    );
  }

  // Show password prompt if not authenticated
  if (showPasswordPrompt) {
    return (
      <AzurePasswordPrompt
        onAuthenticated={handleAuthenticated}
        onCancel={handleCancelAuth}
      />
    );
  }

  // Show locked state if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
            <Lock className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Azure Settings Locked
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Azure configuration settings are protected for security
          </p>
          <button
            onClick={handleUnlockSettings}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-150 flex items-center gap-2 mx-auto"
          >
            <Lock className="w-4 h-4" />
            Unlock Settings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
          Azure Configuration
        </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
          Configure your Azure OpenAI and AI Foundry endpoints and API keys
        </p>
        </div>
        <button
          onClick={handleLockSettings}
          className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-400 rounded-md transition-colors duration-150 text-sm flex items-center gap-2"
        >
          <Lock className="w-3 h-3" />
          Lock Settings
        </button>
      </div>

      {/* Credentials Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h4 className="text-base font-medium text-gray-900 dark:text-white">
              Credentials
            </h4>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                azureConfig.primary.status === 'valid'
                  ? 'bg-green-500'
                  : azureConfig.primary.status === 'invalid'
                    ? 'bg-red-500'
                    : azureConfig.primary.status === 'pending'
                      ? 'bg-yellow-500'
                      : 'bg-gray-300 dark:bg-gray-600'
              }`}
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {azureConfig.primary.status === 'valid'
                ? 'Active'
                : azureConfig.primary.status === 'invalid'
                  ? 'Not Active'
                  : azureConfig.primary.status === 'pending'
                    ? 'Validating...'
                    : 'Not Active'}
            </span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
          <div className="space-y-4">
            <div>
              
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Primary API Key  
                
              
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={azureConfig.primaryApiKey}
                  onChange={e => updatePrimaryApiKey(e.target.value)}
                  placeholder="Enter your primary Azure API key"
                  className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-colors duration-150"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showApiKey ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Primary API key used as fallback when endpoint-specific keys are not provided.
                <br />
                <span className="text-gray-500 dark:text-gray-400">
                  If you have AZURE_API_KEY in your environment variables, it will be automatically loaded as the fallback key.
                </span>
               
              </p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Primary Endpoint
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={azureConfig.primaryEndpoint}
                    onChange={e => updatePrimaryEndpoint(e.target.value)}
                    placeholder="https://your-resource.openai.azure.com"
                    className="flex-1 px-4 py-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-colors duration-150"
                  />
                  <button
                    onClick={validateConfiguration}
                    disabled={
                      isValidating ||
                      !azureConfig.primaryApiKey ||
                      !azureConfig.primaryEndpoint
                    }
                    className="flex items-center gap-2 px-4 py-3 border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50 disabled:border-gray-200 dark:disabled:border-gray-700 disabled:hover:bg-transparent text-gray-700 dark:text-gray-300 disabled:text-gray-400 rounded-lg transition-all duration-200 disabled:cursor-not-allowed text-sm font-medium whitespace-nowrap"
                  >
                    {isValidating ? (
                      <>
                        <div className="w-3 h-3 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
                        Validating...
                      </>
                    ) : (
                      <>
                        <Check className="w-3 h-3" />
                        Validate
                      </>
                    )}
                  </button>
                  
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Primary endpoint URL used as fallback when endpoint-specific URLs are not provided.
                  <br />
                  <span className="text-gray-500 dark:text-gray-400">
                    If you have AZURE_ENDPOINT in your environment variables,
                    it will be automatically loaded as the fallback endpoint.
                  </span>
                </p>
              </div>
            </div>

            <div className="space-y-3 mt-4">
             

              {(validationMessage || azureConfig.primary.validated_at) && (
                <div
                  className={`w-full px-3 py-2 rounded-lg flex items-center gap-2 ${
                    azureConfig.primary.status === 'valid'
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                      : azureConfig.primary.status === 'invalid'
                        ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                        : 'bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {azureConfig.primary.status === 'valid' ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                  <div className="flex-1">
                    {validationMessage && <div className="text-sm">{validationMessage}</div>}
                    {azureConfig.primary.validated_at && (
                      <div className="text-xs mt-1 opacity-75">
                        Last validated: {new Date(azureConfig.primary.validated_at).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            

           
          </div>
        </div>
    

      {/* Endpoints Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h4 className="text-base font-medium text-gray-900 dark:text-white">
              Endpoints
            </h4>
          </div>
          <button
            onClick={addEndpoint}
            className="flex items-center gap-2 px-3 py-1.5 border border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-md transition-colors duration-150 text-sm"
          >
            <Plus className="w-3 h-3" />
            Add Endpoint
          </button>
        </div>

        <div className="space-y-4">
          {azureConfig.endpoints.length === 0 ? (
            <div className="p-8 text-center rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
              <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Endpoints Configured
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Add your Azure OpenAI and AI Foundry endpoints to get started
                <br />
                <a
                  href="https://learn.microsoft.com/en-us/azure/ai-services/openai/how-to/create-resource"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-xs"
                >
                  📖 Learn how to create Azure OpenAI resources
                </a>
              </p>
              <button
                onClick={addEndpoint}
                className="px-4 py-2 border border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-md transition-colors duration-150 text-sm"
              >
                Add Your First Endpoint
              </button>
            </div>
          ) : (
            azureConfig.endpoints.map(endpoint => (
              <EndpointCard
                key={endpoint.id}
                endpoint={endpoint}
                primaryApiKey={azureConfig.primaryApiKey}
                primaryEndpoint={azureConfig.primaryEndpoint}
                onUpdate={updates => updateEndpoint(endpoint.id, updates)}
                onRemove={() => removeEndpoint(endpoint.id)}
                onValidate={() => validateEndpoint(endpoint)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Endpoint Card Component
function EndpointCard({
  endpoint,
  primaryApiKey,
  primaryEndpoint,
  onUpdate,
  onRemove,
  onValidate,
}: {
  endpoint: AzureEndpoint;
  primaryApiKey: string;
  primaryEndpoint: string;
  onUpdate: (updates: Partial<AzureEndpoint>) => void;
  onRemove: () => void;
  onValidate: () => Promise<{ valid: boolean; message?: string }>;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showEndpointApiKey, setShowEndpointApiKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [validationMessage, setValidationMessage] = useState('');

  const handleValidate = async () => {
    setIsValidating(true);
    setValidationStatus('idle');
    setValidationMessage('');

    try {
      const result = await onValidate();
      if (result.valid) {
        setValidationStatus('success');
        setValidationMessage('Endpoint is valid and ready to use');
      } else {
        setValidationStatus('error');
        setValidationMessage(result.message || 'Validation failed');
      }
    } catch {
      setValidationStatus('error');
      setValidationMessage('Failed to validate endpoint');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h5 className="font-medium text-gray-900 dark:text-white">
                {endpoint.name}
              </h5>
              {endpoint.status === 'valid' && (
                <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-xs font-medium">Validated</span>
                </div>
              )}
              {endpoint.status === 'invalid' && (
                <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span className="text-xs font-medium">Invalid</span>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {endpoint.baseUrl || 'No URL configured'}
            </p>
            {endpoint.validated_at && (
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Last validated: {new Date(endpoint.validated_at).toLocaleString()}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleValidate}
            disabled={isValidating || (!endpoint.apiKey && !primaryApiKey) || (!endpoint.baseUrl && !primaryEndpoint)}
            className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50 disabled:border-gray-200 dark:disabled:border-gray-700 disabled:hover:bg-transparent text-gray-700 dark:text-gray-300 disabled:text-gray-400 rounded-lg transition-all duration-200 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-2"
          >
            {isValidating ? (
              <>
                <div className="w-3 h-3 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
                Validating...
              </>
            ) : (
              <>
                <Check className="w-3 h-3" />
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
                Display Name
              </label>
              <input
                type="text"
                value={endpoint.name}
                onChange={e => onUpdate({ name: e.target.value })}
                placeholder="Enter a display name for this endpoint"
                className="w-full px-3 py-2 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-colors duration-150"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Deployment Name (ID)
              </label>
              <input
                type="text"
                value={endpoint.id}
                onChange={e => onUpdate({ id: e.target.value })}
                placeholder="Enter the deployment name (e.g., dalle-3, flux-1-1-pro)"
                className="w-full px-3 py-2 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-colors duration-150"
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                This is the actual deployment name used by Azure OpenAI. It must match the deployment name in your Azure resource.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Base URL {!endpoint.baseUrl && primaryEndpoint && (
                  <span className="text-xs text-blue-600 dark:text-blue-400">(using primary)</span>
                )}
              </label>
              <input
                type="url"
                value={endpoint.baseUrl || ''}
                onChange={e => onUpdate({ baseUrl: e.target.value })}
                placeholder={primaryEndpoint || "https://your-endpoint.openai.azure.com"}
                className="w-full px-3 py-2 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-colors duration-150"
              />
              {!endpoint.baseUrl && primaryEndpoint && (
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  Using primary endpoint: {primaryEndpoint}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                API Version
              </label>
              <input
                type="text"
                value={endpoint.apiVersion}
                onChange={e => onUpdate({ apiVersion: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-colors duration-150"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Endpoint API Key (Optional) {!endpoint.apiKey && primaryApiKey && (
                  <span className="text-xs text-blue-600 dark:text-blue-400">(using primary)</span>
                )}
              </label>
              <div className="relative">
                <input
                  type={showEndpointApiKey ? 'text' : 'password'}
                  value={endpoint.apiKey || ''}
                  onChange={e => onUpdate({ apiKey: e.target.value })}
                  placeholder="Leave empty to use primary API key"
                  className="w-full px-3 py-2 pr-10 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-colors duration-150"
                />
                <button
                  type="button"
                  onClick={() => setShowEndpointApiKey(!showEndpointApiKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showEndpointApiKey ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {!endpoint.apiKey && primaryApiKey ? (
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  Using primary API key (ending in ...{primaryApiKey.slice(-4)})
                </p>
              ) : (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Specific API key for this endpoint. If empty, primary API key will be used.
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Endpoint Resource Name (Required)
              </label>
              <input
                type="text"
                value={endpoint.resourceName || ''}
                onChange={e => onUpdate({ resourceName: e.target.value })}
                placeholder="Enter resource name for this endpoint"
                className="w-full px-3 py-2 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-colors duration-150"
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Resource name for this endpoint. Required for proper validation
                and API calls.
                <br />
                <a
                  href="https://learn.microsoft.com/en-us/azure/ai-services/openai/how-to/create-resource"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  📖 How to find your endpoint URL and resource name
                </a>
              </p>
            </div>
          </div>
          
          {/* Validation Status */}
          {validationMessage && (
            <div className={`p-3 rounded-lg text-sm ${
              validationStatus === 'success' 
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' 
                : validationStatus === 'error'
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                  : 'bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300'
            }`}>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  validationStatus === 'success'
                    ? 'bg-green-500'
                    : validationStatus === 'error'
                      ? 'bg-red-500'
                      : 'bg-gray-300 dark:bg-gray-600'
                }`} />
                <span className="font-medium">
                  {validationStatus === 'success' ? 'Active' : validationStatus === 'error' ? 'Not Active' : 'Validating...'}
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
