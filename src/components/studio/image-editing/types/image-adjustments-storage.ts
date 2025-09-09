/**
 * Image Adjustments Storage Types
 * For persisting image editing data in projects
 */

import { ImageAdjustments } from '../hooks/use-real-time-preview';

/**
 * Stored image adjustments with metadata
 */
export interface StoredImageAdjustments {
  // Image identification
  imageId: string; // Fabric.js object ID or image URL hash
  imageSrc?: string; // Source URL for reference

  // Applied adjustments
  adjustments: ImageAdjustments;

  // Metadata
  appliedAt: Date;
  version: string; // Adjustments format version
  presetUsed?: string; // Name of preset if used
}

/**
 * Project-level image adjustments storage
 */
export interface ProjectImageAdjustments {
  version: string;
  images: Record<string, StoredImageAdjustments>; // imageId -> adjustments
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Extended project data with image adjustments
 */
export interface ProjectDataWithAdjustments {
  // ... existing project properties
  imageAdjustments?: ProjectImageAdjustments;
}
