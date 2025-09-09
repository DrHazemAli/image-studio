"use client";

import React, { useEffect, useCallback } from "react";
import { Canvas as FabricCanvas, FabricObject } from "fabric";
import { Tool } from "../toolbar";
import { ZOOM_CONSTANTS } from "@/lib/constants";

interface CanvasViewportProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  fabricCanvasRef: React.RefObject<FabricCanvas | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  canvasInitializedRef: React.RefObject<boolean>;
  resizeTimeoutRef: React.RefObject<NodeJS.Timeout | null>;
  zoom: number;
  pan: { x: number; y: number };
  isDragging: boolean;
  dragStart: { x: number; y: number };
  isDrawing: boolean;
  brushSize: number;
  brushColor: string;
  isLoadingImage: boolean;
  // Removed unused props
  imageLoaded: boolean;
  canvasWidth: number;
  canvasHeight: number;
  isCanvasReady: boolean;
  containerSize: { width: number; height: number };
  isResizing: boolean;
  resizeHandle: string | null;
  resizeStart: { x: number; y: number; width: number; height: number };
  activeTool: Tool;
  onZoomChange: (zoom: number) => void;
  onPanChange: (pan: { x: number; y: number }) => void;
  onIsDraggingChange: (isDragging: boolean) => void;
  onDragStartChange: (dragStart: { x: number; y: number }) => void;
  onIsDrawingChange: (isDrawing: boolean) => void;
  onBrushSizeChange: (brushSize: number) => void;
  onBrushColorChange: (brushColor: string) => void;
  onImageLoadedChange: (imageLoaded: boolean) => void;
  onDeleteSelected: () => void;
  // Removed unused callback props
  onCanvasWidthChange: (width: number) => void;
  onCanvasHeightChange: (height: number) => void;
  onIsCanvasReadyChange: (ready: boolean) => void;
  onContainerSizeChange: (size: { width: number; height: number }) => void;
  onIsResizingChange: (resizing: boolean) => void;
  onResizeHandleChange: (handle: string | null) => void;
  onResizeStartChange: (start: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

export default function CanvasViewport({
  canvasRef,
  fabricCanvasRef,
  containerRef,
  canvasInitializedRef,
  resizeTimeoutRef,
  zoom,
  pan,
  isDragging,
  dragStart,
  isDrawing,
  brushSize,
  brushColor,
  isLoadingImage,
  // Removed unused parameters
  imageLoaded,
  canvasWidth,
  canvasHeight,
  isCanvasReady,
  containerSize,
  isResizing,
  resizeHandle,
  resizeStart,
  activeTool,
  onZoomChange,
  onPanChange,
  onIsDraggingChange,
  onDragStartChange,
  onIsDrawingChange,
  onBrushSizeChange,
  onBrushColorChange,
  onImageLoadedChange,
  onDeleteSelected,
  // Removed unused callback parameters
  onCanvasWidthChange,
  onCanvasHeightChange,
  onIsCanvasReadyChange,
  onContainerSizeChange,
  onIsResizingChange,
  onResizeHandleChange,
  onResizeStartChange,
  onContextMenu,
}: CanvasViewportProps) {
  // Handle canvas mouse events
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (activeTool === "hand") {
        onIsDraggingChange(true);
        onDragStartChange({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      }
    },
    [activeTool, pan, onIsDraggingChange, onDragStartChange],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging && activeTool === "hand") {
        onPanChange({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        });
      }
    },
    [isDragging, activeTool, dragStart, onPanChange],
  );

  const handleMouseUp = useCallback(() => {
    onIsDraggingChange(false);
  }, [onIsDraggingChange]);

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -10 : 10;
      onZoomChange(
        Math.max(
          ZOOM_CONSTANTS.MIN_ZOOM,
          Math.min(ZOOM_CONSTANTS.MAX_ZOOM, zoom + delta),
        ),
      );
    },
    [zoom, onZoomChange],
  );

  // Handle canvas resize from borders
  const handleResizeStart = useCallback(
    (e: React.MouseEvent, handle: string) => {
      e.preventDefault();
      e.stopPropagation();

      // Disable resize when image is loaded
      if (imageLoaded) {
        return;
      }

      onIsResizingChange(true);
      onResizeHandleChange(handle);
      onResizeStartChange({
        x: e.clientX,
        y: e.clientY,
        width: canvasWidth,
        height: canvasHeight,
      });
    },
    [
      canvasWidth,
      canvasHeight,
      imageLoaded,
      onIsResizingChange,
      onResizeHandleChange,
      onResizeStartChange,
    ],
  );

  const handleResizeMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing || !resizeHandle) return;

      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;

      let newWidth = resizeStart.width;
      let newHeight = resizeStart.height;

      switch (resizeHandle) {
        case "se": // Southeast corner
          newWidth = Math.max(100, resizeStart.width + deltaX);
          newHeight = Math.max(100, resizeStart.height + deltaY);
          break;
        case "sw": // Southwest corner
          newWidth = Math.max(100, resizeStart.width - deltaX);
          newHeight = Math.max(100, resizeStart.height + deltaY);
          break;
        case "ne": // Northeast corner
          newWidth = Math.max(100, resizeStart.width + deltaX);
          newHeight = Math.max(100, resizeStart.height - deltaY);
          break;
        case "nw": // Northwest corner
          newWidth = Math.max(100, resizeStart.width - deltaX);
          newHeight = Math.max(100, resizeStart.height - deltaY);
          break;
        case "e": // East edge
          newWidth = Math.max(100, resizeStart.width + deltaX);
          break;
        case "w": // West edge
          newWidth = Math.max(100, resizeStart.width - deltaX);
          break;
        case "n": // North edge
          newHeight = Math.max(100, resizeStart.height - deltaY);
          break;
        case "s": // South edge
          newHeight = Math.max(100, resizeStart.height + deltaY);
          break;
      }

      // Only update state during resize, don't trigger expensive operations
      onCanvasWidthChange(newWidth);
      onCanvasHeightChange(newHeight);
    },
    [
      isResizing,
      resizeHandle,
      resizeStart,
      onCanvasWidthChange,
      onCanvasHeightChange,
    ],
  );

  const handleResizeEnd = useCallback(() => {
    onIsResizingChange(false);
    onResizeHandleChange(null);

    // Apply the final canvas update after resize ends
    if (fabricCanvasRef.current && isCanvasReady) {
      setTimeout(() => {
        if (fabricCanvasRef.current) {
          try {
            fabricCanvasRef.current.setDimensions({
              width: canvasWidth,
              height: canvasHeight,
            });
            fabricCanvasRef.current.renderAll();
            console.log(
              "Canvas dimensions updated after resize:",
              canvasWidth,
              "x",
              canvasHeight,
            );
          } catch (error) {
            console.error(
              "Error updating canvas dimensions after resize:",
              error,
            );
          }
        }
      }, 50);
    }
  }, [
    canvasWidth,
    canvasHeight,
    isCanvasReady,
    fabricCanvasRef,
    onIsResizingChange,
    onResizeHandleChange,
  ]);

  // Handle container resize for responsive canvas
  const handleContainerResize = useCallback(() => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const newSize = {
      width: Math.round(rect.width),
      height: Math.round(rect.height),
    };

    if (
      newSize.width !== containerSize.width ||
      newSize.height !== containerSize.height
    ) {
      onContainerSizeChange(newSize);
      console.log("Container resized to:", newSize.width, "x", newSize.height);
    }
  }, [
    containerSize.width,
    containerSize.height,
    onContainerSizeChange,
    containerRef,
  ]);

  // Memoized resize handle handlers
  const createResizeHandler = useCallback(
    (handle: string) => {
      return (e: React.MouseEvent) => handleResizeStart(e, handle);
    },
    [handleResizeStart],
  );

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (!canvasRef.current || canvasInitializedRef.current || isResizing)
      return;

    console.log("Initializing Fabric.js canvas...");

    const fabricCanvas = new FabricCanvas(canvasRef.current, {
      width: canvasWidth,
      height: canvasHeight,
      backgroundColor: "transparent",
      selection: true,
      preserveObjectStacking: true,
    });

    fabricCanvasRef.current = fabricCanvas;
    canvasInitializedRef.current = true;

    // Ensure canvas is fully initialized before setting ready
    setTimeout(() => {
      onIsCanvasReadyChange(true);
      console.log("Fabric.js canvas initialized and ready");
    }, 50);

    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
      canvasInitializedRef.current = false;
      onIsCanvasReadyChange(false);
    };
  }, [
    canvasWidth,
    canvasHeight,
    isResizing,
    canvasRef,
    fabricCanvasRef,
    canvasInitializedRef,
    onIsCanvasReadyChange,
  ]);

  // Update Fabric.js canvas when dimensions change
  useEffect(() => {
    if (
      !fabricCanvasRef.current ||
      !canvasRef.current ||
      !isCanvasReady ||
      isResizing
    )
      return;

    // Clear any existing timeout
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }

    // Add a small delay to ensure canvas is fully initialized
    resizeTimeoutRef.current = setTimeout(() => {
      if (!fabricCanvasRef.current || isResizing) return;

      // Check if the canvas is properly initialized
      try {
        fabricCanvasRef.current.setDimensions({
          width: canvasWidth,
          height: canvasHeight,
        });

        fabricCanvasRef.current.renderAll();
      } catch (error) {
        console.error("Error updating canvas dimensions:", error);
      }
    }, 100); // 100ms delay

    return () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [
    canvasWidth,
    canvasHeight,
    isCanvasReady,
    isResizing,
    fabricCanvasRef,
    canvasRef,
    resizeTimeoutRef,
  ]);

  // Handle window resize for responsive canvas
  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(handleContainerResize, 100);
    };

    // Initial resize
    handleContainerResize();

    window.addEventListener("resize", handleResize);

    // Use ResizeObserver for more accurate container size detection
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(containerRef.current);

      return () => {
        window.removeEventListener("resize", handleResize);
        resizeObserver.disconnect();
        clearTimeout(resizeTimeout);
      };
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [handleContainerResize, containerRef]);

  // Handle resize mouse events
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      handleResizeMove(e);
    };

    const handleMouseUp = () => {
      handleResizeEnd();
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, handleResizeMove, handleResizeEnd]);

  // Ensure canvas is always interactive for editing
  useEffect(() => {
    if (!fabricCanvasRef.current || !isCanvasReady) return;

    const canvas = fabricCanvasRef.current;
    canvas.selection = true;
    canvas.preserveObjectStacking = true;

    // Make all objects selectable and interactive
    canvas.getObjects().forEach((obj: FabricObject) => {
      obj.selectable = true;
      obj.evented = true;
    });

    console.log("Canvas configured for editing");
  }, [isCanvasReady, fabricCanvasRef]);

  // Add wheel event listener manually to avoid passive event issues
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, [handleWheel, containerRef]);

  // Handle keyboard events for canvas operations
  // This effect listens for Delete/Backspace keys to remove selected canvas elements
  // It only triggers when no input fields are focused to avoid interfering with text editing
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle delete key when canvas is focused or when no input is focused
      if (event.key === "Delete" || event.key === "Backspace") {
        const activeElement = document.activeElement;
        const isInputFocused =
          activeElement &&
          (activeElement.tagName === "INPUT" ||
            activeElement.tagName === "TEXTAREA" ||
            (activeElement as HTMLElement).contentEditable === "true");

        if (!isInputFocused) {
          event.preventDefault();
          onDeleteSelected();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onDeleteSelected]);

  return (
    <div
      ref={containerRef}
      className="relative cursor-grab active:cursor-grabbing flex items-center justify-center"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onContextMenu={onContextMenu}
      style={{
        width: "100%",
        height: "100%",
        minHeight: "400px",
        minWidth: "300px",
      }}
    >
      {/* Canvas Container - sized to match canvas dimensions */}
      <div
        className="relative overflow-hidden"
        style={{
          width: `${canvasWidth}px`,
          height: `${canvasHeight}px`,
          transform: `scale(${zoom / 100})`,
          transformOrigin: "center center",
        }}
      >
        {/* Checkerboard Background - only behind the actual canvas */}
        <div
          className="absolute inset-0 pointer-events-none bg-red"
          style={{
            background: `
              repeating-conic-gradient(#ffffff 0% 25%, #c0c0c0 0% 50%) 50% / 12px 12px
            `,
          }}
        />

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute rounded-lg shadow-lg"
          style={{
            width: `${canvasWidth}px`,
            height: `${canvasHeight}px`,
            left: 0,
            top: 0,
            cursor: isResizing
              ? "grabbing"
              : activeTool === "hand"
                ? "grab"
                : activeTool === "brush"
                  ? "crosshair"
                  : activeTool === "eraser"
                    ? "crosshair"
                    : activeTool === "text"
                      ? "text"
                      : activeTool === "shape"
                        ? "crosshair"
                        : activeTool === "crop"
                          ? "crosshair"
                          : "default",
            backgroundColor: "transparent",
          }}
        />
      </div>

      {/* Resize Handles - only show when no image is loaded */}
      {!imageLoaded && (
        <div
          className="absolute"
          style={{
            width: `${canvasWidth}px`,
            height: `${canvasHeight}px`,
            left: "50%",
            top: "50%",
            transform: `translate(-50%, -50%) scale(${zoom / 100})`,
            transformOrigin: "center center",
            pointerEvents: "none",
          }}
        >
          {/* Corner handles */}
          <div
            className="absolute w-3 h-3 bg-blue-500 border border-white rounded-full cursor-nw-resize hover:bg-blue-600 transition-colors"
            style={{ top: -6, left: -6, pointerEvents: "auto" }}
            onMouseDown={createResizeHandler("nw")}
            title="Resize from top-left"
          />
          <div
            className="absolute w-3 h-3 bg-blue-500 border border-white rounded-full cursor-ne-resize hover:bg-blue-600 transition-colors"
            style={{ top: -6, right: -6, pointerEvents: "auto" }}
            onMouseDown={createResizeHandler("ne")}
            title="Resize from top-right"
          />
          <div
            className="absolute w-3 h-3 bg-blue-500 border border-white rounded-full cursor-sw-resize hover:bg-blue-600 transition-colors"
            style={{ bottom: -6, left: -6, pointerEvents: "auto" }}
            onMouseDown={createResizeHandler("sw")}
            title="Resize from bottom-left"
          />
          <div
            className="absolute w-3 h-3 bg-blue-500 border border-white rounded-full cursor-se-resize hover:bg-blue-600 transition-colors"
            style={{ bottom: -6, right: -6, pointerEvents: "auto" }}
            onMouseDown={createResizeHandler("se")}
            title="Resize from bottom-right"
          />

          {/* Edge handles */}
          <div
            className="absolute w-3 h-3 bg-blue-500 border border-white rounded-full cursor-n-resize hover:bg-blue-600 transition-colors"
            style={{
              top: -6,
              left: "50%",
              transform: "translateX(-50%)",
              pointerEvents: "auto",
            }}
            onMouseDown={createResizeHandler("n")}
            title="Resize from top"
          />
          <div
            className="absolute w-3 h-3 bg-blue-500 border border-white rounded-full cursor-s-resize hover:bg-blue-600 transition-colors"
            style={{
              bottom: -6,
              left: "50%",
              transform: "translateX(-50%)",
              pointerEvents: "auto",
            }}
            onMouseDown={createResizeHandler("s")}
            title="Resize from bottom"
          />
          <div
            className="absolute w-3 h-3 bg-blue-500 border border-white rounded-full cursor-w-resize hover:bg-blue-600 transition-colors"
            style={{
              left: -6,
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "auto",
            }}
            onMouseDown={createResizeHandler("w")}
            title="Resize from left"
          />
          <div
            className="absolute w-3 h-3 bg-blue-500 border border-white rounded-full cursor-e-resize hover:bg-blue-600 transition-colors"
            style={{
              right: -6,
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "auto",
            }}
            onMouseDown={createResizeHandler("e")}
            title="Resize from right"
          />
        </div>
      )}
    </div>
  );
}
