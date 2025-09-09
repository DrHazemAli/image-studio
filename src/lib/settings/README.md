# Laravel-Style Config System

A simple, unified settings store that works like Laravel's config helper. Easy to use, supports multiple storage types, and includes dot notation for nested values.

## 🚀 Quick Start

```typescript
import { config } from "@/lib/settings";

// Get values
const theme = config("theme"); // Get from localStorage (default)
const theme = config("theme", "dark"); // Get with default value
const theme = config("theme", "dark", "cookies"); // Get from cookies

// Set values
config("theme", "dark"); // Set in localStorage
config("theme", "dark", "cookies"); // Set in cookies
config("apiKey", "secret", "localStorage", true); // Set encrypted

// Dot notation for nested values
config("user.preferences.theme", "dark");
config("app.settings.autoSave", true);
```

## 📚 API Reference

### Basic Usage

```typescript
// Get value
config("key"); // Get from default storage
config("key", "default"); // Get with default value
config("key", "default", "cookies"); // Get from specific storage
config("key", "default", "localStorage", true); // Get encrypted value

// Set value
config("key", "value"); // Set in default storage
config("key", "value", "cookies"); // Set in cookies
config("key", "value", "localStorage", true); // Set encrypted
```

### Storage Types

- `localStorage` - Persistent, large capacity (default)
- `cookies` - Server-accessible, limited size
- `sessionStorage` - Session-only, automatic cleanup

### Helper Functions

```typescript
import {
  configHas,
  configRemove,
  configClear,
  configAll,
  configKeys,
  configSetDefaultStorage,
  configMigrate,
} from "@/lib/settings";

// Check if key exists
configHas("theme"); // true/false

// Remove key
configRemove("theme");

// Clear all values
configClear("localStorage");

// Get all values
const allSettings = configAll("localStorage");

// Get all keys
const keys = configKeys("cookies");

// Set default storage
configSetDefaultStorage("cookies");

// Migrate data
configMigrate("theme", "localStorage", "cookies");
```

## 🔄 Migration from Existing Code

### Before (Old localStorage usage)

```typescript
// Old way
const theme = localStorage.getItem("theme") || "dark";
localStorage.setItem("theme", "dark");
localStorage.removeItem("theme");
```

### After (Laravel-style config)

```typescript
// New way
const theme = config("theme", "dark");
config("theme", "dark");
configRemove("theme");
```

### Migration Examples

```typescript
// Theme management
const theme = config("theme", "system");
config("theme", "dark");

// Auto-save settings
const autoSave = config("autoSave.enabled", true);
const duration = config("autoSave.duration", 3);
config("autoSave.enabled", true);
config("autoSave.duration", 5);

// User preferences
config("user.preferences.theme", "dark");
config("user.preferences.animations", true);
config("user.preferences.showConsole", false);

// API keys (encrypted)
config("apiKey", "secret-key", "localStorage", true);
const apiKey = config("apiKey", "", "localStorage", true);
```

## 🔐 Encryption

For sensitive data like API keys:

```typescript
// Set encrypted value
config("apiKey", "secret-key", "localStorage", true);

// Get encrypted value
const apiKey = config("apiKey", "", "localStorage", true);
```

## 🍪 Cookie Options

```typescript
// Cookies support additional options
config("sessionId", "abc123", "cookies");
// The cookie will be set with default options

// For advanced cookie options, use the appSettings instance directly
import { appSettings } from "@/lib/settings";
appSettings.set("sessionId", "abc123", "cookies", false, {
  expires: 7, // 7 days
  path: "/",
  secure: true,
  httpOnly: true,
});
```

## 🎯 Real-World Examples

### Theme Management

```typescript
// Get current theme
const currentTheme = config("theme", "system");

// Set theme
config("theme", "dark");

// Check if theme exists
if (configHas("theme")) {
  console.log("Theme is set");
}
```

### User Preferences

```typescript
// Set multiple preferences
config("user.preferences.theme", "dark");
config("user.preferences.animations", true);
config("user.preferences.showConsole", false);

// Get preferences
const theme = config("user.preferences.theme", "light");
const animations = config("user.preferences.animations", true);
```

### API Configuration

```typescript
// Store API key securely
config("api.key", "your-api-key", "localStorage", true);

// Get API key
const apiKey = config("api.key", "", "localStorage", true);
```

### Session Management

```typescript
// Store session data in cookies
config("session.id", "session-123", "cookies");
config("session.user", "john@example.com", "cookies");

// Get session data
const sessionId = config("session.id", "", "cookies");
const user = config("session.user", "", "cookies");
```

## 🛠️ Advanced Usage

### Using the AppSettings Instance Directly

```typescript
import { appSettings } from "@/lib/settings";

// Set default storage
appSettings.setDefaultStorage("cookies");

// Get all values from specific storage
const allCookies = appSettings.all("cookies");

// Migrate data between storages
appSettings.migrate("theme", "localStorage", "cookies");
```

### Error Handling

The config system includes built-in error handling and will:

- Log warnings for failed operations
- Return default values when operations fail
- Gracefully handle missing storage APIs (SSR compatibility)

## 🔧 TypeScript Support

Full TypeScript support with proper typing:

```typescript
import { config, StorageType } from "@/lib/settings";

// Type-safe storage types
const storage: StorageType = "localStorage";

// Type-safe config calls
const theme: string = config("theme", "dark");
const autoSave: boolean = config("autoSave", true);
```

## 🚀 Benefits

- **Laravel-style API** - Familiar and intuitive
- **Multiple storage types** - localStorage, cookies, sessionStorage
- **Dot notation** - Easy nested value access
- **Encryption support** - Secure sensitive data
- **TypeScript support** - Full type safety
- **Error handling** - Graceful fallbacks
- **SSR compatible** - Works with Next.js
- **Migration support** - Easy data migration between storages
