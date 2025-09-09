"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Sun,
  Moon,
  Monitor,
  Palette,
  Eye,
  EyeOff,
  Sliders,
  Layers,
} from "lucide-react";
import { config } from "@/lib/settings";
import { useTheme } from "@/hooks/use-theme";

export function GeneralSettings() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const themeOptions = [
    {
      value: "light" as const,
      label: "Light",
      description: "Clean and bright interface",
      icon: Sun,
    },
    {
      value: "dark" as const,
      label: "Dark",
      description: "Easy on the eyes in low light",
      icon: Moon,
    },
    {
      value: "system" as const,
      label: "System",
      description: "Follow your system preference",
      icon: Monitor,
    },
  ];

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
  };

  const handleToggleSetting = (key: string, currentValue: boolean) => {
    config(key, !currentValue);
    // Force re-render by updating a dummy state or using a callback
    window.dispatchEvent(
      new CustomEvent("settingsChanged", {
        detail: { key, value: !currentValue },
      }),
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
          General
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Customize the look and feel of your application
        </p>

        {/* Theme Selection */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h4 className="text-base font-medium text-gray-900 dark:text-white">
              Appearance
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {themeOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = theme === option.value;

              return (
                <motion.button
                  key={option.value}
                  onClick={() => handleThemeChange(option.value)}
                  className={`
                    relative p-3 rounded-lg border transition-all duration-200 text-left group
                    ${
                      isSelected
                        ? "border-blue-500/50 bg-blue-50/50 dark:bg-blue-900/20 shadow-sm"
                        : "border-gray-200/50 dark:border-gray-700/50 hover:border-gray-300/50 dark:hover:border-gray-600/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
                    }
                  `}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`
                      w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                      ${
                        isSelected
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100/50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 group-hover:bg-gray-200/50 dark:group-hover:bg-gray-600/50"
                      }
                    `}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 dark:text-white text-sm">
                        {option.label}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {option.description}
                      </div>
                    </div>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center"
                      >
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </motion.div>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* UI Preferences */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h4 className="text-base font-medium text-gray-900 dark:text-white">
            Interface
          </h4>
        </div>

        <div className="space-y-2">
          {/* Animations Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
            <div>
              <div className="font-medium text-gray-900 dark:text-white text-sm">
                Animations
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Enable smooth animations and transitions
              </div>
            </div>
            <ToggleSwitch
              checked={config("ui.animations", true)}
              onChange={() =>
                handleToggleSetting(
                  "ui.animations",
                  config("ui.animations", true),
                )
              }
            />
          </div>

          {/* Show Console Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
            <div>
              <div className="font-medium text-gray-900 dark:text-white text-sm">
                Developer Console
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Show the developer console panel
              </div>
            </div>
            <ToggleSwitch
              checked={config("ui.showConsole", false)}
              onChange={() =>
                handleToggleSetting(
                  "ui.showConsole",
                  config("ui.showConsole", false),
                )
              }
            />
          </div>

          {/* Show Layers Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
            <div>
              <div className="font-medium text-gray-900 dark:text-white text-sm">
                Layers Panel
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Show the layers management panel
              </div>
            </div>
            <ToggleSwitch
              checked={config("ui.showLayers", false)}
              onChange={() =>
                handleToggleSetting(
                  "ui.showLayers",
                  config("ui.showLayers", false),
                )
              }
            />
          </div>

          {/* Show History Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
            <div>
              <div className="font-medium text-gray-900 dark:text-white text-sm">
                History Panel
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Show the generation history panel
              </div>
            </div>
            <ToggleSwitch
              checked={config("ui.showHistory", true)}
              onChange={() =>
                handleToggleSetting(
                  "ui.showHistory",
                  config("ui.showHistory", true),
                )
              }
            />
          </div>
        </div>
      </div>

      {/* Auto-save Settings */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <EyeOff className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h4 className="text-base font-medium text-gray-900 dark:text-white">
            Auto-save
          </h4>
        </div>

        <div className="space-y-2">
          {/* Auto-save Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
            <div>
              <div className="font-medium text-gray-900 dark:text-white text-sm">
                Enable Auto-save
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Automatically save your work periodically
              </div>
            </div>
            <ToggleSwitch
              checked={config("autoSave.enabled", true)}
              onChange={() =>
                handleToggleSetting(
                  "autoSave.enabled",
                  config("autoSave.enabled", true),
                )
              }
            />
          </div>

          {/* Auto-save Duration */}
          {config("autoSave.enabled", true) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3 rounded-lg bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50"
            >
              <div className="mb-2">
                <div className="font-medium text-gray-900 dark:text-white text-sm">
                  Auto-save Interval
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  How often to save your work automatically
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={config("autoSave.duration", 3)}
                  onChange={(e) => {
                    config("autoSave.duration", parseInt(e.target.value));
                    window.dispatchEvent(
                      new CustomEvent("settingsChanged", {
                        detail: {
                          key: "autoSave.duration",
                          value: parseInt(e.target.value),
                        },
                      }),
                    );
                  }}
                  className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="w-12 text-xs font-medium text-gray-900 dark:text-white">
                  {config("autoSave.duration", 3)}s
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

// Toggle Switch Component
function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      onClick={onChange}
      className={`
        relative inline-flex h-5 w-9 items-center rounded-full transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500/50
        ${checked ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"}
      `}
    >
      <motion.span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out
        `}
        animate={{ x: checked ? 16 : 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </button>
  );
}
