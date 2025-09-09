"use client";

import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from "react";
// Removed unused imports
import { Tool } from "../toolbar";
import { LayerManager, Layer } from "../tools";
import { Canvas as FabricCanvas, FabricImage, FabricObject } from "fabric";

// Import canvas components
import CanvasViewport from "@/components/studio/canvas/canvas-viewport";
import { ToolOptionsPanel } from "../panels";
import ZoomControls from "./zoom-controls";
import LayersToggle from "./layers-toggle";
import CanvasInfo from "./canvas-info";
import FileUploadArea from "@/components/studio/canvas/file-upload-area";
import ContextMenu from "../context-menu";
import ResizeDialog from "../resize-dialog";
import ResizeCanvasModal from "./resize-canvas-modal";
import LoadingIndicator from "../loading-indicator";
import { TextTool, ShapesTool } from "../tools";
import { FloatingImageToolbar, BackgroundRemovalTool } from "../image-toolbar";
import { ZOOM_CONSTANTS, TOOL_CONSTANTS } from "@/lib/constants";
import {
  useErrorToast,
  useSuccessToast,
  useWarningToast,
} from "@/components/ui/toast";

export interface MainCanvasRef {
  addImageToCanvas: (imageData: string) => void;
}

interface MainCanvasProps {
  activeTool: Tool;
  currentImage?: string | null;
  onImageLoad?: (imageData: string) => void;
  isGenerating?: boolean;
  isInpaintMode?: boolean;
  generatedImage?: string | null;
  // Menu Bar Integration: External zoom control props
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
}

const MainCanvas = forwardRef<MainCanvasRef, MainCanvasProps>(
  (
    {
      activeTool,
      currentImage,
      onImageLoad,
      // Removed unused parameters
      generatedImage,
      // Menu Bar Integration: External zoom control parameters
      zoom: externalZoom,
      onZoomChange,
    },
    ref,
  ) => {
    // Canvas refs and state
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricCanvasRef = useRef<FabricCanvas | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const lastLoadedImageRef = useRef<string | null>(null);
    const canvasInitializedRef = useRef(false);
    const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Canvas state
    // Menu Bar Integration: Zoom state management
    // This allows the menu bar to control zoom externally while maintaining internal fallback
    const [internalZoom, setInternalZoom] = useState(
      ZOOM_CONSTANTS.DEFAULT_ZOOM,
    );
    const zoom = externalZoom !== undefined ? externalZoom : internalZoom;
    const setZoom = onZoomChange || setInternalZoom;
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [isDrawing, setIsDrawing] = useState(false);
    const [brushSize, setBrushSize] = useState(
      TOOL_CONSTANTS.DEFAULT_BRUSH_SIZE,
    );
    const [brushColor, setBrushColor] = useState(
      TOOL_CONSTANTS.DEFAULT_BRUSH_COLOR,
    );
    const [isLoadingImage, setIsLoadingImage] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [canvasWidth, setCanvasWidth] = useState(1024);
    const [canvasHeight, setCanvasHeight] = useState(1024);
    const [isCanvasReady, setIsCanvasReady] = useState(false);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
    const [isResizing, setIsResizing] = useState(false);
    const [resizeHandle, setResizeHandle] = useState<string | null>(null);
    const [resizeStart, setResizeStart] = useState({
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    });

    // UI state
    const [contextMenu, setContextMenu] = useState({
      isOpen: false,
      x: 0,
      y: 0,
    });
    const [isResizeDialogOpen, setIsResizeDialogOpen] = useState(false);
    const [isResizeCanvasModalOpen, setIsResizeCanvasModalOpen] =
      useState(false);
    const [pendingImageDimensions, setPendingImageDimensions] = useState<{
      width: number;
      height: number;
    } | null>(null);
    const [pendingCanvasDimensions, setPendingCanvasDimensions] = useState<{
      width: number;
      height: number;
    } | null>(null);
    const [isCanvasInitializing, setIsCanvasInitializing] = useState(true);
    const [isProcessingResize, setIsProcessingResize] = useState(false);
    const [layers, setLayers] = useState<Layer[]>([]);
    const [activeLayerId, setActiveLayerId] = useState<string | null>(null);
    const [showLayers, setShowLayers] = useState(false);

    // Tool modal states
    const [isTextToolOpen, setIsTextToolOpen] = useState(false);
    const [isShapeToolOpen, setIsShapeToolOpen] = useState(false);

    // Floating image toolbar states
    const [selectedImageObjects, setSelectedImageObjects] = useState<
      FabricObject[]
    >([]);
    const [isImageToolbarVisible, setIsImageToolbarVisible] = useState(false);
    const [isBackgroundRemovalOpen, setIsBackgroundRemovalOpen] =
      useState(false);
    const [backgroundRemovalProgress, setBackgroundRemovalProgress] = useState<
      number | undefined
    >(undefined);
    const [effectOverlay, setEffectOverlay] = useState<{
      isVisible: boolean;
      bounds: { x: number; y: number; width: number; height: number };
      progress?: number;
      message?: string;
    } | null>(null);

    // Tool handlers

    const handleAddText = useCallback(
      (text: string, style: any) => {
        if (!fabricCanvasRef.current) return;

        import("fabric").then(({ Textbox }) => {
          const textObject = new Textbox(text, {
            left: canvasWidth / 2,
            top: canvasHeight / 2,
            fontFamily: style.fontFamily,
            fontSize: style.fontSize,
            fontWeight: style.fontWeight,
            fontStyle: style.fontStyle,
            textDecoration: style.textDecoration,
            textAlign: style.textAlign,
            fill: style.fillColor,
            stroke: style.strokeColor,
            strokeWidth: style.strokeWidth,
            opacity: style.opacity / 100,
            selectable: true,
            evented: true,
            originX: "center",
            originY: "center",
          });

          fabricCanvasRef.current?.add(textObject);
          fabricCanvasRef.current?.setActiveObject(textObject);
          fabricCanvasRef.current?.renderAll();

          // Create layer for the text
          const textLayer: Layer = {
            id: `text-layer-${Date.now()}`,
            name: `Text: ${text.substring(0, 20)}${text.length > 20 ? "..." : ""}`,
            type: "text",
            visible: true,
            locked: false,
            opacity: style.opacity,
            object: textObject,
          };

          setLayers((prev) => [...prev, textLayer]);
          setActiveLayerId(textLayer.id);

          // Close the text tool modal after adding text
          setIsTextToolOpen(false);
        });
      },
      [canvasWidth, canvasHeight],
    );

    const handleAddShape = useCallback(
      (shapeType: string, style: any) => {
        if (!fabricCanvasRef.current) return;

        import("fabric").then(({ Rect, Circle, Triangle }) => {
          let shapeObject;
          const commonProps = {
            left: canvasWidth / 2,
            top: canvasHeight / 2,
            fill: style.fillColor,
            stroke: style.strokeColor,
            strokeWidth: style.strokeWidth,
            opacity: style.opacity / 100,
            selectable: true,
            evented: true,
            originX: "center" as const,
            originY: "center" as const,
          };

          switch (shapeType) {
            case "rectangle":
              shapeObject = new Rect({
                ...commonProps,
                width: 100,
                height: 100,
              });
              break;
            case "circle":
              shapeObject = new Circle({
                ...commonProps,
                radius: 50,
              });
              break;
            case "triangle":
              shapeObject = new Triangle({
                ...commonProps,
                width: 100,
                height: 100,
              });
              break;
            default:
              return;
          }

          fabricCanvasRef.current?.add(shapeObject);
          fabricCanvasRef.current?.setActiveObject(shapeObject);
          fabricCanvasRef.current?.renderAll();

          // Create layer for the shape
          const shapeLayer: Layer = {
            id: `shape-layer-${Date.now()}`,
            name: `${shapeType.charAt(0).toUpperCase() + shapeType.slice(1)}`,
            type: "shape",
            visible: true,
            locked: false,
            opacity: style.opacity,
            object: shapeObject,
          };

          setLayers((prev) => [...prev, shapeLayer]);
          setActiveLayerId(shapeLayer.id);

          // Close the shape tool modal after adding shape
          setIsShapeToolOpen(false);
        });
      },
      [canvasWidth, canvasHeight],
    );

    const loadImageDirectly = useCallback(
      (
        img: any,
        imgWidth: number,
        imgHeight: number,
        targetCanvasWidth?: number,
        targetCanvasHeight?: number,
      ) => {
        if (!fabricCanvasRef.current) return;

        const canvas = fabricCanvasRef.current;

        // Use target dimensions if provided, otherwise use current canvas dimensions
        const effectiveCanvasWidth = targetCanvasWidth || canvasWidth;
        const effectiveCanvasHeight = targetCanvasHeight || canvasHeight;

        // Auto-zoom out for large images
        if (containerRef.current) {
          const container = containerRef.current;
          const padding = 100;
          const scaleX =
            (container.clientWidth - padding) / effectiveCanvasWidth;
          const scaleY =
            (container.clientHeight - padding) / effectiveCanvasHeight;
          const scale = Math.min(scaleX, scaleY);

          if (scale < 1) {
            const newZoom = Math.max(scale * 100, ZOOM_CONSTANTS.AUTO_ZOOM_MIN);
            setZoom(newZoom);
            console.log(
              "Auto-zoomed out to:",
              newZoom + "% to fit canvas in viewport",
            );
          }
        }

        // Clear existing objects
        canvas.getObjects().forEach((obj) => {
          canvas.remove(obj);
        });

        console.log("loadImageDirectly called with:", {
          imgWidth,
          imgHeight,
          targetCanvasWidth,
          targetCanvasHeight,
          effectiveCanvasWidth,
          effectiveCanvasHeight,
          currentCanvasWidth: canvasWidth,
          currentCanvasHeight: canvasHeight,
        });

        // Calculate scale to fit image to canvas while maintaining aspect ratio
        const canvasAspect = effectiveCanvasWidth / effectiveCanvasHeight;
        const imageAspect = imgWidth / imgHeight;

        let scaleX, scaleY;
        if (imageAspect > canvasAspect) {
          // Image is wider than canvas - fit to width
          scaleX = effectiveCanvasWidth / imgWidth;
          scaleY = scaleX;
        } else {
          // Image is taller than canvas - fit to height
          scaleY = effectiveCanvasHeight / imgHeight;
          scaleX = scaleY;
        }

        console.log("Image scaling calculation:", {
          imageAspect,
          canvasAspect,
          imgWidth,
          imgHeight,
          effectiveCanvasWidth,
          effectiveCanvasHeight,
          scaleX,
          scaleY,
        });

        // Calculate centered position
        const scaledWidth = imgWidth * scaleX;
        const scaledHeight = imgHeight * scaleY;
        const centerX = effectiveCanvasWidth / 2;
        const centerY = effectiveCanvasHeight / 2;

        // Set image properties
        img.set({
          left: centerX - scaledWidth / 2,
          top: centerY - scaledHeight / 2,
          scaleX: scaleX,
          scaleY: scaleY,
          selectable: true,
          evented: true,
          lockMovementX: false,
          lockMovementY: false,
          opacity: 1,
          globalCompositeOperation: "source-over",
        });

        canvas.add(img);
        canvas.bringObjectToFront(img);
        canvas.renderAll();

        // Create layer for the image
        const imageLayer: Layer = {
          id: `image-layer-${Date.now()}`,
          name: "Background Image",
          type: "image",
          visible: true,
          locked: false,
          opacity: 100,
          object: img,
        };

        setLayers([imageLayer]);
        setActiveLayerId(imageLayer.id);
        setImageLoaded(true);
        setIsLoadingImage(false);
      },
      [canvasWidth, canvasHeight, setZoom],
    );

    // Load image to Fabric.js canvas with optional force parameter
    const loadImageToCanvas = useCallback(
      (imageData: string, forceUpdate = false) => {
        if (!fabricCanvasRef.current || isLoadingImage || isProcessingResize)
          return;

        // Validate image data before processing
        if (
          !imageData ||
          imageData === "undefined" ||
          imageData.includes("undefined")
        ) {
          console.error("Invalid image data provided to canvas:", imageData);
          setIsLoadingImage(false);
          return;
        }

        // Prevent loading the same image multiple times (unless forced)
        if (!forceUpdate && lastLoadedImageRef.current === imageData) {
          console.log("Image already loaded, skipping...");
          return;
        }

        // When forcing update, log the reason
        if (forceUpdate && lastLoadedImageRef.current === imageData) {
          console.log("Force updating image with filters/adjustments...");
        }

        console.log(
          "Loading image to canvas:",
          imageData.substring(0, 50) + "...",
        );
        setIsLoadingImage(true);
        lastLoadedImageRef.current = imageData;

        FabricImage.fromURL(imageData)
          .then((img) => {
            if (!fabricCanvasRef.current) return;

            const canvas = fabricCanvasRef.current;
            const imgWidth = img.width || 0;
            const imgHeight = img.height || 0;

            console.log(
              "Current canvas dimensions:",
              canvasWidth,
              canvasHeight,
            );

            // Check if canvas is empty (first image load)
            const hasObjects = canvas.getObjects().length > 0;

            if (!hasObjects) {
              // First time loading an image - check if we should ask for resize confirmation
              console.log(
                "First image load - checking if resize confirmation needed",
              );

              // Check if image is smaller than current canvas size first (using original dimensions)
              const isImageSmallerThanCanvas =
                imgWidth < canvasWidth && imgHeight < canvasHeight;

              // Calculate reasonable canvas size while maintaining aspect ratio
              const maxCanvasSize = 1200; // Maximum dimension for canvas (more viewport-friendly)
              const imageAspect = imgWidth / imgHeight;

              let targetWidth, targetHeight;

              if (isImageSmallerThanCanvas) {
                // Image is smaller than canvas - don't resize, just use original dimensions
                targetWidth = imgWidth;
                targetHeight = imgHeight;
              } else if (
                imgWidth > maxCanvasSize ||
                imgHeight > maxCanvasSize
              ) {
                // Image is very large - scale down to maxCanvasSize
                if (imageAspect > 1) {
                  // Landscape image - fit to max width
                  targetWidth = maxCanvasSize;
                  targetHeight = Math.round(targetWidth / imageAspect);
                } else {
                  // Portrait or square image - fit to max height
                  targetHeight = maxCanvasSize;
                  targetWidth = Math.round(targetHeight * imageAspect);
                }
              } else {
                // Image fits reasonably but is larger than canvas - use original dimensions
                targetWidth = imgWidth;
                targetHeight = imgHeight;
              }

              if (isImageSmallerThanCanvas) {
                // Image is smaller than canvas - ask user for confirmation
                console.log(
                  "Image is smaller than canvas - showing resize confirmation modal",
                );
                setPendingImageDimensions({
                  width: imgWidth,
                  height: imgHeight,
                });
                setPendingCanvasDimensions({
                  width: targetWidth,
                  height: targetHeight,
                });
                setIsResizeCanvasModalOpen(true);
                setIsLoadingImage(false);
                return;
              } else {
                // Image is larger than or equal to canvas - auto-resize as before
                console.log(
                  "Image is larger than canvas - auto-resizing canvas to match image aspect ratio",
                );
                setIsProcessingResize(true);

                // Resize canvas to calculated dimensions
                console.log("Setting canvas dimensions:", {
                  imgWidth,
                  imgHeight,
                  imageAspect,
                  targetWidth,
                  targetHeight,
                });
                setCanvasWidth(targetWidth);
                setCanvasHeight(targetHeight);

                // Load the image after a short delay to allow canvas to resize
                setTimeout(() => {
                  if (fabricCanvasRef.current) {
                    console.log("Loading image after canvas resize:", {
                      imgWidth,
                      imgHeight,
                      targetWidth,
                      targetHeight,
                      canvasWidth: fabricCanvasRef.current.width,
                      canvasHeight: fabricCanvasRef.current.height,
                      stateCanvasWidth: canvasWidth,
                      stateCanvasHeight: canvasHeight,
                    });
                    loadImageDirectly(
                      img,
                      imgWidth,
                      imgHeight,
                      targetWidth,
                      targetHeight,
                    );
                    setIsProcessingResize(false);
                  }
                }, 150);

                // Safety timeout to reset processing flag
                setTimeout(() => {
                  setIsProcessingResize(false);
                }, 3000);
                return;
              }
            }

            // For new images, auto-resize logic already handled above
            // For same images (zoom/pan operations), just load directly

            // Load the image directly if dimensions match
            loadImageDirectly(img, imgWidth, imgHeight);
          })
          .catch((error) => {
            console.error("Error loading image:", error);
            setIsLoadingImage(false);
          });
      },
      [
        isLoadingImage,
        isProcessingResize,
        canvasWidth,
        canvasHeight,
        loadImageDirectly,
      ],
    );

    // Add image to canvas as an object (for insert functionality)
    const addImageToCanvas = useCallback(
      (imageData: string) => {
        if (!fabricCanvasRef.current) return;

        console.log(
          "Adding image to canvas:",
          imageData.substring(0, 50) + "...",
        );

        FabricImage.fromURL(imageData)
          .then((img) => {
            if (!fabricCanvasRef.current) return;

            const canvas = fabricCanvasRef.current;
            const imgWidth = img.width || 0;
            const imgHeight = img.height || 0;

            // Scale image to fit within canvas bounds (max 300px width/height)
            const maxSize = 300;
            let scale = 1;
            if (imgWidth > maxSize || imgHeight > maxSize) {
              scale = Math.min(maxSize / imgWidth, maxSize / imgHeight);
            }

            // Set image properties
            img.set({
              left: canvas.width / 2,
              top: canvas.height / 2,
              scaleX: scale,
              scaleY: scale,
              originX: "center",
              originY: "center",
              selectable: true,
              evented: true,
              cornerStyle: "circle",
              cornerColor: "#007bff",
              cornerSize: 8,
              transparentCorners: false,
              borderColor: "#007bff",
              borderScaleFactor: 2,
            });

            // Add image to canvas
            canvas.add(img);
            canvas.setActiveObject(img);
            canvas.renderAll();

            // Create layer for the image
            const imageLayer: Layer = {
              id: `image-${Date.now()}`,
              name: `Image ${layers.length + 1}`,
              type: "image",
              visible: true,
              locked: false,
              opacity: 1,
              object: img,
            };

            setLayers((prev) => [...prev, imageLayer]);
            setActiveLayerId(imageLayer.id);

            console.log("Image added to canvas successfully");
          })
          .catch((error) => {
            console.error("Error adding image to canvas:", error);
          });
      },
      [layers.length],
    );

    // Layer management functions
    const handleLayerSelect = useCallback(
      (layerId: string) => {
        setActiveLayerId(layerId);
        if (fabricCanvasRef.current) {
          const layer = layers.find((l) => l.id === layerId);
          if (layer && layer.object) {
            fabricCanvasRef.current.setActiveObject(layer.object);
            fabricCanvasRef.current.renderAll();
          }
        }
      },
      [layers],
    );

    const handleLayerToggleVisibility = useCallback(
      (layerId: string) => {
        setLayers((prev) =>
          prev.map((layer) =>
            layer.id === layerId
              ? { ...layer, visible: !layer.visible }
              : layer,
          ),
        );

        if (fabricCanvasRef.current) {
          const layer = layers.find((l) => l.id === layerId);
          if (layer && layer.object) {
            layer.object.set("visible", !layer.visible);
            fabricCanvasRef.current.renderAll();
          }
        }
      },
      [layers],
    );

    const handleLayerToggleLock = useCallback(
      (layerId: string) => {
        setLayers((prev) =>
          prev.map((layer) =>
            layer.id === layerId ? { ...layer, locked: !layer.locked } : layer,
          ),
        );

        if (fabricCanvasRef.current) {
          const layer = layers.find((l) => l.id === layerId);
          if (layer && layer.object) {
            layer.object.set("selectable", layer.locked);
            layer.object.set("evented", !layer.locked);
            fabricCanvasRef.current.renderAll();
          }
        }
      },
      [layers],
    );

    const handleLayerOpacityChange = useCallback(
      (layerId: string, opacity: number) => {
        setLayers((prev) =>
          prev.map((layer) =>
            layer.id === layerId ? { ...layer, opacity } : layer,
          ),
        );

        if (fabricCanvasRef.current) {
          const layer = layers.find((l) => l.id === layerId);
          if (layer && layer.object) {
            layer.object.set("opacity", opacity / 100);
            fabricCanvasRef.current.renderAll();
          }
        }
      },
      [layers],
    );

    const handleLayerDelete = useCallback(
      (layerId: string) => {
        if (fabricCanvasRef.current) {
          const layer = layers.find((l) => l.id === layerId);
          if (layer && layer.object) {
            fabricCanvasRef.current.remove(layer.object);
            fabricCanvasRef.current.renderAll();
          }
        }

        setLayers((prev) => prev.filter((layer) => layer.id !== layerId));
        if (activeLayerId === layerId) {
          setActiveLayerId(null);
        }
      },
      [layers, activeLayerId],
    );

    const handleLayerDuplicate = useCallback(
      (layerId: string) => {
        if (fabricCanvasRef.current) {
          const layer = layers.find((l) => l.id === layerId);
          if (layer && layer.object) {
            layer.object.clone().then((cloned: FabricObject) => {
              cloned.set({
                left: (layer.object?.left || 0) + 20,
                top: (layer.object?.top || 0) + 20,
              });
              fabricCanvasRef.current?.add(cloned);

              const newLayer: Layer = {
                id: `layer-${Date.now()}`,
                name: `${layer.name} Copy`,
                type: layer.type,
                visible: layer.visible,
                locked: layer.locked,
                opacity: layer.opacity,
                object: cloned,
              };

              setLayers((prev) => [...prev, newLayer]);
              setActiveLayerId(newLayer.id);
              fabricCanvasRef.current?.renderAll();
            });
          }
        }
      },
      [layers],
    );

    const handleLayerReorder = useCallback(
      (fromIndex: number, toIndex: number) => {
        setLayers((prev) => {
          const newLayers = [...prev];
          const [movedLayer] = newLayers.splice(fromIndex, 1);
          newLayers.splice(toIndex, 0, movedLayer);
          return newLayers;
        });

        if (fabricCanvasRef.current) {
          // Reorder objects in Fabric.js canvas
          const objects = fabricCanvasRef.current.getObjects();
          objects.forEach((obj, index) => {
            const layer = layers[index];
            if (layer && layer.object === obj) {
              fabricCanvasRef.current?.bringObjectToFront(obj);
            }
          });
          fabricCanvasRef.current.renderAll();
        }
      },
      [layers],
    );

    const handleAddLayer = useCallback((type: "text" | "shape") => {
      // Open the appropriate tool modal instead of creating empty layer
      if (type === "text") {
        setIsTextToolOpen(true);
      } else if (type === "shape") {
        setIsShapeToolOpen(true);
      }
    }, []);

    // Image toolbar handlers
    const handleSelectionChange = useCallback(() => {
      if (!fabricCanvasRef.current) return;

      const canvas = fabricCanvasRef.current;
      const activeObjects = canvas.getActiveObjects();

      // Debug logs (commented out)
      // console.log('Selection changed:', {
      //   totalObjects: activeObjects.length,
      //   objectTypes: activeObjects.map(obj => obj.type)
      // });

      // Filter for image objects only
      const imageObjects = activeObjects.filter((obj) => obj.type === "image");

      // console.log('Image objects found:', imageObjects.length);

      setSelectedImageObjects(imageObjects);
      setIsImageToolbarVisible(imageObjects.length > 0);

      // console.log('Setting toolbar visible:', imageObjects.length > 0);

      // Close background removal modal if no images are selected
      if (imageObjects.length === 0 && isBackgroundRemovalOpen) {
        setIsBackgroundRemovalOpen(false);
      }
    }, [isBackgroundRemovalOpen]);

    // Toast hooks for error handling
    const showErrorToast = useErrorToast();
    const showSuccessToast = useSuccessToast();
    const showWarningToast = useWarningToast();

    const handleBackgroundRemoval = useCallback(
      async (image: FabricObject): Promise<void> => {
        if (!fabricCanvasRef.current || image.type !== "image") return;

        try {
          // Calculate effect bounds for the ray overlay
          const objBounds = image.getBoundingRect();
          const canvasElement = fabricCanvasRef.current.getElement();
          const canvasRect = canvasElement.getBoundingClientRect();
          const zoom = fabricCanvasRef.current.getZoom();
          const pan = fabricCanvasRef.current.viewportTransform;

          // Convert canvas coordinates to screen coordinates
          const screenX =
            canvasRect.left + (objBounds.left + (pan?.[4] || 0)) * zoom;
          const screenY =
            canvasRect.top + (objBounds.top + (pan?.[5] || 0)) * zoom;
          const screenWidth = objBounds.width * zoom;
          const screenHeight = objBounds.height * zoom;

          setEffectOverlay({
            isVisible: true,
            bounds: {
              x: screenX,
              y: screenY,
              width: screenWidth,
              height: screenHeight,
            },
            progress: 0,
            message: "Preparing image...",
          });

          // Get image data as base64

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const fabricImage = image as any; // FabricImage type assertion
          const imageData = fabricImage.toDataURL({
            format: "png",
            quality: 1,
          });

          // Make API request to background removal endpoint
          const response = await fetch("/api/background-removal", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              image: imageData,

              transparencyMode: "full",
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            const errorMessage = errorData.error || "Background removal failed";

            // Handle specific error cases
            if (
              errorData.availableModels &&
              errorMessage.includes("not available")
            ) {
              const availableModels = errorData.availableModels.join(", ");
              showWarningToast(
                "Model Not Available",
                `The selected AI model is not available. Available models: ${availableModels}`,
              );
            } else if (errorMessage.includes("disabled")) {
              showErrorToast(
                "Feature Disabled",
                "Background removal feature is currently disabled in the configuration.",
              );
            } else {
              showErrorToast("Background Removal Failed", errorMessage);
            }

            // Hide effect overlay
            setEffectOverlay(null);
            return;
          }

          const result = await response.json();

          if (!result.success || !result.data?.data?.[0]?.b64_json) {
            showErrorToast(
              "Processing Failed",
              "No processed image received from the server. Please try again.",
            );
            setEffectOverlay(null);
            return;
          }

          // Update effect overlay for completion
          setEffectOverlay((prev) =>
            prev
              ? {
                  ...prev,
                  progress: 100,
                  message: "Background removed successfully!",
                }
              : null,
          );

          // Load processed image back to canvas
          const processedImageData = `data:image/png;base64,${result.data.data[0].b64_json}`;

          import("fabric").then(({ FabricImage }) => {
            FabricImage.fromURL(processedImageData).then((newImg) => {
              if (!fabricCanvasRef.current) return;

              // Replace the original image with the processed one
              const canvas = fabricCanvasRef.current;

              // Copy transform properties from original image
              newImg.set({
                left: image.left,
                top: image.top,
                scaleX: image.scaleX,
                scaleY: image.scaleY,
                angle: image.angle,
                opacity: image.opacity,
                selectable: true,
                evented: true,
              });

              // Remove old image and add new one
              canvas.remove(image);
              canvas.add(newImg);
              canvas.setActiveObject(newImg);
              canvas.renderAll();

              // Update layers
              setLayers((prev) =>
                prev.map((layer) =>
                  layer.object === image
                    ? {
                        ...layer,
                        object: newImg,
                        name: "Background Removed Image",
                      }
                    : layer,
                ),
              );

              // Show success toast
              showSuccessToast(
                "Background Removed",
                "Image background has been successfully removed.",
              );

              // Hide effect overlay after a short delay
              setTimeout(() => {
                setEffectOverlay(null);
              }, 1500);
            });
          });
        } catch (error) {
          console.error("Background removal failed:", error);

          // Hide effect overlay
          setEffectOverlay(null);

          // Show appropriate error toast
          if (error instanceof Error) {
            if (error.message.includes("Failed to fetch")) {
              showErrorToast(
                "Connection Error",
                "Unable to connect to the AI service. Please check your internet connection.",
              );
            } else {
              showErrorToast(
                "Unexpected Error",
                error.message ||
                  "An unexpected error occurred during background removal.",
              );
            }
          } else {
            showErrorToast(
              "Unknown Error",
              "An unknown error occurred. Please try again.",
            );
          }
        }
      },
      [showErrorToast, showSuccessToast, showWarningToast],
    );

    const handleImageDuplicate = useCallback((objects: FabricObject[]) => {
      if (!fabricCanvasRef.current) return;

      objects.forEach((obj) => {
        obj.clone().then((cloned: FabricObject) => {
          cloned.set({
            left: (obj.left || 0) + 20,
            top: (obj.top || 0) + 20,
          });
          fabricCanvasRef.current?.add(cloned);
          fabricCanvasRef.current?.renderAll();

          // Create layer for duplicated object
          const newLayer: Layer = {
            id: `duplicate-layer-${Date.now()}`,
            name: `Duplicate Image`,
            type: "image",
            visible: true,
            locked: false,
            opacity: 100,
            object: cloned,
          };

          setLayers((prev) => [...prev, newLayer]);
        });
      });
    }, []);

    const handleImageDelete = useCallback((objects: FabricObject[]) => {
      if (!fabricCanvasRef.current) return;

      objects.forEach((obj) => {
        fabricCanvasRef.current?.remove(obj);
      });

      fabricCanvasRef.current.renderAll();

      // Remove from layers
      setLayers((prev) =>
        prev.filter((layer) => layer.object && !objects.includes(layer.object)),
      );

      // Update selection
      setSelectedImageObjects([]);
      setIsImageToolbarVisible(false);
    }, []);

    // Background removal handler for the modal version (returns processed image URL)
    const handleBackgroundRemovalModal = useCallback(
      async (
        image: FabricObject,
        options?: {
          model?: string;
          quality?: string;
          edgeRefinement?: boolean;
          transparencyMode?: string;
        },
      ): Promise<string | null> => {
        if (!fabricCanvasRef.current || image.type !== "image") return null;

        try {
          // Get image data as base64
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const fabricImage = image as any; // FabricImage type assertion
          const imageData = fabricImage.toDataURL({
            format: "png",
            quality: 1,
          });

          // Make API request to background removal endpoint
          const response = await fetch("/api/background-removal", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              image: imageData,
              model: options?.model || "florence-2",
              quality: options?.quality || "standard",
              edgeRefinement:
                options?.edgeRefinement !== undefined
                  ? options.edgeRefinement
                  : true,
              transparencyMode: options?.transparencyMode || "full",
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            const errorMessage = errorData.error || "Background removal failed";

            if (
              errorData.availableModels &&
              errorMessage.includes("not available")
            ) {
              const availableModels = errorData.availableModels.join(", ");
              showWarningToast(
                "Model Not Available",
                `The selected AI model is not available. Available models: ${availableModels}`,
              );
            } else {
              showErrorToast("Background Removal Failed", errorMessage);
            }
            return null;
          }

          const result = await response.json();

          if (!result.success || !result.data?.data?.[0]?.b64_json) {
            showErrorToast(
              "Processing Failed",
              "No processed image received from the server. Please try again.",
            );
            return null;
          }

          // Return the processed image data
          const processedImageData = `data:image/png;base64,${result.data.data[0].b64_json}`;

          // Load processed image back to canvas
          import("fabric").then(({ FabricImage }) => {
            FabricImage.fromURL(processedImageData).then((newImg) => {
              if (!fabricCanvasRef.current) return;

              // Replace the original image with the processed one
              const canvas = fabricCanvasRef.current;

              // Copy transform properties from original image
              newImg.set({
                left: image.left,
                top: image.top,
                scaleX: image.scaleX,
                scaleY: image.scaleY,
                angle: image.angle,
                opacity: image.opacity,
                selectable: true,
                evented: true,
              });

              // Remove old image and add new one
              canvas.remove(image);
              canvas.add(newImg);
              canvas.setActiveObject(newImg);
              canvas.renderAll();

              // Update layers
              setLayers((prev) =>
                prev.map((layer) =>
                  layer.object === image
                    ? {
                        ...layer,
                        object: newImg,
                        name: "Background Removed Image",
                      }
                    : layer,
                ),
              );
            });
          });

          return processedImageData;
        } catch (error) {
          console.error("Background removal failed:", error);

          if (error instanceof Error) {
            if (error.message.includes("Failed to fetch")) {
              showErrorToast(
                "Connection Error",
                "Unable to connect to the AI service. Please check your internet connection.",
              );
            } else {
              showErrorToast(
                "Unexpected Error",
                error.message ||
                  "An unexpected error occurred during background removal.",
              );
            }
          } else {
            showErrorToast(
              "Unknown Error",
              "An unknown error occurred. Please try again.",
            );
          }
          return null;
        }
      },
      [showErrorToast, showWarningToast],
    );

    // Menu Bar Integration: Layer visibility toggle
    // This function is used by the View menu in the menu bar
    // It toggles the visibility of the layers panel
    const handleToggleLayers = useCallback(() => {
      setShowLayers((prev) => !prev);
    }, []);

    // Menu Bar Integration: Zoom controls
    // These functions are used by the View menu in the menu bar
    // They control the canvas zoom level with configurable increments
    const handleZoomIn = useCallback(() => {
      const newZoom = Math.min(
        zoom + ZOOM_CONSTANTS.ZOOM_STEP,
        ZOOM_CONSTANTS.MAX_ZOOM,
      );
      setZoom(newZoom);
    }, [setZoom, zoom]);

    const handleZoomOut = useCallback(() => {
      const newZoom = Math.max(
        zoom - ZOOM_CONSTANTS.ZOOM_STEP,
        ZOOM_CONSTANTS.MIN_ZOOM,
      );
      setZoom(newZoom);
    }, [setZoom, zoom]);

    const handleResetZoom = useCallback(() => {
      setZoom(ZOOM_CONSTANTS.DEFAULT_ZOOM);
    }, [setZoom]);

    // Delete selected elements from canvas
    // This function removes all currently selected objects from the Fabric.js canvas
    // It's triggered by the Delete or Backspace key when no input is focused
    const handleDeleteSelected = useCallback(() => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;

      const activeObjects = canvas.getActiveObjects();
      if (activeObjects.length > 0) {
        // Delete all selected objects
        activeObjects.forEach((obj) => {
          canvas.remove(obj);
        });

        // Clear selection and re-render canvas
        canvas.discardActiveObject();
        canvas.requestRenderAll();

        console.log(`Deleted ${activeObjects.length} selected object(s)`);
      }
    }, []);

    // Context menu handlers
    const handleContextMenu = useCallback((e: React.MouseEvent) => {
      e.preventDefault();
      setContextMenu({
        isOpen: true,
        x: e.clientX,
        y: e.clientY,
      });
    }, []);

    const handleContextMenuClose = useCallback(() => {
      setContextMenu({ isOpen: false, x: 0, y: 0 });
    }, []);

    // Resize canvas modal handlers
    const handleResizeCanvas = useCallback(() => {
      console.log("handleResizeCanvas called", {
        pendingCanvasDimensions,
        currentImage,
      });
      if (pendingCanvasDimensions) {
        // Set processing flag to prevent modal loops
        setIsProcessingResize(true);

        // Close the modal first
        setIsResizeCanvasModalOpen(false);
        setPendingImageDimensions(null);
        setPendingCanvasDimensions(null);

        // Resize canvas to the new dimensions
        console.log(
          "Resizing canvas to:",
          pendingCanvasDimensions.width,
          pendingCanvasDimensions.height,
        );
        setCanvasWidth(pendingCanvasDimensions.width);
        setCanvasHeight(pendingCanvasDimensions.height);

        // Apply the resize to Fabric.js canvas and refit existing image
        if (fabricCanvasRef.current && isCanvasReady) {
          setTimeout(() => {
            if (fabricCanvasRef.current) {
              try {
                // Resize canvas
                fabricCanvasRef.current.setDimensions({
                  width: pendingCanvasDimensions.width,
                  height: pendingCanvasDimensions.height,
                });

                // Force reload of current image to fit new canvas dimensions
                if (currentImage) {
                  console.log("Reloading image for new canvas dimensions");
                  // Clear the lastLoadedImageRef to force reload
                  lastLoadedImageRef.current = null;
                  // Trigger image reload after canvas is ready
                  setTimeout(() => {
                    if (currentImage) {
                      loadImageToCanvas(currentImage);
                    }
                  }, 100);
                }

                fabricCanvasRef.current.renderAll();
                console.log(
                  "Canvas resized to:",
                  pendingCanvasDimensions.width,
                  "x",
                  pendingCanvasDimensions.height,
                );
              } catch (error) {
                console.error("Error resizing canvas:", error);
              }
            }
            setIsProcessingResize(false);
          }, 50);
        } else {
          setIsProcessingResize(false);
        }

        // Safety timeout to reset processing flag
        setTimeout(() => {
          setIsProcessingResize(false);
        }, 5000);
      }
    }, [
      pendingCanvasDimensions,
      isCanvasReady,
      currentImage,
      loadImageToCanvas,
    ]);

    const handleResizeCanvasAndImage = useCallback(() => {
      if (pendingCanvasDimensions && currentImage) {
        // Set processing flag to prevent modal loops
        setIsProcessingResize(true);

        // Close the modal first
        setIsResizeCanvasModalOpen(false);
        setPendingImageDimensions(null);
        setPendingCanvasDimensions(null);

        // Resize canvas to new dimensions
        setCanvasWidth(pendingCanvasDimensions.width);
        setCanvasHeight(pendingCanvasDimensions.height);

        // Load and resize image to fit the new canvas
        FabricImage.fromURL(currentImage)
          .then((img) => {
            if (!fabricCanvasRef.current) return;
            const imgWidth = img.width || 0;
            const imgHeight = img.height || 0;
            lastLoadedImageRef.current = currentImage; // Update ref to prevent duplicate loading

            // Calculate scale to fit image within new canvas dimensions
            const scaleX = pendingCanvasDimensions.width / imgWidth;
            const scaleY = pendingCanvasDimensions.height / imgHeight;
            const scale = Math.min(scaleX, scaleY);

            // Apply canvas resize first
            if (fabricCanvasRef.current && isCanvasReady) {
              setTimeout(() => {
                if (fabricCanvasRef.current) {
                  try {
                    fabricCanvasRef.current.setDimensions({
                      width: pendingCanvasDimensions.width,
                      height: pendingCanvasDimensions.height,
                    });
                    // Load image with calculated scale
                    loadImageDirectly(
                      img,
                      imgWidth * scale,
                      imgHeight * scale,
                      pendingCanvasDimensions.width,
                      pendingCanvasDimensions.height,
                    );
                    fabricCanvasRef.current.renderAll();
                    console.log(
                      "Canvas and image resized to:",
                      pendingCanvasDimensions.width,
                      "x",
                      pendingCanvasDimensions.height,
                    );
                  } catch (error) {
                    console.error("Error resizing canvas and image:", error);
                  }
                }
                setIsProcessingResize(false);
              }, 50);
            } else {
              setIsProcessingResize(false);
            }
          })
          .catch((error) => {
            console.error("Error loading image after resize:", error);
            setIsProcessingResize(false);
          });

        // Safety timeout to reset processing flag
        setTimeout(() => {
          setIsProcessingResize(false);
        }, 5000);
      }
    }, [
      pendingCanvasDimensions,
      currentImage,
      isCanvasReady,
      loadImageDirectly,
    ]);

    const handleDiscardImage = useCallback(() => {
      // Simply close the modal and clear pending dimensions
      setIsResizeCanvasModalOpen(false);
      setPendingImageDimensions(null);
      setPendingCanvasDimensions(null);
      setIsLoadingImage(false);
      setIsProcessingResize(false);
    }, []);

    const handleKeepCurrentCanvas = useCallback(() => {
      if (pendingImageDimensions && currentImage) {
        // Load the image directly without resizing the canvas
        console.log("Loading image with current canvas size");
        setIsProcessingResize(true);

        // Close the modal first
        setIsResizeCanvasModalOpen(false);
        setPendingImageDimensions(null);
        setPendingCanvasDimensions(null);

        // Load the image directly to the current canvas
        FabricImage.fromURL(currentImage)
          .then((img) => {
            if (!fabricCanvasRef.current) return;
            const imgWidth = img.width || 0;
            const imgHeight = img.height || 0;
            lastLoadedImageRef.current = currentImage; // Update ref to prevent duplicate loading

            // Load image directly without resizing canvas
            loadImageDirectly(
              img,
              imgWidth,
              imgHeight,
              canvasWidth,
              canvasHeight,
            );
            setIsProcessingResize(false);
          })
          .catch((error) => {
            console.error("Error loading image with current canvas:", error);
            setIsProcessingResize(false);
          });

        // Safety timeout to reset processing flag
        setTimeout(() => {
          setIsProcessingResize(false);
        }, 3000);
      }
    }, [
      pendingImageDimensions,
      currentImage,
      canvasWidth,
      canvasHeight,
      loadImageDirectly,
    ]);

    const handleCloseResizeModal = useCallback(() => {
      // Reset all states when modal is closed
      setIsResizeCanvasModalOpen(false);
      setPendingImageDimensions(null);
      setPendingCanvasDimensions(null);
      setIsLoadingImage(false);
      setIsProcessingResize(false);
    }, []);

    const handleResizeFromMenu = useCallback(() => {
      setIsResizeDialogOpen(true);
    }, []);

    const handleResizeFromDialog = useCallback(
      (width: number, height: number) => {
        // Check if there's an image loaded and dimensions don't match
        if (imageLoaded && currentImage) {
          // Show modal to ask what to do with existing image
          console.log(
            "Manual canvas resize with existing image - showing modal",
          );
          setPendingCanvasDimensions({ width: width, height: height });
          setIsResizeCanvasModalOpen(true);
          setIsResizeDialogOpen(false);
          return;
        }

        // No image loaded, just resize canvas
        setCanvasWidth(width);
        setCanvasHeight(height);

        // Apply the resize immediately
        if (fabricCanvasRef.current && isCanvasReady) {
          setTimeout(() => {
            if (fabricCanvasRef.current) {
              try {
                fabricCanvasRef.current.setDimensions({
                  width: width,
                  height: height,
                });
                fabricCanvasRef.current.renderAll();
                console.log("Canvas resized from dialog:", width, "x", height);
              } catch (error) {
                console.error("Error resizing canvas from dialog:", error);
              }
            }
          }, 50);
        }

        setIsResizeDialogOpen(false);
      },
      [isCanvasReady, imageLoaded, currentImage],
    );

    // Stable callback wrappers to prevent infinite re-renders
    const handleCanvasWidthChange = useCallback((width: number) => {
      setCanvasWidth(width);
    }, []);

    const handleCanvasHeightChange = useCallback((height: number) => {
      setCanvasHeight(height);
    }, []);

    const handleIsResizingChange = useCallback((resizing: boolean) => {
      setIsResizing(resizing);
    }, []);

    const handleResizeHandleChange = useCallback((handle: string | null) => {
      setResizeHandle(handle);
    }, []);

    const handleResizeStartChange = useCallback(
      (start: { x: number; y: number; width: number; height: number }) => {
        setResizeStart(start);
      },
      [],
    );

    const handleIsCanvasReadyChange = useCallback((ready: boolean) => {
      setIsCanvasReady(ready);
    }, []);

    const handleContainerSizeChange = useCallback(
      (size: { width: number; height: number }) => {
        setContainerSize(size);
      },
      [],
    );

    const handleDownload = useCallback(() => {
      if (fabricCanvasRef.current) {
        const dataURL = fabricCanvasRef.current.toDataURL({
          format: "png",
          quality: 1,
          multiplier: 1,
        });

        const link = document.createElement("a");
        link.download = "canvas-image.png";
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }, []);

    const handleClearCanvas = useCallback(() => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.clear();
        setImageLoaded(false);
        setLayers([]);
        setActiveLayerId(null);
        fabricCanvasRef.current.renderAll();
      }
    }, []);

    const handleFitImageToCanvas = useCallback(() => {
      if (!fabricCanvasRef.current || !imageLoaded) return;

      const canvas = fabricCanvasRef.current;
      const objects = canvas.getObjects();
      const imageObject = objects.find((obj) => obj.type === "image");

      if (imageObject && imageObject.width && imageObject.height) {
        const imgWidth = imageObject.width * imageObject.scaleX!;
        const imgHeight = imageObject.height * imageObject.scaleY!;

        // Calculate scale to fit image to canvas while maintaining aspect ratio
        const canvasAspect = canvasWidth / canvasHeight;
        const imageAspect = imgWidth / imgHeight;

        let scaleX, scaleY;
        if (imageAspect > canvasAspect) {
          // Image is wider than canvas - fit to width
          scaleX = canvasWidth / imgWidth;
          scaleY = scaleX;
        } else {
          // Image is taller than canvas - fit to height
          scaleY = canvasHeight / imgHeight;
          scaleX = scaleY;
        }

        // Apply the new scale
        imageObject.set({
          scaleX: scaleX,
          scaleY: scaleY,
          left: 0,
          top: 0,
        });

        canvas.renderAll();
        console.log("Image fitted to canvas with scale:", scaleX);
      }
    }, [canvasWidth, canvasHeight, imageLoaded]);

    // Set canvas initialization state when canvas is ready
    useEffect(() => {
      if (isCanvasReady) {
        setIsCanvasInitializing(false);
      }
    }, [isCanvasReady]);

    // Menu Bar Integration: Tool selection handling
    // This effect responds to tool changes from the Tools menu in the menu bar
    // It automatically opens tool-specific panels when tools are selected
    useEffect(() => {
      if (activeTool === "text") {
        setIsTextToolOpen(true);
      } else if (activeTool === "shape") {
        setIsShapeToolOpen(true);
      }
    }, [activeTool]);

    // Clear last loaded image ref when currentImage changes to a new value
    useEffect(() => {
      if (currentImage && currentImage !== lastLoadedImageRef.current) {
        lastLoadedImageRef.current = null;
      }
    }, [currentImage]);

    // Load image when currentImage or generatedImage changes
    useEffect(() => {
      const imageToLoad = generatedImage || currentImage;
      if (
        !imageToLoad ||
        !fabricCanvasRef.current ||
        isResizing ||
        isProcessingResize
      ) {
        console.log("Image loading blocked:", {
          hasImage: !!imageToLoad,
          hasCanvas: !!fabricCanvasRef.current,
          isResizing,
          isProcessingResize,
        });
        return;
      }

      console.log(
        "Image changed, loading to canvas...",
        imageToLoad.substring(0, 50) + "...",
      );

      // Debounce to prevent multiple rapid loads
      const timeoutId = setTimeout(() => {
        if (!isResizing && !isProcessingResize) {
          loadImageToCanvas(imageToLoad);
        }
      }, 100);

      return () => clearTimeout(timeoutId);
    }, [
      currentImage,
      generatedImage,
      loadImageToCanvas,
      isResizing,
      isProcessingResize,
    ]);

    // Expose addImageToCanvas function through ref
    useImperativeHandle(
      ref,
      () => ({
        addImageToCanvas,
      }),
      [addImageToCanvas],
    );

    // Listen for canvas selection changes to show/hide image toolbar
    useEffect(() => {
      if (!fabricCanvasRef.current || !isCanvasReady) {
        // console.log('Selection listeners: Canvas not ready', {
        //   hasCanvas: !!fabricCanvasRef.current,
        //   isCanvasReady
        // });
        return;
      }

      const canvas = fabricCanvasRef.current;
      // console.log('Setting up selection event listeners for canvas');

      // Add selection event listeners
      const handleSelection = () => {
        // console.log('Selection event fired!');
        handleSelectionChange();
      };

      const handleSelectionCleared = () => {
        // console.log('Selection cleared event fired!');
        setSelectedImageObjects([]);
        setIsImageToolbarVisible(false);
      };

      canvas.on("selection:created", handleSelection);
      canvas.on("selection:updated", handleSelection);
      canvas.on("selection:cleared", handleSelectionCleared);

      // console.log('Selection event listeners attached successfully');

      // Cleanup
      return () => {
        // console.log('Cleaning up selection event listeners');
        canvas.off("selection:created", handleSelection);
        canvas.off("selection:updated", handleSelection);
        canvas.off("selection:cleared", handleSelectionCleared);
      };
    }, [handleSelectionChange, isCanvasReady]);

    return (
      <>
        <LoadingIndicator
          isVisible={isCanvasInitializing}
          message="Initializing canvas..."
          type="canvas"
        />

        <LoadingIndicator
          isVisible={isLoadingImage}
          message="Loading image..."
          type="image"
        />

        <div className="flex-1 relative overflow-hidden bg-gray-100 dark:bg-black flex">
          {/* Layers Panel */}
          {showLayers && (
            <LayerManager
              layers={layers}
              activeLayerId={activeLayerId}
              onLayerSelect={handleLayerSelect}
              onLayerToggleVisibility={handleLayerToggleVisibility}
              onLayerToggleLock={handleLayerToggleLock}
              onLayerOpacityChange={handleLayerOpacityChange}
              onLayerDelete={handleLayerDelete}
              onLayerDuplicate={handleLayerDuplicate}
              onLayerReorder={handleLayerReorder}
              onAddLayer={handleAddLayer}
            />
          )}

          {/* Main Canvas Area */}
          <div className="flex-1 relative overflow-hidden">
            <CanvasViewport
              canvasRef={canvasRef}
              fabricCanvasRef={fabricCanvasRef}
              containerRef={containerRef}
              canvasInitializedRef={canvasInitializedRef}
              resizeTimeoutRef={resizeTimeoutRef}
              zoom={zoom}
              pan={pan}
              isDragging={isDragging}
              dragStart={dragStart}
              isDrawing={isDrawing}
              brushSize={brushSize}
              brushColor={brushColor}
              isLoadingImage={isLoadingImage}
              imageLoaded={imageLoaded}
              canvasWidth={canvasWidth}
              canvasHeight={canvasHeight}
              isCanvasReady={isCanvasReady}
              containerSize={containerSize}
              isResizing={isResizing}
              resizeHandle={resizeHandle}
              resizeStart={resizeStart}
              activeTool={activeTool}
              onZoomChange={setZoom}
              onPanChange={setPan}
              onIsDraggingChange={setIsDragging}
              onDragStartChange={setDragStart}
              onIsDrawingChange={setIsDrawing}
              onBrushSizeChange={setBrushSize}
              onBrushColorChange={setBrushColor}
              onImageLoadedChange={setImageLoaded}
              onDeleteSelected={handleDeleteSelected}
              onCanvasWidthChange={handleCanvasWidthChange}
              onCanvasHeightChange={handleCanvasHeightChange}
              onIsCanvasReadyChange={handleIsCanvasReadyChange}
              onContainerSizeChange={handleContainerSizeChange}
              onIsResizingChange={handleIsResizingChange}
              onResizeHandleChange={handleResizeHandleChange}
              onResizeStartChange={handleResizeStartChange}
              onContextMenu={handleContextMenu}
            />

            <ToolOptionsPanel
              activeTool={activeTool}
              brushSize={brushSize}
              brushColor={brushColor}
              onBrushSizeChange={setBrushSize}
              onBrushColorChange={setBrushColor}
            />

            <LayersToggle
              showLayers={showLayers}
              onToggleLayers={handleToggleLayers}
            />

            <ZoomControls
              zoom={zoom}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onResetZoom={handleResetZoom}
            />

            <CanvasInfo
              canvasWidth={canvasWidth}
              canvasHeight={canvasHeight}
              zoom={zoom}
              imageLoaded={imageLoaded}
              isResizing={isResizing}
            />

            <FileUploadArea
              onImageLoad={onImageLoad}
              isLoadingImage={isLoadingImage}
              imageLoaded={imageLoaded}
            />

            <ContextMenu
              isOpen={contextMenu.isOpen}
              position={{ x: contextMenu.x, y: contextMenu.y }}
              onClose={handleContextMenuClose}
              onResize={handleResizeFromMenu}
              onFitToCanvas={handleFitImageToCanvas}
              onDownload={handleDownload}
              onUpload={() => document.getElementById("file-upload")?.click()}
              onClear={handleClearCanvas}
              hasImage={imageLoaded}
            />

            <ResizeDialog
              isOpen={isResizeDialogOpen}
              onClose={() => setIsResizeDialogOpen(false)}
              currentWidth={canvasWidth}
              currentHeight={canvasHeight}
              onResize={handleResizeFromDialog}
            />

            <ResizeCanvasModal
              isOpen={isResizeCanvasModalOpen}
              onClose={handleCloseResizeModal}
              onResizeCanvas={handleResizeCanvas}
              onResizeCanvasAndImage={handleResizeCanvasAndImage}
              onDiscard={handleDiscardImage}
              onKeepCurrentCanvas={handleKeepCurrentCanvas}
              imageWidth={pendingImageDimensions?.width || 0}
              imageHeight={pendingImageDimensions?.height || 0}
              currentCanvasWidth={canvasWidth}
              currentCanvasHeight={canvasHeight}
            />

            <TextTool
              isOpen={isTextToolOpen}
              onClose={() => setIsTextToolOpen(false)}
              onAddText={handleAddText}
            />

            <ShapesTool
              isOpen={isShapeToolOpen}
              onClose={() => setIsShapeToolOpen(false)}
              onAddShape={handleAddShape}
            />
          </div>

          {/* Floating Image Toolbar */}
          <FloatingImageToolbar
            fabricCanvas={fabricCanvasRef.current}
            selectedObjects={selectedImageObjects}
            isVisible={isImageToolbarVisible}
            onBackgroundRemoval={handleBackgroundRemoval}
            onDuplicate={handleImageDuplicate}
            onDelete={handleImageDelete}
            effectOverlay={effectOverlay || undefined}
          />

          {/* Background Removal Tool Modal */}
          <BackgroundRemovalTool
            fabricCanvas={fabricCanvasRef.current}
            selectedImage={selectedImageObjects[0] || null}
            isOpen={isBackgroundRemovalOpen}
            onClose={() => setIsBackgroundRemovalOpen(false)}
            onRemoveBackground={handleBackgroundRemovalModal}
          />
        </div>
      </>
    );
  },
);

MainCanvas.displayName = "MainCanvas";

export default MainCanvas;
