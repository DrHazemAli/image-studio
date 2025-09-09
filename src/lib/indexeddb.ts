// IndexedDB utility functions for storing large data like images and history
 /* eslint-disable */
interface Asset {
  id: string;
  project_id: string; // Foreign key to Project
  url: string;
  name: string;
  type: 'generation' | 'edit' | 'upload';
  timestamp: Date;
  prompt?: string;
  model?: string;
}

interface HistoryEntry {
  id: string;
  project_id: string; // Foreign key to Project
  type: 'generation' | 'edit' | 'upload';
  timestamp: Date;
  prompt?: string;
  model?: string;
  settings?: Record<string, unknown>;
  imageUrl?: string;
  thumbnailUrl?: string;
  status: 'completed' | 'failed' | 'in-progress';
  error?: string;
}

interface Project {
  id: string; // UUID
  user_id: string; // Owner of the project
  name: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
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
  // UI State
  ui: {
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
  };
  // Generation State
  generation: {
    isGenerating: boolean;
    generationProgress: number;
    requestLog: unknown;
    responseLog: unknown;
  };
  // Undo/Redo History
  history: {
    states: Array<{
      currentImage: string | null;
      generatedImage: string | null;
      attachedImage: string | null;
      zoom: number;
      timestamp: number;
    }>;
    historyIndex: number;
  };
  metadata: {
    tags?: string[];
    author?: string;
  };
}

class IndexedDBManager {
  private dbName = 'AzureStudioDB';
  private version = 4; // Increment version to add comprehensive project state
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || typeof indexedDB === 'undefined') {
      throw new Error('IndexedDB is not available in this environment');
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = (event.target as IDBOpenDBRequest).transaction;

        // Create assets store
        if (!db.objectStoreNames.contains('assets')) {
          const assetsStore = db.createObjectStore('assets', { keyPath: 'id' });
          assetsStore.createIndex('timestamp', 'timestamp', { unique: false });
          assetsStore.createIndex('type', 'type', { unique: false });
          assetsStore.createIndex('project_id', 'project_id', { unique: false });
        } else {
          // Add project_id index to existing assets store
          const assetsStore = transaction!.objectStore('assets');
          if (!assetsStore.indexNames.contains('project_id')) {
            assetsStore.createIndex('project_id', 'project_id', { unique: false });
          }
        }

        // Create history store
        if (!db.objectStoreNames.contains('history')) {
          const historyStore = db.createObjectStore('history', { keyPath: 'id' });
          historyStore.createIndex('timestamp', 'timestamp', { unique: false });
          historyStore.createIndex('type', 'type', { unique: false });
          historyStore.createIndex('project_id', 'project_id', { unique: false });
        } else {
          // Add project_id index to existing history store
          const historyStore = transaction!.objectStore('history');
          if (!historyStore.indexNames.contains('project_id')) {
            historyStore.createIndex('project_id', 'project_id', { unique: false });
          }
        }

        // Create projects store
        if (!db.objectStoreNames.contains('projects')) {
          const projectsStore = db.createObjectStore('projects', { keyPath: 'id' });
          projectsStore.createIndex('user_id', 'user_id', { unique: false });
          projectsStore.createIndex('created_at', 'created_at', { unique: false });
          projectsStore.createIndex('updated_at', 'updated_at', { unique: false });
        }
      };
    });
  }

  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init();
    }
    if (!this.db) {
      throw new Error('Failed to initialize IndexedDB');
    }
    return this.db;
  }

  // Assets operations
  async saveAsset(asset: Asset): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['assets'], 'readwrite');
      const store = transaction.objectStore('assets');
      const request = store.put(asset);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAssets(projectId?: string): Promise<Asset[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['assets'], 'readonly');
      const store = transaction.objectStore('assets');
      
      let request: IDBRequest;
      if (projectId) {
        try {
          // Check if project_id index exists
          if (store.indexNames.contains('project_id')) {
            const index = store.index('project_id');
            request = index.getAll(projectId);
          } else {
            // Fallback: get all assets and filter by project_id
            request = store.getAll();
          }
        } catch (error) {
          // Fallback: get all assets and filter by project_id
          request = store.getAll();
        }
      } else {
        request = store.getAll();
      }
      
      request.onsuccess = () => {
        let assets = request.result.map((asset: any) => ({
          ...asset,
          timestamp: new Date(asset.timestamp)
        }));
        
        // If we used fallback and have a projectId, filter the results
        if (projectId && !store.indexNames.contains('project_id')) {
          assets = assets.filter((asset: any) => asset.project_id === projectId);
        }
        
        resolve(assets);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deleteAsset(id: string): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['assets'], 'readwrite');
      const store = transaction.objectStore('assets');
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clearAssets(): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['assets'], 'readwrite');
      const store = transaction.objectStore('assets');
      const request = store.clear();
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteAssetsByProject(projectId: string): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['assets'], 'readwrite');
      const store = transaction.objectStore('assets');
      const index = store.index('project_id');
      const request = index.getAllKeys(projectId);
      
      request.onsuccess = () => {
        const keys = request.result;
        if (keys.length === 0) {
          resolve();
          return;
        }
        
        let completed = 0;
        const total = keys.length;
        
        keys.forEach(key => {
          const deleteRequest = store.delete(key);
          deleteRequest.onsuccess = () => {
            completed++;
            if (completed === total) {
              resolve();
            }
          };
          deleteRequest.onerror = () => reject(deleteRequest.error);
        });
      };
      request.onerror = () => reject(request.error);
    });
  }

  // History operations
  async saveHistoryEntry(entry: HistoryEntry): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['history'], 'readwrite');
      const store = transaction.objectStore('history');
      const request = store.put(entry);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getHistory(projectId?: string): Promise<HistoryEntry[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['history'], 'readonly');
      const store = transaction.objectStore('history');
      
      let request: IDBRequest;
      if (projectId) {
        try {
          // Check if project_id index exists
          if (store.indexNames.contains('project_id')) {
            const index = store.index('project_id');
            request = index.getAll(projectId);
          } else {
            // Fallback: get all history and filter by project_id
            request = store.getAll();
          }
        } catch (error) {
          // Fallback: get all history and filter by project_id
          request = store.getAll();
        }
      } else {
        request = store.getAll();
      }
      
      request.onsuccess = () => {
        let history = request.result.map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp)
        }));
        
        // If we used fallback and have a projectId, filter the results
        if (projectId && !store.indexNames.contains('project_id')) {
         
          history = history.filter((entry: any) => entry.project_id === projectId);
        }
        
        resolve(history);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deleteHistoryEntry(id: string): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['history'], 'readwrite');
      const store = transaction.objectStore('history');
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clearHistory(): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['history'], 'readwrite');
      const store = transaction.objectStore('history');
      const request = store.clear();
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteHistoryByProject(projectId: string): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['history'], 'readwrite');
      const store = transaction.objectStore('history');
      const index = store.index('project_id');
      const request = index.getAllKeys(projectId);
      
      request.onsuccess = () => {
        const keys = request.result;
        if (keys.length === 0) {
          resolve();
          return;
        }
        
        let completed = 0;
        const total = keys.length;
        
        keys.forEach(key => {
          const deleteRequest = store.delete(key);
          deleteRequest.onsuccess = () => {
            completed++;
            if (completed === total) {
              resolve();
            }
          };
          deleteRequest.onerror = () => reject(deleteRequest.error);
        });
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Migration from localStorage
  async migrateFromLocalStorage(): Promise<void> {
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }

    try {
      // Migrate assets
      const savedAssets = localStorage.getItem('azure-studio-assets');
      if (savedAssets) {
        const assets = JSON.parse(savedAssets);
        for (const asset of assets) {
          await this.saveAsset({
            ...asset,
            timestamp: new Date(asset.timestamp)
          });
        }
        localStorage.removeItem('azure-studio-assets');
        console.log('Migrated assets from localStorage to IndexedDB');
      }

      // Migrate history
      const savedHistory = localStorage.getItem('azure-studio-history');
      if (savedHistory) {
        const history = JSON.parse(savedHistory);
        for (const entry of history) {
          await this.saveHistoryEntry({
            ...entry,
            timestamp: new Date(entry.timestamp)
          });
        }
        localStorage.removeItem('azure-studio-history');
        console.log('Migrated history from localStorage to IndexedDB');
      }
    } catch (error) {
      console.error('Migration failed:', error);
    }
  }

  // Get storage usage info
  async getStorageInfo(): Promise<{ assets: number; history: number; projects: number }> {
    const assets = await this.getAssets();
    const history = await this.getHistory();
    const projects = await this.getProjects();
    
    return {
      assets: assets.length,
      history: history.length,
      projects: projects.length
    };
  }

  // Project operations
  async saveProject(project: Project): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['projects'], 'readwrite');
      const store = transaction.objectStore('projects');
      const request = store.put(project);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getProject(id: string): Promise<Project | null> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['projects'], 'readonly');
      const store = transaction.objectStore('projects');
      const request = store.get(id);
      
      request.onsuccess = () => {
        if (request.result) {
          const project = {
            ...request.result,
            created_at: new Date(request.result.created_at),
            updated_at: new Date(request.result.updated_at)
          };
          resolve(project);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getProjects(userId?: string): Promise<Project[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['projects'], 'readonly');
      const store = transaction.objectStore('projects');
      
      let request: IDBRequest;
      if (userId) {
        const index = store.index('user_id');
        request = index.getAll(userId);
      } else {
        request = store.getAll();
      }
      
      request.onsuccess = () => {
        const projects = request.result.map((project: any) => ({
          ...project,
          created_at: new Date(project.created_at),
          updated_at: new Date(project.updated_at)
        }));
        resolve(projects);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deleteProject(id: string): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['projects'], 'readwrite');
      const store = transaction.objectStore('projects');
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clearProjects(): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['projects'], 'readwrite');
      const store = transaction.objectStore('projects');
      const request = store.clear();
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

// Create singleton instance
export const dbManager = new IndexedDBManager();

// Initialize only in browser environment
if (typeof window !== 'undefined') {
  dbManager.init().catch(console.error);
}

export type { Asset, HistoryEntry, Project };

