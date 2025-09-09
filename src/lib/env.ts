/**
 * Environment variable helper utilities
 * Provides functions to replace environment variable tags in strings
 */

/**
 * Replaces environment variable tags in a string with actual environment values
 * @param str - The string containing environment variable tags like <env.VARIABLE_NAME>
 * @param fallback - Optional fallback value if environment variable is not found
 * @returns The string with environment variables replaced
 *
 * @example
 * // Replace single environment variable
 * replaceEnvTags('<env.AZURE_API_BASE_URL>') // Returns the value of AZURE_API_BASE_URL
 *
 * @example
 * // Replace multiple environment variables in a string
 * replaceEnvTags('https://<env.AZURE_API_BASE_URL>/api/v1') // Returns 'https://your-api-url/api/v1'
 *
 * @example
 * // With fallback value
 * replaceEnvTags('<env.OPTIONAL_VAR>', 'default-value') // Returns 'default-value' if OPTIONAL_VAR is not set
 */
export function replaceEnvTags(str: string, fallback?: string): string {
  if (!str || typeof str !== 'string') {
    return str;
  }

  // Regular expression to match <env.VARIABLE_NAME> pattern
  const envTagRegex = /<env\.([A-Z_][A-Z0-9_]*)>/g;

  return str.replace(envTagRegex, (match, envVarName) => {
    const envValue = process.env[envVarName];

    if (envValue !== undefined) {
      return envValue;
    }

    if (fallback !== undefined) {
      return fallback;
    }

    // If no fallback provided and env var not found, return the original tag
    console.warn(
      `Environment variable '${envVarName}' not found in <env.${envVarName}>`
    );
    return match;
  });
}

/**
 * Replaces environment variable tags in an object recursively
 * @param obj - The object to process (can be nested)
 * @param fallback - Optional fallback value for missing environment variables
 * @returns A new object with environment variables replaced
 *
 * @example
 * const config = {
 *   apiUrl: '<env.AZURE_API_BASE_URL>',
 *   timeout: '<env.API_TIMEOUT>',
 *   nested: {
 *     endpoint: '<env.ENDPOINT_URL>'
 *   }
 * };
 * const processedConfig = replaceEnvTagsInObject(config);
 */
export function replaceEnvTagsInObject<T>(obj: T, fallback?: string): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return replaceEnvTags(obj, fallback) as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => replaceEnvTagsInObject(item, fallback)) as T;
  }

  if (typeof obj === 'object') {
    const result = {} as T;
    for (const [key, value] of Object.entries(obj)) {
      (result as Record<string, unknown>)[key] = replaceEnvTagsInObject(
        value,
        fallback
      );
    }
    return result;
  }

  return obj;
}

/**
 * Validates that all required environment variables are present
 * @param requiredVars - Array of required environment variable names
 * @throws Error if any required environment variables are missing
 *
 * @example
 * validateRequiredEnvVars(['AZURE_API_BASE_URL', 'AZURE_API_KEY']);
 */
export function validateRequiredEnvVars(requiredVars: string[]): void {
  const missingVars: string[] = [];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  }

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
        `Please set these variables in your .env file or environment.`
    );
  }
}

/**
 * Gets an environment variable with type safety and optional fallback
 * @param varName - The environment variable name
 * @param fallback - Optional fallback value
 * @returns The environment variable value or fallback
 *
 * @example
 * const apiUrl = getEnvVar('AZURE_API_BASE_URL', 'https://api.azure.com');
 * const apiKey = getEnvVar('AZURE_API_KEY'); // Will throw if not found
 */
export function getEnvVar(varName: string, fallback?: string): string {
  const value = process.env[varName];

  if (value !== undefined) {
    return value;
  }

  if (fallback !== undefined) {
    return fallback;
  }

  throw new Error(`Required environment variable '${varName}' is not set`);
}

/**
 * Gets an environment variable as a number
 * @param varName - The environment variable name
 * @param fallback - Optional fallback value
 * @returns The environment variable value as a number
 *
 * @example
 * const port = getEnvVarAsNumber('PORT', 3000);
 * const timeout = getEnvVarAsNumber('API_TIMEOUT');
 */
export function getEnvVarAsNumber(varName: string, fallback?: number): number {
  const value = process.env[varName];

  if (value !== undefined) {
    const numValue = Number(value);
    if (isNaN(numValue)) {
      throw new Error(
        `Environment variable '${varName}' is not a valid number: ${value}`
      );
    }
    return numValue;
  }

  if (fallback !== undefined) {
    return fallback;
  }

  throw new Error(`Required environment variable '${varName}' is not set`);
}

/**
 * Gets an environment variable as a boolean
 * @param varName - The environment variable name
 * @param fallback - Optional fallback value
 * @returns The environment variable value as a boolean
 *
 * @example
 * const debug = getEnvVarAsBoolean('DEBUG', false);
 * const enableLogging = getEnvVarAsBoolean('ENABLE_LOGGING');
 */
export function getEnvVarAsBoolean(
  varName: string,
  fallback?: boolean
): boolean {
  const value = process.env[varName];

  if (value !== undefined) {
    const lowerValue = value.toLowerCase();
    if (['true', '1', 'yes', 'on'].includes(lowerValue)) {
      return true;
    }
    if (['false', '0', 'no', 'off'].includes(lowerValue)) {
      return false;
    }
    throw new Error(
      `Environment variable '${varName}' is not a valid boolean: ${value}`
    );
  }

  if (fallback !== undefined) {
    return fallback;
  }

  throw new Error(`Required environment variable '${varName}' is not set`);
}

/**
 * Type definitions for common environment variables used in this project
 */
export interface EnvConfig {
  AZURE_API_BASE_URL: string;
  AZURE_API_KEY?: string;
  NODE_ENV: 'development' | 'production' | 'test';
  PORT?: number;
  DEBUG?: boolean;
}

/**
 * Gets all environment variables as a typed object
 * @returns Typed environment configuration object
 */
export function getEnvConfig(): EnvConfig {
  return {
    AZURE_API_BASE_URL: getEnvVar('AZURE_API_BASE_URL'),
    AZURE_API_KEY: process.env.AZURE_API_KEY,
    NODE_ENV: (process.env.NODE_ENV as EnvConfig['NODE_ENV']) || 'development',
    PORT: getEnvVarAsNumber('PORT', 3000),
    DEBUG: getEnvVarAsBoolean('DEBUG', false),
  };
}
