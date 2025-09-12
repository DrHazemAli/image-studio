/**
 * Laravel-style config system types
 */

export type StorageType = "localStorage" | "cookies" | "sessionStorage";

/**
 * Unified settings structure - all settings under az_settings key
 * Excludes: azure settings, models, and theme (handled separately)
 */
export interface UnifiedSettings {
  developer: {
    mode: boolean;
  };
  autoSave: {
    enabled: boolean;
    duration: number;
  };
  ui: {
    animations: boolean;
    showConsole: boolean;
    showLayers: boolean;
    showHistory: boolean;
  };
  logger: {
    config: Record<string, unknown>;
  };
  cache: {
    assets: unknown[];
    history: unknown[];
    projects: unknown[];
  };
  assetStore: {
    enabled: boolean;
    providers: {
      unsplash: {
        enabled: boolean;
        apiKey: string;
        rateLimit: number;
      };
      pexels: {
        enabled: boolean;
        apiKey: string;
        rateLimit: number;
      };
    };
    ui: {
      defaultView: "grid" | "list";
      itemsPerPage: number;
      showAttribution: boolean;
    };
    cache: {
      enabled: boolean;
      maxItems: number;
      ttl: number; // Time to live in minutes
    };
  };
}

export interface ConfigOptions {
  storage?: StorageType;
  encrypted?: boolean;
  expires?: number; // For cookies, in days
  path?: string; // For cookies
  domain?: string; // For cookies
  secure?: boolean; // For cookies
  httpOnly?: boolean; // For cookies
}

export interface ConfigValue {
  value: unknown;
  timestamp: number;
  encrypted?: boolean;
}

export interface ConfigStorage {
  get(key: string): string | null;
  set(key: string, value: string, options?: ConfigOptions): void;
  remove(key: string): void;
  clear(): void;
  keys(): string[];
}

export interface ConfigManager {
  get(
    key: string,
    defaultValue?: unknown,
    storage?: StorageType,
    encrypted?: boolean,
  ): unknown;
  set(
    key: string,
    value: unknown,
    storage?: StorageType,
    encrypted?: boolean,
  ): void;
  has(key: string, storage?: StorageType): boolean;
  remove(key: string, storage?: StorageType): void;
  clear(storage?: StorageType): void;
  all(storage?: StorageType): Record<string, unknown>;
  keys(storage?: StorageType): string[];
}
