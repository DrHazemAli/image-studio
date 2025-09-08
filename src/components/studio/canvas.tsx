'use client';

import MainCanvas from '@/components/studio/canvas/main-canvas';

interface CanvasProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  activeTool: any;
  currentImage?: string | null;
  onImageLoad?: (imageData: string) => void;
  isGenerating?: boolean;
  isInpaintMode?: boolean;
  generatedImage?: string | null;
  // Menu Bar Integration: External zoom control props
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
}

// Menu Bar Integration: Canvas wrapper component
// This component passes through zoom control props from the menu bar to the main canvas
export function Canvas({ activeTool, currentImage, onImageLoad, isGenerating = false, isInpaintMode = false, generatedImage, zoom, onZoomChange }: CanvasProps) {
  return (
    <MainCanvas
      activeTool={activeTool}
      currentImage={currentImage}
      onImageLoad={onImageLoad}
      isGenerating={isGenerating}
      isInpaintMode={isInpaintMode}
      generatedImage={generatedImage}
      zoom={zoom}
      onZoomChange={onZoomChange}
    />
  );
}
