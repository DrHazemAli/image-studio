/**
 * Migration utility to transition from individual settings keys to unified az_settings structure
 */

import { appSettings } from "./index";
import { UnifiedSettings } from "./types";

/**
 * Default unified settings structure
 */
const defaultUnifiedSettings: UnifiedSettings = {
  developer: {
    mode: false,
  },
  autoSave: {
    enabled: true,
    duration: 3,
  },
  ui: {
    animations: true,
    showConsole: false,
    showLayers: false,
    showHistory: true,
  },
  logger: {
    config: {},
  },
  cache: {
    assets: [],
    history: [],
    projects: [],
  },
  assetStore: {
    enabled: true,
    providers: {
      unsplash: {
        enabled: false,
        apiKey: "",
        rateLimit: 50,
      },
      pexels: {
        enabled: false,
        apiKey: "",
        rateLimit: 200,
      },
    },
    ui: {
      defaultView: "grid",
      itemsPerPage: 20,
      showAttribution: true,
    },
    cache: {
      enabled: true,
      maxItems: 1000,
      ttl: 60,
    },
  },
};

/**
 * Mapping of old individual keys to new unified settings paths
 */
const keyMappings: Record<string, string> = {
  "developer.mode": "developer.mode",
  "autoSave.enabled": "autoSave.enabled",
  "autoSave.duration": "autoSave.duration",
  "ui.animations": "ui.animations",
  "ui.showConsole": "ui.showConsole",
  "ui.showLayers": "ui.showLayers",
  "ui.showHistory": "ui.showHistory",
  "logger.config": "logger.config",
  "cache.assets": "cache.assets",
  "cache.history": "cache.history",
  "cache.projects": "cache.projects",
};

/**
 * Migrate individual settings to unified structure
 * @param storage - Storage type to migrate from
 * @returns Whether migration was successful
 */
export function migrateToUnifiedSettings(
  storage: "localStorage" | "sessionStorage" = "localStorage",
): boolean {
  try {
    // Get current unified settings or start with defaults
    let unifiedSettings = appSettings.getUnifiedSettings(
      storage,
    ) as Partial<UnifiedSettings>;

    // If no unified settings exist, start with defaults
    if (!unifiedSettings || Object.keys(unifiedSettings).length === 0) {
      unifiedSettings = { ...defaultUnifiedSettings };
    }

    // Migrate each individual key
    let hasChanges = false;
    for (const [oldKey, newPath] of Object.entries(keyMappings)) {
      const value = appSettings.get(oldKey, undefined, storage);
      if (value !== undefined) {
        // Set the value in the unified structure
        const currentValue = getNestedValue(unifiedSettings, newPath);
        if (currentValue === undefined) {
          setNestedValue(unifiedSettings, newPath, value);
          hasChanges = true;
        }
      }
    }

    // Save the unified settings if there were changes
    if (hasChanges) {
      appSettings.setUnifiedSettings(unifiedSettings, storage);
    }

    return true;
  } catch (error) {
    console.warn("Failed to migrate settings to unified structure:", error);
    return false;
  }
}

/**
 * Clean up old individual settings keys after migration
 * @param storage - Storage type to clean up
 */
export function cleanupOldSettings(
  storage: "localStorage" | "sessionStorage" = "localStorage",
): void {
  try {
    for (const oldKey of Object.keys(keyMappings)) {
      if (appSettings.has(oldKey, storage)) {
        appSettings.remove(oldKey, storage);
      }
    }
  } catch (error) {
    console.warn("Failed to cleanup old settings:", error);
  }
}

/**
 * Helper function to get nested value from object using dot notation
 */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce((current: unknown, key: string) => {
    return current &&
      typeof current === "object" &&
      current !== null &&
      key in (current as Record<string, unknown>)
      ? (current as Record<string, unknown>)[key]
      : undefined;
  }, obj as unknown);
}

/**
 * Helper function to set nested value in object using dot notation
 */
function setNestedValue(
  obj: Record<string, unknown>,
  path: string,
  value: unknown,
): void {
  const keys = path.split(".");
  const lastKey = keys.pop()!;
  const target = keys.reduce((current, key) => {
    if (
      !(key in current) ||
      typeof current[key] !== "object" ||
      current[key] === null
    ) {
      current[key] = {};
    }
    return current[key] as Record<string, unknown>;
  }, obj);
  target[lastKey] = value;
}

/**
 * Check if migration is needed
 * @param storage - Storage type to check
 * @returns Whether migration is needed
 */
export function isMigrationNeeded(
  storage: "localStorage" | "sessionStorage" = "localStorage",
): boolean {
  try {
    // Check if unified settings exist
    const unifiedSettings = appSettings.getUnifiedSettings(storage);
    if (!unifiedSettings || Object.keys(unifiedSettings).length === 0) {
      return true;
    }

    // Check if any old individual keys still exist
    for (const oldKey of Object.keys(keyMappings)) {
      if (appSettings.has(oldKey, storage)) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.warn("Failed to check migration status:", error);
    return false;
  }
}

/**
 * Perform full migration: migrate settings and cleanup old keys
 * @param storage - Storage type to migrate
 * @returns Whether migration was successful
 */
export function performFullMigration(
  storage: "localStorage" | "sessionStorage" = "localStorage",
): boolean {
  try {
    const migrated = migrateToUnifiedSettings(storage);
    if (migrated) {
      cleanupOldSettings(storage);
      return true;
    }
    return false;
  } catch (error) {
    console.warn("Failed to perform full migration:", error);
    return false;
  }
}
