/**
 * Sync Helper - Responsible for project synchronization
 * This helper manages the auto-save/sync functionality for projects
 */

import { dbManager, type Project } from './indexeddb';
import logger from './logger';
export interface SyncStats {
  filesCount: number;
  totalSize: number;
  lastSync: Date | null;
}

export interface SyncOptions {
  duration: number; // in seconds
  enabled: boolean;
  syncOnSave: boolean;
}

export class SyncHelper {
  private static instance: SyncHelper;
  private syncTimeout: NodeJS.Timeout | null = null;
  private currentProject: Project | null = null;
  private currentState: {
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
  } | null = null;
  private onSyncCallback: ((stats: SyncStats) => void) | null = null;
  private onSyncStartCallback: (() => void) | null = null;
  private onSyncEndCallback: (() => void) | null = null;
  private options: SyncOptions = {
    duration: 60, // Default 1 minute
    enabled: true,
    syncOnSave: true,
  };

  private constructor() {
    this.loadOptions();
  }

  public static getInstance(): SyncHelper {
    if (!SyncHelper.instance) {
      SyncHelper.instance = new SyncHelper();
    }
    return SyncHelper.instance;
  }

  /**
   * Load sync options from localStorage
   */
  private loadOptions(): void {
    if (typeof window === 'undefined') return;

    const stored = localStorage.getItem('sync-options');
    if (stored) {
      try {
        this.options = { ...this.options, ...JSON.parse(stored) };
      } catch (error) {
        console.warn('Failed to parse sync options:', error);
      }
    }
  }

  /**
   * Save sync options to localStorage
   */
  private saveOptions(): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('sync-options', JSON.stringify(this.options));
  }

  /**
   * Update sync options
   */
  public updateOptions(newOptions: Partial<SyncOptions>): void {
    this.options = { ...this.options, ...newOptions };
    this.saveOptions();
  }

  /**
   * Get current sync options
   */
  public getOptions(): SyncOptions {
    return { ...this.options };
  }

  /**
   * Set up sync helper with project and callbacks
   */
  public setup(
    project: Project,
    currentState: {
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
    },
    callbacks: {
      onSyncStart?: () => void;
      onSyncEnd?: () => void;
      onSyncComplete?: (stats: SyncStats) => void;
    }
  ): void {
    this.currentProject = project;
    this.currentState = currentState;
    this.onSyncStartCallback = callbacks.onSyncStart || null;
    this.onSyncEndCallback = callbacks.onSyncEnd || null;
    this.onSyncCallback = callbacks.onSyncComplete || null;
  }

  /**
   * Update current state
   */
  public updateState(currentState: {
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
  }): void {
    this.currentState = currentState;
  }

  /**
   * Enable or disable sync
   */
  public setEnabled(enabled: boolean): void {
    this.updateOptions({ enabled });
    if (!enabled && this.syncTimeout) {
      clearTimeout(this.syncTimeout);
      this.syncTimeout = null;
    }
  }

  /**
   * Set sync duration (minimum 30 seconds)
   */
  public setDuration(duration: number): void {
    const minDuration = 30;
    const actualDuration = Math.max(duration, minDuration);
    this.updateOptions({ duration: actualDuration });
  }

  /**
   * Update assets with current canvas modifications
   */
  public async updateAssetsWithCanvasModifications(): Promise<void> {
    if (!this.currentProject || !this.currentState) return;

    try {
      // Update current image if it exists and has been modified
      if (this.currentState.currentImage) {
        await dbManager.saveAsset({
          id: `current-image-${this.currentProject.id}`,
          project_id: this.currentProject.id,
          url: this.currentState.currentImage,
          name: 'Current Image',
          type: 'upload',
          timestamp: new Date(),
        });
      }

      // Update generated image if it exists and has been modified
      if (this.currentState.generatedImage) {
        await dbManager.saveAsset({
          id: `generated-image-${this.currentProject.id}`,
          project_id: this.currentProject.id,
          url: this.currentState.generatedImage,
          name: 'Generated Image',
          type: 'upload',
          timestamp: new Date(),
        });
      }

      // Update attached image if it exists and has been modified
      if (this.currentState.attachedImage) {
        await dbManager.saveAsset({
          id: `attached-image-${this.currentProject.id}`,
          project_id: this.currentProject.id,
          url: this.currentState.attachedImage,
          name: 'Attached Image',
          type: 'upload',
          timestamp: new Date(),
        });
      }

      logger.info('Assets updated with canvas modifications');
    } catch (error) {
      logger.error('Failed to update assets with canvas modifications:', error);
      throw error;
    }
  }

  /**
   * Perform project synchronization (auto-save)
   */
  public async performAutoSave(): Promise<SyncStats> {
    if (!this.currentProject || !this.currentState || !this.options.enabled) {
      throw new Error('Sync helper not properly set up or disabled');
    }

    try {
      // Call sync start callback
      if (this.onSyncStartCallback) {
        this.onSyncStartCallback();
      }

      // Update project data with current state
      const updatedProject: Project = {
        ...this.currentProject,
        name: this.currentState.projectName,
        settings: {
          currentModel: this.currentState.currentModel,
          currentSize: this.currentState.currentSize,
          isInpaintMode: this.currentState.isInpaintMode,
        },
        canvas: {
          currentImage: this.currentState.currentImage,
          generatedImage: this.currentState.generatedImage,
          attachedImage: this.currentState.attachedImage,
        },
        // UI State
        ui: {
          activeTool: this.currentState.activeTool,
          showGenerationPanel: this.currentState.showGenerationPanel,
          showPromptBox: this.currentState.showPromptBox,
          showAssetsPanel: this.currentState.showAssetsPanel,
          showHistoryPanel: this.currentState.showHistoryPanel,
          showConsole: this.currentState.showConsole,
          showSizeModal: this.currentState.showSizeModal,
          showKeyboardShortcuts: this.currentState.showKeyboardShortcuts,
          showAbout: this.currentState.showAbout,
          zoom: this.currentState.zoom,
        },
        // Generation State
        generation: {
          isGenerating: this.currentState.isGenerating,
          generationProgress: this.currentState.generationProgress,
          requestLog: this.currentState.requestLog,
          responseLog: this.currentState.responseLog,
        },
        // Undo/Redo History
        history: {
          states: this.currentState.history,
          historyIndex: this.currentState.historyIndex,
        },
        updated_at: new Date(),
      };

      // Update assets with canvas modifications first
      await this.updateAssetsWithCanvasModifications();

      // Save to database
      await dbManager.saveProject(updatedProject);

      // Get assets for stats
      const assets = await dbManager.getAssets(this.currentProject.id);
      const totalSize = assets.reduce(
        (sum, asset) => sum + (asset.url?.length || 0),
        0
      );

      const stats: SyncStats = {
        filesCount: assets.length,
        totalSize: totalSize,
        lastSync: new Date(),
      };

      // Call sync complete callback
      if (this.onSyncCallback) {
        this.onSyncCallback(stats);
      }

      logger.info('Auto-save completed via sync helper:', stats);
      return stats;
    } catch (error) {
      console.error('Auto-save failed:', error);
      throw error;
    } finally {
      // Call sync end callback
      if (this.onSyncEndCallback) {
        this.onSyncEndCallback();
      }
    }
  }

  /**
   * Schedule next auto-save
   */
  public scheduleAutoSave(): void {
    if (!this.options.enabled || !this.currentProject || !this.currentState)
      return;

    // Clear existing timeout
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
    }

    // Schedule new auto-save
    this.syncTimeout = setTimeout(async () => {
      try {
        await this.performAutoSave();
      } catch (error) {
        console.error('Scheduled auto-save failed:', error);
      }
    }, this.options.duration * 1000);
  }

  /**
   * Trigger auto-save immediately
   */
  public triggerAutoSave(): void {
    if (!this.options.enabled || !this.currentProject || !this.currentState)
      return;

    // Clear existing timeout
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
    }

    // Perform auto-save immediately
    this.performAutoSave().catch((error) => {
      console.error('Immediate auto-save failed:', error);
    });
  }

  /**
   * Cancel scheduled sync
   */
  public cancelSync(): void {
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
      this.syncTimeout = null;
    }
  }

  /**
   * Get project sync statistics
   */
  public async getProjectStats(
    projectId: string
  ): Promise<Omit<SyncStats, 'lastSync'>> {
    try {
      const assets = await dbManager.getAssets(projectId);
      const totalSize = assets.reduce(
        (sum, asset) => sum + (asset.url?.length || 0),
        0
      );

      return {
        filesCount: assets.length,
        totalSize: totalSize,
      };
    } catch (error) {
      console.error('Failed to get project stats:', error);
      return {
        filesCount: 0,
        totalSize: 0,
      };
    }
  }

  /**
   * Format file size for display
   */
  public formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }

  /**
   * Get sync status message
   */
  public getStatusMessage(enabled: boolean, lastSync: Date | null): string {
    if (!enabled) return 'Sync Disabled';
    if (!lastSync) return 'Never synced';

    const now = new Date();
    const diffMs = now.getTime() - lastSync.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  }
}

// Export singleton instance
export const syncHelper = SyncHelper.getInstance();
