import { ConfigManager, StorageType, ConfigOptions } from './types';
import { LocalStorage } from './storage/local-storage';
import { CookieStorage } from './storage/cookie-storage';
import { SessionStorage } from './storage/session-storage';
import {
  serialize,
  deserialize,
  getNestedValue,
  setNestedValue,
} from './utils/serialization';

export class AppSettings implements ConfigManager {
  private storages: Record<
    StorageType,
    LocalStorage | CookieStorage | SessionStorage
  >;
  private defaultStorage: StorageType = 'localStorage';

  constructor() {
    this.storages = {
      localStorage: new LocalStorage(),
      cookies: new CookieStorage(),
      sessionStorage: new SessionStorage(),
    };
  }

  /**
   * Get a configuration value
   * @param key - Configuration key (supports dot notation)
   * @param defaultValue - Default value if key doesn't exist
   * @param storage - Storage type to use
   * @param encrypted - Whether the value is encrypted
   */
  get(
    key: string,
    defaultValue?: any,
    storage?: StorageType,
    encrypted?: boolean
  ): any {
    const storageType = storage || this.defaultStorage;
    const storageInstance = this.storages[storageType];

    try {
      const serializedValue = storageInstance.get(key);

      if (serializedValue === null) {
        return defaultValue;
      }

      const value = deserialize(serializedValue, encrypted);

      // Support dot notation for nested values
      if (key.includes('.')) {
        return getNestedValue(value, key) ?? defaultValue;
      }

      return value ?? defaultValue;
    } catch (error) {
      console.warn(`Failed to get config key "${key}":`, error);
      return defaultValue;
    }
  }

  /**
   * Set a configuration value
   * @param key - Configuration key (supports dot notation)
   * @param value - Value to set
   * @param storage - Storage type to use
   * @param encrypted - Whether to encrypt the value
   */
  set(
    key: string,
    value: any,
    storage?: StorageType,
    encrypted?: boolean
  ): void {
    const storageType = storage || this.defaultStorage;
    const storageInstance = this.storages[storageType];

    try {
      // Support dot notation for nested values
      if (key.includes('.')) {
        const existingValue = this.get(key, {}, storageType, encrypted);
        const updatedValue = setNestedValue(existingValue, key, value);
        const serializedValue = serialize(updatedValue, encrypted);
        storageInstance.set(key, serializedValue);
      } else {
        const serializedValue = serialize(value, encrypted);
        storageInstance.set(key, serializedValue);
      }
    } catch (error) {
      console.warn(`Failed to set config key "${key}":`, error);
    }
  }

  /**
   * Check if a configuration key exists
   * @param key - Configuration key
   * @param storage - Storage type to check
   */
  has(key: string, storage?: StorageType): boolean {
    const storageType = storage || this.defaultStorage;
    const storageInstance = this.storages[storageType];

    try {
      const value = storageInstance.get(key);
      return value !== null;
    } catch (error) {
      console.warn(`Failed to check config key "${key}":`, error);
      return false;
    }
  }

  /**
   * Remove a configuration key
   * @param key - Configuration key
   * @param storage - Storage type to remove from
   */
  remove(key: string, storage?: StorageType): void {
    const storageType = storage || this.defaultStorage;
    const storageInstance = this.storages[storageType];

    try {
      storageInstance.remove(key);
    } catch (error) {
      console.warn(`Failed to remove config key "${key}":`, error);
    }
  }

  /**
   * Clear all configuration values
   * @param storage - Storage type to clear
   */
  clear(storage?: StorageType): void {
    const storageType = storage || this.defaultStorage;
    const storageInstance = this.storages[storageType];

    try {
      storageInstance.clear();
    } catch (error) {
      console.warn(`Failed to clear config storage "${storageType}":`, error);
    }
  }

  /**
   * Get all configuration values
   * @param storage - Storage type to get from
   */
  all(storage?: StorageType): Record<string, any> {
    const storageType = storage || this.defaultStorage;
    const storageInstance = this.storages[storageType];

    try {
      const keys = storageInstance.keys();
      const result: Record<string, any> = {};

      keys.forEach((key) => {
        try {
          const value = this.get(key, undefined, storageType);
          if (value !== undefined) {
            result[key] = value;
          }
        } catch (error) {
          console.warn(`Failed to get config key "${key}" for all():`, error);
        }
      });

      return result;
    } catch (error) {
      console.warn(
        `Failed to get all config values from "${storageType}":`,
        error
      );
      return {};
    }
  }

  /**
   * Get all configuration keys
   * @param storage - Storage type to get keys from
   */
  keys(storage?: StorageType): string[] {
    const storageType = storage || this.defaultStorage;
    const storageInstance = this.storages[storageType];

    try {
      return storageInstance.keys();
    } catch (error) {
      console.warn(`Failed to get config keys from "${storageType}":`, error);
      return [];
    }
  }

  /**
   * Set default storage type
   * @param storage - Default storage type
   */
  setDefaultStorage(storage: StorageType): void {
    this.defaultStorage = storage;
  }

  /**
   * Get default storage type
   */
  getDefaultStorage(): StorageType {
    return this.defaultStorage;
  }

  /**
   * Migrate a key from one storage to another
   * @param key - Configuration key
   * @param fromStorage - Source storage type
   * @param toStorage - Destination storage type
   * @param removeFromSource - Whether to remove from source after migration
   */
  migrate(
    key: string,
    fromStorage: StorageType,
    toStorage: StorageType,
    removeFromSource: boolean = true
  ): boolean {
    try {
      if (!this.has(key, fromStorage)) {
        return false;
      }

      const value = this.get(key, undefined, fromStorage);
      this.set(key, value, toStorage);

      if (removeFromSource) {
        this.remove(key, fromStorage);
      }

      return true;
    } catch (error) {
      console.warn(`Failed to migrate config key "${key}":`, error);
      return false;
    }
  }
}
