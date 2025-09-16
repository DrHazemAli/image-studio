/**
 * Utility functions for Azure configuration detection and validation
 */

/**
 * Checks if an error message looks like it's related to Azure API key or endpoint configuration
 * @param errorMessage The error message to check
 * @returns true if the error appears to be Azure API key/endpoint related
 */
export function looksLikeAzureConfigError(errorMessage: string): boolean {
  if (!errorMessage) return false;

  const s = String(errorMessage).toLowerCase();

  // Match common phrases that indicate missing Azure config
  return (
    /azure api key/.test(s) ||
    /azure.*key/.test(s) ||
    /azure.*endpoint/.test(s) ||
    /azure_openai/.test(s) ||
    /azure_openai_key/.test(s) ||
    /azure_openai_endpoint/.test(s) ||
    /azureopenai/.test(s) ||
    /openai.*key/.test(s)
  );
}
