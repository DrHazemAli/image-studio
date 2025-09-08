// Project management utilities for export/import functionality
/* eslint-disable */
import { dbManager, type Asset, type HistoryEntry, type Project } from './indexeddb';

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

  // Generate a UUID v4
  private static generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // Create a new project
  static async createProject(
    userId: string,
    name: string = 'Untitled Project',
    description?: string,
    settings?: {
      currentModel: string;
      currentSize: string;
      isInpaintMode: boolean;
    },
    canvas?: {
      currentImage: string | null;
      generatedImage: string | null;
      attachedImage: string | null;
    }
  ): Promise<Project> {
    const project: Project = {
      id: this.generateUUID(),
      user_id: userId,
      name,
      description,
      created_at: new Date(),
      updated_at: new Date(),
      settings: settings || {
        currentModel: 'FLUX.1-Kontext-pro',
        currentSize: '1024x1024',
        isInpaintMode: false
      },
      canvas: canvas || {
        currentImage: null,
        generatedImage: null,
        attachedImage: null
      },
      metadata: {
        tags: [],
        author: 'Azure Image Studio'
      }
    };

    await dbManager.saveProject(project);
    return project;
  }

  // Load a project by ID
  static async loadProject(projectId: string): Promise<Project | null> {
    return await dbManager.getProject(projectId);
  }

  // Save/Update a project
  static async saveProject(project: Project): Promise<void> {
    project.updated_at = new Date();
    await dbManager.saveProject(project);
  }

  // Get all projects for a user
  static async getUserProjects(userId: string): Promise<Project[]> {
    return await dbManager.getProjects(userId);
  }

  // Get all projects (for admin purposes)
  static async getAllProjects(): Promise<Project[]> {
    return await dbManager.getProjects();
  }

  // Delete a project
  static async deleteProject(projectId: string): Promise<void> {
    await dbManager.deleteProject(projectId);
  }

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

  // Export project from IndexedDB project
  static async exportProjectFromDB(project: Project): Promise<ProjectData> {
    try {
      // Get project-specific assets and history from IndexedDB
      const assets = await dbManager.getAssets(project.id);
      const history = await dbManager.getHistory(project.id);

      const projectData: ProjectData = {
        version: this.PROJECT_VERSION,
        name: project.name,
        createdAt: project.created_at.toISOString(),
        lastModified: project.updated_at.toISOString(),
        settings: project.settings,
        canvas: project.canvas,
        assets,
        history,
        metadata: project.metadata,
      };

      return projectData;
    } catch (error) {
      console.error('Failed to export project from DB:', error);
      throw new Error('Failed to export project from DB');
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
            project_id: '', // Will be set by the calling function
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
            project_id: '', // Will be set by the calling function
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

  // Import project and save to IndexedDB
  static async importProjectToDB(
    projectData: ProjectData,
    userId: string
  ): Promise<{
    success: boolean;
    message: string;
    project?: Project;
  }> {
    try {
      // Validate project data
      if (!this.validateProjectData(projectData)) {
        return {
          success: false,
          message: 'Invalid project file format',
        };
      }

      // Create new project in IndexedDB
      const project = await this.createProject(
        userId,
        projectData.name,
        projectData.metadata.description,
        projectData.settings,
        projectData.canvas
      );

      // Update metadata
      project.metadata = projectData.metadata;

      // Save the project
      await this.saveProject(project);

      // Import assets with project_id
      let assetsImported = 0;
      for (const asset of projectData.assets) {
        try {
          await dbManager.saveAsset({
            ...asset,
            project_id: project.id,
            timestamp: new Date(asset.timestamp),
          });
          assetsImported++;
        } catch (error) {
          console.warn('Failed to import asset:', asset.id, error);
        }
      }

      // Import history with project_id
      let historyImported = 0;
      for (const entry of projectData.history) {
        try {
          await dbManager.saveHistoryEntry({
            ...entry,
            project_id: project.id,
            timestamp: new Date(entry.timestamp),
          });
          historyImported++;
        } catch (error) {
          console.warn('Failed to import history entry:', entry.id, error);
        }
      }

      return {
        success: true,
        message: `Project "${projectData.name}" imported successfully. ${assetsImported} assets, ${historyImported} history entries.`,
        project,
      };
      } catch (err) {
        console.error('Failed to import project to DB:', err);
        return {
          success: false,
          message: `Failed to import project: ${err instanceof Error ? err.message : 'Unknown error'}`,
        };
      }
  }

  // Validate project data structure
  private static validateProjectData(data: unknown): data is ProjectData {
    return (
      data !== null &&
      typeof data === 'object' &&
      'version' in data &&
      'name' in data &&
      'createdAt' in data &&
      'lastModified' in data &&
      'settings' in data &&
      'canvas' in data &&
      'assets' in data &&
      'history' in data &&
      'metadata' in data &&
      typeof (data as any).version === 'string' &&
      typeof (data as any).name === 'string' &&
      typeof (data as any).createdAt === 'string' &&
      typeof (data as any).lastModified === 'string' &&
      (data as any).settings &&
      typeof (data as any).settings.currentModel === 'string' &&
      typeof (data as any).settings.currentSize === 'string' &&
      typeof (data as any).settings.isInpaintMode === 'boolean' &&
      (data as any).canvas &&
      Array.isArray((data as any).assets) &&
      Array.isArray((data as any).history) &&
      (data as any).metadata &&
      typeof (data as any).metadata === 'object'
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
