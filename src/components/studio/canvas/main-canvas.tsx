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
  const [isCanvasInitializing, setIsCanvasInitializing] = useState(true);
  const [layers, setLayers] = useState<Layer[]>([]);
  const [activeLayerId, setActiveLayerId] = useState<string | null>(null);
  const [showLayers, setShowLayers] = useState(false);

  // Removed unused variable

  const loadImageDirectly = useCallback((img: any, imgWidth: number, imgHeight: number) => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;

    // Auto-zoom out for large images
    if (containerRef.current) {
      const container = containerRef.current;
      const padding = 100;
      const scaleX = (container.clientWidth - padding) / imgWidth;
      const scaleY = (container.clientHeight - padding) / imgHeight;
      const scale = Math.min(scaleX, scaleY);

      if (scale < 1) {
        const newZoom = Math.max(scale * 90, 15);
        setZoom(newZoom);
        console.log('Auto-zoomed out to:', newZoom + '% to fit image in viewport');
      }
    }

    // Clear existing objects
    canvas.getObjects().forEach(obj => {
      canvas.remove(obj);
    });

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

    // Set image properties
    img.set({
      left: 0,
      top: 0,
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
    if (!fabricCanvasRef.current || isLoadingImage) return;

    console.log('Loading image to canvas:', imageData.substring(0, 50) + '...');
    setIsLoadingImage(true);

    FabricImage.fromURL(imageData).then((img) => {
      if (!fabricCanvasRef.current) return;

      const canvas = fabricCanvasRef.current;
      const imgWidth = img.width || 0;
      const imgHeight = img.height || 0;

      console.log('Image loaded successfully:', imgWidth, imgHeight);
      console.log('Current canvas dimensions:', canvasWidth, canvasHeight);

      // Check if image dimensions match canvas dimensions
      const dimensionsMatch = Math.abs(imgWidth - canvasWidth) < 5 && Math.abs(imgHeight - canvasHeight) < 5;
      
      if (!dimensionsMatch) {
        // Show modal to ask if user wants to resize canvas
        setPendingImageDimensions({ width: imgWidth, height: imgHeight });
        setIsResizeCanvasModalOpen(true);
        setIsLoadingImage(false);
        return; // Don't load the image yet, wait for user decision
      }

      // Load the image directly if dimensions match
      loadImageDirectly(img, imgWidth, imgHeight);
    }).catch((error) => {
      console.error('Error loading image:', error);
      setIsLoadingImage(false);
    });
  }, [isLoadingImage, canvasWidth, canvasHeight, loadImageDirectly]);

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
  const handleResizeCanvasToImage = useCallback(() => {
    if (pendingImageDimensions) {
      setCanvasWidth(pendingImageDimensions.width);
      setCanvasHeight(pendingImageDimensions.height);
      setPendingImageDimensions(null);
      
      // Load the image after resizing canvas
      if (currentImage) {
        loadImageToCanvas(currentImage);
      }
    }
  }, [pendingImageDimensions, currentImage, loadImageToCanvas]);

  const handleKeepCurrentCanvasSize = useCallback(() => {
    setPendingImageDimensions(null);
    
    // Load the image with current canvas size
    if (currentImage) {
      loadImageToCanvas(currentImage);
    }
  }, [currentImage, loadImageToCanvas]);

  const handleResizeFromMenu = useCallback(() => {
    setIsResizeDialogOpen(true);
  }, []);

  const handleResizeFromDialog = useCallback((width: number, height: number) => {
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
  }, [isCanvasReady]);

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

  // Load image when currentImage changes
  useEffect(() => {
    if (!currentImage || !fabricCanvasRef.current || isResizing) return;
    
    console.log('Current image changed, loading to canvas...', currentImage.substring(0, 50) + '...');
    
    // Debounce to prevent multiple rapid loads
    const timeoutId = setTimeout(() => {
      if (!isResizing) {
        loadImageToCanvas(currentImage);
      }
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [currentImage, loadImageToCanvas, isResizing]);

  // Load generated image immediately when it's available
  useEffect(() => {
    if (!generatedImage || !fabricCanvasRef.current || isResizing) return;
    
    console.log('Generated image received, loading to canvas...', generatedImage.substring(0, 50) + '...');
    
    // Debounce to prevent multiple rapid loads
    const timeoutId = setTimeout(() => {
      if (!isResizing) {
        loadImageToCanvas(generatedImage);
      }
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [generatedImage, loadImageToCanvas, isResizing]);

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
          onClose={() => setIsResizeCanvasModalOpen(false)}
          onResize={handleResizeCanvasToImage}
          onKeepCurrent={handleKeepCurrentCanvasSize}
          imageWidth={pendingImageDimensions?.width || 0}
          imageHeight={pendingImageDimensions?.height || 0}
          currentCanvasWidth={canvasWidth}
          currentCanvasHeight={canvasHeight}
        />
      </div>
    </div>
    </>
  );
}
