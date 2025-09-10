/**
 * Base Asset Provider
 * Abstract base class for all asset providers (Unsplash, Pexels, etc.)
 */

import { Asset, AssetSearchParams, AssetApiResponse, AssetProviderConfig } from '@/types/asset-store';

export abstract class BaseAssetProvider {
  protected config: AssetProviderConfig;
  protected baseUrl: string;

  constructor(config: AssetProviderConfig, baseUrl: string) {
    this.config = config;
    this.baseUrl = baseUrl;
  }

  /**
   * Check if the provider is enabled and configured
   */
  isEnabled(): boolean {
    return this.config.enabled && !!this.config.apiKey;
  }

  /**
   * Get the provider name
   */
  abstract getProviderName(): string;

  /**
   * Search for assets
   */
  abstract searchAssets(params: AssetSearchParams): Promise<AssetApiResponse>;

  /**
   * Get featured/popular assets
   */
  abstract getFeaturedAssets(params?: Omit<AssetSearchParams, 'query'>): Promise<AssetApiResponse>;

  /**
   * Get asset categories
   */
  abstract getCategories(): Promise<string[]>;

  /**
   * Validate API key
   */
  abstract validateApiKey(): Promise<boolean>;

  /**
   * Get rate limit information
   */
  getRateLimit(): number {
    return this.config.rateLimit;
  }

  /**
   * Make authenticated API request with retry logic for transient errors
   */
  protected async makeRequest<T>(
    endpoint: string,
    params: Record<string, string | number> = {},
    retries: number = 1
  ): Promise<T> {
    if (!this.isEnabled()) {
      throw new Error(`${this.getProviderName()} provider is not enabled or configured`);
    }

    const url = new URL(endpoint, this.baseUrl);
    
    // Add query parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            'Authorization': this.getAuthHeader(),
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          
          // Check if this is a retryable error
          if (this.isRetryableError(response.status) && attempt < retries) {
            const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
            console.warn(`${this.getProviderName()} API error ${response.status}, retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
          
          throw new Error(`API request failed: ${response.status} ${errorText}`);
        }

        return response.json();
      } catch (error) {
        // Handle network errors and timeouts
        if (error instanceof Error && 
            (error.name === 'AbortError' || error.message.includes('timeout')) && 
            attempt < retries) {
          const delay = Math.pow(2, attempt) * 1000;
          console.warn(`${this.getProviderName()} request timeout, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        throw error;
      }
    }

    throw new Error(`${this.getProviderName()} API request failed after ${retries + 1} attempts`);
  }

  /**
   * Check if an HTTP status code represents a retryable error
   */
  private isRetryableError(status: number): boolean {
    // Retry on server errors and rate limits, but not 522 (connection timeout)
    return (status >= 500 && status !== 522) || status === 429;
  }

  /**
   * Get authentication header
   */
  protected abstract getAuthHeader(): string;

  /**
   * Transform API response to our Asset format
   */
  protected abstract transformAsset(apiAsset: unknown): Asset;

  /**
   * Transform API response to our AssetApiResponse format
   */
  protected transformResponse(
    apiResponse: unknown,
    currentPage: number,
    perPage: number
  ): AssetApiResponse {
    // This will be implemented by each provider
    // Suppress unused parameter warnings for abstract method
    void apiResponse;
    void currentPage;
    void perPage;
    throw new Error('transformResponse must be implemented by subclass');
  }

  /**
   * Handle rate limiting
   */
  protected async handleRateLimit(): Promise<void> {
    // Simple rate limiting - in production, you'd want more sophisticated handling
    const delay = 1000 / this.config.rateLimit; // Convert requests per second to delay
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Get error message for common API errors
   */
  protected getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      // Handle specific HTTP status codes
      if (error.message.includes('API request failed:')) {
        const statusMatch = error.message.match(/API request failed: (\d+)/);
        if (statusMatch) {
          const status = parseInt(statusMatch[1]);
          switch (status) {
            case 401:
              return `${this.getProviderName()} API key is invalid or expired`;
            case 403:
              return `${this.getProviderName()} API access forbidden. Check your API key permissions`;
            case 429:
              return `${this.getProviderName()} rate limit exceeded. Please try again later`;
            case 500:
              return `${this.getProviderName()} server error. Please try again later`;
            case 502:
            case 503:
            case 504:
              return `${this.getProviderName()} service temporarily unavailable. Please try again later`;
            case 522:
              const providerName = this.getProviderName();
              if (providerName.toLowerCase().includes('pexels')) {
                return `${providerName} connection timeout. This usually indicates server issues or maintenance. Please try again in a few minutes. If the issue persists, check Pexels status page.`;
              }
              return `${providerName} connection timeout. This usually indicates server issues or maintenance. Please try again in a few minutes.`;
            default:
              return `${this.getProviderName()} API error (${status}). Please try again later`;
          }
        }
      }
      return error.message;
    }
    return 'Unknown error occurred';
  }
}
