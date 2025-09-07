'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomInIcon, ZoomOutIcon, ResetIcon, FrameIcon } from '@radix-ui/react-icons';
import { Button } from '@radix-ui/themes';
import ContextMenu from './context-menu';
import ResizeDialog from './resize-dialog';
import { Tool } from './toolbar';

// Import Fabric.js properly
import { Canvas as FabricCanvas, FabricImage, FabricObject, Path, Rect, IText } from 'fabric';

interface CanvasProps {
  activeTool: Tool;
  currentImage?: string | null;
  onImageLoad?: (imageData: string) => void;
  isGenerating?: boolean;
  isInpaintMode?: boolean;
  generatedImage?: string | null;
}

export function Canvas({ activeTool, currentImage, onImageLoad, isGenerating = false, isInpaintMode = false, generatedImage }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(100);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(10);
  const [brushColor, setBrushColor] = useState('#000000');
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [canvasWidth, setCanvasWidth] = useState(800);
  const [canvasHeight, setCanvasHeight] = useState(600);
  const [isCanvasReady, setIsCanvasReady] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const canvasInitializedRef = useRef(false);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [contextMenu, setContextMenu] = useState({ isOpen: false, x: 0, y: 0 });
  const [isResizeDialogOpen, setIsResizeDialogOpen] = useState(false);
  const canvasSize = { width: canvasWidth, height: canvasHeight };


  // Load image to Fabric.js canvas
  const loadImageToCanvas = useCallback((imageData: string) => {
    if (!fabricCanvasRef.current || isLoadingImage) return;

    console.log('Loading image to canvas:', imageData.substring(0, 50) + '...');
    setIsLoadingImage(true);

    FabricImage.fromURL(imageData).then((img: FabricImage) => {
      if (!fabricCanvasRef.current) return;
      
      console.log('Image loaded successfully:', img.width, img.height);
      console.log('Current canvas dimensions:', fabricCanvasRef.current.width, fabricCanvasRef.current.height);
      
      // Clear existing objects
      const canvas = fabricCanvasRef.current;
      const objects = canvas.getObjects();
      objects.forEach(obj => {
        canvas.remove(obj);
      });
      
      // Auto-fit canvas to image dimensions
      const imgWidth = img.width!;
      const imgHeight = img.height!;
      
      // Update canvas size to match image (useEffect will handle Fabric.js update)
      setCanvasWidth(imgWidth);
      setCanvasHeight(imgHeight);
      
      // Auto-zoom out if image is too large for viewport
      if (containerSize.width > 0 && containerSize.height > 0) {
        // Calculate scale needed to fit image in viewport with some padding
        const padding = 100; // 50px padding on each side
        const availableWidth = containerSize.width - padding;
        const availableHeight = containerSize.height - padding;
        
        const scaleX = availableWidth / imgWidth;
        const scaleY = availableHeight / imgHeight;
        const scale = Math.min(scaleX, scaleY, 1); // Don't zoom in beyond 100%
        
        // Only zoom out if image is larger than viewport
        if (scale < 1) {
          const newZoom = Math.max(scale * 90, 15); // Minimum 15% zoom
          setZoom(newZoom);
          console.log('Auto-zoomed out to:', newZoom + '% to fit image in viewport');
        }
      }
      
      // Set image to full size and position at origin
      img.set({
        left: 0,
        top: 0,
        scaleX: 1,
        scaleY: 1,
        selectable: true,
        evented: true,
        lockMovementX: false,
        lockMovementY: false,
        // Ensure image is opaque and on top
        opacity: 1,
        globalCompositeOperation: 'source-over'
      });
      
      canvas.add(img);
      canvas.bringObjectToFront(img);
      canvas.renderAll();
      console.log('Image added to canvas and rendered at full size:', imgWidth, 'x', imgHeight);
      setIsLoadingImage(false);
      setImageLoaded(true);
    }).catch((error) => {
      console.error('Error loading image:', error);
      setIsLoadingImage(false);
    });
  }, [containerSize, isLoadingImage]);

  // Resize canvas function
  const resizeCanvas = useCallback((newWidth: number, newHeight: number) => {
    if (!fabricCanvasRef.current || !isCanvasReady) return;
    
    setCanvasWidth(newWidth);
    setCanvasHeight(newHeight);
    
    // Update Fabric.js canvas dimensions with delay
    setTimeout(() => {
      if (!fabricCanvasRef.current) return;
      
      try {
        fabricCanvasRef.current.setDimensions({
          width: newWidth,
          height: newHeight
        });
        
        fabricCanvasRef.current.renderAll();
      } catch (error) {
        console.error('Error resizing canvas:', error);
      }
    }, 50);
  }, [isCanvasReady]);

  // Reset image to fit canvas
  const resetImageToFit = useCallback(() => {
    if (!fabricCanvasRef.current) return;
    
    const canvas = fabricCanvasRef.current;
    const objects = canvas.getObjects();
    const imageObject = objects.find(obj => obj.type === 'image');
    
    if (imageObject) {
      // Reset image to fit canvas while maintaining aspect ratio
      const canvasWidth = canvas.width!;
      const canvasHeight = canvas.height!;
      const imgWidth = imageObject.width!;
      const imgHeight = imageObject.height!;
      
      // Calculate scale to fit canvas
      const scaleX = canvasWidth / imgWidth;
      const scaleY = canvasHeight / imgHeight;
      const scale = Math.min(scaleX, scaleY);
      
      // Center the image on canvas
      const scaledWidth = imgWidth * scale;
      const scaledHeight = imgHeight * scale;
      const left = (canvasWidth - scaledWidth) / 2;
      const top = (canvasHeight - scaledHeight) / 2;
      
      imageObject.set({
        left: left,
        top: top,
        scaleX: scale,
        scaleY: scale
      });
      
      // Auto-zoom to fit in viewport
      const container = containerRef.current;
      if (container) {
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        // Calculate scale needed to fit image in viewport with some padding
        const padding = 100; // 50px padding on each side
        const availableWidth = containerWidth - padding;
        const availableHeight = containerHeight - padding;
        
        const viewportScaleX = availableWidth / canvasWidth;
        const viewportScaleY = availableHeight / canvasHeight;
        const viewportScale = Math.min(viewportScaleX, viewportScaleY, 1);
        
        // Only zoom out if canvas is larger than viewport
        if (viewportScale < 1) {
          const newZoom = Math.max(viewportScale * 100, 15); // Minimum 15% zoom
          setZoom(newZoom);
          console.log('Auto-zoomed to fit canvas in viewport:', newZoom + '%');
        } else {
          setZoom(100); // Reset to 100% if it fits
        }
      }
      
      canvas.renderAll();
      console.log('Image reset to fit canvas at scale:', scale);
    }
  }, []);

  // Fit canvas to viewport
  const fitToViewport = useCallback(() => {
    if (!fabricCanvasRef.current || containerSize.width === 0 || containerSize.height === 0) return;
    
    // Calculate scale needed to fit canvas in viewport with some padding
    const padding = 100; // 50px padding on each side
    const availableWidth = containerSize.width - padding;
    const availableHeight = containerSize.height - padding;
    
    const scaleX = availableWidth / canvasWidth;
    const scaleY = availableHeight / canvasHeight;
    const scale = Math.min(scaleX, scaleY, 1); // Don't zoom in beyond 100%
    
    const newZoom = Math.max(scale * 90, 15); // Minimum 15% zoom
    setZoom(newZoom);
    setPan({ x: 0, y: 0 }); // Center the canvas
    
    console.log('Fitted canvas to viewport at zoom:', newZoom + '%');
  }, [canvasWidth, canvasHeight, containerSize]);

  // Handle canvas resize from borders
  const handleResizeStart = useCallback((e: React.MouseEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Disable resize when image is loaded
    if (imageLoaded) {
      return;
    }
    
    setIsResizing(true);
    setResizeHandle(handle);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: canvasWidth,
      height: canvasHeight
    });
  }, [canvasWidth, canvasHeight, imageLoaded]);

  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !resizeHandle) return;
    
    const deltaX = e.clientX - resizeStart.x;
    const deltaY = e.clientY - resizeStart.y;
    
    let newWidth = resizeStart.width;
    let newHeight = resizeStart.height;
    
    switch (resizeHandle) {
      case 'se': // Southeast corner
        newWidth = Math.max(100, resizeStart.width + deltaX);
        newHeight = Math.max(100, resizeStart.height + deltaY);
        break;
      case 'sw': // Southwest corner
        newWidth = Math.max(100, resizeStart.width - deltaX);
        newHeight = Math.max(100, resizeStart.height + deltaY);
        break;
      case 'ne': // Northeast corner
        newWidth = Math.max(100, resizeStart.width + deltaX);
        newHeight = Math.max(100, resizeStart.height - deltaY);
        break;
      case 'nw': // Northwest corner
        newWidth = Math.max(100, resizeStart.width - deltaX);
        newHeight = Math.max(100, resizeStart.height - deltaY);
        break;
      case 'e': // East edge
        newWidth = Math.max(100, resizeStart.width + deltaX);
        break;
      case 'w': // West edge
        newWidth = Math.max(100, resizeStart.width - deltaX);
        break;
      case 'n': // North edge
        newHeight = Math.max(100, resizeStart.height - deltaY);
        break;
      case 's': // South edge
        newHeight = Math.max(100, resizeStart.height + deltaY);
        break;
    }
    
    // Only update state during resize, don't trigger expensive operations
    setCanvasWidth(newWidth);
    setCanvasHeight(newHeight);
  }, [isResizing, resizeHandle, resizeStart]);

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
    setResizeHandle(null);
    
    // Apply the final canvas update after resize ends
    if (fabricCanvasRef.current && isCanvasReady) {
      setTimeout(() => {
        if (fabricCanvasRef.current) {
          try {
            fabricCanvasRef.current.setDimensions({
              width: canvasWidth,
              height: canvasHeight
            });
            fabricCanvasRef.current.renderAll();
            console.log('Canvas dimensions updated after resize:', canvasWidth, 'x', canvasHeight);
          } catch (error) {
            console.error('Error updating canvas dimensions after resize:', error);
          }
        }
      }, 50);
    }
  }, [canvasWidth, canvasHeight, isCanvasReady]);

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
      fabricCanvasRef.current.renderAll();
    }
  }, []);

  // Handle container resize for responsive canvas
  const handleContainerResize = useCallback(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const newSize = {
      width: Math.round(rect.width),
      height: Math.round(rect.height)
    };
    
    // Only update if size actually changed
    if (newSize.width !== containerSize.width || newSize.height !== containerSize.height) {
      setContainerSize(newSize);
      console.log('Container resized to:', newSize.width, 'x', newSize.height);
    }
  }, [containerSize.width, containerSize.height]);

  // Update Fabric.js canvas when dimensions change (but not during resize)
  useEffect(() => {
    if (!fabricCanvasRef.current || !canvasRef.current || !isCanvasReady || isResizing) return;
    
    // Clear any existing timeout
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }
    
    // Add a small delay to ensure canvas is fully initialized
    resizeTimeoutRef.current = setTimeout(() => {
      if (!fabricCanvasRef.current || isResizing) return;
      
      // Check if the canvas is properly initialized
      try {
        console.log('Updating canvas dimensions to:', canvasWidth, 'x', canvasHeight);
        
        fabricCanvasRef.current.setDimensions({
          width: canvasWidth,
          height: canvasHeight
        });
        
        fabricCanvasRef.current.renderAll();
      } catch (error) {
        console.error('Error updating canvas dimensions:', error);
      }
    }, 100); // 100ms delay
    
    return () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [canvasWidth, canvasHeight, isCanvasReady, isResizing]);

  // Handle window resize for responsive canvas
  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout;
    
    const handleResize = () => {
      // Throttle resize events
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        handleContainerResize();
      }, 100);
    };

    // Initial size measurement
    handleContainerResize();

    // Add resize listener
    window.addEventListener('resize', handleResize);
    
    // Use ResizeObserver for more accurate container size changes
    let resizeObserver: ResizeObserver | null = null;
    if (containerRef.current) {
      resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [handleContainerResize]);

  // Handle resize mouse events
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => handleResizeMove(e);
    const handleMouseUp = () => handleResizeEnd();

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, handleResizeMove, handleResizeEnd]);

  // Initialize Fabric.js canvas (only once)
  useEffect(() => {
    if (!canvasRef.current || canvasInitializedRef.current || isResizing) return;

    console.log('Initializing Fabric.js canvas...');

    const fabricCanvas = new FabricCanvas(canvasRef.current, {
      width: canvasSize.width,
      height: canvasSize.height,
      backgroundColor: 'transparent',
      selection: true,
      preserveObjectStacking: true,
    });

    fabricCanvasRef.current = fabricCanvas;
    canvasInitializedRef.current = true;
    
    // Ensure canvas is fully initialized before setting ready
    setTimeout(() => {
      setIsCanvasReady(true);
      console.log('Fabric.js canvas initialized and ready');
    }, 50);

    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
      canvasInitializedRef.current = false;
      setIsCanvasReady(false);
    };
  }, [canvasSize.width, canvasSize.height, isResizing]); // Include dependencies but check for existing canvas

  // Load image when currentImage changes (with debouncing)
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

  // Load generated image immediately when it's available (with debouncing)
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

  // Ensure canvas is always interactive for editing
  useEffect(() => {
    if (!fabricCanvasRef.current || !isCanvasReady) return;
    
    const canvas = fabricCanvasRef.current;
    
    // Set up canvas for editing even when empty
    canvas.selection = true;
    canvas.preserveObjectStacking = true;
    
    // Enable interaction for all tools
    canvas.forEachObject((obj) => {
      obj.selectable = true;
      obj.evented = true;
    });
    
    canvas.renderAll();
    console.log('Canvas configured for editing');
  }, [isCanvasReady]);

  // Expose loadImageToCanvas function to parent component
  useEffect(() => {
    if (onImageLoad) {
      // Store the loadImageToCanvas function so it can be called directly
      (window as { loadImageToCanvas?: typeof loadImageToCanvas }).loadImageToCanvas = loadImageToCanvas;
    }
  }, [loadImageToCanvas, onImageLoad]);

  // Drawing functions
  const startDrawing = useCallback((pointer: { x: number; y: number }) => {
    if (!fabricCanvasRef.current) return;

    const path = new Path(`M ${pointer.x} ${pointer.y}`, {
      stroke: brushColor,
      strokeWidth: brushSize,
      fill: '',
      strokeLineCap: 'round',
      strokeLineJoin: 'round',
    });

    fabricCanvasRef.current.add(path);
    fabricCanvasRef.current.setActiveObject(path);
  }, [brushColor, brushSize]);

  const continueDrawing = useCallback((pointer: { x: number; y: number }) => {
    if (!fabricCanvasRef.current) return;

    const activeObject = fabricCanvasRef.current.getActiveObject() as Path;
    if (activeObject && activeObject.type === 'path') {
      const pathData = activeObject.path;
      pathData.push(['L', pointer.x, pointer.y]);
      activeObject.set('path', pathData);
      fabricCanvasRef.current.renderAll();
    }
  }, []);

  const startErasing = useCallback((pointer: { x: number; y: number }) => {
    if (!fabricCanvasRef.current) return;

    const path = new Path(`M ${pointer.x} ${pointer.y}`, {
      stroke: 'white',
      strokeWidth: brushSize * 2,
      fill: '',
      strokeLineCap: 'round',
      strokeLineJoin: 'round',
      globalCompositeOperation: 'destination-out',
    });

    fabricCanvasRef.current.add(path);
    fabricCanvasRef.current.setActiveObject(path);
  }, [brushSize]);

  const continueErasing = useCallback((pointer: { x: number; y: number }) => {
    if (!fabricCanvasRef.current) return;

    const activeObject = fabricCanvasRef.current.getActiveObject() as Path;
    if (activeObject && activeObject.type === 'path') {
      const pathData = activeObject.path;
      pathData.push(['L', pointer.x, pointer.y]);
      activeObject.set('path', pathData);
      fabricCanvasRef.current.renderAll();
    }
  }, []);

  // Text tool
  const addText = useCallback((pointer: { x: number; y: number }) => {
    if (!fabricCanvasRef.current) return;

    const text = new IText('Click to edit', {
      left: pointer.x,
      top: pointer.y,
      fontFamily: 'Arial',
      fontSize: 20,
      fill: brushColor,
    });

    fabricCanvasRef.current.add(text);
    fabricCanvasRef.current.setActiveObject(text);
    fabricCanvasRef.current.renderAll();
  }, [brushColor]);

  // Shape tools
  const addShape = useCallback((pointer: { x: number; y: number }) => {
    if (!fabricCanvasRef.current) return;

    const rect = new Rect({
      left: pointer.x,
      top: pointer.y,
      width: 100,
      height: 100,
      fill: 'transparent',
      stroke: brushColor,
      strokeWidth: 2,
    });

    fabricCanvasRef.current.add(rect);
    fabricCanvasRef.current.setActiveObject(rect);
    fabricCanvasRef.current.renderAll();
  }, [brushColor]);

  // Handle canvas mouse events
  const handleCanvasMouseDown = useCallback((opt: any) => {
    if (!fabricCanvasRef.current) return;

    const pointer = fabricCanvasRef.current.getPointer(opt.e);
    
    switch (activeTool) {
      case 'brush':
        setIsDrawing(true);
        startDrawing(pointer);
        break;
      case 'eraser':
        setIsDrawing(true);
        startErasing(pointer);
        break;
      case 'text':
        addText(pointer);
        break;
      case 'shape':
        addShape(pointer);
        break;
    }
  }, [activeTool, startDrawing, startErasing, addText, addShape]);

  const handleCanvasMouseMove = useCallback((opt: any) => {
    if (!fabricCanvasRef.current || !isDrawing) return;

    const pointer = fabricCanvasRef.current.getPointer(opt.e);
    
    switch (activeTool) {
      case 'brush':
        continueDrawing(pointer);
        break;
      case 'eraser':
        continueErasing(pointer);
        break;
    }
  }, [activeTool, isDrawing, continueDrawing, continueErasing]);

  const handleCanvasMouseUp = useCallback(() => {
    setIsDrawing(false);
  }, []);

  // Set up canvas event listeners
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    canvas.on('mouse:down', handleCanvasMouseDown);
    canvas.on('mouse:move', handleCanvasMouseMove);
    canvas.on('mouse:up', handleCanvasMouseUp);

    return () => {
      canvas.off('mouse:down', handleCanvasMouseDown);
      canvas.off('mouse:move', handleCanvasMouseMove);
      canvas.off('mouse:up', handleCanvasMouseUp);
    };
  }, [handleCanvasMouseDown, handleCanvasMouseMove, handleCanvasMouseUp]);

  // Update canvas when currentImage changes
  useEffect(() => {
    if (currentImage && fabricCanvasRef.current) {
      loadImageToCanvas(currentImage);
    }
  }, [currentImage, loadImageToCanvas]);

  // Update tool behavior
  useEffect(() => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    
    switch (activeTool) {
      case 'select':
        canvas.isDrawingMode = false;
        canvas.selection = true;
        canvas.forEachObject((obj: FabricObject) => {
          obj.selectable = true;
          obj.evented = true;
        });
        break;
      case 'brush':
      case 'eraser':
        canvas.isDrawingMode = false;
        canvas.selection = false;
        canvas.forEachObject((obj: FabricObject) => {
          obj.selectable = false;
          obj.evented = false;
        });
        break;
      case 'hand':
        canvas.isDrawingMode = false;
        canvas.selection = false;
        canvas.forEachObject((obj: FabricObject) => {
          obj.selectable = false;
          obj.evented = false;
        });
        break;
      default:
        canvas.isDrawingMode = false;
        canvas.selection = true;
        canvas.forEachObject((obj: FabricObject) => {
          obj.selectable = true;
          obj.evented = true;
        });
    }
    
    canvas.renderAll();
  }, [activeTool]);

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 25, 400));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 25, 25));
  }, []);

  const handleResetView = useCallback(() => {
    setZoom(100);
    setPan({ x: 0, y: 0 });
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (activeTool === 'hand' || (e.button === 1)) { // Middle mouse button or hand tool
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      e.preventDefault();
    }
  }, [activeTool, pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -10 : 10;
    setZoom(prev => Math.max(25, Math.min(400, prev + delta)));
  }, []);

  // Export canvas as image
  const exportCanvas = useCallback(() => {
    if (!fabricCanvasRef.current) return;
    
    const dataURL = fabricCanvasRef.current.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 1
    });
    
    // Create download link
    const link = document.createElement('a');
    link.download = 'edited-image.png';
    link.href = dataURL;
    link.click();
  }, []);

    // Clear canvas
  const clearCanvas = useCallback(() => {
    if (!fabricCanvasRef.current) return;
    
    // Clear all objects but preserve the canvas structure
    const canvas = fabricCanvasRef.current;
    const objects = canvas.getObjects();
    objects.forEach(obj => {
      canvas.remove(obj);
    });
    
    canvas.renderAll();
    setImageLoaded(false);
  }, []);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || isLoadingImage) return;

    console.log('File selected:', file.name, file.type, file.size);

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target?.result as string;
      console.log('File read successfully, calling onImageLoad...');
      onImageLoad?.(imageData);
    };
    reader.onerror = (error) => {
      console.error('Error reading file:', error);
  };
    reader.readAsDataURL(file);
    
    // Clear the input to allow selecting the same file again
    e.target.value = '';
  }, [onImageLoad, isLoadingImage]);

  return (
    <div className="flex-1 relative overflow-hidden bg-gray-100 dark:bg-black">
      {/* Tool Options Panel */}
      {(activeTool === 'brush' || activeTool === 'eraser' || activeTool === 'text' || activeTool === 'shape') && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-xl p-3 shadow-lg border border-gray-200 dark:border-gray-800"
        >
          <div className="flex items-center gap-4">
            {activeTool === 'brush' && (
              <>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Size:</label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className="w-20"
                  />
                  <span className="text-xs text-gray-500 w-8">{brushSize}</span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Color:</label>
                  <input
                    type="color"
                    value={brushColor}
                    onChange={(e) => setBrushColor(e.target.value)}
                    className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600"
                  />
                </div>
              </>
            )}
            {activeTool === 'eraser' && (
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Size:</label>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="w-20"
                />
                <span className="text-xs text-gray-500 w-8">{brushSize}</span>
              </div>
            )}
            {activeTool === 'text' && (
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Color:</label>
                <input
                  type="color"
                  value={brushColor}
                  onChange={(e) => setBrushColor(e.target.value)}
                  className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600"
                />
              </div>
            )}
            {activeTool === 'shape' && (
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Color:</label>
                <input
                  type="color"
                  value={brushColor}
                  onChange={(e) => setBrushColor(e.target.value)}
                  className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600"
                />
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Canvas Container */}
      <div 
        ref={containerRef}
        className="w-full h-full relative cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onContextMenu={handleContextMenu}
        style={{
          minHeight: '400px', // Ensure minimum height
          minWidth: '300px'   // Ensure minimum width
        }}
      >
        <motion.div
          className="absolute top-1/2 left-1/2 origin-center"
          style={{
            transform: `translate(-50%, -50%) translate(${pan.x}px, ${pan.y}px) scale(${zoom / 100})`,
            willChange: 'transform'
          }}
        >
          {/* Canvas Shadow */}
          <div className="absolute -inset-2 bg-black/20 blur-lg rounded-lg" />
          
          {/* Checkerboard Background */}
          <div 
            className="absolute inset-0 rounded-lg"
            style={{
              background: `
                repeating-conic-gradient(#ffffff 0% 25%, #c0c0c0 0% 50%) 50% / 12px 12px
              `
            }}
          />
          
          {/* Main Canvas */}
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            className={`absolute inset-0 rounded-lg shadow-2xl border transition-colors ${
              isResizing 
                ? 'border-blue-500 border-2' 
                : 'border-gray-300 dark:border-gray-600'
            }`}
            style={{
              imageRendering: zoom > 200 ? 'pixelated' : 'auto',
              cursor: isResizing ? 'grabbing' : 
                      activeTool === 'hand' ? 'grab' : 
                      activeTool === 'brush' ? 'crosshair' :
                      activeTool === 'eraser' ? 'crosshair' :
                      activeTool === 'text' ? 'text' :
                      activeTool === 'shape' ? 'crosshair' :
                      activeTool === 'crop' ? 'crosshair' : 'default',
              backgroundColor: 'transparent'
            }}
          />

          {/* Resize Handles - only show when no image is loaded */}
          {!imageLoaded && (
            <>
              {/* Corner handles */}
              <div
                className="absolute w-3 h-3 bg-blue-500 border border-white rounded-full cursor-nw-resize hover:bg-blue-600 transition-colors"
                style={{ top: -6, left: -6 }}
                onMouseDown={(e) => handleResizeStart(e, 'nw')}
                title="Resize from top-left"
              />
              <div
                className="absolute w-3 h-3 bg-blue-500 border border-white rounded-full cursor-ne-resize hover:bg-blue-600 transition-colors"
                style={{ top: -6, right: -6 }}
                onMouseDown={(e) => handleResizeStart(e, 'ne')}
                title="Resize from top-right"
              />
              <div
                className="absolute w-3 h-3 bg-blue-500 border border-white rounded-full cursor-sw-resize hover:bg-blue-600 transition-colors"
                style={{ bottom: -6, left: -6 }}
                onMouseDown={(e) => handleResizeStart(e, 'sw')}
                title="Resize from bottom-left"
              />
              <div
                className="absolute w-3 h-3 bg-blue-500 border border-white rounded-full cursor-se-resize hover:bg-blue-600 transition-colors"
                style={{ bottom: -6, right: -6 }}
                onMouseDown={(e) => handleResizeStart(e, 'se')}
                title="Resize from bottom-right"
              />

              {/* Edge handles */}
              <div
                className="absolute w-3 h-3 bg-blue-500 border border-white rounded-full cursor-n-resize hover:bg-blue-600 transition-colors"
                style={{ top: -6, left: '50%', transform: 'translateX(-50%)' }}
                onMouseDown={(e) => handleResizeStart(e, 'n')}
                title="Resize from top"
              />
              <div
                className="absolute w-3 h-3 bg-blue-500 border border-white rounded-full cursor-s-resize hover:bg-blue-600 transition-colors"
                style={{ bottom: -6, left: '50%', transform: 'translateX(-50%)' }}
                onMouseDown={(e) => handleResizeStart(e, 's')}
                title="Resize from bottom"
              />
              <div
                className="absolute w-3 h-3 bg-blue-500 border border-white rounded-full cursor-w-resize hover:bg-blue-600 transition-colors"
                style={{ left: -6, top: '50%', transform: 'translateY(-50%)' }}
                onMouseDown={(e) => handleResizeStart(e, 'w')}
                title="Resize from left"
              />
              <div
                className="absolute w-3 h-3 bg-blue-500 border border-white rounded-full cursor-e-resize hover:bg-blue-600 transition-colors"
                style={{ right: -6, top: '50%', transform: 'translateY(-50%)' }}
                onMouseDown={(e) => handleResizeStart(e, 'e')}
                title="Resize from right"
              />
            </>
          )}
          
          {/* Loading Indicator */}
          {isLoadingImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-lg flex items-center justify-center z-10"
            >
              <div className="bg-white/90 dark:bg-gray-900/90 rounded-xl p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Loading image...
                  </span>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Canvas Overlay for Tools */}
          <div className="absolute inset-0 pointer-events-none">
            {activeTool === 'generate' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 border-2 border-dashed border-blue-500 rounded-lg"
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-center text-blue-600 dark:text-blue-400">
                    <ZoomInIcon className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm font-medium">Generation Mode</p>
                    <p className="text-xs opacity-70">Click to place generated image</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Inpaint Mode Overlay */}
            {activeTool === 'inpaint' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 border-2 border-dashed border-purple-500 rounded-lg"
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-purple-500/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-center text-purple-600 dark:text-purple-400">
                    <ZoomInIcon className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm font-medium">Inpaint Mode</p>
                    <p className="text-xs opacity-70">Select area to edit with AI</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Inpaint Processing Animation */}
            {isInpaintMode && isGenerating && currentImage && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: [0, 0.8, 0.4, 0.8, 0.2, 0.6, 0.1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg backdrop-blur-sm"
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 0.9, 1.05, 0.95, 1],
                      rotate: [0, 5, -5, 2, -2, 0]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-purple-600 dark:text-purple-400"
                  >
                    <ZoomInIcon className="w-12 h-12 mx-auto mb-2" />
                  </motion.div>
                  <motion.p 
                    className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
                    animate={{ opacity: [0.7, 1, 0.5, 1, 0.6] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    ✨ AI is editing your image... ✨
                  </motion.p>
                  <motion.p 
                    className="text-sm text-gray-500 dark:text-gray-400 mt-1"
                    animate={{ opacity: [0.5, 0.8, 0.3, 0.9, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    Your enhanced image will appear soon
                  </motion.p>
                </div>
              </motion.div>
            )}
            
            {/* Magical Generation Animation */}
            {isGenerating && !currentImage && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-600/5 rounded-lg overflow-hidden"
              >
                {/* Floating Sparkles */}
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"
                    initial={{ 
                      x: Math.random() * 100 + '%',
                      y: Math.random() * 100 + '%',
                      scale: 0,
                      opacity: 0
                    }}
                    animate={{ 
                      x: Math.random() * 100 + '%',
                      y: Math.random() * 100 + '%',
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: "easeInOut"
                    }}
                  />
                ))}
                
                {/* Central Magic Circle */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <motion.div
                    className="w-32 h-32 border-2 border-gradient-to-r from-blue-400 to-purple-500 rounded-full border-dashed"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  >
                    <motion.div
                      className="absolute inset-4 border border-blue-300 dark:border-blue-600 rounded-full border-dotted"
                      animate={{ rotate: -360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />
                  </motion.div>
                  
                  {/* Magic Wand Icon */}
                  <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500 dark:text-blue-400"
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <ZoomInIcon className="w-8 h-8" />
                  </motion.div>
                </div>
                
                {/* Magical Text */}
                <motion.div
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <motion.p 
                    className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    ✨ AI is creating magic... ✨
                  </motion.p>
                  <motion.p 
                    className="text-sm text-gray-500 dark:text-gray-400 mt-1"
                    animate={{ opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                  >
                    Your image will appear here soon
                  </motion.p>
                </motion.div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Zoom Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-4 left-4 flex items-center gap-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-xl p-2 shadow-lg border border-gray-200 dark:border-gray-800"
      >
        <Button
          variant="ghost"
          size="1"
          onClick={handleZoomOut}
          disabled={zoom <= 25}
        >
          <ZoomOutIcon className="w-4 h-4" />
        </Button>
        
        <div className="px-3 py-1 text-sm font-mono min-w-[60px] text-center">
          {zoom}%
        </div>
        
        <Button
          variant="ghost"
          size="1"
          onClick={handleZoomIn}
          disabled={zoom >= 400}
        >
          <ZoomInIcon className="w-4 h-4" />
        </Button>
        
        <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1" />
        
        <Button
          variant="ghost"
          size="1"
          onClick={handleResetView}
        >
          <ResetIcon className="w-4 h-4" />
        </Button>
        
        <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1" />
        
        <Button
          variant="ghost"
          size="1"
          onClick={fitToViewport}
          title="Fit to viewport"
        >
          <FrameIcon className="w-4 h-4" />
        </Button>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-4 right-4 flex items-center gap-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-xl p-2 shadow-lg border border-gray-200 dark:border-gray-800"
      >
        <Button
          variant="ghost"
          size="1"
          onClick={clearCanvas}
          title="Clear Canvas"
        >
          <ResetIcon className="w-4 h-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="1"
          onClick={exportCanvas}
          title="Export Image"
        >
          <ZoomInIcon className="w-4 h-4" />
        </Button>
      </motion.div>

      {/* Canvas Size Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-4 left-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-xl p-3 shadow-lg border border-gray-200 dark:border-gray-800"
      >
        <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Canvas Size</div>
        <div className="flex gap-2 items-center mb-2">
          <div className="flex items-center gap-1">
            <label className="text-xs text-gray-500">W:</label>
            <input
              type="number"
              value={canvasWidth}
              onChange={(e) => resizeCanvas(parseInt(e.target.value) || 100, canvasHeight)}
              className="w-16 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              min="100"
              max="4000"
            />
          </div>
          <div className="flex items-center gap-1">
            <label className="text-xs text-gray-500">H:</label>
            <input
              type="number"
              value={canvasHeight}
              onChange={(e) => resizeCanvas(canvasWidth, parseInt(e.target.value) || 100)}
              className="w-16 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              min="100"
              max="4000"
            />
          </div>
        </div>
        {imageLoaded && (
          <button
            onClick={resetImageToFit}
            className="w-full px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors flex items-center justify-center gap-1"
            title="Reset image to fit canvas"
          >
            <FrameIcon className="w-3 h-3" />
            Fit Image
          </button>
        )}
      </motion.div>

      {/* Canvas Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-4 right-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-xl p-3 shadow-lg border border-gray-200 dark:border-gray-800"
      >
        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <div className="font-mono">{canvasSize.width} × {canvasSize.height} px</div>
          <div className="font-mono text-gray-500">Viewport: {containerSize.width} × {containerSize.height} px</div>
          <div className="font-medium">Active: {activeTool}</div>
          <div className="font-medium">Zoom: {zoom}%</div>
          {isResizing && (
            <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span>Resizing canvas</span>
            </div>
          )}
          {imageLoaded ? (
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>Image loaded</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span>Ready for editing</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* File Upload Area (when no image) */}
      <AnimatePresence>
        {!imageLoaded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-4 left-1/2 transform -translate-x-1/2"
          >
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <motion.div
                className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl p-3 shadow-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3">
                  <ZoomInIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <div className="text-sm">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Upload Image</span>
                    <span className="text-gray-500 dark:text-gray-400 ml-2">or start editing with tools</span>
                    </div>
                  <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-xs">
                    Browse
                  </div>
                </div>
              </motion.div>
            </label>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Context Menu */}
      <ContextMenu
        isOpen={contextMenu.isOpen}
        position={{ x: contextMenu.x, y: contextMenu.y }}
        onClose={handleContextMenuClose}
        onResize={handleResizeFromMenu}
        onDownload={handleDownload}
        onUpload={() => document.getElementById('file-upload')?.click()}
        onClear={handleClearCanvas}
        hasImage={imageLoaded}
      />

      {/* Resize Dialog */}
      <ResizeDialog
        isOpen={isResizeDialogOpen}
        onClose={() => setIsResizeDialogOpen(false)}
        currentWidth={canvasWidth}
        currentHeight={canvasHeight}
        onResize={handleResizeFromDialog}
      />
    </div>
  );
}