"use client";

import { useEffect, useCallback, useState } from "react";
import { motion } from "framer-motion";
import { Cloud, Folder, FileText, Database, Check, Clock } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { MacStyleView } from "@/components/ui/mac-style-view";
import { syncHelper } from "@/lib/sync-helper";
import type { Project } from "@/lib/indexeddb";

interface SyncManagerProps {
  currentProject: Project | null;
  projectName: string;
  currentModel: string;
  currentSize: string;
  isInpaintMode: boolean;
  currentImage: string | null;
  generatedImage: string | null;
  attachedImage: string | null;
  // UI State
  activeTool: string;
  showGenerationPanel: boolean;
  showPromptBox: boolean;
  showAssetsPanel: boolean;
  showHistoryPanel: boolean;
  showConsole: boolean;
  showSizeModal: boolean;
  showKeyboardShortcuts: boolean;
  showAbout: boolean;
  zoom: number;
  // Generation State
  isGenerating: boolean;
  generationProgress: number;
  requestLog: unknown;
  responseLog: unknown;
  // Undo/Redo History
  history: Array<{
    currentImage: string | null;
    generatedImage: string | null;
    attachedImage: string | null;
    zoom: number;
    timestamp: number;
  }>;
  historyIndex: number;
  // Auto-save state
  autoSave: boolean;
  autoSaveDuration: number;
  onToggleAutoSave: () => void;
  onUpdateAutoSaveDuration: (duration: number) => void;
}

export function SyncManager({
  currentProject,
  projectName,
  currentModel,
  currentSize,
  isInpaintMode,
  currentImage,
  generatedImage,
  attachedImage,
  activeTool,
  showGenerationPanel,
  showPromptBox,
  showAssetsPanel,
  showHistoryPanel,
  showConsole,
  showSizeModal,
  showKeyboardShortcuts,
  showAbout,
  zoom,
  isGenerating,
  generationProgress,
  requestLog,
  responseLog,
  history,
  historyIndex,
  autoSave,
  autoSaveDuration,
  onToggleAutoSave,
  onUpdateAutoSaveDuration,
}: SyncManagerProps) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [syncStats, setSyncStats] = useState({
    filesCount: 0,
    totalSize: 0,
  });

  // Auto-save functionality (fully handled by sync helper)
  const triggerAutoSave = useCallback(() => {
    if (!autoSave || !currentProject) return;

    // Update sync helper state
    syncHelper.updateState({
      projectName,
      currentModel,
      currentSize,
      isInpaintMode,
      currentImage,
      generatedImage,
      attachedImage,
      // UI State
      activeTool,
      showGenerationPanel,
      showPromptBox,
      showAssetsPanel,
      showHistoryPanel,
      showConsole,
      showSizeModal,
      showKeyboardShortcuts,
      showAbout,
      zoom,
      // Generation State
      isGenerating,
      generationProgress,
      requestLog,
      responseLog,
      // Undo/Redo History
      history,
      historyIndex,
    });

    // Schedule auto-save via sync helper
    syncHelper.scheduleAutoSave();
  }, [
    autoSave,
    currentProject,
    projectName,
    currentModel,
    currentSize,
    isInpaintMode,
    currentImage,
    generatedImage,
    attachedImage,
    activeTool,
    showGenerationPanel,
    showPromptBox,
    showAssetsPanel,
    showHistoryPanel,
    showConsole,
    showSizeModal,
    showKeyboardShortcuts,
    showAbout,
    zoom,
    isGenerating,
    generationProgress,
    requestLog,
    responseLog,
    history,
    historyIndex,
  ]);

  // Set up sync helper when project is loaded
  useEffect(() => {
    if (currentProject) {
      syncHelper.setup(
        currentProject,
        {
          projectName,
          currentModel,
          currentSize,
          isInpaintMode,
          currentImage,
          generatedImage,
          attachedImage,
          // UI State
          activeTool,
          showGenerationPanel,
          showPromptBox,
          showAssetsPanel,
          showHistoryPanel,
          showConsole,
          showSizeModal,
          showKeyboardShortcuts,
          showAbout,
          zoom,
          // Generation State
          isGenerating,
          generationProgress,
          requestLog,
          responseLog,
          // Undo/Redo History
          history,
          historyIndex,
        },
        {
          onSyncStart: () => setIsSaving(true),
          onSyncEnd: () => setIsSaving(false),
          onSyncComplete: (stats) => {
            setLastSaved(stats.lastSync);
            setSyncStats({
              filesCount: stats.filesCount,
              totalSize: stats.totalSize,
            });
          },
        },
      );
    }
  }, [
    currentProject,
    projectName,
    currentModel,
    currentSize,
    isInpaintMode,
    currentImage,
    generatedImage,
    attachedImage,
    activeTool,
    showGenerationPanel,
    showPromptBox,
    showAssetsPanel,
    showHistoryPanel,
    showConsole,
    showSizeModal,
    showKeyboardShortcuts,
    showAbout,
    zoom,
    isGenerating,
    generationProgress,
    requestLog,
    responseLog,
    history,
    historyIndex,
  ]);

  // Auto-save triggers - watch for changes to key state variables
  useEffect(() => {
    if (currentProject) {
      triggerAutoSave();
    }
  }, [
    projectName,
    currentImage,
    generatedImage,
    attachedImage,
    triggerAutoSave,
    currentProject,
  ]);

  // Cleanup sync helper on unmount
  useEffect(() => {
    return () => {
      syncHelper.cancelSync();
    };
  }, []);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`p-2 rounded-lg transition-colors relative ${
            autoSave
              ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
              : "hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
          title={`Auto-save ${autoSave ? "enabled" : "disabled"}`}
        >
          <Cloud className="w-4 h-4" />
          {isSaving && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          )}
        </motion.button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[280px] p-0 shadow-2xl border-0 z-50"
          sideOffset={5}
          align="end"
        >
          <MacStyleView
            title="Sync"
            description="Synchronize your project data"
            isEnabled={autoSave}
            onToggle={onToggleAutoSave}
            stats={[
              {
                label: "Status",
                value: autoSave ? "Sync Enabled" : "Sync Disabled",
                color: autoSave ? "green" : "gray",
              },
              {
                label: "Last Sync",
                value: lastSaved ? lastSaved.toLocaleTimeString() : "Never",
                color: lastSaved ? "blue" : "gray",
              },
            ]}
            className="m-0 rounded-lg"
          >
            {/* Folder Information */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50/50 dark:bg-gray-800/50">
                <Folder className="w-4 h-4 text-blue-500" />
                <div>
                  <div className="text-sm font-medium">Main Sync Folder</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    sync
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50/50 dark:bg-gray-800/50">
                <Folder className="w-4 h-4 text-purple-500" />
                <div>
                  <div className="text-sm font-medium">Project Folder</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {projectName} (project)
                  </div>
                </div>
              </div>

              {/* Project Statistics */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50/50 dark:bg-gray-800/50">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="text-sm font-medium">
                      {syncStats.filesCount}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      files
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50/50 dark:bg-gray-800/50">
                  <Database className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="text-sm font-medium">
                      {syncStats.totalSize > 1024
                        ? `${(syncStats.totalSize / 1024).toFixed(1)} KB`
                        : `${syncStats.totalSize} B`}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      size
                    </div>
                  </div>
                </div>
              </div>

              {/* Sync Options */}
              <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-green-500" />
                  <span>Auto-sync every {autoSaveDuration}s</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Sync on save enabled</span>
                </div>
              </div>

              {/* Duration Control */}
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Sync Duration</span>
                  <span className="text-xs text-gray-500">
                    {autoSaveDuration}s
                  </span>
                </div>
                <div className="flex gap-1">
                  {[1, 3, 5, 10, 30].map((duration) => (
                    <button
                      key={duration}
                      onClick={() => onUpdateAutoSaveDuration(duration)}
                      className={`px-2 py-1 text-xs rounded transition-colors ${
                        autoSaveDuration === duration
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                      }`}
                    >
                      {duration}s
                    </button>
                  ))}
                </div>
              </div>

              {isSaving && (
                <div className="flex items-center gap-2 text-blue-500 text-xs">
                  <div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin" />
                  Syncing changes...
                </div>
              )}
            </div>
          </MacStyleView>
          <DropdownMenu.Arrow className="fill-white/95 dark:fill-gray-900/95" />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
