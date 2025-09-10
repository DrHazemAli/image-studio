/**
 * Pexels Asset Provider
 * Handles integration with Pexels API for stock photos and videos
 */

import { BaseAssetProvider } from './base-provider';
import { AssetSearchParams, AssetApiResponse, PhotoAsset, VideoAsset, AssetProviderConfig } from '@/types/asset-store';
import { createClient } from 'pexels';

interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  photographer_id: number;
  avg_color: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
  liked: boolean;
  alt: string;
}

interface PexelsVideo {
  id: number;
  width: number;
  height: number;
  duration: number;
  url: string;
  image: string;
  user: {
    id: number;
    name: string;
    url: string;
  };
  video_files: Array<{
    id: number;
    quality: string;
    file_type: string;
    width: number;
    height: number;
    link: string;
  }>;
  video_pictures: Array<{
    id: number;
    picture: string;
    nr: number;
  }>;
}

interface PexelsSearchResponse {
  total_results: number;
  page: number;
  per_page: number;
  photos: PexelsPhoto[];
  next_page?: string;
}

interface PexelsVideoSearchResponse {
  total_results: number;
  page: number;
  per_page: number;
  videos: PexelsVideo[];
  next_page?: string;
}

interface PexelsFeaturedResponse {
  page: number;
  per_page: number;
  photos: PexelsPhoto[];
  next_page?: string;
}

export class PexelsProvider extends BaseAssetProvider {
  private client: any;

  constructor(config: AssetProviderConfig) {
    super(config, 'https://api.pexels.com/v1');
    this.client = this.config.apiKey ? createClient(this.config.apiKey) : null;
  }

  getProviderName(): string {
    return 'Pexels';
  }

  getAuthHeader(): string {
    return this.config.apiKey;
  }

  async searchAssets(params: AssetSearchParams): Promise<AssetApiResponse> {
    await this.handleRateLimit();

    if (!this.client) {
      if (!this.config.apiKey) {
        return {
          success: false,
          data: [],
          total: 0,
          page: params.page || 1,
          perPage: params.perPage || 20,
          hasMore: false,
          error: 'Pexels API key not configured',
        };
      }
      this.client = createClient(this.config.apiKey);
    }

    try {
      const searchOptions: any = {
        query: params.query || 'nature',
        page: params.page || 1,
        per_page: Math.min(params.perPage || 20, 80), // Pexels max is 80
      };

      if (params.orientation) {
        searchOptions.orientation = params.orientation;
      }
      if (params.color) {
        searchOptions.color = params.color;
      }
      const sizeParam = this.getSizeParam(params.orientation);
      if (sizeParam) {
        searchOptions.size = sizeParam;
      }

      const response = await this.client.photos.search(searchOptions);

      return this.transformResponse(response, params.page || 1, searchOptions.per_page);
    } catch (error) {
      return {
        success: false,
        data: [],
        total: 0,
        page: params.page || 1,
        perPage: params.perPage || 20,
        hasMore: false,
        error: this.getErrorMessage(error),
      };
    }
  }

  async searchVideos(params: AssetSearchParams): Promise<AssetApiResponse> {
    await this.handleRateLimit();

    if (!this.client) {
      if (!this.config.apiKey) {
        return {
          success: false,
          data: [],
          total: 0,
          page: params.page || 1,
          perPage: params.perPage || 20,
          hasMore: false,
          error: 'Pexels API key not configured',
        };
      }
      this.client = createClient(this.config.apiKey);
    }

    try {
      const searchOptions: any = {
        query: params.query || 'nature',
        page: params.page || 1,
        per_page: Math.min(params.perPage || 20, 80),
      };

      if (params.orientation) {
        searchOptions.orientation = params.orientation;
      }
      const sizeParam = this.getSizeParam(params.orientation);
      if (sizeParam) {
        searchOptions.size = sizeParam;
      }

      const response = await this.client.videos.search(searchOptions);

      return this.transformVideoResponse(response, params.page || 1, searchOptions.per_page);
    } catch (error) {
      return {
        success: false,
        data: [],
        total: 0,
        page: params.page || 1,
        perPage: params.perPage || 20,
        hasMore: false,
        error: this.getErrorMessage(error),
      };
    }
  }

  async getFeaturedAssets(params: Omit<AssetSearchParams, 'query'> = {}): Promise<AssetApiResponse> {
    await this.handleRateLimit();

    if (!this.client) {
      if (!this.config.apiKey || this.config.apiKey.trim() === '') {
        return {
          success: false,
          data: [],
          total: 0,
          page: params.page || 1,
          perPage: params.perPage || 20,
          hasMore: false,
          error: 'Pexels API key not configured',
        };
      }
      this.client = createClient(this.config.apiKey);
    }

    try {
      const searchOptions = {
        page: params.page || 1,
        per_page: Math.min(params.perPage || 20, 80),
      };

      const response = await this.client.photos.curated(searchOptions);

      return this.transformResponse(response, params.page || 1, searchOptions.per_page);
    } catch (error) {
      return {
        success: false,
        data: [],
        total: 0,
        page: params.page || 1,
        perPage: params.perPage || 20,
        hasMore: false,
        error: this.getErrorMessage(error),
      };
    }
  }

  async getCategories(): Promise<string[]> {
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
      'sports',
      'music',
      'art',
      'fashion',
      'health',
    ];
  }

  async validateApiKey(): Promise<boolean> {
    try {
      await this.client.photos.curated({ page: 1, per_page: 1 });
      return true;
    } catch (error) {
      return false;
    }
  }

  protected transformAsset(apiAsset: PexelsPhoto): PhotoAsset {
    return {
      id: `pexels_${apiAsset.id}`,
      name: apiAsset.alt || 'Pexels Photo',
      type: 'photo',
      category: this.getCategoryFromAlt(apiAsset.alt),
      url: apiAsset.src.large,
      thumbnail: apiAsset.src.medium,
      metadata: {
        width: apiAsset.width,
        height: apiAsset.height,
        format: 'jpg',
        attribution: `Photo by ${apiAsset.photographer} on Pexels`,
        license: 'Pexels License',
        photographer: apiAsset.photographer,
        photographerUrl: apiAsset.photographer_url,
        downloadUrl: apiAsset.src.original,
        color: apiAsset.avg_color,
        orientation: this.getOrientation(apiAsset.width, apiAsset.height),
      },
      tags: this.extractTagsFromAlt(apiAsset.alt),
      provider: 'pexels',
    };
  }

  protected transformVideoAsset(apiAsset: PexelsVideo): VideoAsset {
    const videoFile = apiAsset.video_files.find(f => f.quality === 'hd') || apiAsset.video_files[0];
    
    return {
      id: `pexels_video_${apiAsset.id}`,
      name: `Pexels Video ${apiAsset.id}`,
      type: 'video',
      category: 'video',
      url: videoFile?.link || apiAsset.url,
      thumbnail: apiAsset.image,
      metadata: {
        width: apiAsset.width,
        height: apiAsset.height,
        format: videoFile?.file_type || 'mp4',
        attribution: `Video by ${apiAsset.user.name} on Pexels`,
        license: 'Pexels License',
        photographer: apiAsset.user.name,
        photographerUrl: apiAsset.user.url,
        duration: apiAsset.duration,
        videoUrl: videoFile?.link || apiAsset.url,
      },
      tags: ['video'],
      provider: 'pexels',
    };
  }

  protected transformResponse(
    apiResponse: PexelsSearchResponse | PexelsFeaturedResponse,
    currentPage: number,
    perPage: number
  ): AssetApiResponse {
    const isSearchResponse = 'total_results' in apiResponse;
    const photos = isSearchResponse ? apiResponse.photos : apiResponse.photos;
    const total = isSearchResponse ? apiResponse.total_results : photos.length;
    const hasMore = isSearchResponse ? !!apiResponse.next_page : false;

    return {
      success: true,
      data: photos.map((photo: PexelsPhoto) => this.transformAsset(photo)),
      total,
      page: currentPage,
      perPage,
      hasMore,
    };
  }

  protected transformVideoResponse(
    apiResponse: PexelsVideoSearchResponse,
    currentPage: number,
    perPage: number
  ): AssetApiResponse {
    return {
      success: true,
      data: apiResponse.videos.map(video => this.transformVideoAsset(video)),
      total: apiResponse.total_results,
      page: currentPage,
      perPage,
      hasMore: !!apiResponse.next_page,
    };
  }

  private getCategoryFromAlt(alt: string): string {
    const altLower = alt.toLowerCase();
    
    if (altLower.includes('nature') || altLower.includes('landscape') || altLower.includes('forest')) return 'nature';
    if (altLower.includes('business') || altLower.includes('office') || altLower.includes('meeting')) return 'business';
    if (altLower.includes('people') || altLower.includes('person') || altLower.includes('portrait')) return 'people';
    if (altLower.includes('technology') || altLower.includes('computer') || altLower.includes('laptop')) return 'technology';
    if (altLower.includes('architecture') || altLower.includes('building') || altLower.includes('city')) return 'architecture';
    if (altLower.includes('food') || altLower.includes('restaurant') || altLower.includes('cooking')) return 'food';
    if (altLower.includes('travel') || altLower.includes('vacation') || altLower.includes('trip')) return 'travel';
    if (altLower.includes('animal') || altLower.includes('pet') || altLower.includes('wildlife')) return 'animals';
    if (altLower.includes('abstract') || altLower.includes('art')) return 'abstract';
    if (altLower.includes('minimal') || altLower.includes('simple')) return 'minimal';
    
    return 'general';
  }

  private extractTagsFromAlt(alt: string): string[] {
    return alt.toLowerCase().split(/[\s,.-]+/).filter(word => word.length > 2);
  }

  private getOrientation(width: number, height: number): 'landscape' | 'portrait' | 'square' {
    if (width > height) return 'landscape';
    if (height > width) return 'portrait';
    return 'square';
  }

  private getSizeParam(orientation?: string): string | undefined {
    if (orientation === 'landscape') return 'large';
    if (orientation === 'portrait') return 'medium';
    return undefined;
  }
}
