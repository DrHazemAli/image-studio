'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas as FabricCanvas, FabricObject } from 'fabric';
import * as Tooltip from '@radix-ui/react-tooltip';
import logger from '@/lib/logger';
import {
  BlendingModeIcon,
  TransformIcon,
  MagicWandIcon,
  CopyIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MoveIcon,
  MixerHorizontalIcon,
  ColorWheelIcon,
} from '@radix-ui/react-icons';

// Import our custom components
import { ImageToolButton } from './image-tool-button';
import { ToolEffectOverlay } from './tool-effect-overlay';

// Import new sliding panel components
import {
  ImageFiltersPanel,
  ColorAdjustmentsPanel,
  ImageAdjustments,
  useAdjustmentsPersistence,
} from '../image-editing';
import { dbManager } from '@/lib/indexeddb';

/**
 * Interface for individual image tools
 * Defines the structure of each tool in the toolbar
 */
export interface ImageTool {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  tooltip: string;
  shortcut?: string;
  variant?: 'default' | 'primary' | 'danger';
  requiresModal?: boolean;
  action: () => void | Promise<void>;
  isProcessing?: boolean;
  isVisible?: boolean;
}

/**
 * Props interface for the FloatingImageToolbar component
 */
export interface FloatingImageToolbarProps {
  // Canvas reference for Fabric.js integration
  fabricCanvas: FabricCanvas | null;

  // Selected objects from canvas
  selectedObjects: FabricObject[];

  // Positioning and visibility
  isVisible: boolean;
  position?: { x: number; y: number };

  // Tool handlers
  onBackgroundRemoval?: (image: FabricObject) => Promise<void>;
  onDuplicate?: (objects: FabricObject[]) => void;
  onDelete?: (objects: FabricObject[]) => void;
  onTransform?: (objects: FabricObject[]) => void;
  onBlendMode?: (objects: FabricObject[]) => void;
  onAdjustments?: (objects: FabricObject[]) => void;
  onFilters?: (objects: FabricObject[]) => void;

  // New callbacks for the sliding panels
  onApplyAdjustments?: (adjustments: ImageAdjustments) => void;
  onApplyFilters?: (adjustments: ImageAdjustments) => void;

  // Project persistence
  projectId?: string;

  // Visual effects
  effectOverlay?: {
    isVisible: boolean;
    bounds: { x: number; y: number; width: number; height: number };
    progress?: number;
    message?: string;
  };
}

/**
 * Floating Image Toolbar Component
 * A context-sensitive toolbar that appears when images are selected on the canvas
 * Provides image-specific editing tools with a collapsible interface
 */
export const FloatingImageToolbar: React.FC<FloatingImageToolbarProps> = ({
  fabricCanvas,
  selectedObjects,
  isVisible,
  position,
  onBackgroundRemoval,
  onDuplicate,
  onDelete,
  onTransform,
  onBlendMode,
  onAdjustments,
  onFilters,
  onApplyAdjustments,
  onApplyFilters,
  projectId,
  effectOverlay,
}) => {
  // Component state
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [toolbarPosition, setToolbarPosition] = useState(
    position || { x: 100, y: 100 }
  );
  const [processingTools, setProcessingTools] = useState<Set<string>>(
    new Set()
  );
  const [hoveredTool, setHoveredTool] = useState<string | null>(null);

  // New state for sliding panels
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isAdjustmentsOpen, setIsAdjustmentsOpen] = useState(false);

  // Persistence hook for saving/loading image adjustments
  const { saveImageAdjustments } =
    useAdjustmentsPersistence(fabricCanvas, {
      projectId,
      autoSave: true,
      saveDebounceMs: 1000,
      onSave: async (projId, adjustments) => {
        // Save to IndexedDB project storage
        try {
          logger.log('Saving project adjustments:', projId, adjustments);
          const project = await dbManager.getProject(projId);
          if (project) {
            const updatedProject = {
              ...project,
              adjustments: adjustments,
              updated_at: new Date(),
            };
            await dbManager.saveProject(updatedProject);
          }
        } catch (error) {
          logger.error('Failed to save project adjustments:', error);
        }
      },
      onLoad: async (projId) => {
        // Load from IndexedDB project storage
        try {
          const project = await dbManager.getProject(projId);
          if (project && project.adjustments) {
            return project.adjustments;
          }
        } catch (error) {
          console.error('Failed to load project adjustments:', error);
        }
        return null;
      },
      onError: (error) => console.error('Persistence error:', error),
    });

  // Refs
  const toolbarRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Update position when prop changes
  useEffect(() => {
    if (position) {
      setToolbarPosition(position);
    }
  }, [position]);

  // Calculate smart positioning based on selected object bounds
  const calculateSmartPosition = useCallback(() => {
    if (!selectedObjects.length || !fabricCanvas) {
      return { x: 100, y: 100 }; // Default position instead of using toolbarPosition
    }

    // Get the first selected object for positioning
    const selectedObj = selectedObjects[0];
    const objBounds = selectedObj.getBoundingRect();
    const canvasElement = fabricCanvas.getElement();
    const canvasRect = canvasElement.getBoundingClientRect();

    // Calculate position relative to viewport
    const objCenterX = canvasRect.left + objBounds.left + objBounds.width / 2;
    const objTop = canvasRect.top + objBounds.top;

    // Position toolbar above the selected object with some padding
    const toolbarWidth = isCollapsed ? 48 : 400; // Wider for horizontal layout
    const toolbarHeight = 48; // Single line height

    const newX = Math.max(
      20,
      Math.min(
        window.innerWidth - toolbarWidth - 20,
        objCenterX - toolbarWidth / 2
      )
    );
    let newY = Math.max(20, objTop - toolbarHeight - 20);

    // If there's not enough space above, position below
    if (newY < 20) {
      newY = canvasRect.top + objBounds.top + objBounds.height + 20;
    }

    return { x: newX, y: newY };
  }, [selectedObjects, fabricCanvas, isCollapsed]);

  // Update position when selection changes
  useEffect(() => {
    if (isVisible && selectedObjects.length > 0) {
      const smartPos = calculateSmartPosition();
      setToolbarPosition(smartPos);
    }
  }, [
    isVisible,
    selectedObjects.length,
    fabricCanvas,
    isCollapsed,
    calculateSmartPosition,
  ]);

  // Handle tool processing state
  const setToolProcessing = useCallback(
    (toolId: string, processing: boolean) => {
      setProcessingTools((prev) => {
        const newSet = new Set(prev);
        if (processing) {
          newSet.add(toolId);
        } else {
          newSet.delete(toolId);
        }
        return newSet;
      });
    },
    []
  );

  // Tool action handlers with processing states
  const handleBackgroundRemoval = useCallback(async () => {
    if (!selectedObjects.length || !onBackgroundRemoval) return;

    setToolProcessing('background-removal', true);
    try {
      await onBackgroundRemoval(selectedObjects[0]);
    } finally {
      setToolProcessing('background-removal', false);
    }
  }, [selectedObjects, onBackgroundRemoval, setToolProcessing]);

  const handleDuplicate = useCallback(() => {
    onDuplicate?.(selectedObjects);
  }, [selectedObjects, onDuplicate]);

  const handleDelete = useCallback(() => {
    onDelete?.(selectedObjects);
  }, [selectedObjects, onDelete]);

  const handleTransform = useCallback(() => {
    onTransform?.(selectedObjects);
  }, [selectedObjects, onTransform]);

  const handleBlendMode = useCallback(() => {
    onBlendMode?.(selectedObjects);
  }, [selectedObjects, onBlendMode]);

  // Updated handlers for sliding panels
  const handleFilters = useCallback(() => {
    setIsFiltersOpen(true);
    onFilters?.(selectedObjects);
  }, [selectedObjects, onFilters]);

  const handleAdjustments = useCallback(() => {
    setIsAdjustmentsOpen(true);
    onAdjustments?.(selectedObjects);
  }, [selectedObjects, onAdjustments]);

  // Panel close handlers
  const handleFiltersClose = useCallback(() => {
    setIsFiltersOpen(false);
  }, []);

  const handleAdjustmentsClose = useCallback(() => {
    setIsAdjustmentsOpen(false);
  }, []);

  // Apply handlers with persistence
  const handleApplyFilters = useCallback(
    (adjustments: ImageAdjustments) => {
      // Call the original handler
      onApplyFilters?.(adjustments);

      // Save adjustments for persistence
      if (selectedObjects.length > 0) {
        saveImageAdjustments(selectedObjects[0], adjustments, 'filters');
      }
    },
    [onApplyFilters, selectedObjects, saveImageAdjustments]
  );

  const handleApplyAdjustments = useCallback(
    (adjustments: ImageAdjustments) => {
      // Call the original handler
      onApplyAdjustments?.(adjustments);

      // Save adjustments for persistence
      if (selectedObjects.length > 0) {
        saveImageAdjustments(selectedObjects[0], adjustments, 'adjustments');
      }
    },
    [onApplyAdjustments, selectedObjects, saveImageAdjustments]
  );

  // Define available tools
  const tools: ImageTool[] = [
    {
      id: 'background-removal',
      name: 'Remove Background',
      icon: MagicWandIcon,
      tooltip: 'Remove image background using AI',
      shortcut: 'Cmd+Shift+B',
      variant: 'primary',
      action: handleBackgroundRemoval,
      isProcessing: processingTools.has('background-removal'),
      requiresModal: false,
    },
    {
      id: 'filters',
      name: 'Filters',
      icon: ColorWheelIcon,
      tooltip: 'Apply image filters and presets',
      shortcut: 'Cmd+Shift+F',
      action: handleFilters,
      requiresModal: true,
    },
    {
      id: 'adjustments',
      name: 'Adjustments',
      icon: MixerHorizontalIcon,
      tooltip: 'Professional color and lighting adjustments',
      shortcut: 'Cmd+Shift+A',
      action: handleAdjustments,
      requiresModal: true,
    },
    {
      id: 'transform',
      name: 'Transform',
      icon: TransformIcon,
      tooltip: 'Resize, rotate, and flip',
      shortcut: 'Cmd+T',
      action: handleTransform,
      requiresModal: false,
    },
    {
      id: 'blend-mode',
      name: 'Blend Mode',
      icon: BlendingModeIcon,
      tooltip: 'Change blend mode and opacity',
      action: handleBlendMode,
      requiresModal: true,
    },
    {
      id: 'duplicate',
      name: 'Duplicate',
      icon: CopyIcon,
      tooltip: 'Duplicate selected image',
      shortcut: 'Cmd+D',
      action: handleDuplicate,
    },
    {
      id: 'delete',
      name: 'Delete',
      icon: TrashIcon,
      tooltip: 'Delete selected image',
      shortcut: 'Del',
      variant: 'danger',
      action: handleDelete,
    },
  ];

  // Handle drag operations
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    // Prevent default to avoid text selection
    e.preventDefault();
    e.stopPropagation();

    setIsDragging(true);
    const rect = toolbarRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      dragStartRef.current = { x: e.clientX, y: e.clientY };
    }
  }, []);

  const handleDragMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      e.preventDefault();

      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      // Constrain to viewport bounds
      const toolbarWidth = isCollapsed ? 48 : 400; // Wider for horizontal layout
      const toolbarHeight = 48; // Single line height
      const constrainedX = Math.max(
        0,
        Math.min(window.innerWidth - toolbarWidth, newX)
      );
      const constrainedY = Math.max(
        0,
        Math.min(window.innerHeight - toolbarHeight, newY)
      );

      setToolbarPosition({ x: constrainedX, y: constrainedY });
    },
    [isDragging, dragOffset, isCollapsed]
  );

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Set up drag event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
      return () => {
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);
      };
    }
  }, [isDragging, handleDragMove, handleDragEnd]);

  // Debug logging (commented out to reduce console spam)
  // console.log('FloatingImageToolbar render:', {
  //   isVisible,
  //   selectedObjectsLength: selectedObjects.length,
  //   selectedObjectTypes: selectedObjects.map(obj => obj.type),
  //   toolbarPosition
  // });

  // Don't render if not visible
  if (!isVisible || selectedObjects.length === 0) {
    return null;
  }

  // Filter tools to show only image-relevant ones
  const visibleTools = tools.filter(() => {
    // Show all tools for now, but we can add logic to filter based on object type
    return true;
  });

  return (
    <Tooltip.Provider>
      <AnimatePresence>
        {isVisible && (
          <>
            {/* Main toolbar */}
            <motion.div
              ref={toolbarRef}
              className={`fixed z-50 select-none ${isDragging ? 'cursor-grabbing' : ''}`}
              style={{
                left: toolbarPosition.x,
                top: toolbarPosition.y,
              }}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
                duration: 0.3,
              }}
            >
              <div
                className={`
                  bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl
                  border border-gray-200/50 dark:border-zinc-800/80
                  rounded-2xl shadow-2xl
                  
                  transition-all duration-300 ease-out
                  ${isDragging ? 'ring-2 ring-blue-500/30 shadow-3xl' : ''}
                  ${isCollapsed ? 'w-12' : 'min-w-[400px]'}
                  h-[48px] flex items-center
                `}
              >
                <div className="flex items-center h-full px-3 gap-2">
                  {/* Drag handle */}
                  <div
                    className="p-1 cursor-grab active:cursor-grabbing rounded hover:bg-gray-100 dark:hover:bg-zinc-800/50 transition-colors touch-none"
                    onMouseDown={handleDragStart}
                    style={{ userSelect: 'none' }}
                  >
                    <MoveIcon className="w-4 h-4 text-gray-400 dark:text-zinc-300" />
                  </div>

                  {/* Tools container - horizontal stack */}
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.div
                        className="flex items-center gap-3 mx-2"
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 'auto', opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {visibleTools.map(tool => (
                          <ImageToolButton
                            key={tool.id}
                            id={tool.id}
                            name={tool.name}
                            icon={tool.icon}
                            tooltip={tool.tooltip}
                            shortcut={tool.shortcut}
                            variant={tool.variant}
                            isProcessing={tool.isProcessing}
                            onClick={tool.action}
                            onMouseEnter={() => setHoveredTool(tool.id)}
                            onMouseLeave={() => setHoveredTool(null)}
                            size="small"
                            className={`
                              ${hoveredTool === tool.id ? 'ring-2 ring-blue-500/20' : ''}
                            `}
                          />
                        ))}

                        {/* Selection count */}
                        <div className="ml-2 px-2 py-1 bg-gray-100 dark:bg-zinc-800/50 rounded text-xs text-gray-600 dark:text-zinc-300">
                          {selectedObjects.length}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Collapse toggle */}
                  <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-zinc-800/50 transition-colors ml-auto"
                  >
                    {isCollapsed ? (
                      <ChevronRightIcon className="w-4 h-4 text-gray-500 dark:text-zinc-300" />
                    ) : (
                      <ChevronLeftIcon className="w-4 h-4 text-gray-500 dark:text-zinc-300" />
                    )}
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Effect overlay */}
            {effectOverlay?.isVisible && (
              <ToolEffectOverlay
                isVisible={effectOverlay.isVisible}
                effectType="ray"
                bounds={effectOverlay.bounds}
                progress={effectOverlay.progress}
                message={effectOverlay.message}
                color="#3b82f6"
                intensity="medium"
                speed="normal"
              />
            )}

            {/* Image Filters Panel */}
            <ImageFiltersPanel
              isOpen={isFiltersOpen}
              onClose={handleFiltersClose}
              fabricCanvas={fabricCanvas}
              selectedImage={selectedObjects[0] || null}
              onApplyFilters={handleApplyFilters}
              onResetFilters={() => console.log('Filters reset')}
            />

            {/* Color Adjustments Panel */}
            <ColorAdjustmentsPanel
              isOpen={isAdjustmentsOpen}
              onClose={handleAdjustmentsClose}
              fabricCanvas={fabricCanvas}
              selectedImage={selectedObjects[0] || null}
              onApplyAdjustments={handleApplyAdjustments}
              onResetAdjustments={() => console.log('Adjustments reset')}
            />
          </>
        )}
      </AnimatePresence>
    </Tooltip.Provider>
  );
};
