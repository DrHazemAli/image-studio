'use client';

import React, { forwardRef } from 'react';
import MainCanvas, {
  type MainCanvasRef,
} from '@/components/studio/canvas/main-canvas';

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
  // Asset Store props
  showAssetStore?: boolean;
  onAssetStoreToggle?: () => void;
  onAssetSelect?: (asset: any) => void;
  projectId?: string;
}

// Menu Bar Integration: Canvas wrapper component
// This component passes through zoom control props from the menu bar to the main canvas
export const Canvas = forwardRef<MainCanvasRef, CanvasProps>(
  (
    {
      activeTool,
      currentImage,
      onImageLoad,
      isGenerating = false,
      isInpaintMode = false,
      generatedImage,
      zoom,
      onZoomChange,
      showAssetStore,
      onAssetStoreToggle,
      onAssetSelect,
      projectId,
    },
    ref
  ) => {
    return (
      <MainCanvas
        ref={ref}
        activeTool={activeTool}
        currentImage={currentImage}
        onImageLoad={onImageLoad}
        isGenerating={isGenerating}
        isInpaintMode={isInpaintMode}
        generatedImage={generatedImage}
        zoom={zoom}
        onZoomChange={onZoomChange}
        showAssetStore={showAssetStore}
        onAssetStoreToggle={onAssetStoreToggle}
        onAssetSelect={onAssetSelect}
        projectId={projectId}
      />
    );
  }
);

Canvas.displayName = 'Canvas';
