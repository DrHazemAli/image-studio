import { AppSettings } from "./app-settings";
import { StorageType, UnifiedSettings } from "./types";

// Create singleton instance
const appSettings = new AppSettings();

/**
 * Laravel-style config helper function
 * Automatically uses unified settings for non-azure and non-models keys
 *
 * @example
 * // Get value
 * config('theme') // Get from unified settings
 * config('ui.animations') // Get from unified settings
 * config('azure.endpoints', [], 'cookies') // Get from separate storage (azure excluded)
 * config('models', [], 'localStorage') // Get from separate storage (models excluded)
 *
 * @example
 * // Set value
 * config('theme', 'dark') // Set in unified settings
 * config('ui.animations', true) // Set in unified settings
 * config('azure.endpoints', [], 'cookies') // Set in separate storage
 * config('models', [], 'localStorage') // Set in separate storage
 */
export function config(
  key: string,
  value?: unknown,
  storage?: StorageType,
  encrypted?: boolean,
): unknown {
  // Check if this is an azure, models, or theme key (excluded from unified settings)
  const isExcludedKey =
    key.startsWith("azure.") ||
    key === "models" ||
    key.startsWith("models.") ||
    key === "theme";

  if (isExcludedKey) {
    // Use original behavior for excluded keys
    if (value === undefined) {
      return appSettings.get(key, undefined, storage, encrypted);
    } else {
      appSettings.set(key, value, storage, encrypted);
      return value;
    }
  }

  // For unified settings keys, use the unified settings structure
  if (value === undefined) {
    // Get mode - check unified settings first, then fallback to individual keys
    const unifiedValue = appSettings.getUnifiedSetting(key, undefined, storage);
    if (unifiedValue !== undefined) {
      return unifiedValue;
    }
    // Fallback to individual key for backward compatibility
    return appSettings.get(key, undefined, storage, encrypted);
  } else {
    // Set mode - update unified settings
    appSettings.updateUnifiedSetting(key, value, storage);
    return value;
  }
}

/**
 * Check if a configuration key exists
 */
export function configHas(key: string, storage?: StorageType): boolean {
  return appSettings.has(key, storage);
}

/**
 * Remove a configuration key
 */
export function configRemove(key: string, storage?: StorageType): void {
  appSettings.remove(key, storage);
}

/**
 * Clear all configuration values
 */
export function configClear(storage?: StorageType): void {
  appSettings.clear(storage);
}

/**
 * Get all configuration values
 */
export function configAll(storage?: StorageType): Record<string, unknown> {
  return appSettings.all(storage);
}

/**
 * Get all configuration keys
 */
export function configKeys(storage?: StorageType): string[] {
  return appSettings.keys(storage);
}

/**
 * Set default storage type
 */
export function configSetDefaultStorage(storage: StorageType): void {
  appSettings.setDefaultStorage(storage);
}

/**
 * Get default storage type
 */
export function configGetDefaultStorage(): StorageType {
  return appSettings.getDefaultStorage();
}

/**
 * Migrate a key from one storage to another
 */
export function configMigrate(
  key: string,
  fromStorage: StorageType,
  toStorage: StorageType,
  removeFromSource: boolean = true,
): boolean {
  return appSettings.migrate(key, fromStorage, toStorage, removeFromSource);
}

/**
 * Get unified settings object
 * @param storage - Storage type to get from
 */
export function getUnifiedSettings(
  storage?: StorageType,
): Partial<UnifiedSettings> {
  return appSettings.getUnifiedSettings(storage);
}

/**
 * Set unified settings object
 * @param settings - Settings object to set
 * @param storage - Storage type to set in
 */
export function setUnifiedSettings(
  settings: Partial<UnifiedSettings>,
  storage?: StorageType,
): void {
  appSettings.setUnifiedSettings(settings, storage);
}

/**
 * Update a specific setting within the unified settings
 * @param key - Dot notation key within unified settings (e.g., 'ui.animations')
 * @param value - Value to set
 * @param storage - Storage type to use
 */
export function updateUnifiedSetting(
  key: string,
  value: unknown,
  storage?: StorageType,
): void {
  appSettings.updateUnifiedSetting(key, value, storage);
}

/**
 * Get a specific setting from unified settings
 * @param key - Dot notation key within unified settings (e.g., 'ui.animations')
 * @param defaultValue - Default value if key doesn't exist
 * @param storage - Storage type to get from
 */
export function getUnifiedSetting(
  key: string,
  defaultValue?: unknown,
  storage?: StorageType,
): unknown {
  return appSettings.getUnifiedSetting(key, defaultValue, storage);
}

// Export the main instance for advanced usage
export { appSettings };

// Export types
export type { StorageType, ConfigOptions, UnifiedSettings } from "./types";

// Export storage classes for advanced usage
export { LocalStorage } from "./storage/local-storage";
export { CookieStorage } from "./storage/cookie-storage";
export { SessionStorage } from "./storage/session-storage";

// Export migration utilities
export {
  migrateToUnifiedSettings,
  cleanupOldSettings,
  isMigrationNeeded,
  performFullMigration,
} from "./migration";
