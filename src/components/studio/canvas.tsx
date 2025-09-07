'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomInIcon, ZoomOutIcon, ResetIcon } from '@radix-ui/react-icons';
import { Button } from '@radix-ui/themes';
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
  const [canvasSize] = useState({ width: 1024, height: 1024 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(10);
  const [brushColor, setBrushColor] = useState('#000000');
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);


  // Load image to Fabric.js canvas
  const loadImageToCanvas = useCallback((imageData: string) => {
    if (!fabricCanvasRef.current) return;

    console.log('Loading image to canvas:', imageData.substring(0, 50) + '...');
    setIsLoadingImage(true);

    FabricImage.fromURL(imageData).then((img: FabricImage) => {
      if (!fabricCanvasRef.current) return;
      
      console.log('Image loaded successfully:', img.width, img.height);
      
      // Clear existing objects
      const canvas = fabricCanvasRef.current;
      const objects = canvas.getObjects();
      objects.forEach(obj => {
        canvas.remove(obj);
      });
      
      // Scale image to fit canvas while maintaining aspect ratio
      const canvasWidth = canvas.width!;
      const canvasHeight = canvas.height!;
      const imgWidth = img.width!;
      const imgHeight = img.height!;
      
      // Calculate scale to fit canvas (allow scaling up if image is smaller)
      const scaleX = canvasWidth / imgWidth;
      const scaleY = canvasHeight / imgHeight;
      const scale = Math.min(scaleX, scaleY); // Remove the ", 1" to allow scaling up
      
      img.scale(scale);
      
      // Center the image on canvas
      const scaledWidth = imgWidth * scale;
      const scaledHeight = imgHeight * scale;
      const left = (canvasWidth - scaledWidth) / 2;
      const top = (canvasHeight - scaledHeight) / 2;
      
      img.set({
        left: left,
        top: top,
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
      console.log('Image added to canvas and rendered at position:', left, top, 'scale:', scale);
      setIsLoadingImage(false);
      setImageLoaded(true);
    }).catch((error) => {
      console.error('Error loading image:', error);
      setIsLoadingImage(false);
    });
  }, []);

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    console.log('Initializing Fabric.js canvas...');

    const fabricCanvas = new FabricCanvas(canvasRef.current, {
      width: canvasSize.width,
      height: canvasSize.height,
      backgroundColor: 'transparent',
      selection: true,
      preserveObjectStacking: true,
    });

    fabricCanvasRef.current = fabricCanvas;
    console.log('Fabric.js canvas initialized');

    return () => {
      fabricCanvas.dispose();
    };
  }, [canvasSize.width, canvasSize.height]);

  // Load image when currentImage changes
  useEffect(() => {
    if (currentImage && fabricCanvasRef.current) {
      console.log('Current image changed, loading to canvas...', currentImage.substring(0, 50) + '...');
      loadImageToCanvas(currentImage);
    }
  }, [currentImage, loadImageToCanvas]);

  // Load generated image immediately when it's available
  useEffect(() => {
    if (generatedImage && fabricCanvasRef.current) {
      console.log('Generated image received, loading to canvas...', generatedImage.substring(0, 50) + '...');
      loadImageToCanvas(generatedImage);
    }
  }, [generatedImage, loadImageToCanvas]);

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('File selected:', file.name, file.type, file.size);

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target?.result as string;
      console.log('File read successfully, calling onImageLoad...');
      onImageLoad?.(imageData);
      
      // Also try to load directly to canvas as fallback
      if (fabricCanvasRef.current) {
        console.log('Loading image directly to canvas as fallback...');
        loadImageToCanvas(imageData);
      }
    };
    reader.onerror = (error) => {
      console.error('Error reading file:', error);
    };
    reader.readAsDataURL(file);
  };

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
            className="absolute inset-0 rounded-lg shadow-2xl border border-gray-300 dark:border-gray-600"
            style={{
              imageRendering: zoom > 200 ? 'pixelated' : 'auto',
              cursor: activeTool === 'hand' ? 'grab' : 
                      activeTool === 'brush' ? 'crosshair' :
                      activeTool === 'eraser' ? 'crosshair' :
                      activeTool === 'text' ? 'text' :
                      activeTool === 'shape' ? 'crosshair' :
                      activeTool === 'crop' ? 'crosshair' : 'default',
              backgroundColor: 'transparent'
            }}
          />
          
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

      {/* Canvas Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-4 right-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-xl p-3 shadow-lg border border-gray-200 dark:border-gray-800"
      >
        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <div className="font-mono">{canvasSize.width} × {canvasSize.height} px</div>
          <div className="font-medium">Active: {activeTool}</div>
          {imageLoaded && (
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>Image loaded</span>
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
            className="absolute inset-0 flex items-center justify-center"
          >
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <motion.div
                className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-12 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-center">
                  <ZoomInIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Start Creating
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Upload an image to edit or use AI tools to generate new content
                  </p>
                  <div className="flex gap-2 justify-center">
                    <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-sm">
                      Upload Image
                    </div>
                    <div className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg text-sm">
                      AI Generate
                    </div>
                  </div>
                </div>
              </motion.div>
            </label>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}