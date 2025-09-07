// Project management utilities for export/import functionality

import { dbManager, type Asset, type HistoryEntry } from './indexeddb';

export interface ProjectData {
  version: string;
  name: string;
  createdAt: string;
  lastModified: string;
  settings: {
    currentModel: string;
    currentSize: string;
    isInpaintMode: boolean;
  };
  canvas: {
    currentImage: string | null;
    generatedImage: string | null;
    attachedImage: string | null;
  };
  assets: Asset[];
  history: HistoryEntry[];
  metadata: {
    description?: string;
    tags?: string[];
    author?: string;
  };
}

export class ProjectManager {
  private static readonly PROJECT_VERSION = '1.0.0';

  // Export current project to JSON
  static async exportProject(
    projectName: string,
    currentModel: string,
    currentSize: string,
    isInpaintMode: boolean,
    currentImage: string | null,
    generatedImage: string | null,
    attachedImage: string | null,
    metadata?: { description?: string; tags?: string[]; author?: string }
  ): Promise<ProjectData> {
    try {
      // Get all assets and history from IndexedDB
      const assets = await dbManager.getAssets();
      const history = await dbManager.getHistory();

      const projectData: ProjectData = {
        version: this.PROJECT_VERSION,
        name: projectName,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        settings: {
          currentModel,
          currentSize,
          isInpaintMode,
        },
        canvas: {
          currentImage,
          generatedImage,
          attachedImage,
        },
        assets,
        history,
        metadata: metadata || {},
      };

      return projectData;
    } catch (error) {
      console.error('Failed to export project:', error);
      throw new Error('Failed to export project');
    }
  }

  // Import project from JSON
  static async importProject(projectData: ProjectData): Promise<{
    success: boolean;
    message: string;
    data?: {
      projectName: string;
      settings: ProjectData['settings'];
      canvas: ProjectData['canvas'];
      assetsCount: number;
      historyCount: number;
    };
  }> {
    try {
      // Validate project data
      if (!this.validateProjectData(projectData)) {
        return {
          success: false,
          message: 'Invalid project file format',
        };
      }

      // Clear existing data
      await dbManager.clearAssets();
      await dbManager.clearHistory();

      // Import assets
      let assetsImported = 0;
      for (const asset of projectData.assets) {
        try {
          await dbManager.saveAsset({
            ...asset,
            timestamp: new Date(asset.timestamp),
          });
          assetsImported++;
        } catch (error) {
          console.warn('Failed to import asset:', asset.id, error);
        }
      }

      // Import history
      let historyImported = 0;
      for (const entry of projectData.history) {
        try {
          await dbManager.saveHistoryEntry({
            ...entry,
            timestamp: new Date(entry.timestamp),
          });
          historyImported++;
        } catch (error) {
          console.warn('Failed to import history entry:', entry.id, error);
        }
      }

      return {
        success: true,
        message: `Project imported successfully. ${assetsImported} assets, ${historyImported} history entries.`,
        data: {
          projectName: projectData.name,
          settings: projectData.settings,
          canvas: projectData.canvas,
          assetsCount: assetsImported,
          historyCount: historyImported,
        },
      };
    } catch (error) {
      console.error('Failed to import project:', error);
      return {
        success: false,
        message: `Failed to import project: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  // Validate project data structure
  private static validateProjectData(data: any): data is ProjectData {
    return (
      data &&
      typeof data === 'object' &&
      typeof data.version === 'string' &&
      typeof data.name === 'string' &&
      typeof data.createdAt === 'string' &&
      typeof data.lastModified === 'string' &&
      data.settings &&
      typeof data.settings.currentModel === 'string' &&
      typeof data.settings.currentSize === 'string' &&
      typeof data.settings.isInpaintMode === 'boolean' &&
      data.canvas &&
      Array.isArray(data.assets) &&
      Array.isArray(data.history) &&
      data.metadata &&
      typeof data.metadata === 'object'
    );
  }

  // Download project as JSON file
  static downloadProject(projectData: ProjectData, filename?: string): void {
    const jsonString = JSON.stringify(projectData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `${projectData.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Read project from file
  static async readProjectFromFile(file: File): Promise<ProjectData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const jsonString = event.target?.result as string;
          const projectData = JSON.parse(jsonString);
          
          if (!this.validateProjectData(projectData)) {
            reject(new Error('Invalid project file format'));
            return;
          }
          
          resolve(projectData);
        } catch (error) {
          reject(new Error('Failed to parse project file'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read project file'));
      };
      
      reader.readAsText(file);
    });
  }

  // Get project info without importing
  static getProjectInfo(projectData: ProjectData): {
    name: string;
    version: string;
    createdAt: string;
    lastModified: string;
    assetsCount: number;
    historyCount: number;
    description?: string;
    tags?: string[];
    author?: string;
  } {
    return {
      name: projectData.name,
      version: projectData.version,
      createdAt: projectData.createdAt,
      lastModified: projectData.lastModified,
      assetsCount: projectData.assets.length,
      historyCount: projectData.history.length,
      description: projectData.metadata.description,
      tags: projectData.metadata.tags,
      author: projectData.metadata.author,
    };
  }
}
