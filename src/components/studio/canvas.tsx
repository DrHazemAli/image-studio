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
}

export function Canvas({ activeTool, currentImage, onImageLoad, isGenerating = false, isInpaintMode = false, generatedImage }: CanvasProps) {
  return (
    <MainCanvas
      activeTool={activeTool}
      currentImage={currentImage}
      onImageLoad={onImageLoad}
      isGenerating={isGenerating}
      isInpaintMode={isInpaintMode}
      generatedImage={generatedImage}
    />
  );
}
