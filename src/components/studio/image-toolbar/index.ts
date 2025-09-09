/**
 * Image Toolbar Components
 *
 * This module provides a comprehensive floating image toolbar system for canvas-based image editing.
 * The toolbar appears contextually when images are selected and provides image-specific tools.
 *
 * Key Features:
 * - Floating, draggable toolbar that appears on image selection
 * - Collapsible interface for space efficiency
 * - Ray effect overlays during processing operations
 * - Background removal with Azure AI integration
 * - Reusable button components with consistent styling
 * - Smart positioning relative to selected objects
 *
 * Usage:
 * ```tsx
 * import { FloatingImageToolbar, BackgroundRemovalTool } from '@/components/studio/image-toolbar';
 * ```
 */

// Main toolbar components
export { FloatingImageToolbar } from './floating-image-toolbar';
export type {
  FloatingImageToolbarProps,
  ImageTool,
} from './floating-image-toolbar';

// Individual tool components
export { BackgroundRemovalTool } from './background-removal-tool';
export type {
  BackgroundRemovalToolProps,
  BackgroundRemovalOptions,
} from './background-removal-tool';

// Base components for building custom tools
export { ImageToolButton } from './image-tool-button';
export type { ImageToolButtonProps } from './image-tool-button';

// Visual effect components
export { ToolEffectOverlay } from './tool-effect-overlay';
export type { ToolEffectOverlayProps } from './tool-effect-overlay';
