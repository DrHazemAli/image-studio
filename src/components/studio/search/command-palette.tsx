"use client";

import { useState, useEffect } from "react";
import { Command } from "cmdk";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Wand2,
  Pencil,
  Square,
  Frame,
  Circle,
  Eraser,
  Type,
  Square as SquareIcon,
  Crop,
  Eye,
  Layers,
  Package,
  Clock,
  MessageCircle,
  MousePointer,
  Move,
  Hand,
  ZoomIn,
  Download,
  Upload,
  Settings,
  Code,
  Info,
  BookOpen,
  Github,
  LifeBuoy,
} from "lucide-react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onToolChange: (tool: string) => void;
  onExportProject: () => void;
  onImportProject: () => void;
  onShowSettings: () => void;
  onShowKeyboardShortcuts: () => void;
  onShowAbout: () => void;
  onShowDocumentation: () => void;
  onShowGitHub: () => void;
  onShowSupport: () => void;
  onNewProject: () => void;
  onClearCanvas: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onToggleFullscreen: () => void;
  onToggleAssetsPanel: () => void;
  onToggleHistoryPanel: () => void;
  onTogglePromptBox: () => void;
  onToggleAssetStorePanel: () => void;
  onInsertImage: () => void;
  onInsertText: () => void;
  onInsertShape: () => void;
  onInsertFromAssetStore: () => void;
  onShowProjects: () => void;
  isAssetStoreEnabled: boolean;
}

const commands = [
  // Tools
  {
    id: "select",
    name: "Select Tool",
    description: "Select and move objects",
    icon: MousePointer,
    shortcut: "Cmd+1",
    category: "Tools",
    action: "tool",
  },
  {
    id: "move",
    name: "Move Tool",
    description: "Move objects around",
    icon: Move,
    shortcut: "Cmd+M",
    category: "Tools",
    action: "tool",
  },
  {
    id: "hand",
    name: "Hand Tool",
    description: "Pan around the canvas",
    icon: Hand,
    shortcut: "Cmd+H",
    category: "Tools",
    action: "tool",
  },
  {
    id: "zoom",
    name: "Zoom Tool",
    description: "Zoom in and out",
    icon: ZoomIn,
    shortcut: "Cmd+2",
    category: "Tools",
    action: "tool",
  },
  {
    id: "generate",
    name: "AI Generate",
    description: "Generate images with AI",
    icon: Wand2,
    shortcut: "Cmd+G",
    category: "AI Tools",
    action: "tool",
  },
  {
    id: "edit",
    name: "AI Edit",
    description: "Edit images with AI",
    icon: Pencil,
    shortcut: "Cmd+E",
    category: "AI Tools",
    action: "tool",
  },
  {
    id: "inpaint",
    name: "AI Inpaint",
    description: "Inpaint parts of images",
    icon: Square,
    shortcut: "Cmd+I",
    category: "AI Tools",
    action: "tool",
  },
  {
    id: "outpaint",
    name: "AI Outpaint",
    description: "Extend images with AI",
    icon: Frame,
    shortcut: "Cmd+O",
    category: "AI Tools",
    action: "tool",
  },
  {
    id: "brush",
    name: "Brush Tool",
    description: "Draw with brush",
    icon: Circle,
    shortcut: "Cmd+B",
    category: "Drawing",
    action: "tool",
  },
  {
    id: "eraser",
    name: "Eraser Tool",
    description: "Erase parts of images",
    icon: Eraser,
    shortcut: "Shift+E",
    category: "Drawing",
    action: "tool",
  },
  {
    id: "text",
    name: "Text Tool",
    description: "Add text to canvas",
    icon: Type,
    shortcut: "Cmd+Shift+T",
    category: "Content",
    action: "tool",
  },
  {
    id: "shape",
    name: "Shape Tool",
    description: "Draw shapes",
    icon: SquareIcon,
    shortcut: "Cmd+U",
    category: "Content",
    action: "tool",
  },
  {
    id: "crop",
    name: "Crop Tool",
    description: "Crop images",
    icon: Crop,
    shortcut: "Cmd+4",
    category: "Transform",
    action: "tool",
  },
  {
    id: "eyedropper",
    name: "Eyedropper Tool",
    description: "Pick colors from canvas",
    icon: Eye,
    shortcut: "Alt",
    category: "Utility",
    action: "tool",
  },
  {
    id: "blend",
    name: "Blend Mode",
    description: "Change blend modes",
    icon: Layers,
    shortcut: "Shift+Alt+B",
    category: "Utility",
    action: "tool",
  },
  {
    id: "assets",
    name: "Assets Panel",
    description: "View project assets",
    icon: Package,
    shortcut: "Cmd+3",
    category: "Panels",
    action: "panel",
  },
  {
    id: "history",
    name: "History Panel",
    description: "View generation history",
    icon: Clock,
    shortcut: "Cmd+Y",
    category: "Panels",
    action: "panel",
  },
  {
    id: "prompt",
    name: "Prompt Box",
    description: "Open prompt input",
    icon: MessageCircle,
    shortcut: "Cmd+P",
    category: "Panels",
    action: "panel",
  },
  // File Operations
  {
    id: "new-project",
    name: "New Project",
    description: "Create a new project",
    icon: Package,
    shortcut: "Cmd+N",
    category: "File",
    action: "file",
  },
  {
    id: "export-project",
    name: "Export Project",
    description: "Export current project",
    icon: Download,
    shortcut: "Cmd+S",
    category: "File",
    action: "file",
  },
  {
    id: "import-project",
    name: "Import Project",
    description: "Import a project file",
    icon: Upload,
    shortcut: "Cmd+O",
    category: "File",
    action: "file",
  },
  // View Operations
  {
    id: "zoom-in",
    name: "Zoom In",
    description: "Increase zoom level",
    icon: ZoomIn,
    shortcut: "Cmd+Plus",
    category: "View",
    action: "view",
  },
  {
    id: "zoom-out",
    name: "Zoom Out",
    description: "Decrease zoom level",
    icon: ZoomIn,
    shortcut: "Cmd+Minus",
    category: "View",
    action: "view",
  },
  {
    id: "reset-zoom",
    name: "Reset Zoom",
    description: "Reset to default zoom",
    icon: ZoomIn,
    shortcut: "Cmd+0",
    category: "View",
    action: "view",
  },
  {
    id: "fullscreen",
    name: "Toggle Fullscreen",
    description: "Enter/exit fullscreen mode",
    icon: Frame,
    shortcut: "F11",
    category: "View",
    action: "view",
  },
  // Edit Operations
  {
    id: "undo",
    name: "Undo",
    description: "Undo last action",
    icon: Clock,
    shortcut: "Cmd+Z",
    category: "Edit",
    action: "edit",
  },
  {
    id: "redo",
    name: "Redo",
    description: "Redo last undone action",
    icon: Clock,
    shortcut: "Cmd+Shift+Z",
    category: "Edit",
    action: "edit",
  },
  {
    id: "clear-canvas",
    name: "Clear Canvas",
    description: "Clear all canvas content",
    icon: Eraser,
    shortcut: "Cmd+Delete",
    category: "Edit",
    action: "edit",
  },
  // Insert Operations
  {
    id: "insert-image",
    name: "Insert Image",
    description: "Add image to canvas",
    icon: Package,
    shortcut: "Cmd+I",
    category: "Insert",
    action: "insert",
  },
  {
    id: "insert-text",
    name: "Insert Text",
    description: "Add text to canvas",
    icon: Type,
    shortcut: "Cmd+T",
    category: "Insert",
    action: "insert",
  },
  {
    id: "insert-shape",
    name: "Insert Shape",
    description: "Add shape to canvas",
    icon: SquareIcon,
    shortcut: "Cmd+U",
    category: "Insert",
    action: "insert",
  },
  {
    id: "insert-from-asset-store",
    name: "Insert from Asset Store",
    description: "Add asset from store",
    icon: Package,
    shortcut: "Cmd+Shift+A",
    category: "Insert",
    action: "insert",
  },
  // Help & Settings
  {
    id: "settings",
    name: "Settings",
    description: "Open application settings",
    icon: Settings,
    shortcut: "Cmd+Comma",
    category: "Settings",
    action: "settings",
  },
  {
    id: "shortcuts",
    name: "Keyboard Shortcuts",
    description: "View all shortcuts",
    icon: Code,
    shortcut: "Cmd+?",
    category: "Help",
    action: "help",
  },
  {
    id: "about",
    name: "About",
    description: "About this application",
    icon: Info,
    shortcut: "Cmd+Shift+A",
    category: "Help",
    action: "help",
  },
  {
    id: "documentation",
    name: "Documentation",
    description: "Open documentation",
    icon: BookOpen,
    shortcut: "Cmd+Shift+D",
    category: "Help",
    action: "help",
  },
  {
    id: "github",
    name: "GitHub Repository",
    description: "Open GitHub repository",
    icon: Github,
    shortcut: "Cmd+Shift+G",
    category: "Help",
    action: "help",
  },
  {
    id: "support",
    name: "Support",
    description: "Get help and support",
    icon: LifeBuoy,
    shortcut: "Cmd+Shift+S",
    category: "Help",
    action: "help",
  },
  {
    id: "projects",
    name: "Projects",
    description: "Manage saved projects",
    icon: Package,
    shortcut: "Cmd+Shift+P",
    category: "Management",
    action: "projects",
  },
];

export function CommandPalette({
  isOpen,
  onClose,
  onToolChange,
  onExportProject,
  onImportProject,
  onShowSettings,
  onShowKeyboardShortcuts,
  onShowAbout,
  onShowDocumentation,
  onShowGitHub,
  onShowSupport,
  onNewProject,
  onClearCanvas,
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onToggleFullscreen,
  onToggleAssetsPanel,
  onToggleHistoryPanel,
  onTogglePromptBox,
  onToggleAssetStorePanel,
  onInsertImage,
  onInsertText,
  onInsertShape,
  onInsertFromAssetStore,
  onShowProjects,
  isAssetStoreEnabled,
}: CommandPaletteProps) {
  const [search, setSearch] = useState("");

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // This would be handled by the parent component
        }
      }
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleSelect = (commandId: string) => {
    const command = commands.find((cmd) => cmd.id === commandId);
    if (!command) return;

    switch (command.action) {
      case "tool":
        onToolChange(commandId);
        break;
      case "panel":
        switch (commandId) {
          case "assets":
            onToggleAssetsPanel();
            break;
          case "history":
            onToggleHistoryPanel();
            break;
          case "prompt":
            onTogglePromptBox();
            break;
          case "assetStore":
            onToggleAssetStorePanel();
            break;
        }
        break;
      case "file":
        switch (commandId) {
          case "new-project":
            onNewProject();
            break;
          case "export-project":
            onExportProject();
            break;
          case "import-project":
            onImportProject();
            break;
        }
        break;
      case "view":
        switch (commandId) {
          case "zoom-in":
            onZoomIn();
            break;
          case "zoom-out":
            onZoomOut();
            break;
          case "reset-zoom":
            onResetZoom();
            break;
          case "fullscreen":
            onToggleFullscreen();
            break;
        }
        break;
      case "edit":
        switch (commandId) {
          case "undo":
            onUndo();
            break;
          case "redo":
            onRedo();
            break;
          case "clear-canvas":
            onClearCanvas();
            break;
        }
        break;
      case "insert":
        switch (commandId) {
          case "insert-image":
            onInsertImage();
            break;
          case "insert-text":
            onInsertText();
            break;
          case "insert-shape":
            onInsertShape();
            break;
          case "insert-from-asset-store":
            onInsertFromAssetStore();
            break;
        }
        break;
      case "settings":
        onShowSettings();
        break;
      case "help":
        switch (commandId) {
          case "shortcuts":
            onShowKeyboardShortcuts();
            break;
          case "about":
            onShowAbout();
            break;
          case "documentation":
            onShowDocumentation();
            break;
          case "github":
            onShowGitHub();
            break;
          case "support":
            onShowSupport();
            break;
        }
        break;
      case "projects":
        onShowProjects();
        break;
    }

    onClose();
  };

  const filteredCommands = commands.filter((command) => {
    // Filter out asset store commands if not enabled
    if (command.id === "insert-from-asset-store" && !isAssetStoreEnabled) {
      return false;
    }

    // Filter by search term
    if (!search) return true;
    
    const searchTerm = search.toLowerCase();
    return (
      command.name.toLowerCase().includes(searchTerm) ||
      command.description.toLowerCase().includes(searchTerm) ||
      command.category.toLowerCase().includes(searchTerm)
    );
  });

  // Group commands by category
  const groupedCommands = filteredCommands.reduce((acc, command) => {
    if (!acc[command.category]) {
      acc[command.category] = [];
    }
    acc[command.category].push(command);
    return acc;
  }, {} as Record<string, typeof commands>);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/20 backdrop-blur-xs"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed left-1/2 top-1/4 -translate-x-1/2 w-full max-w-2xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Command className="bg-white/90 dark:bg-zinc-900/90 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-zinc-700/50 overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200/30 dark:border-zinc-700/30">
                <Search className="w-5 h-5 text-gray-500 dark:text-zinc-300" />
                <Command.Input
                  value={search}
                  onValueChange={setSearch}
                  placeholder="Search commands..."
                  className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-zinc-300 text-lg"
                  autoFocus
                />
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-zinc-300">
                  <kbd className="px-2 py-1 bg-gray-100/80 dark:bg-zinc-800/80 rounded text-xs">⌘</kbd>
                  <kbd className="px-2 py-1 bg-gray-100/80 dark:bg-zinc-800/80 rounded text-xs">K</kbd>
                </div>
              </div>

              <Command.List className="max-h-96 overflow-y-auto">
                <Command.Empty className="px-4 py-8 text-center text-gray-500 dark:text-zinc-300">
                  No commands found.
                </Command.Empty>

                {Object.entries(groupedCommands).map(([category, categoryCommands]) => (
                  <Command.Group
                    key={category}
                    heading={category}
                    className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-zinc-300 uppercase tracking-wider"
                  >
                    {categoryCommands.map((command) => {
                      const Icon = command.icon;
                      return (
                        <Command.Item
                          key={command.id}
                          value={`${command.name} ${command.description} ${command.category}`}
                          onSelect={() => handleSelect(command.id)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-gray-100/80 dark:hover:bg-zinc-800/50 transition-colors mx-2"
                        >
                          <Icon className="w-4 h-4 text-gray-600 dark:text-zinc-300" />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {command.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-zinc-300">
                              {command.description}
                            </div>
                          </div>
                          {command.shortcut && (
                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-zinc-300">
                              {command.shortcut.split("+").map((key, index) => (
                                <kbd
                                  key={index}
                                  className="px-1.5 py-0.5 bg-gray-100/80 dark:bg-zinc-800/80 rounded text-xs"
                                >
                                  {key}
                                </kbd>
                              ))}
                            </div>
                          )}
                        </Command.Item>
                      );
                    })}
                  </Command.Group>
                ))}
              </Command.List>
            </Command>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
