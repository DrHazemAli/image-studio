"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Database,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  Code,
} from "lucide-react";
import { config } from "@/lib/settings";

export function AdvancedSettings() {
  const [developerMode, setDeveloperMode] = useState(
    config("developer.mode", false),
  );

  useEffect(() => {
    // Update state when config changes
    setDeveloperMode(config("developer.mode", false));
  }, []);

  const handleToggleDeveloperMode = () => {
    const newValue = !developerMode;
    setDeveloperMode(newValue);
    config("developer.mode", newValue);

    // Dispatch event to notify other components
    window.dispatchEvent(
      new CustomEvent("developerModeChanged", {
        detail: { enabled: newValue },
      }),
    );
  };

  const handleClearCache = () => {
    if (
      confirm(
        "Are you sure you want to clear all cached data? This action cannot be undone.",
      )
    ) {
      // Clear localStorage cache
      config("cache.assets", [], "localStorage");
      config("cache.history", [], "localStorage");
      config("cache.projects", [], "localStorage");

      // Show success message
      alert("Cache cleared successfully!");
    }
  };

  const handleExportSettings = () => {
    const settings = {
      theme:
        typeof window !== "undefined"
          ? localStorage.getItem("theme") || "system"
          : "system",
      autoSave: {
        enabled: config("autoSave.enabled"),
        duration: config("autoSave.duration"),
      },
      ui: {
        animations: config("ui.animations"),
        showConsole: config("ui.showConsole"),
        showLayers: config("ui.showLayers"),
        showHistory: config("ui.showHistory"),
      },
      azure: {
        endpoints: config("azure.endpoints", [], "cookies"),
        // Don't export API key for security
      },
    };

    const blob = new Blob([JSON.stringify(settings, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "azure-image-studio-settings.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const settings = JSON.parse(e.target?.result as string);

        // Import settings
        if (settings.theme && typeof window !== "undefined") {
          localStorage.setItem("theme", settings.theme);
        }
        if (settings.autoSave) {
          config("autoSave.enabled", settings.autoSave.enabled);
          config("autoSave.duration", settings.autoSave.duration);
        }
        if (settings.ui) {
          config("ui.animations", settings.ui.animations);
          config("ui.showConsole", settings.ui.showConsole);
          config("ui.showLayers", settings.ui.showLayers);
          config("ui.showHistory", settings.ui.showHistory);
        }
        if (settings.azure?.endpoints) {
          config("azure.endpoints", settings.azure.endpoints, "cookies");
        }

        alert("Settings imported successfully!");
        window.location.reload(); // Reload to apply changes
      } catch {
        alert("Failed to import settings. Please check the file format.");
      }
    };
    reader.readAsText(file);
  };

  const handleResetSettings = () => {
    if (
      confirm(
        "Are you sure you want to reset all settings to default? This action cannot be undone.",
      )
    ) {
      // Clear all settings
      if (typeof window !== "undefined") {
        localStorage.setItem("theme", "system");
      }
      config("autoSave.enabled", true);
      config("autoSave.duration", 3);
      config("ui.animations", true);
      config("ui.showConsole", false);
      config("ui.showLayers", false);
      config("ui.showHistory", true);
      config("azure.endpoints", [], "cookies");
      config("azure.apiKey", "", "cookies", true);

      alert("Settings reset to default!");
      window.location.reload();
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Advanced Settings
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Manage advanced application settings and data
        </p>
      </div>

      {/* Data Management */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Database className="w-5 h-5 text-purple-500" />
          <h4 className="font-medium text-gray-900 dark:text-white">
            Data Management
          </h4>
        </div>

        <div className="space-y-4">
          {/* Clear Cache */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                Clear Cache
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Clear all cached data and temporary files
              </div>
            </div>
            <button
              onClick={handleClearCache}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear Cache
            </button>
          </div>

          {/* Export Settings */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                Export Settings
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Download your current settings as a JSON file
              </div>
            </div>
            <button
              onClick={handleExportSettings}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>

          {/* Import Settings */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                Import Settings
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Import settings from a previously exported file
              </div>
            </div>
            <label className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors cursor-pointer">
              <Upload className="w-4 h-4" />
              Import
              <input
                type="file"
                accept=".json"
                onChange={handleImportSettings}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Developer Options */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Code className="w-5 h-5 text-purple-500" />
          <h4 className="font-medium text-gray-900 dark:text-white">
            Developer Options
          </h4>
        </div>

        <div className="space-y-4">
          {/* Developer Mode Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                Developer Mode
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Enable advanced developer features and debugging tools
              </div>
            </div>
            <button
              onClick={handleToggleDeveloperMode}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                developerMode ? "bg-purple-600" : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  developerMode ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-purple-500" />
          <h4 className="font-medium text-gray-900 dark:text-white">
            System Information
          </h4>
        </div>

        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">
                Application Version:
              </span>
              <span className="ml-2 text-gray-900 dark:text-white">1.0.1</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Browser:</span>
              <span className="ml-2 text-gray-900 dark:text-white">
                {typeof navigator !== "undefined"
                  ? navigator.userAgent.split(" ")[0]
                  : "Unknown"}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">
                Storage Available:
              </span>
              <span className="ml-2 text-gray-900 dark:text-white">
                {typeof navigator !== "undefined" &&
                "storage" in navigator &&
                "estimate" in navigator.storage
                  ? "Checking..."
                  : "Unknown"}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Theme:</span>
              <span className="ml-2 text-gray-900 dark:text-white capitalize">
                {typeof window !== "undefined"
                  ? localStorage.getItem("theme") || "system"
                  : "system"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Settings */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <RefreshCw className="w-5 h-5 text-purple-500" />
          <h4 className="font-medium text-gray-900 dark:text-white">
            Reset Settings
          </h4>
        </div>

        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-red-900 dark:text-red-400">
                Reset to Default
              </div>
              <div className="text-sm text-red-700 dark:text-red-300">
                Reset all settings to their default values. This action cannot
                be undone.
              </div>
            </div>
            <button
              onClick={handleResetSettings}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Reset All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
