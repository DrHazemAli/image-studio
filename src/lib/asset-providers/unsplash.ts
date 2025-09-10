/**
 * Unsplash Asset Provider
 * Handles integration with Unsplash API for stock photos
 */

import { BaseAssetProvider } from './base-provider';
import { Asset, AssetSearchParams, AssetApiResponse, PhotoAsset, AssetProviderConfig } from '@/types/asset-store';

interface UnsplashPhoto {
  id: string;
  created_at: string;
  updated_at: string;
  width: number;
  height: number;
  color: string;
  blur_hash: string;
  description: string | null;
  alt_description: string | null;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  links: {
    self: string;
    html: string;
    download: string;
    download_location: string;
  };
  user: {
    id: string;
    username: string;
    name: string;
    first_name: string;
    last_name: string;
    portfolio_url: string | null;
    bio: string | null;
    location: string | null;
    links: {
      self: string;
      html: string;
      photos: string;
      likes: string;
      portfolio: string;
      following: string;
      followers: string;
    };
  };
  tags: Array<{
    type: string;
    title: string;
  }>;
}

interface UnsplashSearchResponse {
  total: number;
  total_pages: number;
  results: UnsplashPhoto[];
}

interface UnsplashFeaturedResponse extends Array<UnsplashPhoto> {}

export class UnsplashProvider extends BaseAssetProvider {
  constructor(config: AssetProviderConfig) {
    super(config, 'https://api.unsplash.com');
  }

  getProviderName(): string {
    return 'Unsplash';
  }

  getAuthHeader(): string {
    return `Client-ID ${this.config.apiKey}`;
  }

  async searchAssets(params: AssetSearchParams): Promise<AssetApiResponse> {
    await this.handleRateLimit();

    const searchParams: Record<string, string | number> = {
      query: params.query || 'nature',
      page: params.page || 1,
      per_page: Math.min(params.perPage || 20, 30), // Unsplash max is 30
      order_by: params.sortBy === 'latest' ? 'latest' : 'relevant',
    };

    if (params.orientation) {
      searchParams.orientation = params.orientation;
    }
    if (params.color) {
      searchParams.color = params.color;
    }

    try {
      const response = await this.makeRequest<UnsplashSearchResponse>(
        '/search/photos',
        searchParams
      );

      return this.transformResponse(response, params.page || 1, searchParams.per_page as number);
    } catch (error) {
      return {
        success: false,
        data: [],
        total: 0,
        page: params.page || 1,
        perPage: searchParams.per_page as number,
        hasMore: false,
        error: this.getErrorMessage(error),
      };
    }
  }

  async getFeaturedAssets(params: Omit<AssetSearchParams, 'query'> = {}): Promise<AssetApiResponse> {
    await this.handleRateLimit();

    const searchParams = {
      page: params.page || 1,
      per_page: Math.min(params.perPage || 20, 30),
      order_by: 'popular',
    };

    try {
      const response = await this.makeRequest<UnsplashFeaturedResponse>(
        '/photos',
        searchParams
      );

      return this.transformResponse(response, params.page || 1, searchParams.per_page as number);
    } catch (error) {
      return {
        success: false,
        data: [],
        total: 0,
        page: params.page || 1,
        perPage: searchParams.per_page as number,
        hasMore: false,
        error: this.getErrorMessage(error),
      };
    }
  }

  async getCategories(): Promise<string[]> {
    // Unsplash doesn't have a categories endpoint, so we return common categories
    return [
      'nature',
      'business',
      'people',
      'technology',
      'architecture',
      'food',
      'travel',
      'animals',
      'abstract',
      'minimal',
    ];
  }

  async validateApiKey(): Promise<boolean> {
    try {
      await this.makeRequest('/photos/random');
      return true;
    } catch (error) {
      console.error('Unsplash API key validation failed:', error);
      return false;
    }
  }

  protected transformAsset(apiAsset: UnsplashPhoto): PhotoAsset {
    return {
      id: `unsplash_${apiAsset.id}`,
      name: apiAsset.description || apiAsset.alt_description || 'Unsplash Photo',
      type: 'photo',
      category: this.getCategoryFromTags(apiAsset.tags),
      url: apiAsset.urls.regular,
      thumbnail: apiAsset.urls.thumb,
      metadata: {
        width: apiAsset.width,
        height: apiAsset.height,
        format: 'jpg',
        attribution: `Photo by ${apiAsset.user.name} on Unsplash`,
        license: 'Unsplash License',
        photographer: apiAsset.user.name,
        photographerUrl: apiAsset.user.links.html,
        downloadUrl: apiAsset.links.download,
        color: apiAsset.color,
        orientation: this.getOrientation(apiAsset.width, apiAsset.height),
      },
      tags: apiAsset.tags.map(tag => tag.title),
      provider: 'unsplash',
    };
  }

  protected transformResponse(
    apiResponse: UnsplashSearchResponse | UnsplashFeaturedResponse,
    currentPage: number,
    perPage: number
  ): AssetApiResponse {
    const isSearchResponse = 'total' in apiResponse;
    const photos = isSearchResponse ? apiResponse.results : apiResponse;
    const total = isSearchResponse ? apiResponse.total : photos.length;
    const totalPages = isSearchResponse ? apiResponse.total_pages : Math.ceil(photos.length / perPage);

    return {
      success: true,
      data: photos.map(photo => this.transformAsset(photo)),
      total,
      page: currentPage,
      perPage,
      hasMore: currentPage < totalPages,
    };
  }

  private getCategoryFromTags(tags: Array<{ type: string; title: string }>): string {
    // Map tags to categories
    const categoryMap: Record<string, string> = {
      'nature': 'nature',
      'landscape': 'nature',
      'forest': 'nature',
      'mountain': 'nature',
      'ocean': 'nature',
      'sky': 'nature',
      'business': 'business',
      'office': 'business',
      'meeting': 'business',
      'work': 'business',
      'people': 'people',
      'portrait': 'people',
      'person': 'people',
      'technology': 'technology',
      'computer': 'technology',
      'laptop': 'technology',
      'phone': 'technology',
      'architecture': 'architecture',
      'building': 'architecture',
      'city': 'architecture',
      'food': 'food',
      'travel': 'travel',
      'animals': 'animals',
      'abstract': 'abstract',
      'minimal': 'minimal',
    };

    for (const tag of tags) {
      const category = categoryMap[tag.title.toLowerCase()];
      if (category) {
        return category;
      }
    }

    return 'general';
  }

  private getOrientation(width: number, height: number): 'landscape' | 'portrait' | 'square' {
    if (width > height) return 'landscape';
    if (height > width) return 'portrait';
    return 'square';
  }
}
