import { AppSettings } from "./app-settings";
import { StorageType } from "./types";

// Create singleton instance
const appSettings = new AppSettings();

/**
 * Laravel-style config helper function
 *
 * @example
 * // Get value
 * config('theme') // Get from default storage (localStorage)
 * config('theme', 'dark') // Get with default value
 * config('theme', 'dark', 'cookies') // Get from specific storage
 * config('theme', 'dark', 'localStorage', true) // Get encrypted value
 *
 * @example
 * // Set value
 * config('theme', 'dark') // Set in default storage
 * config('theme', 'dark', 'cookies') // Set in cookies
 * config('theme', 'dark', 'localStorage', true) // Set encrypted
 *
 * @example
 * // Dot notation support
 * config('user.preferences.theme')
 * config('app.settings.autoSave')
 */
export function config(
  key: string,
  value?: any,
  storage?: StorageType,
  encrypted?: boolean,
): any {
  if (value === undefined) {
    // Get mode
    return appSettings.get(key, undefined, storage, encrypted);
  } else {
    // Set mode
    appSettings.set(key, value, storage, encrypted);
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
export function configAll(storage?: StorageType): Record<string, any> {
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

// Export the main instance for advanced usage
export { appSettings };

// Export types
export type { StorageType, ConfigOptions } from "./types";

// Export storage classes for advanced usage
export { LocalStorage } from "./storage/local-storage";
export { CookieStorage } from "./storage/cookie-storage";
export { SessionStorage } from "./storage/session-storage";
