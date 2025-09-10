/**
 * Asset Manager
 * Unified interface for managing all asset providers and local assets
 */

import { Asset, AssetSearchParams, AssetApiResponse, AssetStoreConfig, AssetType } from '@/types/asset-store';
import { UnsplashProvider } from './unsplash';
import { PexelsProvider } from './pexels';
import { config } from '@/lib/settings';

export class AssetManager {
  private unsplashProvider: UnsplashProvider;
  private pexelsProvider: PexelsProvider;
  private config: AssetStoreConfig;

  constructor() {
    this.config = this.loadConfig();
    this.unsplashProvider = new UnsplashProvider(this.config.providers.unsplash);
    this.pexelsProvider = new PexelsProvider(this.config.providers.pexels);
  }

  /**
   * Load configuration from settings
   */
  private loadConfig(): AssetStoreConfig {
    const defaultConfig: AssetStoreConfig = {
      enabled: true,
      providers: {
        unsplash: {
          enabled: false,
          apiKey: '',
          rateLimit: 50, // 50 requests per hour for free tier
        },
        pexels: {
          enabled: false,
          apiKey: '',
          rateLimit: 200, // 200 requests per hour for free tier
        },
      },
      ui: {
        defaultView: 'grid',
        itemsPerPage: 20,
        showAttribution: true,
      },
      cache: {
        enabled: true,
        maxItems: 1000,
        ttl: 60, // 1 hour
      },
    };

    try {
      const savedConfig = config('assetStore', defaultConfig, 'cookies') as AssetStoreConfig;
      
      // Load API keys from cookies
      const unsplashKey = this.getApiKeyFromCookie('unsplash_api_key');
      const pexelsKey = this.getApiKeyFromCookie('pexels_api_key');
      
      return {
        ...defaultConfig,
        ...savedConfig,
        providers: {
          ...savedConfig.providers,
          unsplash: {
            ...savedConfig.providers.unsplash,
            apiKey: unsplashKey || savedConfig.providers.unsplash.apiKey,
          },
          pexels: {
            ...savedConfig.providers.pexels,
            apiKey: pexelsKey || savedConfig.providers.pexels.apiKey,
          },
        },
      };
    } catch (error) {
      console.warn('Failed to load asset store config:', error);
      return defaultConfig;
    }
  }

  /**
   * Get API key from cookie
   */
  private getApiKeyFromCookie(cookieName: string): string {
    if (typeof document === 'undefined') return '';
    
    const cookie = document.cookie
      .split('; ')
      .find(row => row.startsWith(`${cookieName}=`));
    
    if (cookie) {
      const value = cookie.split('=')[1];
      return value ? decodeURIComponent(value) : '';
    }
    
    return '';
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<AssetStoreConfig>): void {
    this.config = { ...this.config, ...newConfig };
    config('assetStore', this.config, 'cookies');
    
    // Update provider configs
    this.unsplashProvider = new UnsplashProvider(this.config.providers.unsplash);
    this.pexelsProvider = new PexelsProvider(this.config.providers.pexels);
  }

  /**
   * Get current configuration
   */
  getConfig(): AssetStoreConfig {
    return { ...this.config };
  }

  /**
   * Check if asset store is enabled
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Search for assets across all enabled providers
   */
  async searchAssets(params: AssetSearchParams, assetType: AssetType = 'photo'): Promise<AssetApiResponse> {
    if (!this.isEnabled()) {
      return {
        success: false,
        data: [],
        total: 0,
        page: params.page || 1,
        perPage: params.perPage || 20,
        hasMore: false,
        error: 'Asset store is disabled',
      };
    }

    const results: Asset[] = [];
    let totalResults = 0;
    let hasMore = false;
    let lastError: string | null = null;

    // Search photos from enabled providers
    if (assetType === 'photo' || assetType === 'video') {
      if (this.config.providers.unsplash.enabled) {
        try {
          const unsplashResults = await this.unsplashProvider.searchAssets(params);
          if (unsplashResults.success) {
            results.push(...unsplashResults.data);
            totalResults += unsplashResults.total;
            hasMore = hasMore || unsplashResults.hasMore;
          } else {
            lastError = unsplashResults.error || 'Unsplash search failed';
          }
        } catch (error) {
          console.error('Unsplash search error:', error);
          lastError = 'Unsplash search failed';
        }
      }

      if (this.config.providers.pexels.enabled) {
        try {
          const pexelsResults = assetType === 'video' 
            ? await this.pexelsProvider.searchVideos(params)
            : await this.pexelsProvider.searchAssets(params);
          
          if (pexelsResults.success) {
            results.push(...pexelsResults.data);
            totalResults += pexelsResults.total;
            hasMore = hasMore || pexelsResults.hasMore;
          } else {
            lastError = pexelsResults.error || 'Pexels search failed';
          }
        } catch (error) {
          console.error('Pexels search error:', error);
          lastError = 'Pexels search failed';
        }
      }
    }

    // Add local assets (shapes, frames, icons)
    if (assetType === 'shape' || assetType === 'frame' || assetType === 'icon') {
      const localAssets = await this.getLocalAssets(assetType, params);
      results.push(...localAssets);
      totalResults += localAssets.length;
    }

    return {
      success: results.length > 0 || lastError === null,
      data: results,
      total: totalResults,
      page: params.page || 1,
      perPage: params.perPage || 20,
      hasMore,
      error: lastError || undefined,
    };
  }

  /**
   * Get featured assets from all enabled providers
   */
  async getFeaturedAssets(params: Omit<AssetSearchParams, 'query'> = {}, assetType: AssetType = 'photo'): Promise<AssetApiResponse> {
    if (!this.isEnabled()) {
      return {
        success: false,
        data: [],
        total: 0,
        page: params.page || 1,
        perPage: params.perPage || 20,
        hasMore: false,
        error: 'Asset store is disabled',
      };
    }

    const results: Asset[] = [];
    let totalResults = 0;
    let hasMore = false;
    let lastError: string | null = null;

    // Get featured photos from enabled providers
    if (assetType === 'photo' || assetType === 'video') {
      if (this.config.providers.unsplash.enabled) {
        try {
          const unsplashResults = await this.unsplashProvider.getFeaturedAssets(params);
          if (unsplashResults.success) {
            results.push(...unsplashResults.data);
            totalResults += unsplashResults.total;
            hasMore = hasMore || unsplashResults.hasMore;
          } else {
            lastError = unsplashResults.error || 'Unsplash featured failed';
          }
        } catch (error) {
          console.error('Unsplash featured error:', error);
          lastError = 'Unsplash featured failed';
        }
      }

      if (this.config.providers.pexels.enabled) {
        try {
          const pexelsResults = await this.pexelsProvider.getFeaturedAssets(params);
          if (pexelsResults.success) {
            results.push(...pexelsResults.data);
            totalResults += pexelsResults.total;
            hasMore = hasMore || pexelsResults.hasMore;
          } else {
            lastError = pexelsResults.error || 'Pexels featured failed';
          }
        } catch (error) {
          console.error('Pexels featured error:', error);
          lastError = 'Pexels featured failed';
        }
      }
    }

    // Add local assets
    if (assetType === 'shape' || assetType === 'frame' || assetType === 'icon') {
      const localAssets = await this.getLocalAssets(assetType, params);
      results.push(...localAssets);
      totalResults += localAssets.length;
    }

    return {
      success: results.length > 0 || lastError === null,
      data: results,
      total: totalResults,
      page: params.page || 1,
      perPage: params.perPage || 20,
      hasMore,
      error: lastError || undefined,
    };
  }

  /**
   * Get all available categories
   */
  async getCategories(assetType: AssetType = 'photo'): Promise<string[]> {
    const categories = new Set<string>();

    if (assetType === 'photo' || assetType === 'video') {
      if (this.config.providers.unsplash.enabled) {
        try {
          const unsplashCategories = await this.unsplashProvider.getCategories();
          unsplashCategories.forEach(cat => categories.add(cat));
        } catch (error) {
          console.error('Failed to get Unsplash categories:', error);
        }
      }

      if (this.config.providers.pexels.enabled) {
        try {
          const pexelsCategories = await this.pexelsProvider.getCategories();
          pexelsCategories.forEach(cat => categories.add(cat));
        } catch (error) {
          console.error('Failed to get Pexels categories:', error);
        }
      }
    }

    // Add local asset categories
    if (assetType === 'shape' || assetType === 'frame' || assetType === 'icon') {
      const localCategories = this.getLocalCategories(assetType);
      localCategories.forEach(cat => categories.add(cat));
    }

    return Array.from(categories).sort();
  }

  /**
   * Validate API keys for all enabled providers
   */
  async validateApiKeys(): Promise<{ [key: string]: boolean }> {
    const results: { [key: string]: boolean } = {};

    if (this.config.providers.unsplash.enabled) {
      try {
        results.unsplash = await this.unsplashProvider.validateApiKey();
      } catch (error) {
        console.error('Unsplash API key validation failed:', error);
        results.unsplash = false;
      }
    }

    if (this.config.providers.pexels.enabled) {
      try {
        results.pexels = await this.pexelsProvider.validateApiKey();
      } catch (error) {
        console.error('Pexels API key validation failed:', error);
        results.pexels = false;
      }
    }

    return results;
  }

  /**
   * Get local assets (shapes, frames, icons)
   */
  private async getLocalAssets(assetType: AssetType, params: AssetSearchParams): Promise<Asset[]> {
    // This would be implemented to return local SVG assets
    // For now, return empty array
    return [];
  }

  /**
   * Get local asset categories
   */
  private getLocalCategories(assetType: AssetType): string[] {
    switch (assetType) {
      case 'shape':
        return ['basic', 'arrows', 'symbols', 'decorative'];
      case 'frame':
        return ['modern', 'vintage', 'minimalist', 'ornate'];
      case 'icon':
        return ['ui', 'social', 'business', 'navigation'];
      default:
        return [];
    }
  }
}

// Export singleton instance
export const assetManager = new AssetManager();
