/**
 * Image Editing Components
 * Modern, Canva-style image editing interface with sliding panels
 */

// Panels
export { SlidingPanel } from './panels/sliding-panel';
export type { SlidingPanelProps } from './panels/sliding-panel';

export { ImageFiltersPanel } from './panels/image-filters-panel';
export type { ImageFiltersPanelProps } from './panels/image-filters-panel';

export { ColorAdjustmentsPanel } from './panels/color-adjustments-panel';
export type { ColorAdjustmentsPanelProps } from './panels/color-adjustments-panel';

// Controls
export { AdjustmentSlider } from './controls/adjustment-slider';
export type { AdjustmentSliderProps } from './controls/adjustment-slider';

export { ImagePreview } from './controls/image-preview';
export type { ImagePreviewProps } from './controls/image-preview';

// Hooks
export { useRealTimePreview } from './hooks/use-real-time-preview';
export type { ImageAdjustments, PreviewConfig } from './hooks/use-real-time-preview';
export { DEFAULT_ADJUSTMENTS } from './hooks/use-real-time-preview';

export { useAdjustmentsPersistence } from './hooks/use-adjustments-persistence';
export type { AdjustmentsPersistenceConfig } from './hooks/use-adjustments-persistence';

// Types
export type { 
  StoredImageAdjustments, 
  ProjectImageAdjustments,
  ProjectDataWithAdjustments 
} from './types/image-adjustments-storage';