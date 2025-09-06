'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomInIcon, ZoomOutIcon, ResetIcon } from '@radix-ui/react-icons';
import { Button } from '@radix-ui/themes';
import { Tool } from './toolbar';

interface CanvasProps {
  activeTool: Tool;
  currentImage?: string | null;
  onImageLoad?: (imageData: string) => void;
  isGenerating?: boolean;
}

interface Layer {
  id: string;
  name: string;
  imageData?: string;
  visible: boolean;
  opacity: number;
  blendMode: string;
}

export function Canvas({ activeTool, currentImage, onImageLoad, isGenerating = false }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(100);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [layers, setLayers] = useState<Layer[]>([
    {
      id: 'background',
      name: 'Background',
      visible: true,
      opacity: 100,
      blendMode: 'normal'
    }
  ]);
  const [canvasSize, setCanvasSize] = useState({ width: 1024, height: 1024 });

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

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw checkerboard background
    const cellSize = 20;
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#e0e0e0';
    for (let x = 0; x < canvas.width; x += cellSize) {
      for (let y = 0; y < canvas.height; y += cellSize) {
        if ((x / cellSize + y / cellSize) % 2) {
          ctx.fillRect(x, y, cellSize, cellSize);
        }
      }
    }

    // Draw current image if available
    if (currentImage) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = currentImage;
    }
  }, [currentImage]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target?.result as string;
      onImageLoad?.(imageData);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex-1 relative overflow-hidden bg-gray-100 dark:bg-black">
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
          
          {/* Main Canvas */}
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            className="bg-white rounded-lg shadow-2xl border border-gray-300 dark:border-gray-600"
            style={{
              imageRendering: zoom > 200 ? 'pixelated' : 'auto'
            }}
          />
          
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

      {/* Canvas Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-4 right-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-xl p-3 shadow-lg border border-gray-200 dark:border-gray-800"
      >
        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <div className="font-mono">{canvasSize.width} × {canvasSize.height} px</div>
          <div className="font-medium">Active: {activeTool}</div>
        </div>
      </motion.div>

      {/* File Upload Area (when no image) */}
      <AnimatePresence>
        {!currentImage && (
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