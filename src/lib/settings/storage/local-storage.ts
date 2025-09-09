import { ConfigStorage, ConfigOptions } from "../types";

export class LocalStorage implements ConfigStorage {
  private prefix = "azure_studio_";

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  get(key: string): string | null {
    if (typeof window === "undefined") return null;

    try {
      return localStorage.getItem(this.getKey(key));
    } catch (error) {
      console.warn(`Failed to get localStorage key "${key}":`, error);
      return null;
    }
  }

  set(key: string, value: string, _options?: ConfigOptions): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(this.getKey(key), value);
    } catch (error) {
      console.warn(`Failed to set localStorage key "${key}":`, error);
    }
  }

  remove(key: string): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.removeItem(this.getKey(key));
    } catch (error) {
      console.warn(`Failed to remove localStorage key "${key}":`, error);
    }
  }

  clear(): void {
    if (typeof window === "undefined") return;

    try {
      const keys = this.keys();
      keys.forEach((key) => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.warn("Failed to clear localStorage:", error);
    }
  }

  keys(): string[] {
    if (typeof window === "undefined") return [];

    try {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          keys.push(key.substring(this.prefix.length));
        }
      }
      return keys;
    } catch (error) {
      console.warn("Failed to get localStorage keys:", error);
      return [];
    }
  }
}
