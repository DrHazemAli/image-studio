import { ConfigStorage, ConfigOptions } from "../types";

export class CookieStorage implements ConfigStorage {
  private prefix = "";

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  get(key: string): string | null {
    if (typeof document === "undefined") return null;

    try {
      const name = this.getKey(key);
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);

      if (parts.length === 2) {
        const cookieValue = parts.pop()?.split(";").shift();
        return cookieValue ? decodeURIComponent(cookieValue) : null;
      }

      return null;
    } catch (error) {
      console.warn(`Failed to get cookie key "${key}":`, error);
      return null;
    }
  }

  set(key: string, value: string, options?: ConfigOptions): void {
    if (typeof document === "undefined") return;

    try {
      const name = this.getKey(key);
      const encodedValue = encodeURIComponent(value);

      let cookieString = `${name}=${encodedValue}`;

      if (options?.expires) {
        const date = new Date();
        date.setTime(date.getTime() + options.expires * 24 * 60 * 60 * 1000);
        cookieString += `; expires=${date.toUTCString()}`;
      }

      if (options?.path) {
        cookieString += `; path=${options.path}`;
      }

      if (options?.domain) {
        cookieString += `; domain=${options.domain}`;
      }

      if (options?.secure) {
        cookieString += `; secure`;
      }

      if (options?.httpOnly) {
        cookieString += `; httponly`;
      }

      document.cookie = cookieString;
    } catch (error) {
      console.warn(`Failed to set cookie key "${key}":`, error);
    }
  }

  remove(key: string): void {
    if (typeof document === "undefined") return;

    try {
      const name = this.getKey(key);
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    } catch (error) {
      console.warn(`Failed to remove cookie key "${key}":`, error);
    }
  }

  clear(): void {
    if (typeof document === "undefined") return;

    try {
      const keys = this.keys();
      keys.forEach((key) => {
        this.remove(key);
      });
    } catch (error) {
      console.warn("Failed to clear cookies:", error);
    }
  }

  keys(): string[] {
    if (typeof document === "undefined") return [];

    try {
      const keys: string[] = [];
      const cookies = document.cookie.split(";");

      cookies.forEach((cookie) => {
        const trimmedCookie = cookie.trim();
        if (trimmedCookie.startsWith(this.prefix)) {
          const key = trimmedCookie.split("=")[0].substring(this.prefix.length);
          keys.push(key);
        }
      });

      return keys;
    } catch (error) {
      console.warn("Failed to get cookie keys:", error);
      return [];
    }
  }
}
