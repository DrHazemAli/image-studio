"use client";

import React, { useState, useEffect } from "react";
import { AppConfig, AppConfigService } from "@/types/app-config";
import { GearIcon, CheckIcon, CrossCircledIcon } from "@radix-ui/react-icons";

/**
 * Configuration Info Component
 * Displays current app configuration and allows basic modifications
 * This is a demonstration component showing how the configuration system works
 */
export const ConfigInfo: React.FC = () => {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  // Load configuration on mount
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const appConfig = await AppConfigService.loadConfig();
        setConfig(appConfig);
      } catch (error) {
        console.error("Failed to load config:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, []);

  if (isLoading) {
    return (
      <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Loading config...
          </span>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="fixed bottom-4 right-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow-lg p-3">
        <div className="flex items-center gap-2">
          <CrossCircledIcon className="w-4 h-4 text-red-500" />
          <span className="text-sm text-red-600 dark:text-red-400">
            Config failed to load
          </span>
        </div>
      </div>
    );
  }

  const bgRemovalConfig = config.features.backgroundRemoval;

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <GearIcon className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            App Configuration
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${bgRemovalConfig.enabled ? "bg-green-500" : "bg-red-500"}`}
          ></span>
          <span className="text-xs text-gray-500">
            {isExpanded ? "▼" : "▶"}
          </span>
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-3 space-y-3 max-w-sm">
          {/* App Info */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              Application
            </h4>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <div>
                {config.app.name} v{config.app.version}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {config.app.environment}
              </div>
            </div>
          </div>

          {/* Background Removal Config */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              Background Removal
            </h4>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Enabled:
                </span>
                <div className="flex items-center gap-1">
                  {bgRemovalConfig.enabled ? (
                    <>
                      <CheckIcon className="w-3 h-3 text-green-500" />
                      <span className="text-green-600 dark:text-green-400 text-xs">
                        Yes
                      </span>
                    </>
                  ) : (
                    <>
                      <CrossCircledIcon className="w-3 h-3 text-red-500" />
                      <span className="text-red-600 dark:text-red-400 text-xs">
                        No
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Default Model:
                </span>
                <span className="text-gray-800 dark:text-gray-200 text-xs font-mono">
                  {bgRemovalConfig.defaultModel}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Available Models:
                </span>
                <span className="text-gray-800 dark:text-gray-200 text-xs">
                  {bgRemovalConfig.models.length}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Default Quality:
                </span>
                <span className="text-gray-800 dark:text-gray-200 text-xs capitalize">
                  {bgRemovalConfig.defaultSettings.quality}
                </span>
              </div>
            </div>
          </div>

          {/* Models List */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              Available Models
            </h4>
            <div className="space-y-1">
              {bgRemovalConfig.models.map((model) => (
                <div
                  key={model.id}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-gray-700 dark:text-gray-300">
                    {model.name}
                    {model.recommended && " ⭐"}
                  </span>
                  <div className="flex gap-1">
                    <span className="px-1 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs">
                      {model.speed}
                    </span>
                    <span className="px-1 py-0.5 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-xs">
                      {model.quality}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feature Flags */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              Features
            </h4>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-400">
                  Image Toolbar:
                </span>
                <span
                  className={`${config.features.floatingImageToolbar.enabled ? "text-green-600" : "text-red-600"}`}
                >
                  {config.features.floatingImageToolbar.enabled
                    ? "Enabled"
                    : "Disabled"}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-400">
                  Image Generation:
                </span>
                <span
                  className={`${config.features.imageGeneration.enabled ? "text-green-600" : "text-red-600"}`}
                >
                  {config.features.imageGeneration.enabled
                    ? "Enabled"
                    : "Disabled"}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-400">
                  Image Editing:
                </span>
                <span
                  className={`${config.features.imageEditing.enabled ? "text-green-600" : "text-red-600"}`}
                >
                  {config.features.imageEditing.enabled
                    ? "Enabled"
                    : "Disabled"}
                </span>
              </div>
            </div>
          </div>

          {/* Configuration File Info */}
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Config:{" "}
              <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">
                app/config/app-config.json
              </code>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
