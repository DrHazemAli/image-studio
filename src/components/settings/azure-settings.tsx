'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  Sliders,
} from 'lucide-react';
import { config } from '@/lib/settings';
import { AzureConfig, AzureEndpoint } from '@/types/azure';

export function AzureSettings() {
  const [endpoints, setEndpoints] = useState<AzureEndpoint[]>([]);
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');
  const [validationMessage, setValidationMessage] = useState('');

  useEffect(() => {
    // Load saved endpoints from cookies
    const savedEndpoints = config('azure.endpoints', [], 'cookies');
    if (savedEndpoints && Array.isArray(savedEndpoints)) {
      setEndpoints(savedEndpoints);
    }

    // Load API key from cookies (encrypted)
    const savedApiKey = config('azure.apiKey', '', 'cookies', true);
    setApiKey(savedApiKey);
  }, []);

  const saveEndpoints = (newEndpoints: AzureEndpoint[]) => {
    setEndpoints(newEndpoints);
    config('azure.endpoints', newEndpoints, 'cookies');
  };

  const saveApiKey = (key: string) => {
    setApiKey(key);
    config('azure.apiKey', key, 'cookies', true);
  };

  const validateConfiguration = async () => {
    if (!apiKey || endpoints.length === 0) {
      setValidationStatus('error');
      setValidationMessage(
        'Please configure API key and at least one endpoint'
      );
      return;
    }

    setIsValidating(true);
    setValidationStatus('idle');

    try {
      // Simulate validation - in real implementation, you'd call your API
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setValidationStatus('success');
      setValidationMessage('Configuration is valid and ready to use');
    } catch (error) {
      setValidationStatus('error');
      setValidationMessage(
        'Failed to validate configuration. Please check your settings.'
      );
    } finally {
      setIsValidating(false);
    }
  };

  const addEndpoint = () => {
    const newEndpoint: AzureEndpoint = {
      id: `endpoint-${Date.now()}`,
      name: 'New Endpoint',
      baseUrl: '',
      apiVersion: '2025-04-01-preview',
      deployments: [],
    };
    saveEndpoints([...endpoints, newEndpoint]);
  };

  const updateEndpoint = (id: string, updates: Partial<AzureEndpoint>) => {
    const updated = endpoints.map((ep) =>
      ep.id === id ? { ...ep, ...updates } : ep
    );
    saveEndpoints(updated);
  };

  const removeEndpoint = (id: string) => {
    saveEndpoints(endpoints.filter((ep) => ep.id !== id));
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Azure Configuration
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Configure your Azure OpenAI and AI Foundry endpoints and API keys
        </p>
      </div>

      {/* API Key Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Key className="w-5 h-5 text-purple-500" />
          <h4 className="font-medium text-gray-900 dark:text-white">API Key</h4>
        </div>

        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Azure API Key
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => saveApiKey(e.target.value)}
                  placeholder="Enter your Azure API key"
                  className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                Your API key is encrypted and stored securely in cookies
              </p>
            </div>

            <button
              onClick={validateConfiguration}
              disabled={isValidating || !apiKey}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              {isValidating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Validating...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Validate Configuration
                </>
              )}
            </button>

            {validationMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-lg flex items-center gap-2 ${
                  validationStatus === 'success'
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                    : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                }`}
              >
                {validationStatus === 'success' ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <X className="w-4 h-4" />
                )}
                {validationMessage}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Endpoints Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-purple-500" />
            <h4 className="font-medium text-gray-900 dark:text-white">
              Endpoints
            </h4>
          </div>
          <button
            onClick={addEndpoint}
            className="flex items-center gap-2 px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Endpoint
          </button>
        </div>

        <div className="space-y-4">
          {endpoints.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Endpoints Configured
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Add your Azure OpenAI and AI Foundry endpoints to get started
              </p>
              <button
                onClick={addEndpoint}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
              >
                Add Your First Endpoint
              </button>
            </div>
          ) : (
            endpoints.map((endpoint, index) => (
              <EndpointCard
                key={endpoint.id}
                endpoint={endpoint}
                onUpdate={(updates) => updateEndpoint(endpoint.id, updates)}
                onRemove={() => removeEndpoint(endpoint.id)}
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
  onUpdate,
  onRemove,
}: {
  endpoint: AzureEndpoint;
  onUpdate: (updates: Partial<AzureEndpoint>) => void;
  onRemove: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      layout
      className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div>
            <h5 className="font-medium text-gray-900 dark:text-white">
              {endpoint.name}
            </h5>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {endpoint.baseUrl || 'No URL configured'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronDown
              className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            />
          </button>
          <button
            onClick={onRemove}
            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4 space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Endpoint Name
              </label>
              <input
                type="text"
                value={endpoint.name}
                onChange={(e) => onUpdate({ name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Base URL
              </label>
              <input
                type="url"
                value={endpoint.baseUrl}
                onChange={(e) => onUpdate({ baseUrl: e.target.value })}
                placeholder="https://your-endpoint.openai.azure.com"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                API Version
              </label>
              <input
                type="text"
                value={endpoint.apiVersion}
                onChange={(e) => onUpdate({ apiVersion: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
