"use client";

import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas as FabricCanvas, FabricObject, FabricImage } from "fabric";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { AppConfigService, BackgroundRemovalModel } from "@/types/app-config";
import {
  ScissorsIcon,
  CheckCircledIcon,
  CrossCircledIcon,
  ReloadIcon,
  DownloadIcon,
  Cross2Icon,
} from "@radix-ui/react-icons";

// Import our effect overlay
import { ToolEffectOverlay } from "./tool-effect-overlay";

/**
 * Props interface for the BackgroundRemovalTool component
 */
export interface BackgroundRemovalToolProps {
  // Canvas integration
  fabricCanvas: FabricCanvas | null;
  selectedImage: FabricObject | null;

  // Modal control
  isOpen: boolean;
  onClose: () => void;

  // Processing callbacks
  onRemoveBackground: (
    image: FabricObject,
    options?: BackgroundRemovalOptions,
  ) => Promise<string | null>;
  onError?: (error: string) => void;
  onSuccess?: (processedImageUrl: string) => void;
}

/**
 * Configuration options for background removal
 */
export interface BackgroundRemovalOptions {
  model?: "gpt-image-1" | "florence-2";
  quality?: "standard" | "high";
  edgeRefinement?: boolean;
  transparencyMode?: "full" | "soft";
  prompt?: string; // For AI-guided removal
}

/**
 * Processing stages for the background removal operation
 */
type ProcessingStage =
  | "idle"
  | "preparing"
  | "uploading"
  | "processing"
  | "downloading"
  | "complete"
  | "error";

/**
 * Background Removal Tool Component
 * Provides AI-powered background removal with visual feedback and options
 */
export const BackgroundRemovalTool: React.FC<BackgroundRemovalToolProps> = ({
  fabricCanvas,
  selectedImage,
  isOpen,
  onClose,
  onRemoveBackground,
  onError,
  onSuccess,
}) => {
  // Component state
  const [processingStage, setProcessingStage] =
    useState<ProcessingStage>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<BackgroundRemovalOptions>({
    model: "florence-2", // Will be updated from app config
    quality: "standard",
    edgeRefinement: true,
    transparencyMode: "full",
  });
  const [effectBounds, setEffectBounds] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(
    null,
  );
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);

  // App configuration state
  const [availableModels, setAvailableModels] = useState<
    BackgroundRemovalModel[]
  >([]);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);

  // Stage messages for user feedback
  const stageMessages = {
    preparing: "Preparing image...",
    uploading: "Uploading to Azure AI...",
    processing: "Removing background...",
    downloading: "Finalizing results...",
    complete: "Background removed successfully!",
    error: "Processing failed",
  };

  // Load app configuration on component mount
  useEffect(() => {
    const loadConfiguration = async () => {
      try {
        const config = await AppConfigService.loadConfig();
        const bgRemovalConfig = config.features.backgroundRemoval;

        if (bgRemovalConfig) {
          // Update available models
          setAvailableModels(bgRemovalConfig.models);

          // Set default options from config
          setOptions((prev) => ({
            ...prev,
            model:
              bgRemovalConfig.defaultModel as BackgroundRemovalOptions["model"],
            quality: bgRemovalConfig.defaultSettings.quality,
            edgeRefinement: bgRemovalConfig.defaultSettings.edgeRefinement,
            transparencyMode: bgRemovalConfig.defaultSettings.transparencyMode,
          }));
        }
      } catch (error) {
        console.error("Failed to load app configuration:", error);
        // Set fallback models if config loading fails
        setAvailableModels([
          {
            id: "florence-2",
            name: "Florence 2.0",
            provider: "Microsoft Azure",
            description: "Microsoft's advanced vision-language model",
            capabilities: ["background-removal"],
            recommended: true,
            speed: "fast",
            quality: "high",
          },
          {
            id: "gpt-image-1",
            name: "GPT-Image-1",
            provider: "Azure OpenAI",
            description: "Advanced image editing model (requires approval)",
            capabilities: ["background-removal"],
            recommended: false,
            speed: "medium",
            quality: "premium",
            requiresApproval: true,
          },
        ]);
      } finally {
        setIsLoadingConfig(false);
      }
    };

    loadConfiguration();
  }, []);

  // Calculate effect bounds based on selected image
  const calculateEffectBounds = useCallback(() => {
    if (!selectedImage || !fabricCanvas) return null;

    const objBounds = selectedImage.getBoundingRect();
    const canvasElement = fabricCanvas.getElement();
    const canvasRect = canvasElement.getBoundingClientRect();
    const zoom = fabricCanvas.getZoom();
    const pan = fabricCanvas.viewportTransform;

    // Convert canvas coordinates to screen coordinates
    const screenX = canvasRect.left + (objBounds.left + (pan?.[4] || 0)) * zoom;
    const screenY = canvasRect.top + (objBounds.top + (pan?.[5] || 0)) * zoom;
    const screenWidth = objBounds.width * zoom;
    const screenHeight = objBounds.height * zoom;

    return {
      x: screenX,
      y: screenY,
      width: screenWidth,
      height: screenHeight,
    };
  }, [selectedImage, fabricCanvas]);

  // Update effect bounds when image changes
  useEffect(() => {
    if (selectedImage && processingStage !== "idle") {
      const bounds = calculateEffectBounds();
      setEffectBounds(bounds);
    }
  }, [selectedImage, processingStage, calculateEffectBounds]);

  // Handle background removal process
  const handleRemoveBackground = useCallback(async () => {
    if (!selectedImage || !onRemoveBackground) return;

    try {
      // Reset state
      setError(null);
      setProcessedImageUrl(null);

      // Store original image URL for comparison
      if (selectedImage instanceof FabricImage) {
        setOriginalImageUrl(selectedImage.getSrc());
      }

      // Calculate effect bounds
      const bounds = calculateEffectBounds();
      setEffectBounds(bounds);

      // Start processing stages
      setProcessingStage("preparing");
      setProgress(10);

      await new Promise((resolve) => setTimeout(resolve, 500)); // UX delay

      setProcessingStage("uploading");
      setProgress(30);

      await new Promise((resolve) => setTimeout(resolve, 800)); // UX delay

      setProcessingStage("processing");
      setProgress(60);

      // Call the actual background removal function
      const result = await onRemoveBackground(selectedImage, options);

      if (!result) {
        throw new Error("Failed to process image - no result returned");
      }

      setProcessingStage("downloading");
      setProgress(90);

      await new Promise((resolve) => setTimeout(resolve, 500)); // UX delay

      setProcessedImageUrl(result);
      setProcessingStage("complete");
      setProgress(100);

      // Call success callback
      onSuccess?.(result);

      // Auto-close after 2 seconds on success
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      setProcessingStage("error");
      onError?.(errorMessage);
    }
  }, [
    selectedImage,
    onRemoveBackground,
    options,
    calculateEffectBounds,
    onSuccess,
    onError,
  ]);

  // Handle modal close
  const handleClose = useCallback(() => {
    // Reset all state
    setProcessingStage("idle");
    setProgress(0);
    setError(null);
    setEffectBounds(null);
    setProcessedImageUrl(null);
    setOriginalImageUrl(null);

    onClose();
  }, [onClose]);

  // Handle retry
  const handleRetry = useCallback(() => {
    setProcessingStage("idle");
    setProgress(0);
    setError(null);
    setEffectBounds(null);
  }, []);

  // Handle download processed image
  const handleDownload = useCallback(() => {
    if (!processedImageUrl) return;

    const link = document.createElement("a");
    link.href = processedImageUrl;
    link.download = `background-removed-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [processedImageUrl]);

  return (
    <>
      {/* Main modal dialog */}
      <AlertDialog.Root
        open={isOpen}
        onOpenChange={(open) => !open && handleClose()}
      >
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50" />
          <AlertDialog.Content className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white dark:bg-gray-900 p-6 shadow-2xl duration-200 rounded-2xl">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <ScissorsIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <AlertDialog.Title className="text-lg font-bold text-gray-900 dark:text-white">
                  Remove Background
                </AlertDialog.Title>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  AI-powered background removal
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                disabled={
                  processingStage === "processing" ||
                  processingStage === "uploading"
                }
              >
                <Cross2Icon className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Options section (only show when idle) */}
            {processingStage === "idle" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Loading state */}
                {isLoadingConfig ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Loading configuration...
                    </p>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        AI Model
                      </label>
                      <select
                        value={options.model}
                        onChange={(e) =>
                          setOptions((prev) => ({
                            ...prev,
                            model: e.target
                              .value as BackgroundRemovalOptions["model"],
                          }))
                        }
                        className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        disabled={availableModels.length === 0}
                      >
                        {availableModels.map((model) => (
                          <option key={model.id} value={model.id}>
                            {model.name}
                            {model.recommended && " (Recommended)"}
                            {model.requiresApproval && " (Requires Approval)"}
                          </option>
                        ))}
                      </select>

                      {/* Model description */}
                      {availableModels.find((m) => m.id === options.model) && (
                        <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs text-gray-600 dark:text-gray-400">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">
                              {
                                availableModels.find(
                                  (m) => m.id === options.model,
                                )?.provider
                              }
                            </span>
                            <div className="flex gap-1">
                              <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs">
                                {
                                  availableModels.find(
                                    (m) => m.id === options.model,
                                  )?.speed
                                }
                              </span>
                              <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-xs">
                                {
                                  availableModels.find(
                                    (m) => m.id === options.model,
                                  )?.quality
                                }
                              </span>
                            </div>
                          </div>
                          <p>
                            {
                              availableModels.find(
                                (m) => m.id === options.model,
                              )?.description
                            }
                          </p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Quality
                      </label>
                      <select
                        value={options.quality}
                        onChange={(e) =>
                          setOptions((prev) => ({
                            ...prev,
                            quality: e.target
                              .value as BackgroundRemovalOptions["quality"],
                          }))
                        }
                        className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        <option value="standard">Standard</option>
                        <option value="high">High Quality</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="edge-refinement"
                        checked={options.edgeRefinement}
                        onChange={(e) =>
                          setOptions((prev) => ({
                            ...prev,
                            edgeRefinement: e.target.checked,
                          }))
                        }
                        className="rounded border-gray-300 dark:border-gray-600"
                      />
                      <label
                        htmlFor="edge-refinement"
                        className="text-sm text-gray-700 dark:text-gray-300"
                      >
                        Edge refinement
                      </label>
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {/* Processing status */}
            {processingStage !== "idle" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                {/* Status message */}
                <div className="flex items-center gap-3">
                  {processingStage === "error" ? (
                    <CrossCircledIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
                  ) : processingStage === "complete" ? (
                    <CheckCircledIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <ReloadIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    </motion.div>
                  )}
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {error || stageMessages[processingStage]}
                  </span>
                </div>

                {/* Progress bar */}
                {processingStage !== "error" &&
                  processingStage !== "complete" && (
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <motion.div
                        className="bg-blue-500 h-2 rounded-full"
                        initial={{ width: "0%" }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      />
                    </div>
                  )}

                {/* Error message */}
                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-700 dark:text-red-300">
                      {error}
                    </p>
                  </div>
                )}

                {/* Success message with download option */}
                {processingStage === "complete" && processedImageUrl && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="text-sm text-green-700 dark:text-green-300 mb-2">
                      Background removed successfully! The image has been
                      updated on your canvas.
                    </p>
                    <button
                      onClick={handleDownload}
                      className="inline-flex items-center gap-2 text-sm text-green-700 dark:text-green-300 hover:underline"
                    >
                      <DownloadIcon className="w-4 h-4" />
                      Download processed image
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Action buttons */}
            <div className="flex gap-2 pt-2">
              {processingStage === "idle" && (
                <>
                  <AlertDialog.Cancel asChild>
                    <motion.button
                      className="flex-1 inline-flex h-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancel
                    </motion.button>
                  </AlertDialog.Cancel>
                  <motion.button
                    onClick={handleRemoveBackground}
                    className="flex-1 inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm font-medium text-white transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <ScissorsIcon className="w-4 h-4 mr-2" />
                    Remove Background
                  </motion.button>
                </>
              )}

              {processingStage === "error" && (
                <>
                  <motion.button
                    onClick={handleClose}
                    className="flex-1 inline-flex h-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Close
                  </motion.button>
                  <motion.button
                    onClick={handleRetry}
                    className="flex-1 inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm font-medium text-white transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <ReloadIcon className="w-4 h-4 mr-2" />
                    Retry
                  </motion.button>
                </>
              )}

              {processingStage === "complete" && (
                <motion.button
                  onClick={handleClose}
                  className="w-full inline-flex h-10 items-center justify-center rounded-lg bg-green-600 hover:bg-green-700 px-4 py-2 text-sm font-medium text-white transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <CheckCircledIcon className="w-4 h-4 mr-2" />
                  Done
                </motion.button>
              )}

              {(processingStage === "processing" ||
                processingStage === "uploading" ||
                processingStage === "downloading") && (
                <motion.button
                  disabled
                  className="w-full inline-flex h-10 items-center justify-center rounded-lg bg-blue-500/50 px-4 py-2 text-sm font-medium text-white cursor-not-allowed"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="mr-2"
                  >
                    <ReloadIcon className="w-4 h-4" />
                  </motion.div>
                  Processing...
                </motion.button>
              )}
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>

      {/* Effect overlay on canvas */}
      {effectBounds &&
        (processingStage === "processing" ||
          processingStage === "uploading" ||
          processingStage === "downloading") && (
          <ToolEffectOverlay
            isVisible={true}
            effectType="ray"
            bounds={effectBounds}
            progress={progress}
            message={stageMessages[processingStage]}
            color="#3b82f6"
            intensity="medium"
            speed="normal"
          />
        )}
    </>
  );
};
