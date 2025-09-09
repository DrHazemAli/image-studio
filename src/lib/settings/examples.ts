/**
 * Laravel-Style Config System Examples
 * 
 * This file demonstrates how to use the new config system
 * to replace existing localStorage usage throughout the app.
 */

import { config, configHas, configRemove, configAll, configMigrate } from './index';

// ============================================================================
// BASIC USAGE EXAMPLES
// ============================================================================

export function basicExamples() {
  // Get values with defaults
  const theme = config('theme', 'system');
  const autoSave = config('autoSave.enabled', true);
  const duration = config('autoSave.duration', 3);
  
  // Set values
  config('theme', 'dark');
  config('autoSave.enabled', false);
  config('autoSave.duration', 5);
  
  // Check if values exist
  if (configHas('theme')) {
    console.log('Theme is configured');
  }
  
  // Remove values
  configRemove('autoSave.duration');
  
  // Get all settings
  const allSettings = configAll('localStorage');
  console.log('All settings:', allSettings);
}

// ============================================================================
// STORAGE TYPE EXAMPLES
// ============================================================================

export function storageExamples() {
  // Store in different storage types
  config('theme', 'dark', 'localStorage'); // Persistent
  config('sessionId', 'abc123', 'cookies'); // Server-accessible
  config('tempData', 'temporary', 'sessionStorage'); // Session-only
  
  // Get from specific storage
  const theme = config('theme', 'light', 'localStorage');
  const sessionId = config('sessionId', '', 'cookies');
  const tempData = config('tempData', '', 'sessionStorage');
  
  console.log({ theme, sessionId, tempData });
}

// ============================================================================
// ENCRYPTION EXAMPLES
// ============================================================================

export function encryptionExamples() {
  // Store sensitive data encrypted
  config('apiKey', 'secret-api-key', 'localStorage', true);
  config('userToken', 'jwt-token', 'cookies', true);
  
  // Retrieve encrypted data
  const apiKey = config('apiKey', '', 'localStorage', true);
  const userToken = config('userToken', '', 'cookies', true);
  
  console.log({ apiKey, userToken });
}

// ============================================================================
// DOT NOTATION EXAMPLES
// ============================================================================

export function dotNotationExamples() {
  // Set nested values
  config('user.preferences.theme', 'dark');
  config('user.preferences.animations', true);
  config('user.preferences.showConsole', false);
  config('user.settings.autoSave', true);
  config('user.settings.duration', 3);
  
  // Get nested values
  const theme = config('user.preferences.theme', 'light');
  const animations = config('user.preferences.animations', true);
  const autoSave = config('user.settings.autoSave', false);
  
  console.log({ theme, animations, autoSave });
}

// ============================================================================
// MIGRATION EXAMPLES
// ============================================================================

export function migrationExamples() {
  // Migrate data from localStorage to cookies
  configMigrate('theme', 'localStorage', 'cookies');
  configMigrate('user.preferences', 'localStorage', 'cookies');
  
  // Migrate without removing from source
  configMigrate('apiKey', 'localStorage', 'cookies', false);
}

// ============================================================================
// REAL-WORLD USAGE EXAMPLES
// ============================================================================

export function realWorldExamples() {
  // Theme management
  const currentTheme = config('theme', 'system');
  config('theme', 'dark');
  
  // User preferences
  config('user.preferences.theme', 'dark');
  config('user.preferences.animations', true);
  config('user.preferences.showConsole', false);
  config('user.preferences.toolbarPosition', 'left');
  
  // Auto-save settings
  config('autoSave.enabled', true);
  config('autoSave.duration', 3);
  config('autoSave.interval', 'seconds');
  
  // API configuration
  config('api.endpoint', 'https://api.example.com');
  config('api.timeout', 30000);
  config('api.retries', 3);
  
  // Session data
  config('session.id', 'session-123', 'cookies');
  config('session.user', 'john@example.com', 'cookies');
  config('session.expires', Date.now() + 3600000, 'cookies');
  
  // Temporary data
  config('temp.uploadProgress', 0, 'sessionStorage');
  config('temp.currentProject', 'project-123', 'sessionStorage');
  
  // Sensitive data (encrypted)
  config('api.key', 'secret-key', 'localStorage', true);
  config('user.token', 'jwt-token', 'cookies', true);
}

// ============================================================================
// MIGRATION FROM EXISTING CODE
// ============================================================================

export function migrationFromExisting() {
  // OLD WAY (localStorage)
  // const theme = localStorage.getItem('theme') || 'system';
  // localStorage.setItem('theme', 'dark');
  // localStorage.removeItem('theme');
  
  // NEW WAY (Laravel-style config)
  const theme = config('theme', 'system');
  config('theme', 'dark');
  configRemove('theme');
  
  // OLD WAY (complex nested objects)
  // const settings = JSON.parse(localStorage.getItem('settings') || '{}');
  // settings.user = settings.user || {};
  // settings.user.preferences = settings.user.preferences || {};
  // settings.user.preferences.theme = 'dark';
  // localStorage.setItem('settings', JSON.stringify(settings));
  
  // NEW WAY (dot notation)
  config('user.preferences.theme', 'dark');
  
  // OLD WAY (checking existence)
  // if (localStorage.getItem('theme') !== null) {
  //   console.log('Theme exists');
  // }
  
  // NEW WAY (configHas)
  if (configHas('theme')) {
    console.log('Theme exists');
  }
}

// ============================================================================
// USAGE IN REACT COMPONENTS
// ============================================================================

export function reactComponentExamples() {
  // In a React component, you can use the config system like this:
  
  // Get initial value
  const initialTheme = config('theme', 'system');
  const initialAutoSave = config('autoSave.enabled', true);
  
  // Update values
  const updateTheme = (newTheme: string) => {
    config('theme', newTheme);
  };
  
  const updateAutoSave = (enabled: boolean) => {
    config('autoSave.enabled', enabled);
  };
  
  // Check if values exist
  const hasTheme = configHas('theme');
  const hasAutoSave = configHas('autoSave.enabled');
  
  return {
    initialTheme,
    initialAutoSave,
    updateTheme,
    updateAutoSave,
    hasTheme,
    hasAutoSave
  };
}
