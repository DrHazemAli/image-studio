/**
 * Laravel-style config system types
 */

export type StorageType = 'localStorage' | 'cookies' | 'sessionStorage';

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
  value: any;
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
    defaultValue?: any,
    storage?: StorageType,
    encrypted?: boolean
  ): any;
  set(
    key: string,
    value: any,
    storage?: StorageType,
    encrypted?: boolean
  ): void;
  has(key: string, storage?: StorageType): boolean;
  remove(key: string, storage?: StorageType): void;
  clear(storage?: StorageType): void;
  all(storage?: StorageType): Record<string, any>;
  keys(storage?: StorageType): string[];
}
