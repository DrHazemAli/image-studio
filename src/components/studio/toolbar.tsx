'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useDragControls } from 'framer-motion';
import {
  MagicWandIcon,
  Pencil2Icon,
  FrameIcon,
  CropIcon,
  BlendingModeIcon,
  EyeOpenIcon,
  ZoomInIcon,
  MoveIcon,
  HandIcon,
  EraserIcon,
  TextIcon,
  TransformIcon,
  DashboardIcon,
  CircleIcon,
  CursorArrowIcon,
  SquareIcon,
  StackIcon,
  ClockIcon,
  ChatBubbleIcon,
  DragHandleDots2Icon,
  SizeIcon
} from '@radix-ui/react-icons';
import * as Tooltip from '@radix-ui/react-tooltip';

export type Tool = 
  | 'select'
  | 'move' 
  | 'hand'
  | 'zoom'
  | 'generate'
  | 'edit'
  | 'inpaint'
  | 'outpaint'
  | 'brush'
  | 'eraser'
  | 'text'
  | 'shape'
  | 'crop'
  | 'transform'
  | 'eyedropper'
  | 'blend'
  | 'assets'
  | 'history'
  | 'prompt';

interface ToolbarProps {
  activeTool: Tool;
  onToolChange: (tool: Tool) => void;
}

const tools = [
  // Selection & Navigation
  { 
    id: 'select' as Tool, 
    name: 'Select', 
    icon: CursorArrowIcon, 
    shortcut: 'Cmd+V',
    group: 'selection'
  },
  { 
    id: 'move' as Tool, 
    name: 'Move', 
    icon: MoveIcon, 
    shortcut: 'Cmd+M',
    group: 'selection'
  },
  { 
    id: 'hand' as Tool, 
    name: 'Hand Tool', 
    icon: HandIcon, 
    shortcut: 'Cmd+H',
    group: 'navigation'
  },
  { 
    id: 'zoom' as Tool, 
    name: 'Zoom', 
    icon: ZoomInIcon, 
    shortcut: 'Cmd+Z',
    group: 'navigation'
  },
  
  // AI Tools
  { 
    id: 'generate' as Tool, 
    name: 'AI Generate', 
    icon: MagicWandIcon, 
    shortcut: 'Cmd+G',
    group: 'ai',
    gradient: true
  },
  { 
    id: 'edit' as Tool, 
    name: 'AI Edit', 
    icon: Pencil2Icon, 
    shortcut: 'Cmd+E',
    group: 'ai',
    gradient: true
  },
  { 
    id: 'inpaint' as Tool, 
    name: 'AI Inpaint', 
    icon: DashboardIcon, 
    shortcut: 'Cmd+I',
    group: 'ai',
    gradient: true
  },
  { 
    id: 'outpaint' as Tool, 
    name: 'AI Outpaint', 
    icon: FrameIcon, 
    shortcut: 'Cmd+O',
    group: 'ai',
    gradient: true
  },
  
  // Drawing Tools
  { 
    id: 'brush' as Tool, 
    name: 'Brush', 
    icon: CircleIcon, 
    shortcut: 'Cmd+B',
    group: 'drawing'
  },
  { 
    id: 'eraser' as Tool, 
    name: 'Eraser', 
    icon: EraserIcon, 
    shortcut: 'Shift+E',
    group: 'drawing'
  },
  
  // Content Tools
  { 
    id: 'text' as Tool, 
    name: 'Text', 
    icon: TextIcon, 
    shortcut: 'Cmd+Shift+T',
    group: 'content'
  },
  { 
    id: 'shape' as Tool, 
    name: 'Shapes', 
    icon: SquareIcon, 
    shortcut: 'Cmd+U',
    group: 'content'
  },
  
  // Transform Tools
  { 
    id: 'crop' as Tool, 
    name: 'Crop', 
    icon: CropIcon, 
    shortcut: 'Cmd+C',
    group: 'transform'
  },
  { 
    id: 'transform' as Tool, 
    name: 'Transform', 
    icon: TransformIcon, 
    shortcut: 'Cmd+T',
    group: 'transform'
  },
  
  // Utility Tools
  { 
    id: 'eyedropper' as Tool, 
    name: 'Eyedropper', 
    icon: EyeOpenIcon, 
    shortcut: 'Alt',
    group: 'utility'
  },
  { 
    id: 'blend' as Tool, 
    name: 'Blend Mode', 
    icon: BlendingModeIcon, 
    shortcut: 'Shift+Alt+B',
    group: 'utility'
  },
  
  // Management Tools
  { 
    id: 'assets' as Tool, 
    name: 'Assets', 
    icon: StackIcon, 
    shortcut: 'Cmd+A',
    group: 'management'
  },
  { 
    id: 'history' as Tool, 
    name: 'History', 
    icon: ClockIcon, 
    shortcut: 'Cmd+Y',
    group: 'management'
  },
  { 
    id: 'prompt' as Tool, 
    name: 'Prompt Box', 
    icon: ChatBubbleIcon, 
    shortcut: 'Cmd+P',
    group: 'management'
  }
];

const groupSeparators = new Set(['navigation', 'ai', 'drawing', 'content', 'transform', 'management']);

export function Toolbar({ activeTool, onToolChange }: ToolbarProps) {
  const [hoveredTool, setHoveredTool] = useState<Tool | null>(null);
  const [position, setPosition] = useState({ x: 16, y: 16 });
  const [height, setHeight] = useState(400);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragControls = useDragControls();
  const toolbarRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<HTMLDivElement>(null);

  // Load saved position and height from localStorage
  useEffect(() => {
    const savedPosition = localStorage.getItem('toolbar-position');
    const savedHeight = localStorage.getItem('toolbar-height');
    
    if (savedPosition) {
      setPosition(JSON.parse(savedPosition));
    }
    if (savedHeight) {
      setHeight(parseInt(savedHeight, 10));
    }
  }, []);

  // Save position and height to localStorage
  useEffect(() => {
    localStorage.setItem('toolbar-position', JSON.stringify(position));
  }, [position]);

  useEffect(() => {
    localStorage.setItem('toolbar-height', height.toString());
  }, [height]);

  // Handle drag constraints
  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: { point: { x: number; y: number } }) => {
    const newX = Math.max(0, Math.min(window.innerWidth - 60, info.point.x));
    const newY = Math.max(0, Math.min(window.innerHeight - height - 100, info.point.y));
    setPosition({ x: newX, y: newY });
  };

  // Handle resize
  const handleResize = (event: React.MouseEvent) => {
    if (!toolbarRef.current) return;
    
    const startY = event.clientY;
    const startHeight = height;
    
    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = e.clientY - startY;
      const newHeight = Math.max(200, Math.min(window.innerHeight - 200, startHeight + deltaY));
      setHeight(newHeight);
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    setIsResizing(true);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <Tooltip.Provider>
      <motion.div
        ref={toolbarRef}
        drag
        dragControls={dragControls}
        dragMomentum={false}
        onDrag={handleDrag}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setIsDragging(false)}
        className="fixed z-30 select-none"
        style={{ 
          x: 16,
          y: 16,
          height: height,
          width: 60
        }}
        whileDrag={{ scale: 1.02, rotate: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className={`studio-toolbar bg-white/90 dark:bg-black/90 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl h-full flex flex-col transition-all duration-200 ${
          isDragging ? 'shadow-3xl scale-105' : ''
        } ${isResizing ? 'ring-2 ring-blue-500/50' : ''}`}>
          {/* Drag Handle */}
          <div
            className="flex items-center justify-center p-2 cursor-move hover:bg-gray-100 dark:hover:bg-gray-800 rounded-t-2xl transition-colors"
            onPointerDown={(e) => dragControls.start(e)}
          >
            <DragHandleDots2Icon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          </div>
          
          {/* Tools Container */}
          <div className="flex-1 flex flex-col gap-1 p-2 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
            {tools.map((tool, index) => {
              const Icon = tool.icon;
              const isActive = activeTool === tool.id;
              const isHovered = hoveredTool === tool.id;
              const showSeparator = index > 0 && groupSeparators.has(tool.group);
              
              return (
                <div key={tool.id}>
                  {showSeparator && (
                    <div className="h-px bg-gray-200 dark:bg-gray-700 my-2 mx-2" />
                  )}
                  
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <motion.button
                        className={`
                          relative w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200
                          ${isActive 
                            ? tool.gradient
                              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                              : 'bg-blue-500 text-white shadow-lg'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                          }
                          ${isHovered ? 'scale-110' : 'scale-100'}
                        `}
                        onClick={() => onToolChange(tool.id)}
                        onMouseEnter={() => setHoveredTool(tool.id)}
                        onMouseLeave={() => setHoveredTool(null)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Icon className="w-5 h-5" />
                        
                        {/* Active indicator */}
                        {isActive && (
                          <motion.div
                            layoutId="activeIndicator"
                            className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-white !rounded-full"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          />
                        )}
                        
                        {/* Keyboard shortcut indicator */}
                        {tool.shortcut && !isActive && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded text-xs flex items-center justify-center text-gray-500 dark:text-gray-400 text-[10px] font-mono">
                            {tool.shortcut.length === 1 ? tool.shortcut : '⌘'}
                          </div>
                        )}
                      </motion.button>
                    </Tooltip.Trigger>
                    
                    <Tooltip.Portal>
                      <Tooltip.Content
                        className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-2 rounded-lg text-sm font-medium shadow-lg"
                        side="right"
                        sideOffset={10}
                      >
                        <div className="flex flex-col gap-1">
                          <span>{tool.name}</span>
                          <span className="text-xs opacity-70 font-mono">{tool.shortcut}</span>
                        </div>
                        <Tooltip.Arrow className="fill-gray-900 dark:fill-gray-100" />
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                </div>
              );
            })}
          </div>
          
          {/* Tool options indicator */}
          <motion.div
            className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex justify-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            </div>
          </motion.div>
          
          {/* Resize Handle */}
          <div
            ref={resizeRef}
            className={`flex items-center justify-center p-1 cursor-ns-resize hover:bg-gray-100 dark:hover:bg-gray-800 rounded-b-2xl transition-colors ${
              isResizing ? 'bg-blue-100 dark:bg-blue-900/30' : ''
            }`}
            onMouseDown={handleResize}
          >
            <SizeIcon className={`w-3 h-3 transition-colors ${
              isResizing ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'
            }`} />
          </div>
        </div>
      </motion.div>
    </Tooltip.Provider>
  );
}