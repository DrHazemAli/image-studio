/**
 * Asset Store Types
 * Defines the structure for assets from various providers
 */

export type AssetType = 'photo' | 'video' | 'shape' | 'frame' | 'icon' | 'upload';
export type AssetProvider = 'unsplash' | 'pexels' | 'local' | 'user';
export type ViewMode = 'grid' | 'list';

/**
 * Base asset interface that all asset types extend
 */
export interface BaseAsset {
  id: string;
  name: string;
  type: AssetType;
  category: string;
  url: string;
  thumbnail: string;
  metadata: {
    width: number;
    height: number;
    format: string;
    size?: number;
    attribution?: string;
    license?: string;
  };
  tags: string[];
  provider: AssetProvider;
}

/**
 * Photo asset from external APIs (Unsplash, Pexels)
 */
export interface PhotoAsset extends BaseAsset {
  type: 'photo';
  provider: 'unsplash' | 'pexels';
  metadata: BaseAsset['metadata'] & {
    photographer?: string;
    photographerUrl?: string;
    downloadUrl?: string;
    color?: string;
    orientation?: 'landscape' | 'portrait' | 'square';
  };
}

/**
 * Video asset from external APIs
 */
export interface VideoAsset extends BaseAsset {
  type: 'video';
  provider: 'pexels';
  metadata: BaseAsset['metadata'] & {
    duration?: number;
    videoUrl?: string;
    photographer?: string;
    photographerUrl?: string;
  };
}

/**
 * Shape asset (SVG shapes)
 */
export interface ShapeAsset extends BaseAsset {
  type: 'shape';
  provider: 'local';
  metadata: BaseAsset['metadata'] & {
    svgContent?: string;
    customizable?: boolean;
  };
}

/**
 * Frame asset (decorative frames)
 */
export interface FrameAsset extends BaseAsset {
  type: 'frame';
  provider: 'local';
  metadata: BaseAsset['metadata'] & {
    style?: string;
    customizable?: boolean;
  };
}

/**
 * Icon asset
 */
export interface IconAsset extends BaseAsset {
  type: 'icon';
  provider: 'local';
  metadata: BaseAsset['metadata'] & {
    svgContent?: string;
    customizable?: boolean;
  };
}

/**
 * User uploaded asset
 */
export interface UploadAsset extends BaseAsset {
  type: 'upload';
  provider: 'user';
  metadata: BaseAsset['metadata'] & {
    originalName?: string;
    uploadDate?: Date;
  };
}

/**
 * Union type for all asset types
 */
export type Asset = PhotoAsset | VideoAsset | ShapeAsset | FrameAsset | IconAsset | UploadAsset;

/**
 * Search and filter parameters
 */
export interface AssetSearchParams {
  query?: string;
  category?: string;
  color?: string;
  orientation?: 'landscape' | 'portrait' | 'square';
  page?: number;
  perPage?: number;
  sortBy?: 'relevant' | 'latest' | 'popular';
}

/**
 * Asset provider configuration
 */
export interface AssetProviderConfig {
  enabled: boolean;
  apiKey: string;
  rateLimit: number;
  baseUrl?: string;
}

/**
 * Asset store configuration
 */
export interface AssetStoreConfig {
  enabled: boolean;
  providers: {
    unsplash: AssetProviderConfig;
    pexels: AssetProviderConfig;
  };
  ui: {
    defaultView: ViewMode;
    itemsPerPage: number;
    showAttribution: boolean;
  };
  cache: {
    enabled: boolean;
    maxItems: number;
    ttl: number; // Time to live in minutes
  };
}

/**
 * API response structure for external providers
 */
export interface AssetApiResponse<T = Asset> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  perPage: number;
  hasMore: boolean;
  error?: string;
}

/**
 * Cached asset data
 */
export interface CachedAssetData {
  assets: Asset[];
  timestamp: number;
  query: string;
  page: number;
}

/**
 * Asset store state
 */
export interface AssetStoreState {
  assets: Asset[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  currentPage: number;
  searchQuery: string;
  selectedCategory: string;
  viewMode: ViewMode;
}
