/**
 * Development Logger Utility
 * A console-compatible logger that can be enabled/disabled through app settings
 * Only works in development mode by default
 */

import { AppSettings } from "./settings/app-settings";

export interface LoggerConfig {
  enabled: boolean;
  developmentOnly: boolean;
  prefix?: string;
  timestamp?: boolean;
  level?: "debug" | "info" | "warn" | "error" | "log";
}

export interface LoggerMethods {
  log(...args: any[]): void;
  info(...args: any[]): void;
  warn(...args: any[]): void;
  error(...args: any[]): void;
  debug(...args: any[]): void;
  trace(...args: any[]): void;
  table(...args: any[]): void;
  group(...args: any[]): void;
  groupCollapsed(...args: any[]): void;
  groupEnd(): void;
  time(label?: string): void;
  timeEnd(label?: string): void;
  timeLog(label?: string, ...args: any[]): void;
  count(label?: string): void;
  countReset(label?: string): void;
  clear(): void;
  dir(...args: any[]): void;
  dirxml(...args: any[]): void;
  assert(condition?: boolean, ...args: any[]): void;
  profile(label?: string): void;
  profileEnd(label?: string): void;
  timeStamp(label?: string): void;
}

class Logger implements LoggerMethods {
  private appSettings: AppSettings;
  private config: LoggerConfig;
  private isDevelopment: boolean;

  constructor() {
    this.appSettings = new AppSettings();
    this.isDevelopment = process.env.NODE_ENV === "development";

    // Default configuration
    this.config = {
      enabled: true,
      developmentOnly: true,
      prefix: "[Logger]",
      timestamp: true,
      level: "debug",
    };

    // Load configuration from app settings
    this.loadConfig();
  }

  /**
   * Load logger configuration from app settings
   */
  private loadConfig(): void {
    const savedConfig = this.appSettings.get("logger.config", null);
    if (savedConfig) {
      this.config = { ...this.config, ...savedConfig };
    }
  }

  /**
   * Check if logging is enabled
   */
  private isEnabled(): boolean {
    // Check if logger is disabled
    if (!this.config.enabled) {
      return false;
    }

    // Check if development-only mode is enabled and we're not in development
    if (this.config.developmentOnly && !this.isDevelopment) {
      return false;
    }

    return true;
  }

  /**
   * Format log message with prefix and timestamp
   */
  private formatMessage(level: string, ...args: any[]): any[] {
    const formattedArgs = [...args];

    if (this.config.prefix || this.config.timestamp) {
      const prefixParts: string[] = [];

      if (this.config.prefix) {
        prefixParts.push(this.config.prefix);
      }

      if (this.config.timestamp) {
        const timestamp = new Date().toISOString();
        prefixParts.push(`[${timestamp}]`);
      }

      prefixParts.push(`[${level.toUpperCase()}]`);

      formattedArgs.unshift(prefixParts.join(" "));
    }

    return formattedArgs;
  }

  /**
   * Check if the log level should be processed
   */
  private shouldLog(level: string): boolean {
    if (!this.isEnabled()) {
      return false;
    }

    const levels = ["debug", "log", "info", "warn", "error"];
    const currentLevelIndex = levels.indexOf(this.config.level || "debug");
    const messageLevelIndex = levels.indexOf(level);

    return messageLevelIndex >= currentLevelIndex;
  }

  /**
   * Generic log method
   */
  private logMethod(
    consoleMethod: keyof Console,
    level: string,
    ...args: any[]
  ): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const formattedArgs = this.formatMessage(level, ...args);
    (console[consoleMethod] as any)(...formattedArgs);
  }

  // Console-compatible methods
  log(...args: any[]): void {
    this.logMethod("log", "log", ...args);
  }

  info(...args: any[]): void {
    this.logMethod("info", "info", ...args);
  }

  warn(...args: any[]): void {
    this.logMethod("warn", "warn", ...args);
  }

  error(...args: any[]): void {
    this.logMethod("error", "error", ...args);
  }

  debug(...args: any[]): void {
    this.logMethod("debug", "debug", ...args);
  }

  trace(...args: any[]): void {
    if (!this.isEnabled()) return;
    const formattedArgs = this.formatMessage("trace", ...args);
    console.trace(...formattedArgs);
  }

  table(...args: any[]): void {
    if (!this.isEnabled()) return;
    console.table(...args);
  }

  group(...args: any[]): void {
    if (!this.isEnabled()) return;
    const formattedArgs = this.formatMessage("group", ...args);
    console.group(...formattedArgs);
  }

  groupCollapsed(...args: any[]): void {
    if (!this.isEnabled()) return;
    const formattedArgs = this.formatMessage("group", ...args);
    console.groupCollapsed(...formattedArgs);
  }

  groupEnd(): void {
    if (!this.isEnabled()) return;
    console.groupEnd();
  }

  time(label?: string): void {
    if (!this.isEnabled()) return;
    console.time(label);
  }

  timeEnd(label?: string): void {
    if (!this.isEnabled()) return;
    console.timeEnd(label);
  }

  timeLog(label?: string, ...args: any[]): void {
    if (!this.isEnabled()) return;
    console.timeLog(label, ...args);
  }

  count(label?: string): void {
    if (!this.isEnabled()) return;
    console.count(label);
  }

  countReset(label?: string): void {
    if (!this.isEnabled()) return;
    console.countReset(label);
  }

  clear(): void {
    if (!this.isEnabled()) return;
    console.clear();
  }

  dir(...args: any[]): void {
    if (!this.isEnabled()) return;
    console.dir(...args);
  }

  dirxml(...args: any[]): void {
    if (!this.isEnabled()) return;
    console.dirxml(...args);
  }

  assert(condition?: boolean, ...args: any[]): void {
    if (!this.isEnabled()) return;
    console.assert(condition, ...args);
  }

  profile(label?: string): void {
    if (!this.isEnabled()) return;
    console.profile(label);
  }

  profileEnd(label?: string): void {
    if (!this.isEnabled()) return;
    console.profileEnd(label);
  }

  timeStamp(label?: string): void {
    if (!this.isEnabled()) return;
    console.timeStamp(label);
  }

  /**
   * Update logger configuration
   */
  updateConfig(newConfig: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.appSettings.set("logger.config", this.config);
  }

  /**
   * Get current logger configuration
   */
  getConfig(): LoggerConfig {
    return { ...this.config };
  }

  /**
   * Enable logging
   */
  enable(): void {
    this.updateConfig({ enabled: true });
  }

  /**
   * Disable logging
   */
  disable(): void {
    this.updateConfig({ enabled: false });
  }

  /**
   * Toggle logging on/off
   */
  toggle(): void {
    this.updateConfig({ enabled: !this.config.enabled });
  }

  /**
   * Check if logger is currently enabled
   */
  isLoggerEnabled(): boolean {
    return this.isEnabled();
  }
}

// Create and export a singleton instance
export const logger = new Logger();

// Export the class for custom instances if needed
export { Logger };

// Export default logger instance
export default logger;
