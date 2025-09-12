"use client";

import React, { useState, useEffect } from "react";
import { Terminal, Settings, Clock, Tag, AlertCircle } from "lucide-react";
import { logger, LoggerConfig } from "@/lib/logger";
import { config } from "@/lib/settings";

interface LoggerSettingsProps {
  className?: string;
}

export function LoggerSettings({ className }: LoggerSettingsProps) {
  const [loggerConfig, setLoggerConfig] = useState<LoggerConfig>({
    enabled: true,
    developmentOnly: true,
    prefix: "[Logger]",
    timestamp: true,
    level: "debug",
  });

  useEffect(() => {
    // Load current logger configuration
    const savedConfig = config("logger.config");
    if (savedConfig) {
      setLoggerConfig({ ...loggerConfig, ...savedConfig });
    }
  }, []);

  const updateConfig = (updates: Partial<LoggerConfig>) => {
    const newConfig = { ...loggerConfig, ...updates };
    setLoggerConfig(newConfig);
    config("logger.config", newConfig);
    logger.updateConfig(newConfig);
  };

  const handleToggleEnabled = (enabled: boolean) => {
    updateConfig({ enabled });
  };

  const handleToggleDevelopmentOnly = (developmentOnly: boolean) => {
    updateConfig({ developmentOnly });
  };

  const handleToggleTimestamp = (timestamp: boolean) => {
    updateConfig({ timestamp });
  };

  const handlePrefixChange = (prefix: string) => {
    updateConfig({ prefix });
  };

  const handleLevelChange = (level: string) => {
    updateConfig({ level: level as LoggerConfig["level"] });
  };

  const testLogger = () => {
    logger.info("This is a test info message");
    logger.warn("This is a test warning message");
    logger.error("This is a test error message");
    logger.debug("This is a test debug message");
  };

  return (
    <div className={`space-y-6 ${className || ""}`}>
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Logger Settings
          </h3>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Configure the development logger behavior and output format.
        </p>
      </div>

      {/* Enable Logger */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h4 className="text-base font-medium text-gray-900 dark:text-white">
            Logger Configuration
          </h4>
        </div>

        <div className="space-y-4">
          {/* Enable Logger Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="space-y-0.5">
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                Enable Logger
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Turn logging on or off completely
              </p>
            </div>
            <button
              onClick={() => handleToggleEnabled(!loggerConfig.enabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                loggerConfig.enabled
                  ? "bg-blue-600"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  loggerConfig.enabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Development Only Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="space-y-0.5">
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                Development Only
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Only log in development mode (NODE_ENV=development)
              </p>
            </div>
            <button
              onClick={() =>
                handleToggleDevelopmentOnly(!loggerConfig.developmentOnly)
              }
              disabled={!loggerConfig.enabled}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                loggerConfig.developmentOnly
                  ? "bg-blue-600"
                  : "bg-gray-200 dark:bg-gray-700"
              } ${!loggerConfig.enabled ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  loggerConfig.developmentOnly
                    ? "translate-x-6"
                    : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Log Level */}
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                Log Level
              </label>
              <select
                value={loggerConfig.level}
                onChange={(e) => handleLevelChange(e.target.value)}
                disabled={!loggerConfig.enabled}
                className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="debug">Debug (All messages)</option>
                <option value="log">Log (Log, Info, Warn, Error)</option>
                <option value="info">Info (Info, Warn, Error)</option>
                <option value="warn">Warn (Warn, Error)</option>
                <option value="error">Error (Error only)</option>
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Only messages at or above this level will be logged
              </p>
            </div>
          </div>

          {/* Prefix */}
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                Log Prefix
              </label>
              <input
                type="text"
                value={loggerConfig.prefix || ""}
                onChange={(e) => handlePrefixChange(e.target.value)}
                placeholder="[Logger]"
                disabled={!loggerConfig.enabled}
                className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Custom prefix to add to all log messages
              </p>
            </div>
          </div>

          {/* Timestamp Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="space-y-0.5">
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                Include Timestamp
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Add timestamp to all log messages
              </p>
            </div>
            <button
              onClick={() => handleToggleTimestamp(!loggerConfig.timestamp)}
              disabled={!loggerConfig.enabled}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                loggerConfig.timestamp
                  ? "bg-blue-600"
                  : "bg-gray-200 dark:bg-gray-700"
              } ${!loggerConfig.enabled ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  loggerConfig.timestamp ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Test Logger */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h4 className="text-base font-medium text-gray-900 dark:text-white">
            Test Logger
          </h4>
        </div>

        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <button
            onClick={testLogger}
            disabled={!loggerConfig.enabled}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Test Logger Output
          </button>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Click to test the logger with sample messages (check browser
            console)
          </p>
        </div>
      </div>

      {/* Current Status */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h4 className="text-base font-medium text-gray-900 dark:text-white">
            Current Status
          </h4>
        </div>

        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900 dark:text-white">
                Enabled:
              </span>
              <span
                className={
                  loggerConfig.enabled ? "text-green-600" : "text-red-600"
                }
              >
                {loggerConfig.enabled ? "Yes" : "No"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900 dark:text-white">
                Development Only:
              </span>
              <span
                className={
                  loggerConfig.developmentOnly
                    ? "text-blue-600"
                    : "text-orange-600"
                }
              >
                {loggerConfig.developmentOnly ? "Yes" : "No"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900 dark:text-white">
                Current Environment:
              </span>
              <span className="text-blue-600">
                {process.env.NODE_ENV || "development"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900 dark:text-white">
                Logger Active:
              </span>
              <span
                className={
                  logger.isLoggerEnabled() ? "text-green-600" : "text-red-600"
                }
              >
                {logger.isLoggerEnabled() ? "Yes" : "No"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
