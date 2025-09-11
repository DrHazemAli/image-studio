/* eslint-disable @typescript-eslint/no-explicit-any */

import { ConfigValue } from "../types";

/**
 * Simple encryption/decryption for sensitive data
 * Note: This is basic obfuscation, not cryptographically secure
 * For production, use proper encryption libraries
 */
export function encrypt(value: string): string {
  try {
    return btoa(encodeURIComponent(value));
  } catch (error) {
    console.warn("Encryption failed:", error);
    return value;
  }
}

export function decrypt(encryptedValue: string): string {
  try {
    return decodeURIComponent(atob(encryptedValue));
  } catch (error) {
    console.warn("Decryption failed:", error);
    return encryptedValue;
  }
}

/**
 * Serialize value to JSON string with metadata
 */
export function serialize(value: any, encrypted: boolean = false): string {
  try {
    const configValue: ConfigValue = {
      value,
      timestamp: Date.now(),
      encrypted,
    };

    let serialized = JSON.stringify(configValue);

    if (encrypted) {
      serialized = encrypt(serialized);
    }

    return serialized;
  } catch (error) {
    console.warn("Serialization failed:", error);
    return JSON.stringify(value);
  }
}

/**
 * Deserialize JSON string to value
 */
export function deserialize(
  serializedValue: string,
  encrypted: boolean = false,
): any {
  try {
    let value = serializedValue;

    if (encrypted) {
      value = decrypt(serializedValue);
    }

    const configValue: ConfigValue = JSON.parse(value);

    // Return the actual value, not the wrapper object
    return configValue.value;
  } catch (error) {
    console.warn("Deserialization failed:", error);

    // Fallback: try to parse as plain JSON
    try {
      return JSON.parse(serializedValue);
    } catch {
      return serializedValue;
    }
  }
}

/**
 * Get nested value using dot notation
 * Example: getNestedValue({user: {name: 'John'}}, 'user.name') => 'John'
 */
export function getNestedValue(obj: any, path: string): any {
  if (!obj || !path) return obj;

  const keys = path.split(".");
  let current = obj;

  for (const key of keys) {
    if (
      current === null ||
      current === undefined ||
      typeof current !== "object"
    ) {
      return undefined;
    }
    current = current[key];
  }

  return current;
}

/**
 * Set nested value using dot notation
 * Example: setNestedValue({}, 'user.name', 'John') => {user: {name: 'John'}}
 */
export function setNestedValue(obj: any, path: string, value: any): any {
  if (!path) return value;

  const keys = path.split(".");
  const result = { ...obj };
  let current = result;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (
      !(key in current) ||
      typeof current[key] !== "object" ||
      current[key] === null
    ) {
      current[key] = {};
    } else {
      current[key] = { ...current[key] };
    }
    current = current[key];
  }

  current[keys[keys.length - 1]] = value;
  return result;
}
