// IndexedDB utility functions for storing large data like images and history

interface Asset {
  id: string;
  url: string;
  name: string;
  type: 'generation' | 'edit' | 'upload';
  timestamp: Date;
  prompt?: string;
  model?: string;
}

interface HistoryEntry {
  id: string;
  type: 'generation' | 'edit' | 'upload';
  timestamp: Date;
  prompt?: string;
  model?: string;
  settings?: any;
  imageUrl?: string;
  thumbnailUrl?: string;
  status: 'completed' | 'failed' | 'in-progress';
  error?: string;
}

class IndexedDBManager {
  private dbName = 'AzureStudioDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create assets store
        if (!db.objectStoreNames.contains('assets')) {
          const assetsStore = db.createObjectStore('assets', { keyPath: 'id' });
          assetsStore.createIndex('timestamp', 'timestamp', { unique: false });
          assetsStore.createIndex('type', 'type', { unique: false });
        }

        // Create history store
        if (!db.objectStoreNames.contains('history')) {
          const historyStore = db.createObjectStore('history', { keyPath: 'id' });
          historyStore.createIndex('timestamp', 'timestamp', { unique: false });
          historyStore.createIndex('type', 'type', { unique: false });
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

  async getAssets(): Promise<Asset[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['assets'], 'readonly');
      const store = transaction.objectStore('assets');
      const request = store.getAll();
      
      request.onsuccess = () => {
        const assets = request.result.map(asset => ({
          ...asset,
          timestamp: new Date(asset.timestamp)
        }));
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

  async getHistory(): Promise<HistoryEntry[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['history'], 'readonly');
      const store = transaction.objectStore('history');
      const request = store.getAll();
      
      request.onsuccess = () => {
        const history = request.result.map(entry => ({
          ...entry,
          timestamp: new Date(entry.timestamp)
        }));
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

  // Migration from localStorage
  async migrateFromLocalStorage(): Promise<void> {
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
  async getStorageInfo(): Promise<{ assets: number; history: number }> {
    const assets = await this.getAssets();
    const history = await this.getHistory();
    
    return {
      assets: assets.length,
      history: history.length
    };
  }
}

// Create singleton instance
export const dbManager = new IndexedDBManager();

// Initialize on import
dbManager.init().catch(console.error);

export type { Asset, HistoryEntry };
