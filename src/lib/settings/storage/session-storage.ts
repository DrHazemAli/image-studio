import { ConfigStorage, ConfigOptions } from '../types';

export class SessionStorage implements ConfigStorage {
  private prefix = '';

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  get(key: string): string | null {
    if (typeof window === 'undefined') return null;

    try {
      return sessionStorage.getItem(this.getKey(key));
    } catch (error) {
      console.warn(`Failed to get sessionStorage key "${key}":`, error);
      return null;
    }
  }

  set(key: string, value: string, _options?: ConfigOptions): void {
    if (typeof window === 'undefined') return;

    try {
      sessionStorage.setItem(this.getKey(key), value);
    } catch (error) {
      console.warn(`Failed to set sessionStorage key "${key}":`, error);
    }
  }

  remove(key: string): void {
    if (typeof window === 'undefined') return;

    try {
      sessionStorage.removeItem(this.getKey(key));
    } catch (error) {
      console.warn(`Failed to remove sessionStorage key "${key}":`, error);
    }
  }

  clear(): void {
    if (typeof window === 'undefined') return;

    try {
      const keys = this.keys();
      keys.forEach((key) => {
        sessionStorage.removeItem(this.getKey(key));
      });
    } catch (error) {
      console.warn('Failed to clear sessionStorage:', error);
    }
  }

  keys(): string[] {
    if (typeof window === 'undefined') return [];

    try {
      const keys: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          keys.push(key.substring(this.prefix.length));
        }
      }
      return keys;
    } catch (error) {
      console.warn('Failed to get sessionStorage keys:', error);
      return [];
    }
  }
}
