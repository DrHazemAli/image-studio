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
   * Make authenticated API request
   */
  protected async makeRequest<T>(
    endpoint: string,
    params: Record<string, string | number> = {}
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

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/json',
        'User-Agent': 'Azure-Image-Studio/1.0.1',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} ${errorText}`);
    }

    return response.json();
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
      return error.message;
    }
    return 'Unknown error occurred';
  }
}
