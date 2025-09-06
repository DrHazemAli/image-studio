// Migration utility to move data from localStorage to IndexedDB
// This can be run independently or as part of the app initialization

import { dbManager } from './indexeddb';

export interface MigrationResult {
  success: boolean;
  assetsMigrated: number;
  historyMigrated: number;
  errors: string[];
}

export async function migrateFromLocalStorage(): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: true,
    assetsMigrated: 0,
    historyMigrated: 0,
    errors: []
  };

  try {
    // Initialize IndexedDB
    await dbManager.init();

    // Migrate assets
    const savedAssets = localStorage.getItem('azure-studio-assets');
    if (savedAssets) {
      try {
        const assets = JSON.parse(savedAssets);
        for (const asset of assets) {
          await dbManager.saveAsset({
            ...asset,
            timestamp: new Date(asset.timestamp)
          });
          result.assetsMigrated++;
        }
        localStorage.removeItem('azure-studio-assets');
        console.log(`Migrated ${result.assetsMigrated} assets from localStorage to IndexedDB`);
      } catch (error) {
        const errorMsg = `Failed to migrate assets: ${error}`;
        result.errors.push(errorMsg);
        console.error(errorMsg);
      }
    }

    // Migrate history
    const savedHistory = localStorage.getItem('azure-studio-history');
    if (savedHistory) {
      try {
        const history = JSON.parse(savedHistory);
        for (const entry of history) {
          await dbManager.saveHistoryEntry({
            ...entry,
            timestamp: new Date(entry.timestamp)
          });
          result.historyMigrated++;
        }
        localStorage.removeItem('azure-studio-history');
        console.log(`Migrated ${result.historyMigrated} history entries from localStorage to IndexedDB`);
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
    console.error('Migration failed:', error);
  }

  return result;
}

// Check if migration is needed
export function needsMigration(): boolean {
  return !!(localStorage.getItem('azure-studio-assets') || localStorage.getItem('azure-studio-history'));
}

// Get storage usage information
export async function getStorageInfo(): Promise<{
  localStorage: {
    assets: number;
    history: number;
    totalSize: number;
  };
  indexedDB: {
    assets: number;
    history: number;
  };
}> {
  const localStorageInfo = {
    assets: 0,
    history: 0,
    totalSize: 0
  };

  // Check localStorage
  const savedAssets = localStorage.getItem('azure-studio-assets');
  if (savedAssets) {
    const assets = JSON.parse(savedAssets);
    localStorageInfo.assets = assets.length;
    localStorageInfo.totalSize += savedAssets.length;
  }

  const savedHistory = localStorage.getItem('azure-studio-history');
  if (savedHistory) {
    const history = JSON.parse(savedHistory);
    localStorageInfo.history = history.length;
    localStorageInfo.totalSize += savedHistory.length;
  }

  // Check IndexedDB
  const indexedDBInfo = await dbManager.getStorageInfo();

  return {
    localStorage: localStorageInfo,
    indexedDB: indexedDBInfo
  };
}

// Clear all data (useful for testing)
export async function clearAllData(): Promise<void> {
  try {
    await dbManager.clearAssets();
    await dbManager.clearHistory();
    localStorage.removeItem('azure-studio-assets');
    localStorage.removeItem('azure-studio-history');
    console.log('All data cleared');
  } catch (error) {
    console.error('Failed to clear data:', error);
    throw error;
  }
}
