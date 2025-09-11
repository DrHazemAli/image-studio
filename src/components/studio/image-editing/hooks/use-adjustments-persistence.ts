"use client";

import { useCallback, useEffect, useRef } from "react";
import { Canvas as FabricCanvas, FabricObject, FabricImage } from "fabric";
import { ImageAdjustments, DEFAULT_ADJUSTMENTS } from "./use-real-time-preview";
import logger from "@/lib/logger";
import {
  StoredImageAdjustments,
  ProjectImageAdjustments,
} from "../types/image-adjustments-storage";

/**
 * Configuration for adjustments persistence
 */
export interface AdjustmentsPersistenceConfig {
  projectId?: string;
  autoSave?: boolean;
  saveDebounceMs?: number;
  onSave?: (
    projectId: string,
    adjustments: ProjectImageAdjustments,
  ) => Promise<void>;
  onLoad?: (projectId: string) => Promise<ProjectImageAdjustments | null>;
  onError?: (error: Error) => void;
}

/**
 * Custom hook for persisting image adjustments in projects
 * Handles saving/loading image adjustments to/from project data
 */
export const useAdjustmentsPersistence = (
  fabricCanvas: FabricCanvas | null,
  config: AdjustmentsPersistenceConfig = {},
) => {
  const {
    projectId,
    autoSave = true,
    saveDebounceMs = 1000,
    onSave,
    onLoad,
    onError,
  } = config;

  // Internal state
  const projectAdjustmentsRef = useRef<ProjectImageAdjustments>({
    version: "1.0.0",
    images: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Generate a stable ID for an image object
   */
  const generateImageId = useCallback((imageObject: FabricObject): string => {
    // Try to use Fabric.js object ID first
    if ((imageObject as any).id) {
      return (imageObject as any).id.toString();
    }

    // Fallback to image source hash
    if (imageObject instanceof FabricImage) {
      const src = imageObject.getSrc();
      if (src) {
        // Create a simple hash from the image source
        let hash = 0;
        for (let i = 0; i < src.length; i++) {
          const char = src.charCodeAt(i);
          hash = (hash << 5) - hash + char;
          hash = hash & hash; // Convert to 32bit integer
        }
        return `img_${Math.abs(hash)}`;
      }
    }

    // Last resort: use object coordinates and type
    return `obj_${imageObject.left}_${imageObject.top}_${imageObject.type}`;
  }, []);

  /**
   * Save adjustments for a specific image
   */
  const saveImageAdjustments = useCallback(
    async (
      imageObject: FabricObject,
      adjustments: ImageAdjustments,
      presetUsed?: string,
    ) => {
      if (!projectId || !onSave) {
        return;
      }

      try {
        const imageId = generateImageId(imageObject);
        const imageSrc =
          imageObject instanceof FabricImage ? imageObject.getSrc() : undefined;

        const storedAdjustments: StoredImageAdjustments = {
          imageId,
          imageSrc,
          adjustments: { ...adjustments },
          appliedAt: new Date(),
          version: "1.0.0",
          presetUsed,
        };

        // Update in-memory storage
        projectAdjustmentsRef.current = {
          ...projectAdjustmentsRef.current,
          images: {
            ...projectAdjustmentsRef.current.images,
            [imageId]: storedAdjustments,
          },
          updatedAt: new Date(),
        };

        // Debounced save to storage
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(async () => {
          try {
            await onSave(projectId, projectAdjustmentsRef.current);
            logger.info("Image adjustments saved for project:", projectId);
          } catch (error) {
            console.error("Failed to save image adjustments:", error);
            onError?.(error as Error);
          }
        }, saveDebounceMs);
      } catch (error) {
        console.error("Error saving image adjustments:", error);
        onError?.(error as Error);
      }
    },
    [projectId, onSave, generateImageId, saveDebounceMs, onError],
  );

  /**
   * Load adjustments for a specific image
   */
  const loadImageAdjustments = useCallback(
    (imageObject: FabricObject): ImageAdjustments => {
      if (!projectId) {
        return { ...DEFAULT_ADJUSTMENTS };
      }

      try {
        const imageId = generateImageId(imageObject);
        const storedAdjustments = projectAdjustmentsRef.current.images[imageId];

        if (storedAdjustments) {
          logger.info(
            "Loaded adjustments for image:",
            imageId,
            storedAdjustments.adjustments,
          );
          return { ...storedAdjustments.adjustments };
        }
      } catch (error) {
        console.warn("Error loading image adjustments:", error);
      }

      return { ...DEFAULT_ADJUSTMENTS };
    },
    [projectId, generateImageId],
  );

  /**
   * Remove adjustments for a specific image
   */
  const removeImageAdjustments = useCallback(
    async (imageObject: FabricObject) => {
      if (!projectId || !onSave) {
        return;
      }

      try {
        const imageId = generateImageId(imageObject);

        // Remove from in-memory storage
        const newImages = { ...projectAdjustmentsRef.current.images };
        delete newImages[imageId];

        projectAdjustmentsRef.current = {
          ...projectAdjustmentsRef.current,
          images: newImages,
          updatedAt: new Date(),
        };

        // Save updated data
        await onSave(projectId, projectAdjustmentsRef.current);
        logger.info("Removed adjustments for image:", imageId);
      } catch (error) {
        console.error("Error removing image adjustments:", error);
        onError?.(error as Error);
      }
    },
    [projectId, onSave, generateImageId, onError],
  );

  /**
   * Load project adjustments data
   */
  const loadProjectAdjustments = useCallback(async () => {
    if (!projectId || !onLoad) {
      return;
    }

    try {
      const projectData = await onLoad(projectId);
      if (projectData) {
        projectAdjustmentsRef.current = projectData;
        logger.info(
          "Loaded project adjustments:",
          projectId,
          Object.keys(projectData.images).length,
          "images",
        );
      }
    } catch (error) {
      console.error("Error loading project adjustments:", error);
      onError?.(error as Error);
    }
  }, [projectId, onLoad, onError]);

  /**
   * Get all stored adjustments for the project
   */
  const getAllImageAdjustments = useCallback((): Record<
    string,
    StoredImageAdjustments
  > => {
    return { ...projectAdjustmentsRef.current.images };
  }, []);

  /**
   * Check if image has stored adjustments
   */
  const hasStoredAdjustments = useCallback(
    (imageObject: FabricObject): boolean => {
      if (!projectId) return false;

      const imageId = generateImageId(imageObject);
      return imageId in projectAdjustmentsRef.current.images;
    },
    [projectId, generateImageId],
  );

  /**
   * Apply stored adjustments to all images on canvas
   */
  const applyStoredAdjustments = useCallback(
    (
      applyFunction: (
        imageObject: FabricObject,
        adjustments: ImageAdjustments,
      ) => void,
    ) => {
      if (!fabricCanvas) return;

      const objects = fabricCanvas.getObjects();
      let appliedCount = 0;

      objects.forEach((obj) => {
        if (obj instanceof FabricImage) {
          const storedAdjustments = loadImageAdjustments(obj);

          // Check if adjustments are not default
          const hasAdjustments = Object.entries(storedAdjustments).some(
            ([key, value]) => {
              const defaultValue =
                DEFAULT_ADJUSTMENTS[key as keyof ImageAdjustments];
              return value !== defaultValue;
            },
          );

          if (hasAdjustments) {
            applyFunction(obj, storedAdjustments);
            appliedCount++;
          }
        }
      });

      if (appliedCount > 0) {
        logger.info(`Applied stored adjustments to ${appliedCount} images`);
      }
    },
    [fabricCanvas, loadImageAdjustments],
  );

  // Load project data on mount
  useEffect(() => {
    if (projectId && onLoad) {
      loadProjectAdjustments();
    }
  }, [projectId, loadProjectAdjustments]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    // Actions
    saveImageAdjustments,
    loadImageAdjustments,
    removeImageAdjustments,
    loadProjectAdjustments,
    applyStoredAdjustments,

    // Queries
    getAllImageAdjustments,
    hasStoredAdjustments,

    // Utils
    generateImageId,
  };
};
