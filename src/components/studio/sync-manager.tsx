'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cloud, 
  Folder, 
  FileText, 
  Database, 
  Save, 
  Loader2,
  CloudCheck,
  CloudOff,
  RefreshCw
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { syncHelper } from '@/lib/sync-helper';
import type { Project } from '@/lib/indexeddb';

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
  const [isManualSaving, setIsManualSaving] = useState(false);
  const [syncStats, setSyncStats] = useState({
    filesCount: 0,
    totalSize: 0,
  });
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const animationRef = useRef<number | null>(null);

  // Manual save functionality
  const handleManualSave = useCallback(async () => {
    if (!currentProject || isManualSaving) return;

    setIsManualSaving(true);
    setSyncStatus('syncing');
    setProgress(0);

    // Start progress animation
    const startTime = Date.now();
    const duration = 2000; // 2 seconds for animation

    const animateProgress = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 95); // Cap at 95% until real completion
      setProgress(newProgress);

      if (newProgress < 95) {
        animationRef.current = requestAnimationFrame(animateProgress);
      }
    };

    animationRef.current = requestAnimationFrame(animateProgress);

    try {
      // Update sync helper state with current canvas data
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

      // Update assets with canvas modifications and perform immediate save
      await syncHelper.updateAssetsWithCanvasModifications();
      await syncHelper.performAutoSave();
      
      // Complete progress animation
      setProgress(100);
      setSyncStatus('success');
      
      // Reset status after 2 seconds
      setTimeout(() => {
        setSyncStatus('idle');
        setProgress(0);
      }, 2000);

    } catch (error) {
      console.error('Manual save failed:', error);
      setSyncStatus('error');
      setProgress(0);
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setSyncStatus('idle');
      }, 3000);
    } finally {
      setIsManualSaving(false);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    }
  }, [
    currentProject,
    isManualSaving,
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
          onSyncStart: () => {
            setIsSaving(true);
            setSyncStatus('syncing');
          },
          onSyncEnd: () => {
            setIsSaving(false);
            setSyncStatus('idle');
          },
          onSyncComplete: (stats) => {
            setLastSaved(stats.lastSync);
            setSyncStats({
              filesCount: stats.filesCount,
              totalSize: stats.totalSize,
            });
            setSyncStatus('success');
            setTimeout(() => setSyncStatus('idle'), 2000);
          },
        }
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
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Update sync helper duration when autoSaveDuration changes
  useEffect(() => {
    if (autoSaveDuration >= 30) { // Minimum 30 seconds
      syncHelper.setDuration(autoSaveDuration);
    }
  }, [autoSaveDuration]);

  // Get sync status icon and color
  const getSyncIcon = () => {
    switch (syncStatus) {
      case 'syncing':
        return <RefreshCw className="w-4 h-4" />;
      case 'success':
        return <CloudCheck className="w-4 h-4" />;
      case 'error':
        return <CloudOff className="w-4 h-4" />;
      default:
        return autoSave ? <Cloud className="w-4 h-4" /> : <CloudOff className="w-4 h-4" />;
    }
  };

  const getSyncColor = () => {
    switch (syncStatus) {
      case 'syncing':
        return 'text-blue-500 dark:text-blue-400';
      case 'success':
        return 'text-green-500 dark:text-green-400';
      case 'error':
        return 'text-red-500 dark:text-red-400';
      default:
        return autoSave 
          ? 'text-green-500 dark:text-green-400' 
          : 'text-gray-400 dark:text-gray-500';
    }
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`p-2 rounded-lg transition-all duration-200 relative group ${
            autoSave
              ? 'bg-green-100/80 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-200/80 dark:hover:bg-green-900/30'
              : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
          }`}
          title={`Auto-sync ${autoSave ? 'enabled' : 'disabled'}`}
        >
          <motion.div
            animate={{ 
              rotate: syncStatus === 'syncing' ? 360 : 0,
              scale: syncStatus === 'success' ? [1, 1.2, 1] : 1
            }}
            transition={{ 
              duration: syncStatus === 'syncing' ? 1 : 0.3,
              repeat: syncStatus === 'syncing' ? Infinity : 0,
              ease: syncStatus === 'syncing' ? 'linear' : 'easeOut'
            }}
            className={getSyncColor()}
          >
            {getSyncIcon()}
          </motion.div>
          
          {/* Status indicator */}
          <AnimatePresence>
            {isSaving && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"
              />
            )}
          </AnimatePresence>
        </motion.button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[320px] p-0 shadow-2xl border-0 z-50"
          sideOffset={5}
          align="end"
        >
          <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl rounded-xl border border-zinc-200/50 dark:border-zinc-700/50 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-zinc-200/50 dark:border-zinc-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ 
                      rotate: syncStatus === 'syncing' ? 360 : 0,
                      scale: syncStatus === 'success' ? [1, 1.1, 1] : 1
                    }}
                    transition={{ 
                      duration: syncStatus === 'syncing' ? 1 : 0.3,
                      repeat: syncStatus === 'syncing' ? Infinity : 0,
                      ease: syncStatus === 'syncing' ? 'linear' : 'easeOut'
                    }}
                    className={getSyncColor()}
                  >
                    {getSyncIcon()}
                  </motion.div>
                  <div>
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                      Auto-sync
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {autoSave ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                </div>
                
                {/* Toggle Switch */}
                <button
                  onClick={onToggleAutoSave}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                    autoSave ? 'bg-green-500' : 'bg-zinc-300 dark:bg-zinc-600'
                  }`}
                >
                  <motion.span
                    animate={{ x: autoSave ? 16 : 2 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    className="inline-block h-4 w-4 transform rounded-full bg-white shadow-sm"
                  />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Sync Status */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-50/50 dark:bg-zinc-800/50">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    syncStatus === 'syncing' ? 'bg-blue-500 animate-pulse' :
                    syncStatus === 'success' ? 'bg-green-500' :
                    syncStatus === 'error' ? 'bg-red-500' :
                    autoSave ? 'bg-green-500' : 'bg-zinc-400'
                  }`} />
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {syncStatus === 'syncing' ? 'Syncing...' :
                     syncStatus === 'success' ? 'Synced' :
                     syncStatus === 'error' ? 'Sync Failed' :
                     autoSave ? 'Ready to sync' : 'Sync Disabled'}
                  </span>
                </div>
                {lastSaved && (
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {lastSaved.toLocaleTimeString()}
                  </span>
                )}
              </div>

              {/* Progress Bar (only when syncing) */}
              <AnimatePresence>
                {syncStatus === 'syncing' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                      <span>Syncing changes...</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-1.5 overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Project Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-zinc-50/50 dark:bg-zinc-800/50">
                  <Folder className="w-4 h-4 text-blue-500" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                      {projectName}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      Project folder
                    </div>
                  </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-zinc-50/50 dark:bg-zinc-800/50">
                    <FileText className="w-4 h-4 text-zinc-500" />
                    <div>
                      <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {syncStats.filesCount}
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">
                        files
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2 rounded-lg bg-zinc-50/50 dark:bg-zinc-800/50">
                    <Database className="w-4 h-4 text-zinc-500" />
                    <div>
                      <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {syncStats.totalSize > 1024
                          ? `${(syncStats.totalSize / 1024).toFixed(1)} KB`
                          : `${syncStats.totalSize} B`}
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">
                        size
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sync Duration Control */}
              <div className="space-y-3 pt-2 border-t border-zinc-200/50 dark:border-zinc-700/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    Auto-sync Interval
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {autoSaveDuration}s
                  </span>
                </div>
                
                <div className="flex gap-1">
                  {[30, 60, 120, 300, 600].map((duration) => (
                    <button
                      key={duration}
                      onClick={() => onUpdateAutoSaveDuration(duration)}
                      disabled={!autoSave}
                      className={`px-3 py-1.5 text-xs rounded-lg transition-all duration-200 ${
                        autoSaveDuration === duration
                          ? 'bg-blue-500 text-white shadow-sm'
                          : autoSave
                          ? 'bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-300'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed'
                      }`}
                    >
                      {duration < 60 ? `${duration}s` : `${Math.floor(duration / 60)}m`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Manual Save Button */}
              <div className="pt-2 border-t border-zinc-200/50 dark:border-zinc-700/50">
                <button
                  onClick={handleManualSave}
                  disabled={isManualSaving || !currentProject}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isManualSaving || !currentProject
                      ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600 text-white shadow-sm hover:shadow-md'
                  }`}
                >
                  {isManualSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Now</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          <DropdownMenu.Arrow className="fill-white/95 dark:fill-zinc-900/95" />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
