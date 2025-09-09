'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Canvas as FabricCanvas, FabricObject, FabricImage } from 'fabric';

// Declare fabric for filter access
declare const fabric: any;

/**
 * Configuration for real-time preview behavior
 */
export interface PreviewConfig {
  // Performance settings
  debounceMs?: number; // Debounce delay for updates (default: 16ms for 60fps)
  maxPreviewSize?: number; // Max size for preview rendering optimization
  enablePreviewMode?: boolean; // Whether to use lower quality previews during interaction

  // Visual feedback
  showProcessingIndicator?: boolean;
  onProcessingStart?: () => void;
  onProcessingEnd?: () => void;

  // Error handling
  onError?: (error: Error) => void;
}

/**
 * Adjustment values interface
 * Matches CSS filter properties and custom adjustments
 */
export interface ImageAdjustments {
  // Basic adjustments (CSS filters)
  brightness: number; // -100 to 100 (maps to 0% to 200%)
  contrast: number; // -100 to 100 (maps to 0% to 200%)
  saturation: number; // -100 to 100 (maps to 0% to 200%)
  hue: number; // -180 to 180 (degrees)
  blur: number; // 0 to 20 (pixels)
  sepia: number; // 0 to 100 (percentage)
  grayscale: number; // 0 to 100 (percentage)
  invert: boolean; // true/false
  opacity: number; // 0 to 100 (percentage)

  // Advanced adjustments (require custom implementation)
  temperature: number; // -100 to 100 (warm/cool)
  tint: number; // -100 to 100 (green/magenta)
  exposure: number; // -2 to +2 (stops)
  highlights: number; // -100 to 100
  shadows: number; // -100 to 100
  whites: number; // -100 to 100
  blacks: number; // -100 to 100
  vibrance: number; // -100 to 100
  clarity: number; // -100 to 100
  sharpness: number; // 0 to 100
  denoise: number; // 0 to 100
  vignette: number; // 0 to 100
}

/**
 * Default adjustment values
 */
export const DEFAULT_ADJUSTMENTS: ImageAdjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  hue: 0,
  blur: 0,
  sepia: 0,
  grayscale: 0,
  invert: false,
  opacity: 100,
  temperature: 0,
  tint: 0,
  exposure: 0,
  highlights: 0,
  shadows: 0,
  whites: 0,
  blacks: 0,
  vibrance: 0,
  clarity: 0,
  sharpness: 0,
  denoise: 0,
  vignette: 0,
};

/**
 * Custom hook for real-time image preview with performance optimization
 * Manages debounced updates, preview modes, and Fabric.js integration
 */
export const useRealTimePreview = (
  fabricCanvas: FabricCanvas | null,
  selectedImage: FabricObject | null,
  config: PreviewConfig = {}
) => {
  const {
    debounceMs = 16,
    maxPreviewSize = 1000,
    enablePreviewMode = true,
    showProcessingIndicator = true,
    onProcessingStart,
    onProcessingEnd,
    onError,
  } = config;

  // State
  const [isProcessing, setIsProcessing] = useState(false);
  const [isApplyingFilters, setIsApplyingFilters] = useState(false);
  const [originalFilters, setOriginalFilters] = useState<string>('');

  // Refs
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastAdjustmentsRef = useRef<ImageAdjustments>(DEFAULT_ADJUSTMENTS);
  const originalImagePropsRef = useRef<{
    filters?: string;
    opacity?: number;
  } | null>(null);

  /**
   * Convert adjustment values to CSS filter string
   */
  const adjustmentsToCSSFilter = useCallback(
    (adjustments: ImageAdjustments): string => {
      const filters = [];

      // Basic CSS filters
      if (adjustments.brightness !== 0) {
        filters.push(`brightness(${100 + adjustments.brightness}%)`);
      }
      if (adjustments.contrast !== 0) {
        filters.push(`contrast(${100 + adjustments.contrast}%)`);
      }
      if (adjustments.saturation !== 0) {
        filters.push(`saturate(${100 + adjustments.saturation}%)`);
      }
      if (adjustments.hue !== 0) {
        filters.push(`hue-rotate(${adjustments.hue}deg)`);
      }
      if (adjustments.blur > 0) {
        filters.push(`blur(${adjustments.blur}px)`);
      }
      if (adjustments.sepia > 0) {
        filters.push(`sepia(${adjustments.sepia}%)`);
      }
      if (adjustments.grayscale > 0) {
        filters.push(`grayscale(${adjustments.grayscale}%)`);
      }
      if (adjustments.invert) {
        filters.push('invert(100%)');
      }

      // Advanced adjustments approximations
      if (adjustments.temperature !== 0) {
        const tempHue = adjustments.temperature * 0.3;
        filters.push(`hue-rotate(${tempHue}deg)`);
      }

      if (adjustments.vibrance !== 0) {
        const vibrantSaturation = 100 + adjustments.vibrance * 0.5;
        filters.push(`saturate(${vibrantSaturation}%)`);
      }

      if (adjustments.exposure !== 0) {
        const exposureBrightness = 100 + adjustments.exposure * 0.5;
        filters.push(`brightness(${exposureBrightness}%)`);
      }

      if (adjustments.clarity !== 0) {
        const clarityContrast = 100 + adjustments.clarity * 0.3;
        filters.push(`contrast(${clarityContrast}%)`);
      }

      if (adjustments.highlights !== 0 || adjustments.shadows !== 0) {
        // Approximate highlights/shadows with brightness adjustments
        const highlightAdjust = adjustments.highlights * -0.2;
        const shadowAdjust = adjustments.shadows * 0.2;
        const combined = highlightAdjust + shadowAdjust;
        if (combined !== 0) {
          filters.push(`brightness(${100 + combined}%)`);
        }
      }

      if (adjustments.sharpness > 0) {
        // No direct CSS equivalent, but we can simulate with contrast
        const sharpnessContrast = 100 + adjustments.sharpness * 0.1;
        filters.push(`contrast(${sharpnessContrast}%)`);
      }

      return filters.join(' ');
    },
    []
  );

  /**
   * Apply adjustments to the selected image
   */
  const applyAdjustments = useCallback(
    (adjustments: ImageAdjustments, immediate = false) => {
      if (
        !fabricCanvas ||
        !selectedImage ||
        !(selectedImage instanceof FabricImage)
      ) {
        return;
      }

      const applyFilters = () => {
        try {
          setIsApplyingFilters(true); // Set flag to prevent resets

          if (showProcessingIndicator && !immediate) {
            setIsProcessing(true);
            onProcessingStart?.();
          }

          // Store original properties if this is the first adjustment
          if (!originalImagePropsRef.current) {
            originalImagePropsRef.current = {
              filters: (selectedImage as any).filters || '',
              opacity: selectedImage.opacity || 1,
            };
          }

          // Generate CSS filter string with all adjustments
          const filterString = adjustmentsToCSSFilter(adjustments);

          // Debug logging
          console.log('Applying filters:', filterString, adjustments);

          // Manual canvas filter implementation since Fabric.js native filters aren't working
          let filtersApplied = false;

          try {
            // Apply filters by manipulating the canvas context directly
            const canvasElement = fabricCanvas.getElement();
            const ctx = fabricCanvas.getContext();

            if (canvasElement && ctx) {
              // Build CSS filter string for canvas context
              const canvasFilterString = adjustmentsToCSSFilter(adjustments);

              if (canvasFilterString) {
                // Method 1: Apply filter to canvas context (modern approach)
                try {
                  ctx.filter = canvasFilterString;
                  console.log(
                    'Applied canvas context filter:',
                    canvasFilterString
                  );
                  filtersApplied = true;
                } catch (ctxError) {
                  console.warn('Canvas context filter failed:', ctxError);
                }

                // Method 2: Apply filter to canvas element directly (fallback)
                if (!filtersApplied) {
                  try {
                    canvasElement.style.filter = canvasFilterString;
                    console.log(
                      'Applied canvas element filter:',
                      canvasFilterString
                    );
                    filtersApplied = true;
                  } catch (elementError) {
                    console.warn('Canvas element filter failed:', elementError);
                  }
                }

                // Method 3: Create a filtered version of the image
                if (!filtersApplied) {
                  try {
                    // Get the image element from the Fabric image object
                    const imageElement = (
                      selectedImage as FabricImage
                    ).getElement();
                    if (imageElement) {
                      // Create a temporary canvas to apply filters
                      const tempCanvas = document.createElement('canvas');
                      const tempCtx = tempCanvas.getContext('2d');

                      if (tempCtx) {
                        tempCanvas.width =
                          imageElement.width || selectedImage.width!;
                        tempCanvas.height =
                          imageElement.height || selectedImage.height!;

                        // Apply filter to temp context
                        tempCtx.filter = canvasFilterString;

                        // Draw the image with filters
                        tempCtx.drawImage(imageElement, 0, 0);

                        // Create a new image from the filtered result
                        const filteredImageData = tempCanvas.toDataURL();

                        // Replace the Fabric image source with the filtered version
                        (selectedImage as FabricImage).setSrc(
                          filteredImageData
                        );
                        fabricCanvas.renderAll();
                        console.log('Applied manual image filter processing');

                        filtersApplied = true;
                      }
                    }
                  } catch (manualError) {
                    console.warn(
                      'Manual filter processing failed:',
                      manualError
                    );
                  }
                }
              }
            }
          } catch (error) {
            console.error('Canvas filter application failed:', error);
          }

          // Fallback approach: Apply CSS filters (works for preview but not canvas)
          if (!filtersApplied) {
            const imageElement = (selectedImage as FabricImage).getElement();
            if (imageElement && imageElement.style) {
              imageElement.style.filter = filterString;
              console.log(
                'Applied CSS filters as fallback:',
                imageElement.style.filter
              );
            }
          }

          // Apply opacity to the Fabric object
          if (adjustments.opacity !== 100) {
            selectedImage.set('opacity', adjustments.opacity / 100);
          } else if (originalImagePropsRef.current.opacity !== undefined) {
            selectedImage.set('opacity', originalImagePropsRef.current.opacity);
          }

          // Force update the object - ensure canvas knows it needs to redraw
          selectedImage.set('dirty', true);
          (selectedImage as any)._setImageSmoothing?.(false);

          // For Fabric.js filters, we need to ensure proper rendering sequence
          if (filtersApplied) {
            // Mark the image as requiring a full re-render and clear all caches
            selectedImage.set('dirty', true);

            // Clear the object's cache completely to force regeneration with filters
            (selectedImage as any)._cacheCanvas = null;
            (selectedImage as any)._cacheContext = null;
            (selectedImage as any).cacheKey = null;
            (selectedImage as any).ownCaching = false;

            // Force immediate cache regeneration
            (selectedImage as FabricImage).set('dirty', true);

            // Trigger multiple render cycles to ensure filters are applied
            fabricCanvas.renderAll();

            // Use multiple animation frames to ensure complete rendering
            requestAnimationFrame(() => {
              // Force canvas re-render
              fabricCanvas.renderAll();

              requestAnimationFrame(() => {
                // Final render to ensure everything is visible
                fabricCanvas.renderAll();
                console.log('Canvas fully re-rendered with filters applied');

                // Trigger a final invalidation to ensure the change is visible
                fabricCanvas.requestRenderAll();
              });
            });
          } else {
            // Standard rendering for CSS filters fallback
            selectedImage.canvas?.renderAll();
            fabricCanvas.renderAll();

            requestAnimationFrame(() => {
              fabricCanvas.renderAll();
            });
          }

          // Store the last applied adjustments
          lastAdjustmentsRef.current = { ...adjustments };
        } catch (error) {
          console.error('Error applying adjustments:', error);
          onError?.(error as Error);
        } finally {
          setIsApplyingFilters(false); // Clear flag
          if (showProcessingIndicator && !immediate) {
            setIsProcessing(false);
            onProcessingEnd?.();
          }
        }
      };

      // Apply immediately or with debounce
      if (immediate) {
        applyFilters();
      } else {
        // Clear existing timeout
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }

        // Set new timeout
        debounceTimeoutRef.current = setTimeout(applyFilters, debounceMs);
      }
    },
    [
      fabricCanvas,
      selectedImage,
      adjustmentsToCSSFilter,
      showProcessingIndicator,
      onProcessingStart,
      onProcessingEnd,
      onError,
      debounceMs,
    ]
  );

  /**
   * Reset all adjustments to default
   */
  const resetAdjustments = useCallback(() => {
    if (
      !fabricCanvas ||
      !selectedImage ||
      !(selectedImage instanceof FabricImage)
    ) {
      return;
    }

    // Prevent reset if we're currently applying filters
    if (isApplyingFilters) {
      console.log('Reset blocked - currently applying filters');
      return;
    }

    console.log('resetAdjustments called - investigating source');
    console.trace(); // This will show the call stack

    try {
      // Reset CSS filters
      if (originalImagePropsRef.current) {
        const imageElement = (selectedImage as FabricImage).getElement();
        if (imageElement && imageElement.style) {
          imageElement.style.filter =
            originalImagePropsRef.current.filters || '';
        }

        if (originalImagePropsRef.current.opacity !== undefined) {
          selectedImage.set('opacity', originalImagePropsRef.current.opacity);
        }
      } else {
        // Fallback to clearing all filters
        const imageElement = (selectedImage as FabricImage).getElement();
        if (imageElement && imageElement.style) {
          imageElement.style.filter = '';
        }
        selectedImage.set('opacity', 1);
      }

      // Reset canvas filters using the same approaches as apply
      try {
        // Method 1: Reset canvas context filter
        const ctx = fabricCanvas.getContext();
        if (ctx) {
          ctx.filter = 'none';
          console.log('Reset canvas context filter');
        }

        // Method 2: Reset canvas element filter
        const canvasElement = fabricCanvas.getElement();
        if (canvasElement) {
          canvasElement.style.filter = '';
          console.log('Reset canvas element filter');
        }

        // Method 3: If we have stored the original image source, restore it
        if (
          originalImagePropsRef.current &&
          (selectedImage as FabricImage).getSrc
        ) {
          try {
            const currentSrc = (selectedImage as FabricImage).getSrc();
            // If the current source looks like a data URL (filtered), we might need to restore original
            if (currentSrc && currentSrc.startsWith('data:image/')) {
              console.log(
                'Image may have been modified by filters, but no original stored'
              );
              // For now, just ensure filters are cleared from the object
              (selectedImage as FabricImage).filters = [];
            }
          } catch (srcError) {
            console.warn('Could not check image source:', srcError);
          }
        }

        // Clear any Fabric.js filters as fallback
        if ((selectedImage as FabricImage).filters) {
          (selectedImage as FabricImage).filters = [];
          console.log('Cleared Fabric image filters array');
        }
      } catch (resetError) {
        console.warn('Could not reset canvas filters:', resetError);
        // Ensure basic cleanup
        try {
          (selectedImage as FabricImage).filters = [];
          const canvasElement = fabricCanvas.getElement();
          if (canvasElement) {
            canvasElement.style.filter = '';
          }
        } catch (fallbackError) {
          console.error('Fallback reset also failed:', fallbackError);
        }
      }

      // Force update and clear cache completely to ensure reset is visible
      selectedImage.set('dirty', true);

      // Clear the object's cache completely to force regeneration without filters
      (selectedImage as any)._cacheCanvas = null;
      (selectedImage as any)._cacheContext = null;
      (selectedImage as any).cacheKey = null;
      (selectedImage as any).ownCaching = false;

      // Re-render the canvas with proper timing
      fabricCanvas.renderAll();

      requestAnimationFrame(() => {
        // Force canvas re-render after reset
        fabricCanvas.renderAll();

        requestAnimationFrame(() => {
          fabricCanvas.renderAll();
          console.log('Canvas re-rendered after filter reset');

          // Final invalidation
          fabricCanvas.requestRenderAll();
        });
      });

      // Reset stored adjustments
      lastAdjustmentsRef.current = { ...DEFAULT_ADJUSTMENTS };
    } catch (error) {
      console.error('Error resetting adjustments:', error);
      onError?.(error as Error);
    }
  }, [fabricCanvas, selectedImage, onError, isApplyingFilters]);

  /**
   * Get the current adjustments
   */
  const getCurrentAdjustments = useCallback((): ImageAdjustments => {
    return { ...lastAdjustmentsRef.current };
  }, []);

  /**
   * Cleanup on unmount or when selected image changes
   */
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Reset original properties when selected image changes
  useEffect(() => {
    originalImagePropsRef.current = null;
    lastAdjustmentsRef.current = { ...DEFAULT_ADJUSTMENTS };
  }, [selectedImage]);

  return {
    // State
    isProcessing,
    isApplyingFilters,

    // Methods
    applyAdjustments,
    resetAdjustments,
    getCurrentAdjustments,

    // Utilities
    adjustmentsToCSSFilter,

    // Constants
    DEFAULT_ADJUSTMENTS,
  };
};
