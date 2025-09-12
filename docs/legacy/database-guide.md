# Database Guide - Image Studio

This comprehensive guide covers the data storage, management, and architecture of Image Studio's database system.

> ⚠️ **Important**: This is a **community project** and is not affiliated with or endorsed by Microsoft or Azure. It's an independent project that uses Azure AI services.

**Last Updated**: September 8, 2025  
**Version**: 1.0.3

## 🗄️ Database Overview

Image Studio uses a client-side database architecture built on IndexedDB for storing user data, assets, and project information. This approach provides:

- **Offline Capability**: Work without internet connection
- **Performance**: Fast local data access
- **Privacy**: Data stays on user's device
- **Scalability**: Handle large amounts of data efficiently

## 🏗️ Database Architecture

### Storage Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                        │
├─────────────────────────────────────────────────────────────┤
│                    IndexedDB Manager                        │
├─────────────────────────────────────────────────────────────┤
│                    IndexedDB Storage                        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │   Assets    │ │   History   │ │  Projects   │           │
│  │   Store     │ │    Store    │ │    Store    │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

### Database Schema

#### Database Information

- **Database Name**: `AzureStudioDB`
- **Version**: 3
- **Object Stores**: 3 (assets, history, projects)

## 📊 Data Models

### Asset Model

```typescript
interface Asset {
  id: string; // Unique identifier
  project_id: string; // Foreign key to Project
  url: string; // Asset URL or data URL
  name: string; // Asset name
  type: "generation" | "edit" | "upload"; // Asset type
  timestamp: Date; // Creation timestamp
  prompt?: string; // Generation prompt (if applicable)
  model?: string; // AI model used (if applicable)
  metadata?: {
    // Additional metadata
    size?: number; // File size in bytes
    format?: string; // File format (png, jpeg, etc.)
    dimensions?: {
      // Image dimensions
      width: number;
      height: number;
    };
    tags?: string[]; // User-defined tags
  };
}
```

### History Entry Model

```typescript
interface HistoryEntry {
  id: string; // Unique identifier
  project_id: string; // Foreign key to Project
  type: "generation" | "edit" | "upload"; // Operation type
  timestamp: Date; // Operation timestamp
  prompt?: string; // Generation prompt
  model?: string; // AI model used
  settings?: Record<string, unknown>; // Generation settings
  imageUrl?: string; // Result image URL
  thumbnailUrl?: string; // Thumbnail URL
  status: "completed" | "failed" | "in-progress"; // Operation status
  error?: string; // Error message (if failed)
  duration?: number; // Processing time in milliseconds
  metadata?: {
    // Additional metadata
    size?: string; // Image size (1024x1024, etc.)
    quality?: string; // Quality level
    style?: string; // Style option
    count?: number; // Number of images generated
  };
}
```

### Project Model

```typescript
interface Project {
  id: string; // UUID
  user_id: string; // Owner of the project
  name: string; // Project name
  description?: string; // Project description
  created_at: Date; // Creation timestamp
  updated_at: Date; // Last modification timestamp
  settings: {
    // Project settings
    currentModel: string; // Default AI model
    currentSize: string; // Default image size
    isInpaintMode: boolean; // Inpaint mode flag
    defaultQuality: string; // Default quality level
    defaultStyle: string; // Default style
  };
  canvas: {
    // Canvas state
    currentImage: string | null; // Current canvas image
    generatedImage: string | null; // Last generated image
    attachedImage: string | null; // Attached reference image
    zoom: number; // Canvas zoom level
    pan: {
      // Canvas pan position
      x: number;
      y: number;
    };
  };
  metadata: {
    // Project metadata
    tags?: string[]; // Project tags
    author?: string; // Project author
    version?: string; // Project version
    template?: string; // Project template used
  };
}
```

## 🔧 IndexedDB Implementation

### Database Manager Class

```typescript
class IndexedDBManager {
  private dbName = "AzureStudioDB";
  private version = 3;
  private db: IDBDatabase | null = null;

  // Initialize database
  async init(): Promise<void>;

  // Asset operations
  async saveAsset(asset: Asset): Promise<void>;
  async getAssets(projectId?: string): Promise<Asset[]>;
  async deleteAsset(id: string): Promise<void>;
  async clearAssets(): Promise<void>;
  async deleteAssetsByProject(projectId: string): Promise<void>;

  // History operations
  async saveHistoryEntry(entry: HistoryEntry): Promise<void>;
  async getHistory(projectId?: string): Promise<HistoryEntry[]>;
  async deleteHistoryEntry(id: string): Promise<void>;
  async clearHistory(): Promise<void>;
  async deleteHistoryByProject(projectId: string): Promise<void>;

  // Project operations
  async saveProject(project: Project): Promise<void>;
  async getProject(id: string): Promise<Project | null>;
  async getProjects(userId?: string): Promise<Project[]>;
  async deleteProject(id: string): Promise<void>;
  async clearProjects(): Promise<void>;

  // Utility operations
  async getStorageInfo(): Promise<{
    assets: number;
    history: number;
    projects: number;
  }>;
  async migrateFromLocalStorage(): Promise<void>;
}
```

### Database Initialization

```typescript
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
      const transaction = (event.target as IDBOpenDBRequest).transaction;

      // Create assets store
      if (!db.objectStoreNames.contains('assets')) {
        const assetsStore = db.createObjectStore('assets', { keyPath: 'id' });
        assetsStore.createIndex('timestamp', 'timestamp', { unique: false });
        assetsStore.createIndex('type', 'type', { unique: false });
        assetsStore.createIndex('project_id', 'project_id', { unique: false });
      }

      // Create history store
      if (!db.objectStoreNames.contains('history')) {
        const historyStore = db.createObjectStore('history', { keyPath: 'id' });
        historyStore.createIndex('timestamp', 'timestamp', { unique: false });
        historyStore.createIndex('type', 'type', { unique: false });
        historyStore.createIndex('project_id', 'project_id', { unique: false });
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
```

## 📈 Database Operations

### Asset Management

#### Save Asset

```typescript
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
```

#### Get Assets

```typescript
async getAssets(projectId?: string): Promise<Asset[]> {
  const db = await this.ensureDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['assets'], 'readonly');
    const store = transaction.objectStore('assets');

    let request: IDBRequest;
    if (projectId) {
      const index = store.index('project_id');
      request = index.getAll(projectId);
    } else {
      request = store.getAll();
    }

    request.onsuccess = () => {
      const assets = request.result.map((asset: any) => ({
        ...asset,
        timestamp: new Date(asset.timestamp)
      }));
      resolve(assets);
    };
    request.onerror = () => reject(request.error);
  });
}
```

#### Delete Asset

```typescript
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
```

### History Management

#### Save History Entry

```typescript
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
```

#### Get History

```typescript
async getHistory(projectId?: string): Promise<HistoryEntry[]> {
  const db = await this.ensureDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['history'], 'readonly');
    const store = transaction.objectStore('history');

    let request: IDBRequest;
    if (projectId) {
      const index = store.index('project_id');
      request = index.getAll(projectId);
    } else {
      request = store.getAll();
    }

    request.onsuccess = () => {
      const history = request.result.map((entry: any) => ({
        ...entry,
        timestamp: new Date(entry.timestamp)
      }));
      resolve(history);
    };
    request.onerror = () => reject(request.error);
  });
}
```

### Project Management

#### Save Project

```typescript
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
```

#### Get Project

```typescript
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
```

## 🔄 Data Migration

### Migration System

The application includes a comprehensive migration system to handle data structure changes and localStorage to IndexedDB migration.

#### Migration from localStorage

```typescript
export async function migrateFromLocalStorage(): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: true,
    assetsMigrated: 0,
    historyMigrated: 0,
    errors: [],
  };

  try {
    // Initialize IndexedDB
    await dbManager.init();

    // Migrate assets
    const savedAssets = localStorage.getItem("azure-studio-assets");
    if (savedAssets) {
      try {
        const assets = JSON.parse(savedAssets);
        for (const asset of assets) {
          await dbManager.saveAsset({
            ...asset,
            timestamp: new Date(asset.timestamp),
          });
          result.assetsMigrated++;
        }
        localStorage.removeItem("azure-studio-assets");
        console.log(
          `Migrated ${result.assetsMigrated} assets from localStorage to IndexedDB`,
        );
      } catch (error) {
        const errorMsg = `Failed to migrate assets: ${error}`;
        result.errors.push(errorMsg);
        console.error(errorMsg);
      }
    }

    // Migrate history
    const savedHistory = localStorage.getItem("azure-studio-history");
    if (savedHistory) {
      try {
        const history = JSON.parse(savedHistory);
        for (const entry of history) {
          await dbManager.saveHistoryEntry({
            ...entry,
            timestamp: new Date(entry.timestamp),
          });
          result.historyMigrated++;
        }
        localStorage.removeItem("azure-studio-history");
        console.log(
          `Migrated ${result.historyMigrated} history entries from localStorage to IndexedDB`,
        );
      } catch (error) {
        const errorMsg = `Failed to migrate history: ${error}`;
        result.errors.push(errorMsg);
        console.error(errorMsg);
      }
    }

    if (result.errors.length > 0) {
      result.success = false;
    }
  } catch (error) {
    result.success = false;
    result.errors.push(`Migration failed: ${error}`);
    console.error("Migration failed:", error);
  }

  return result;
}
```

#### Check Migration Need

```typescript
export function needsMigration(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof localStorage !== "undefined" &&
    (localStorage.getItem("azure-studio-assets") !== null ||
      localStorage.getItem("azure-studio-history") !== null)
  );
}
```

## 📊 Storage Information

### Get Storage Usage

```typescript
export async function getStorageInfo(): Promise<{
  localStorage: {
    assets: number;
    history: number;
    totalSize: number;
  };
  indexedDB: {
    assets: number;
    history: number;
    projects: number;
  };
}> {
  const localStorageInfo = {
    assets: 0,
    history: 0,
    totalSize: 0,
  };

  // Check localStorage
  const savedAssets = localStorage.getItem("azure-studio-assets");
  if (savedAssets) {
    const assets = JSON.parse(savedAssets);
    localStorageInfo.assets = assets.length;
    localStorageInfo.totalSize += savedAssets.length;
  }

  const savedHistory = localStorage.getItem("azure-studio-history");
  if (savedHistory) {
    const history = JSON.parse(savedHistory);
    localStorageInfo.history = history.length;
    localStorageInfo.totalSize += savedHistory.length;
  }

  // Check IndexedDB
  const indexedDBInfo = await dbManager.getStorageInfo();

  return {
    localStorage: localStorageInfo,
    indexedDB: indexedDBInfo,
  };
}
```

### Clear All Data

```typescript
export async function clearAllData(): Promise<void> {
  try {
    // Clear IndexedDB
    await dbManager.clearAssets();
    await dbManager.clearHistory();
    await dbManager.clearProjects();

    // Clear localStorage
    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
      localStorage.removeItem("azure-studio-assets");
      localStorage.removeItem("azure-studio-history");
    }

    console.log("All data cleared successfully");
  } catch (error) {
    console.error("Failed to clear data:", error);
    throw error;
  }
}
```

## 🎯 Project Management

### Project Data Structure

```typescript
interface ProjectData {
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
```

### Project Export

```typescript
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
```

### Project Import

```typescript
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
```

## 🔍 Querying and Filtering

### Asset Queries

#### Get Assets by Type

```typescript
async getAssetsByType(type: 'generation' | 'edit' | 'upload'): Promise<Asset[]> {
  const db = await this.ensureDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['assets'], 'readonly');
    const store = transaction.objectStore('assets');
    const index = store.index('type');
    const request = index.getAll(type);

    request.onsuccess = () => {
      const assets = request.result.map((asset: any) => ({
        ...asset,
        timestamp: new Date(asset.timestamp)
      }));
      resolve(assets);
    };
    request.onerror = () => reject(request.error);
  });
}
```

#### Get Recent Assets

```typescript
async getRecentAssets(limit: number = 10): Promise<Asset[]> {
  const db = await this.ensureDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['assets'], 'readonly');
    const store = transaction.objectStore('assets');
    const index = store.index('timestamp');
    const request = index.getAll();

    request.onsuccess = () => {
      const assets = request.result
        .map((asset: any) => ({
          ...asset,
          timestamp: new Date(asset.timestamp)
        }))
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, limit);
      resolve(assets);
    };
    request.onerror = () => reject(request.error);
  });
}
```

### History Queries

#### Get History by Status

```typescript
async getHistoryByStatus(status: 'completed' | 'failed' | 'in-progress'): Promise<HistoryEntry[]> {
  const db = await this.ensureDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['history'], 'readonly');
    const store = transaction.objectStore('history');
    const request = store.getAll();

    request.onsuccess = () => {
      const history = request.result
        .map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp)
        }))
        .filter((entry: HistoryEntry) => entry.status === status);
      resolve(history);
    };
    request.onerror = () => reject(request.error);
  });
}
```

#### Get History by Model

```typescript
async getHistoryByModel(model: string): Promise<HistoryEntry[]> {
  const db = await this.ensureDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['history'], 'readonly');
    const store = transaction.objectStore('history');
    const request = store.getAll();

    request.onsuccess = () => {
      const history = request.result
        .map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp)
        }))
        .filter((entry: HistoryEntry) => entry.model === model);
      resolve(history);
    };
    request.onerror = () => reject(request.error);
  });
}
```

## 🚀 Performance Optimization

### Indexing Strategy

The database uses strategic indexing for optimal query performance:

#### Asset Store Indexes

- `timestamp`: For chronological queries
- `type`: For filtering by asset type
- `project_id`: For project-specific queries

#### History Store Indexes

- `timestamp`: For chronological queries
- `type`: For filtering by operation type
- `project_id`: For project-specific queries

#### Project Store Indexes

- `user_id`: For user-specific queries
- `created_at`: For chronological queries
- `updated_at`: For recent activity queries

### Batch Operations

#### Batch Asset Import

```typescript
async batchImportAssets(assets: Asset[]): Promise<{ success: number; failed: number }> {
  const db = await this.ensureDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['assets'], 'readwrite');
    const store = transaction.objectStore('assets');

    let success = 0;
    let failed = 0;
    let completed = 0;

    assets.forEach(asset => {
      const request = store.put(asset);
      request.onsuccess = () => {
        success++;
        completed++;
        if (completed === assets.length) {
          resolve({ success, failed });
        }
      };
      request.onerror = () => {
        failed++;
        completed++;
        if (completed === assets.length) {
          resolve({ success, failed });
        }
      };
    });
  });
}
```

### Memory Management

#### Cleanup Old Data

```typescript
async cleanupOldData(daysOld: number = 30): Promise<{ assetsDeleted: number; historyDeleted: number }> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const assets = await this.getAssets();
  const history = await this.getHistory();

  const oldAssets = assets.filter(asset => asset.timestamp < cutoffDate);
  const oldHistory = history.filter(entry => entry.timestamp < cutoffDate);

  // Delete old assets
  for (const asset of oldAssets) {
    await this.deleteAsset(asset.id);
  }

  // Delete old history
  for (const entry of oldHistory) {
    await this.deleteHistoryEntry(entry.id);
  }

  return {
    assetsDeleted: oldAssets.length,
    historyDeleted: oldHistory.length
  };
}
```

## 🔒 Data Security

### Data Validation

#### Asset Validation

```typescript
function validateAsset(asset: any): asset is Asset {
  return (
    typeof asset.id === "string" &&
    typeof asset.project_id === "string" &&
    typeof asset.url === "string" &&
    typeof asset.name === "string" &&
    ["generation", "edit", "upload"].includes(asset.type) &&
    asset.timestamp instanceof Date
  );
}
```

#### History Entry Validation

```typescript
function validateHistoryEntry(entry: any): entry is HistoryEntry {
  return (
    typeof entry.id === "string" &&
    typeof entry.project_id === "string" &&
    ["generation", "edit", "upload"].includes(entry.type) &&
    entry.timestamp instanceof Date &&
    ["completed", "failed", "in-progress"].includes(entry.status)
  );
}
```

### Data Sanitization

#### Sanitize Asset Data

```typescript
function sanitizeAsset(asset: any): Asset {
  return {
    id: String(asset.id),
    project_id: String(asset.project_id),
    url: String(asset.url),
    name: String(asset.name).substring(0, 255), // Limit name length
    type: ["generation", "edit", "upload"].includes(asset.type)
      ? asset.type
      : "upload",
    timestamp: new Date(asset.timestamp),
    prompt: asset.prompt ? String(asset.prompt).substring(0, 4000) : undefined,
    model: asset.model ? String(asset.model) : undefined,
    metadata:
      asset.metadata && typeof asset.metadata === "object"
        ? asset.metadata
        : undefined,
  };
}
```

## 📊 Monitoring and Analytics

### Storage Metrics

#### Get Storage Statistics

```typescript
async getStorageStatistics(): Promise<{
  totalAssets: number;
  totalHistory: number;
  totalProjects: number;
  storageSize: number;
  oldestAsset?: Date;
  newestAsset?: Date;
  mostUsedModel?: string;
}> {
  const assets = await this.getAssets();
  const history = await this.getHistory();
  const projects = await this.getProjects();

  const modelUsage = history.reduce((acc, entry) => {
    if (entry.model) {
      acc[entry.model] = (acc[entry.model] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const mostUsedModel = Object.entries(modelUsage)
    .sort(([,a], [,b]) => b - a)[0]?.[0];

  const timestamps = assets.map(asset => asset.timestamp);
  const oldestAsset = timestamps.length > 0 ? new Date(Math.min(...timestamps.map(t => t.getTime()))) : undefined;
  const newestAsset = timestamps.length > 0 ? new Date(Math.max(...timestamps.map(t => t.getTime()))) : undefined;

  return {
    totalAssets: assets.length,
    totalHistory: history.length,
    totalProjects: projects.length,
    storageSize: 0, // Would need to calculate actual storage size
    oldestAsset,
    newestAsset,
    mostUsedModel
  };
}
```

## 🛠️ Development Tools

### Database Inspector

#### Debug Database State

```typescript
async debugDatabaseState(): Promise<{
  databaseExists: boolean;
  version: number;
  objectStores: string[];
  sampleData: {
    assets: Asset[];
    history: HistoryEntry[];
    projects: Project[];
  };
}> {
  try {
    const db = await this.ensureDB();
    const assets = await this.getAssets();
    const history = await this.getHistory();
    const projects = await this.getProjects();

    return {
      databaseExists: true,
      version: db.version,
      objectStores: Array.from(db.objectStoreNames),
      sampleData: {
        assets: assets.slice(0, 5), // First 5 assets
        history: history.slice(0, 5), // First 5 history entries
        projects: projects.slice(0, 5) // First 5 projects
      }
    };
  } catch (error) {
    return {
      databaseExists: false,
      version: 0,
      objectStores: [],
      sampleData: {
        assets: [],
        history: [],
        projects: []
      }
    };
  }
}
```

## 📚 Additional Resources

### Documentation

- [Architecture Guide](architecture.md) - System design overview
- [API Documentation](api-documentation.md) - Technical API reference
- [Developer Guide](developer-guide.md) - Development setup
- [User Guide](user-guide.md) - Usage instructions

### External Resources

- [IndexedDB MDN Documentation](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [IndexedDB Tutorial](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

---

## 🧭 Navigation

<div align="center">

[← Back: API Documentation](api-documentation.md) | [Next: Installation Guide →](installation.md)

</div>

---

This guide provides comprehensive information about the database architecture and data management in Image Studio. For more specific information, refer to the individual guides for each component.
