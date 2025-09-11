"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  Info,
  Github,
  Linkedin,
  ExternalLink,
  Heart,
  Download,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react";
import {
  checkForUpdates,
  getCurrentVersion,
  formatVersion,
  getUpdateTypeColor,
  getUpdateTypeLabel,
  getUpdateTypeIcon,
  formatRelativeTime,
  getReleaseNotesUrl,
  getDownloadUrl,
  type VersionInfo,
} from "@/lib/version-utils";

export function AboutSettings() {
  // Version check state
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // Check for updates on component mount
  useEffect(() => {
    handleCheckForUpdates();
  }, []);

  const handleCheckForUpdates = async (force: boolean = false) => {
    setIsCheckingUpdate(true);
    setUpdateError(null);

    try {
      const result = await checkForUpdates(force);
      setVersionInfo(result);
      setLastChecked(new Date());
    } catch (error) {
      setUpdateError(
        error instanceof Error ? error.message : "Failed to check for updates",
      );
    } finally {
      setIsCheckingUpdate(false);
    }
  };

  const appConfig = useMemo(
    () => ({
      name: "Azure Image Studio",
      version: getCurrentVersion(),
      description: "AI-powered image generation and editing platform",
      author: "Hazem Ali",
      github: "https://github.com/DrHazemAli/azure-image-studio",
      linkedin: "https://linkedin.com/in/hazemali",
      website: "https://www.skytells.ai",
    }),
    [],
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
          About
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Learn more about this application and its features
        </p>
      </div>

      {/* Application Info */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h4 className="text-base font-medium text-gray-900 dark:text-white">
            Application Information
          </h4>
        </div>

        <div className="p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <span className="text-xl">🎨</span>
            </div>
            <div className="flex-1">
              <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                {appConfig.name}
              </h5>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                {appConfig.description}
              </p>
              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                <span>Version {formatVersion(appConfig.version)}</span>
                <span>•</span>
                <span>Built with Next.js & React</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Version Check */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Download className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h4 className="text-base font-medium text-gray-900 dark:text-white">
            Version Information
          </h4>
        </div>

        <div className="space-y-3">
          {/* Current Version */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
            <div>
              <div className="font-medium text-gray-900 dark:text-white text-sm">
                Current Version
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {formatVersion(appConfig.version)}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-xs font-medium text-green-600 dark:text-green-400">
                Installed
              </span>
            </div>
          </div>

          {/* Latest Version & Update Status */}
          {versionInfo && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
              <div>
                <div className="font-medium text-gray-900 dark:text-white text-sm">
                  Latest Version
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {formatVersion(versionInfo.latest)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">
                  {getUpdateTypeIcon(versionInfo.updateType)}
                </span>
                <span
                  className={`text-xs font-medium ${getUpdateTypeColor(versionInfo.updateType)}`}
                >
                  {getUpdateTypeLabel(versionInfo.updateType)}
                </span>
              </div>
            </div>
          )}

          {/* Update Available */}
          {versionInfo?.isUpdateAvailable && (
            <div className="p-3 rounded-lg bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-800/50">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <div className="font-medium text-blue-900 dark:text-blue-100 text-sm mb-1">
                    Update Available
                  </div>
                  <div className="text-xs text-blue-700 dark:text-blue-300 mb-2">
                    A new version is available with latest features and
                    improvements.
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={getReleaseNotesUrl(versionInfo.latest, versionInfo)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Release Notes
                    </a>
                    <a
                      href={getDownloadUrl(versionInfo.latest, versionInfo)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-2 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-xs transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      Download
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error State */}
          {updateError && (
            <div className="p-3 rounded-lg bg-red-50/50 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/50">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5" />
                <div>
                  <div className="font-medium text-red-900 dark:text-red-100 text-sm mb-1">
                    Update Check Failed
                  </div>
                  <div className="text-xs text-red-700 dark:text-red-300">
                    {updateError}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Check for Updates Button */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
            <div>
              <div className="font-medium text-gray-900 dark:text-white text-sm">
                Check for Updates
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Manually check for the latest version
              </div>
            </div>
            <button
              onClick={() => handleCheckForUpdates(true)}
              disabled={isCheckingUpdate}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm"
            >
              {isCheckingUpdate ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Check Now
                </>
              )}
            </button>
          </div>

          {/* Last Checked */}
          {lastChecked && (
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 px-3">
              <Clock className="w-3 h-3" />
              <span>Last checked: {formatRelativeTime(lastChecked)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Author Info */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Heart className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h4 className="text-base font-medium text-gray-900 dark:text-white">
            Created by
          </h4>
        </div>

        <div className="p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <span className="text-xl text-white">👨‍💻</span>
            </div>
            <div className="flex-1">
              <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                {appConfig.author}
              </h5>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Full-stack developer passionate about AI and modern web
                technologies
              </p>
              <div className="flex items-center gap-3">
                <a
                  href={appConfig.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-sm"
                >
                  <Github className="w-4 h-4" />
                  GitHub
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href={appConfig.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-sm"
                >
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href={appConfig.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  Website
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
