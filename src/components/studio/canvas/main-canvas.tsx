'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
// Removed unused imports
import { Tool } from '../toolbar';
import { LayerManager, Layer } from '../tools';
import { Canvas as FabricCanvas, FabricImage, FabricObject } from 'fabric';

// Import canvas components
import CanvasViewport from './canvas-viewport';
import ToolOptionsPanel from './tool-options-panel';
import ZoomControls from './zoom-controls';
import LayersToggle from './layers-toggle';
import CanvasInfo from './canvas-info';
import FileUploadArea from './file-upload-area';
import ContextMenu from '../context-menu';
import ResizeDialog from '../resize-dialog';
import ResizeCanvasModal from './resize-canvas-modal';
import LoadingIndicator from '../loading-indicator';
import { TextTool, ShapesTool } from '../tools';

interface MainCanvasProps {
  activeTool: Tool;
  currentImage?: string | null;
  onImageLoad?: (imageData: string) => void;
  isGenerating?: boolean;
  isInpaintMode?: boolean;
  generatedImage?: string | null;
}

export default function MainCanvas({ 
  activeTool, 
  currentImage, 
  onImageLoad, 
  // Removed unused parameters 
  generatedImage 
}: MainCanvasProps) {
  // Canvas refs and state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastLoadedImageRef = useRef<string | null>(null);
  const canvasInitializedRef = useRef(false);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Canvas state
  const [zoom, setZoom] = useState(100);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(10);
  const [brushColor, setBrushColor] = useState('#000000');
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [canvasWidth, setCanvasWidth] = useState(1024);
  const [canvasHeight, setCanvasHeight] = useState(1024);
  const [isCanvasReady, setIsCanvasReady] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  // UI state
  const [contextMenu, setContextMenu] = useState({ isOpen: false, x: 0, y: 0 });
  const [isResizeDialogOpen, setIsResizeDialogOpen] = useState(false);
  const [isResizeCanvasModalOpen, setIsResizeCanvasModalOpen] = useState(false);
  const [pendingImageDimensions, setPendingImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [pendingCanvasDimensions, setPendingCanvasDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isCanvasInitializing, setIsCanvasInitializing] = useState(true);
  const [isProcessingResize, setIsProcessingResize] = useState(false);
  const [layers, setLayers] = useState<Layer[]>([]);
  const [activeLayerId, setActiveLayerId] = useState<string | null>(null);
  const [showLayers, setShowLayers] = useState(false);

  // Tool modal states
  const [isTextToolOpen, setIsTextToolOpen] = useState(false);
  const [isShapeToolOpen, setIsShapeToolOpen] = useState(false);

  // Tool handlers
  const handleAddText = useCallback((text: string, style: any) => {
    if (!fabricCanvasRef.current) return;

    import('fabric').then(({ Textbox }) => {
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
        originX: 'center',
        originY: 'center'
      });

      fabricCanvasRef.current?.add(textObject);
      fabricCanvasRef.current?.setActiveObject(textObject);
      fabricCanvasRef.current?.renderAll();

      // Create layer for the text
      const textLayer: Layer = {
        id: `text-layer-${Date.now()}`,
        name: `Text: ${text.substring(0, 20)}${text.length > 20 ? '...' : ''}`,
        type: 'text',
        visible: true,
        locked: false,
        opacity: style.opacity,
        object: textObject
      };

      setLayers(prev => [...prev, textLayer]);
      setActiveLayerId(textLayer.id);
    });
  }, [canvasWidth, canvasHeight]);

  const handleAddShape = useCallback((shapeType: string, style: any) => {
    if (!fabricCanvasRef.current) return;

    import('fabric').then(({ Rect, Circle, Triangle }) => {
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
        originX: 'center',
        originY: 'center'
      };

      switch (shapeType) {
        case 'rectangle':
          shapeObject = new Rect({
            ...commonProps,
            width: 100,
            height: 100
          });
          break;
        case 'circle':
          shapeObject = new Circle({
            ...commonProps,
            radius: 50
          });
          break;
        case 'triangle':
          shapeObject = new Triangle({
            ...commonProps,
            width: 100,
            height: 100
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
        type: 'shape',
        visible: true,
        locked: false,
        opacity: style.opacity,
        object: shapeObject
      };

      setLayers(prev => [...prev, shapeLayer]);
      setActiveLayerId(shapeLayer.id);
    });
  }, [canvasWidth, canvasHeight]);

  const loadImageDirectly = useCallback((img: any, imgWidth: number, imgHeight: number, targetCanvasWidth?: number, targetCanvasHeight?: number) => {
      if (!fabricCanvasRef.current) return;

      const canvas = fabricCanvasRef.current;

      // Use target dimensions if provided, otherwise use current canvas dimensions
      const effectiveCanvasWidth = targetCanvasWidth || canvasWidth;
      const effectiveCanvasHeight = targetCanvasHeight || canvasHeight;

      // Auto-zoom out for large images
      if (containerRef.current) {
        const container = containerRef.current;
        const padding = 100;
        const scaleX = (container.clientWidth - padding) / effectiveCanvasWidth;
        const scaleY = (container.clientHeight - padding) / effectiveCanvasHeight;
        const scale = Math.min(scaleX, scaleY);

        if (scale < 1) {
          const newZoom = Math.max(scale * 100, 15);
          setZoom(newZoom);
          console.log('Auto-zoomed out to:', newZoom + '% to fit canvas in viewport');
        }
      }

      // Clear existing objects
      canvas.getObjects().forEach(obj => {
        canvas.remove(obj);
      });
    
    console.log('loadImageDirectly called with:', {
      imgWidth,
      imgHeight,
      targetCanvasWidth,
      targetCanvasHeight,
      effectiveCanvasWidth,
      effectiveCanvasHeight,
      currentCanvasWidth: canvasWidth,
      currentCanvasHeight: canvasHeight
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
    
    console.log('Image scaling calculation:', {
      imageAspect,
      canvasAspect,
      imgWidth,
      imgHeight,
      effectiveCanvasWidth,
      effectiveCanvasHeight,
      scaleX,
      scaleY
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
        globalCompositeOperation: 'source-over'
      });
      
      canvas.add(img);
      canvas.bringObjectToFront(img);
      canvas.renderAll();
      
      // Create layer for the image
      const imageLayer: Layer = {
        id: `image-layer-${Date.now()}`,
        name: 'Background Image',
        type: 'image',
        visible: true,
        locked: false,
        opacity: 100,
        object: img
      };
      
    setLayers([imageLayer]);
      setActiveLayerId(imageLayer.id);
    setImageLoaded(true);
    setIsLoadingImage(false);
  }, [canvasWidth, canvasHeight]);

  // Load image to Fabric.js canvas
  const loadImageToCanvas = useCallback((imageData: string) => {
    if (!fabricCanvasRef.current || isLoadingImage || isProcessingResize) return;
    
    // Prevent loading the same image multiple times
    if (lastLoadedImageRef.current === imageData) {
      console.log('Image already loaded, skipping...');
      return;
    }

    console.log('Loading image to canvas:', imageData.substring(0, 50) + '...');
    setIsLoadingImage(true);
    lastLoadedImageRef.current = imageData;

    FabricImage.fromURL(imageData).then((img) => {
      if (!fabricCanvasRef.current) return;

      const canvas = fabricCanvasRef.current;
      const imgWidth = img.width || 0;
      const imgHeight = img.height || 0;

      console.log('Image loaded successfully:', {
        imgWidth,
        imgHeight,
        imgWidthFromFabric: img.width,
        imgHeightFromFabric: img.height,
        imgNaturalWidth: img.getElement()?.naturalWidth,
        imgNaturalHeight: img.getElement()?.naturalHeight
      });
      console.log('Current canvas dimensions:', canvasWidth, canvasHeight);

      console.log('Dimension check:', {
        imgWidth,
        imgHeight,
        canvasWidth,
        canvasHeight,
        isProcessingResize,
        imageLoaded
      });
      
      // Check if canvas is empty (first image load)
      const hasObjects = canvas.getObjects().length > 0;
      
      if (!hasObjects) {
        // First time loading an image - auto-resize canvas to match image aspect ratio
        console.log('First image load - auto-resize canvas to match image aspect ratio');
        setIsProcessingResize(true);
        
        // Calculate reasonable canvas size while maintaining aspect ratio
        const maxCanvasSize = 1200; // Maximum dimension for canvas (more viewport-friendly)
        const imageAspect = imgWidth / imgHeight;
        
        let targetWidth, targetHeight;
        
        // Always scale down if either dimension is larger than maxCanvasSize
        if (imgWidth > maxCanvasSize || imgHeight > maxCanvasSize) {
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
          // Image is smaller than maxCanvasSize, but still scale it to a reasonable size
          const scaleFactor = Math.min(800 / imgWidth, 600 / imgHeight, 1);
          targetWidth = Math.round(imgWidth * scaleFactor);
          targetHeight = Math.round(imgHeight * scaleFactor);
        }
        
        // Resize canvas to calculated dimensions
        console.log('Setting canvas dimensions:', {
          imgWidth,
          imgHeight,
          imageAspect,
          targetWidth,
          targetHeight
        });
        setCanvasWidth(targetWidth);
        setCanvasHeight(targetHeight);
        
        // Load the image after a short delay to allow canvas to resize
        setTimeout(() => {
          if (fabricCanvasRef.current) {
            console.log('Loading image after canvas resize:', {
              imgWidth,
              imgHeight,
              targetWidth,
              targetHeight,
              canvasWidth: fabricCanvasRef.current.width,
              canvasHeight: fabricCanvasRef.current.height,
              stateCanvasWidth: canvasWidth,
              stateCanvasHeight: canvasHeight
            });
            loadImageDirectly(img, imgWidth, imgHeight, targetWidth, targetHeight);
            setIsProcessingResize(false);
          }
        }, 150);
        
        // Safety timeout to reset processing flag
        setTimeout(() => {
          setIsProcessingResize(false);
        }, 3000);
        return;
      }
      
      // For new images, auto-resize logic already handled above
      // For same images (zoom/pan operations), just load directly

      // Load the image directly if dimensions match
      loadImageDirectly(img, imgWidth, imgHeight);
    }).catch((error) => {
      console.error('Error loading image:', error);
      setIsLoadingImage(false);
    });
  }, [isLoadingImage, isProcessingResize, canvasWidth, canvasHeight, loadImageDirectly]);

  // Layer management functions
  const handleLayerSelect = useCallback((layerId: string) => {
    setActiveLayerId(layerId);
    if (fabricCanvasRef.current) {
      const layer = layers.find(l => l.id === layerId);
      if (layer && layer.object) {
        fabricCanvasRef.current.setActiveObject(layer.object);
        fabricCanvasRef.current.renderAll();
      }
    }
  }, [layers]);

  const handleLayerToggleVisibility = useCallback((layerId: string) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId 
        ? { ...layer, visible: !layer.visible }
        : layer
    ));
    
    if (fabricCanvasRef.current) {
      const layer = layers.find(l => l.id === layerId);
      if (layer && layer.object) {
        layer.object.set('visible', !layer.visible);
        fabricCanvasRef.current.renderAll();
      }
    }
  }, [layers]);

  const handleLayerToggleLock = useCallback((layerId: string) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId 
        ? { ...layer, locked: !layer.locked }
        : layer
    ));
    
    if (fabricCanvasRef.current) {
      const layer = layers.find(l => l.id === layerId);
      if (layer && layer.object) {
        layer.object.set('selectable', layer.locked);
        layer.object.set('evented', !layer.locked);
        fabricCanvasRef.current.renderAll();
      }
    }
  }, [layers]);

  const handleLayerOpacityChange = useCallback((layerId: string, opacity: number) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId 
        ? { ...layer, opacity }
        : layer
    ));
    
    if (fabricCanvasRef.current) {
      const layer = layers.find(l => l.id === layerId);
      if (layer && layer.object) {
        layer.object.set('opacity', opacity / 100);
        fabricCanvasRef.current.renderAll();
      }
    }
  }, [layers]);

  const handleLayerDelete = useCallback((layerId: string) => {
    if (fabricCanvasRef.current) {
      const layer = layers.find(l => l.id === layerId);
      if (layer && layer.object) {
        fabricCanvasRef.current.remove(layer.object);
        fabricCanvasRef.current.renderAll();
      }
    }
    
    setLayers(prev => prev.filter(layer => layer.id !== layerId));
    if (activeLayerId === layerId) {
      setActiveLayerId(null);
    }
  }, [layers, activeLayerId]);

  const handleLayerDuplicate = useCallback((layerId: string) => {
    if (fabricCanvasRef.current) {
      const layer = layers.find(l => l.id === layerId);
      if (layer && layer.object) {
        layer.object.clone().then((cloned: FabricObject) => {
          cloned.set({
            left: (layer.object?.left || 0) + 20,
            top: (layer.object?.top || 0) + 20
          });
          fabricCanvasRef.current?.add(cloned);
          
          const newLayer: Layer = {
            id: `layer-${Date.now()}`,
            name: `${layer.name} Copy`,
            type: layer.type,
            visible: layer.visible,
            locked: layer.locked,
            opacity: layer.opacity,
            object: cloned
          };
          
          setLayers(prev => [...prev, newLayer]);
          setActiveLayerId(newLayer.id);
          fabricCanvasRef.current?.renderAll();
        });
      }
    }
  }, [layers]);

  const handleLayerReorder = useCallback((fromIndex: number, toIndex: number) => {
    setLayers(prev => {
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
  }, [layers]);

  const handleAddLayer = useCallback((type: 'text' | 'shape') => {
    if (!fabricCanvasRef.current) return;
    
    const newLayer: Layer = {
      id: `layer-${Date.now()}`,
      name: type === 'text' ? 'Text Layer' : 'Shape Layer',
      type,
      visible: true,
      locked: false,
      opacity: 100,
      object: undefined
    };
    
    setLayers(prev => [...prev, newLayer]);
    setActiveLayerId(newLayer.id);
  }, []);

  // Context menu handlers
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY
    });
  }, []);

  const handleContextMenuClose = useCallback(() => {
    setContextMenu({ isOpen: false, x: 0, y: 0 });
  }, []);

  // Resize canvas modal handlers
  const handleResizeCanvas = useCallback(() => {
    console.log('handleResizeCanvas called', { pendingCanvasDimensions, currentImage });
    if (pendingCanvasDimensions) {
      // Set processing flag to prevent modal loops
      setIsProcessingResize(true);
      
      // Close the modal first
      setIsResizeCanvasModalOpen(false);
      setPendingImageDimensions(null);
      setPendingCanvasDimensions(null);
      
      // Resize canvas to the new dimensions
      console.log('Resizing canvas to:', pendingCanvasDimensions.width, pendingCanvasDimensions.height);
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
                height: pendingCanvasDimensions.height
              });
              
              // Force reload of current image to fit new canvas dimensions
              if (currentImage) {
                console.log('Reloading image for new canvas dimensions');
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
              console.log('Canvas resized to:', pendingCanvasDimensions.width, 'x', pendingCanvasDimensions.height);
            } catch (error) {
              console.error('Error resizing canvas:', error);
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
  }, [pendingCanvasDimensions, isCanvasReady, currentImage]);

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
      FabricImage.fromURL(currentImage).then((img) => {
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
                  height: pendingCanvasDimensions.height
                });
                // Load image with calculated scale
                loadImageDirectly(img, imgWidth * scale, imgHeight * scale, pendingCanvasDimensions.width, pendingCanvasDimensions.height);
                fabricCanvasRef.current.renderAll();
                console.log('Canvas and image resized to:', pendingCanvasDimensions.width, 'x', pendingCanvasDimensions.height);
              } catch (error) {
                console.error('Error resizing canvas and image:', error);
              }
            }
            setIsProcessingResize(false);
          }, 50);
        } else {
          setIsProcessingResize(false);
        }
      }).catch((error) => {
        console.error('Error loading image after resize:', error);
        setIsProcessingResize(false);
      });
      
      // Safety timeout to reset processing flag
      setTimeout(() => {
        setIsProcessingResize(false);
      }, 5000);
    }
  }, [pendingCanvasDimensions, currentImage, isCanvasReady, loadImageDirectly]);

  const handleDiscardImage = useCallback(() => {
    // Simply close the modal and clear pending dimensions
    setIsResizeCanvasModalOpen(false);
    setPendingImageDimensions(null);
    setPendingCanvasDimensions(null);
    setIsLoadingImage(false);
    setIsProcessingResize(false);
  }, []);

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

  const handleResizeFromDialog = useCallback((width: number, height: number) => {
    // Check if there's an image loaded and dimensions don't match
    if (imageLoaded && currentImage) {
      // Show modal to ask what to do with existing image
      console.log('Manual canvas resize with existing image - showing modal');
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
              height: height
            });
            fabricCanvasRef.current.renderAll();
            console.log('Canvas resized from dialog:', width, 'x', height);
          } catch (error) {
            console.error('Error resizing canvas from dialog:', error);
          }
        }
      }, 50);
    }
    
    setIsResizeDialogOpen(false);
  }, [isCanvasReady, imageLoaded, currentImage]);

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

  const handleResizeStartChange = useCallback((start: { x: number; y: number; width: number; height: number }) => {
    setResizeStart(start);
  }, []);

  const handleIsCanvasReadyChange = useCallback((ready: boolean) => {
    setIsCanvasReady(ready);
  }, []);

  const handleContainerSizeChange = useCallback((size: { width: number; height: number }) => {
    setContainerSize(size);
  }, []);

  const handleDownload = useCallback(() => {
    if (fabricCanvasRef.current) {
      const dataURL = fabricCanvasRef.current.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 1
      });
      
      const link = document.createElement('a');
      link.download = 'canvas-image.png';
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
    const imageObject = objects.find(obj => obj.type === 'image');
    
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
        top: 0
      });
      
      canvas.renderAll();
      console.log('Image fitted to canvas with scale:', scaleX);
    }
  }, [canvasWidth, canvasHeight, imageLoaded]);

  // Set canvas initialization state when canvas is ready
  useEffect(() => {
    if (isCanvasReady) {
      setIsCanvasInitializing(false);
    }
  }, [isCanvasReady]);

  // Handle tool selection
  useEffect(() => {
    if (activeTool === 'text') {
      setIsTextToolOpen(true);
    } else if (activeTool === 'shape') {
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
    if (!imageToLoad || !fabricCanvasRef.current || isResizing || isProcessingResize) {
      console.log('Image loading blocked:', {
        hasImage: !!imageToLoad,
        hasCanvas: !!fabricCanvasRef.current,
        isResizing,
        isProcessingResize
      });
      return;
    }
    
    console.log('Image changed, loading to canvas...', imageToLoad.substring(0, 50) + '...');
    
    // Debounce to prevent multiple rapid loads
    const timeoutId = setTimeout(() => {
      if (!isResizing && !isProcessingResize) {
        loadImageToCanvas(imageToLoad);
      }
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [currentImage, generatedImage, loadImageToCanvas, isResizing, isProcessingResize]);

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
          onToggleLayers={() => setShowLayers(!showLayers)}
        />

        <ZoomControls
          zoom={zoom}
          onZoomIn={() => setZoom(prev => Math.min(prev + 25, 400))}
          onZoomOut={() => setZoom(prev => Math.max(prev - 25, 25))}
          onResetZoom={() => setZoom(100)}
        />

        <CanvasInfo
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          containerSize={containerSize}
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
          onUpload={() => document.getElementById('file-upload')?.click()}
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
    </div>
    </>
  );
}
