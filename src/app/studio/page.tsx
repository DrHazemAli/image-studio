'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Theme } from '@radix-ui/themes';
import { Toolbar, Tool } from '@/components/studio/toolbar';
import { Canvas } from '@/components/studio/canvas';
import EnhancedPromptBox from '@/components/studio/enhanced-prompt-box';
import { GenerationPanel, AssetsPanel, HistoryPanel } from '@/components/studio/panels';
import { ConsoleSidebar } from '@/components/ui/console-sidebar';
import { SizeModal, ErrorNotification } from '@/components/studio/modals';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { StudioLoading } from '@/components/studio/studio-loading';
import { MenuBar, MenuProvider } from '@/components/studio/menu-bar';
import type { ModelInfo } from '@/app/api/models/route';
import { dbManager, type Asset, type HistoryEntry } from '@/lib/indexeddb';
import { ProjectManager } from '@/lib/project-manager';
import { ZOOM_CONSTANTS, CANVAS_CONSTANTS } from '@/lib/constants';
import { 
  HamburgerMenuIcon, 
  DownloadIcon, 
  UploadIcon,
  Share1Icon,
  LayersIcon,
  InfoCircledIcon,
  GitHubLogoIcon,
  LinkedInLogoIcon,
} from '@radix-ui/react-icons';

interface GenerationParams {
  prompt: string;
  model: string;
  size: string;
  style?: string;
  quality: string;
  count: number;
  seed?: number;
  negativePrompt?: string;
}

export default function StudioPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTool, setActiveTool] = useState<Tool>('select');
  const [showGenerationPanel, setShowGenerationPanel] = useState(false);
  const [showPromptBox, setShowPromptBox] = useState(true);
  const [showAssetsPanel, setShowAssetsPanel] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [showConsole, setShowConsole] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [requestLog, setRequestLog] = useState<unknown>(null);
  const [responseLog, setResponseLog] = useState<unknown>(null);
  const [projectName, setProjectName] = useState('Untitled Project');
  const [isEditingProjectName, setIsEditingProjectName] = useState(false);
  const [tempProjectName, setTempProjectName] = useState('Untitled Project');
  const [error, setError] = useState<string | null>(null);
  const [currentModel, setCurrentModel] = useState('flux-kontext-pro');
  const [isInpaintMode, setIsInpaintMode] = useState(false);
  const [currentSize, setCurrentSize] = useState('1024x1024');
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [zoom, setZoom] = useState(ZOOM_CONSTANTS.INITIAL_ZOOM);
  
  // Undo/Redo state
  const [history, setHistory] = useState<Array<{
    currentImage: string | null;
    generatedImage: string | null;
    attachedImage: string | null;
    zoom: number;
    timestamp: number;
  }>>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Handle tool changes
  const handleToolChange = useCallback((tool: Tool) => {
    setActiveTool(tool);
    
    // Handle panel opening for different tools
    switch (tool) {
      case 'generate':
        setShowPromptBox(true);
        setIsInpaintMode(false);
        break;
      case 'inpaint':
        setShowPromptBox(true);
        setIsInpaintMode(true);
        break;
      case 'assets':
        setShowAssetsPanel(true);
        break;
      case 'history':
        setShowHistoryPanel(true);
        break;
      case 'prompt':
        setShowPromptBox(prev => !prev);
        break;
    }
  }, []);

  // Save current state to history
  const saveToHistory = useCallback(() => {
    const newState = {
      currentImage,
      generatedImage,
      attachedImage,
      zoom,
      timestamp: Date.now()
    };
    
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newState);
      // Keep only last N states to prevent memory issues
      return newHistory.slice(-CANVAS_CONSTANTS.MAX_HISTORY_STATES);
    });
    setHistoryIndex(prev => Math.min(prev + 1, CANVAS_CONSTANTS.MAX_HISTORY_STATES - 1));
  }, [currentImage, generatedImage, attachedImage, zoom, historyIndex]);

  // Handle image attachment
  const handleImageUpload = useCallback((file: File) => {
    // Save current state before upload
    saveToHistory();
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target?.result as string;
      setAttachedImage(imageData);
    };
    reader.readAsDataURL(file);
  }, [saveToHistory]);

  // Loading timer - show loading screen for 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // Fetch models on component mount
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch('/api/models');
        const data = await response.json();
        setModels(data.models);
        setCurrentModel(data.defaultModel);
        setCurrentSize(data.defaultSize);
      } catch (error) {
        console.error('Failed to fetch models:', error);
        // Fallback to default values if API fails
        setCurrentModel('FLUX.1-Kontext-pro');
        setCurrentSize('1024x1024');
      }
    };

    fetchModels();
  }, []);

  // Get model name helper - memoized to prevent unnecessary recalculations
  const getModelName = useCallback((modelId: string) => {
    const model = models.find(m => m.id === modelId);
    return model ? model.name : modelId;
  }, [models]);

  // Memoized error dismiss handler to prevent unnecessary rerenders
  const handleErrorDismiss = useCallback(() => {
    setError(null);
  }, []);

  // Memoized size modal handlers to prevent unnecessary rerenders
  const handleSizeModalOpen = useCallback(() => {
    setShowSizeModal(true);
  }, []);

  const handleSizeModalClose = useCallback(() => {
    setShowSizeModal(false);
  }, []);

  // Memoized attached image removal handler
  const handleAttachedImageRemove = useCallback(() => {
    setAttachedImage(null);
  }, []);

  // Handle project name editing
  const handleProjectNameEdit = useCallback(() => {
    setTempProjectName(projectName);
    setIsEditingProjectName(true);
  }, [projectName]);

  const handleProjectNameSave = useCallback(() => {
    if (tempProjectName.trim()) {
      setProjectName(tempProjectName.trim());
    }
    setIsEditingProjectName(false);
  }, [tempProjectName]);

  const handleProjectNameCancel = useCallback(() => {
    setTempProjectName(projectName);
    setIsEditingProjectName(false);
  }, [projectName]);

  const handleProjectNameKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleProjectNameSave();
    } else if (e.key === 'Escape') {
      handleProjectNameCancel();
    }
  }, [handleProjectNameSave, handleProjectNameCancel]);

  // Menu bar handlers
  const handleNewProject = useCallback(() => {
    setProjectName('Untitled Project');
    setCurrentImage(null);
    setGeneratedImage(null);
    setAttachedImage(null);
    setError(null);
  }, []);

  const handleClose = useCallback(() => {
    // In a real app, this would close the window/tab
    console.log('Close application');
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + ZOOM_CONSTANTS.ZOOM_STEP, ZOOM_CONSTANTS.MAX_ZOOM));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - ZOOM_CONSTANTS.ZOOM_STEP, ZOOM_CONSTANTS.MIN_ZOOM));
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoom(ZOOM_CONSTANTS.DEFAULT_ZOOM);
  }, []);

  const handleToggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  const handleClearCanvas = useCallback(() => {
    // Save current state before clearing
    saveToHistory();
    
    setCurrentImage(null);
    setGeneratedImage(null);
    setAttachedImage(null);
  }, [saveToHistory]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setCurrentImage(prevState.currentImage);
      setGeneratedImage(prevState.generatedImage);
      setAttachedImage(prevState.attachedImage);
      setZoom(prevState.zoom);
      setHistoryIndex(prev => prev - 1);
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setCurrentImage(nextState.currentImage);
      setGeneratedImage(nextState.generatedImage);
      setAttachedImage(nextState.attachedImage);
      setZoom(nextState.zoom);
      setHistoryIndex(prev => prev + 1);
    }
  }, [history, historyIndex]);

  const handleShowKeyboardShortcuts = useCallback(() => {
    setShowKeyboardShortcuts(true);
  }, []);

  const handleShowAbout = useCallback(() => {
    setShowAbout(true);
  }, []);

  const handleShowDocumentation = useCallback(() => {
    window.open('https://github.com/DrHazemAli/azure-image-studio', '_blank');
  }, []);

  const handleShowGitHub = useCallback(() => {
    window.open('https://github.com/DrHazemAli/azure-image-studio', '_blank');
  }, []);

  const handleShowSupport = useCallback(() => {
    window.open('https://github.com/DrHazemAli/azure-image-studio/issues', '_blank');
  }, []);

  // Handle project export
  const handleExportProject = useCallback(async () => {
    try {
      const projectData = await ProjectManager.exportProject(
        projectName,
        currentModel,
        currentSize,
        isInpaintMode,
        currentImage,
        generatedImage,
        attachedImage,
        {
          description: `Project exported from Azure Image Studio`,
          tags: ['azure', 'image-studio'],
          author: 'Azure Image Studio User'
        }
      );
      
      ProjectManager.downloadProject(projectData);
    } catch (error) {
      console.error('Export failed:', error);
      setError('Failed to export project');
    }
  }, [projectName, currentModel, currentSize, isInpaintMode, currentImage, generatedImage, attachedImage]);

  const handleSaveProject = useCallback(() => {
    handleExportProject();
  }, [handleExportProject]);

  // Handle project import
  const handleImportProject = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const projectData = await ProjectManager.readProjectFromFile(file);
        const result = await ProjectManager.importProject(projectData);
        
        if (result.success && result.data) {
          // Update studio state with imported data
          setProjectName(result.data.projectName);
          setCurrentModel(result.data.settings.currentModel);
          setCurrentSize(result.data.settings.currentSize);
          setIsInpaintMode(result.data.settings.isInpaintMode);
          setCurrentImage(result.data.canvas.currentImage);
          setGeneratedImage(result.data.canvas.generatedImage);
          setAttachedImage(result.data.canvas.attachedImage);
          
          // Show success message
          setError(null);
          console.log(result.message);
        } else {
          setError(result.message);
        }
      } catch (error) {
        console.error('Import failed:', error);
        setError('Failed to import project');
      }
    };
    input.click();
  }, []);

  // Handle image generation
  const handleGenerate = useCallback(async (params: GenerationParams) => {
    // Save current state before generation
    saveToHistory();
    
    setIsGenerating(true);
    setGenerationProgress(0);
    setError(null);
    setGeneratedImage(null); // Clear previous generated image

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deploymentId: params.model,
          prompt: params.prompt,
          size: params.size,
          outputFormat: 'png',
          count: params.count,
          quality: params.quality,
          style: params.style,
          seed: params.seed,
          negativePrompt: params.negativePrompt,
          mode: isInpaintMode ? 'edit' : 'generate',
          image: isInpaintMode ? attachedImage : undefined,
          mask: undefined // Could be added later for mask support
        })
      });

      clearInterval(progressInterval);

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Generation failed');
      }

      setGenerationProgress(100);
      setRequestLog(data.requestLog);
      setResponseLog(data.responseLog);

      // Set the generated image and save to assets & history
      if (data.data && data.data.data && data.data.data[0]) {
        const imageItem = data.data.data[0];
        
        // Validate that b64_json exists and is not undefined
        if (!imageItem.b64_json) {
          console.error('Generated image data is missing b64_json field:', imageItem);
          setError('Generated image data is invalid - missing image content');
          setResponseLog('Error: Generated image data is missing b64_json field');
          return;
        }
        
        const imageData = `data:image/png;base64,${imageItem.b64_json}`;
        setCurrentImage(imageData);
        setGeneratedImage(imageData);
        
        // Save to assets using IndexedDB
        const asset: Asset = {
          id: Date.now().toString(),
          url: imageData,
          name: `Generated-${new Date().toISOString().slice(0, 16)}`,
          type: 'generation' as const,
          timestamp: new Date(),
          prompt: params.prompt,
          model: params.model
        };
        
        try {
          await dbManager.saveAsset(asset);
        } catch (error) {
          console.warn('Failed to save to assets:', error);
        }
        
        // Save to history using IndexedDB
        const historyEntry: HistoryEntry = {
          id: Date.now().toString(),
          type: 'generation' as const,
          timestamp: new Date(),
          prompt: params.prompt,
          model: params.model,
          settings: { size: params.size, quality: params.quality },
          imageUrl: imageData,
          thumbnailUrl: imageData,
          status: 'completed' as const
        };
        
        try {
          await dbManager.saveHistoryEntry(historyEntry);
        } catch (error) {
          console.warn('Failed to save to history:', error);
        }
      }

    } catch (error) {
      console.error('Generation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      setResponseLog(errorMessage);
    } finally {
      setIsGenerating(false);
      setTimeout(() => setGenerationProgress(0), 2000);
    }
  }, [isInpaintMode, attachedImage, saveToHistory]);

  // Migrate from localStorage to IndexedDB on mount
  useEffect(() => {
    const migrateData = async () => {
      try {
        await dbManager.migrateFromLocalStorage();
      } catch (error) {
        console.error('Migration failed:', error);
      }
    };
    migrateData();
  }, []);

  // Initialize history with current state
  useEffect(() => {
    if (history.length === 0) {
      saveToHistory();
    }
  }, [saveToHistory, history.length]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey) {
        switch (event.key) {
          case 's':
            event.preventDefault();
            handleExportProject();
            break;
          case 'o':
            event.preventDefault();
            handleImportProject();
            break;
          case 'e':
            event.preventDefault();
            handleExportProject();
            break;
          case 'z':
            if (event.shiftKey) {
              event.preventDefault();
              handleRedo();
            } else {
              event.preventDefault();
              handleUndo();
            }
            break;
        }
      }

      // Tool shortcuts - require Cmd key
      if (event.metaKey || event.ctrlKey) {
        switch (event.key) {
          case '1':
            event.preventDefault();
            setActiveTool('select');
            break;
          case 'm':
            event.preventDefault();
            setActiveTool('move');
            break;
          case 'h':
            event.preventDefault();
            setActiveTool('hand');
            break;
          case '2':
            event.preventDefault();
            setActiveTool('zoom');
            break;
          case 'g':
            event.preventDefault();
            setActiveTool('generate');
            setShowPromptBox(true);
            break;
          case '3':
            event.preventDefault();
            setActiveTool('assets');
            setShowAssetsPanel(true);
            break;
          case 'e':
            event.preventDefault();
            setActiveTool('edit');
            break;
          case 'b':
            event.preventDefault();
            setActiveTool('brush');
            break;
          case 'T':
            if (event.shiftKey) {
              event.preventDefault();
              setActiveTool('text');
            }
            break;
          case '4':
            event.preventDefault();
            setActiveTool('crop');
            break;
          case 'i':
            event.preventDefault();
            setActiveTool('inpaint');
            setShowPromptBox(true);
            break;
          case 'p':
            event.preventDefault();
            setActiveTool('prompt');
            setShowPromptBox(prev => !prev);
            break;
          case 'u':
            event.preventDefault();
            setActiveTool('shape');
            break;
          case 'y':
            event.preventDefault();
            setActiveTool('history');
            setShowHistoryPanel(true);
            break;
        }
      }

      // Special tool shortcuts that don't use Cmd
      if (event.shiftKey && event.key === 'E' && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        setActiveTool('eraser');
      }

      if (event.altKey && !event.metaKey && !event.ctrlKey && !event.shiftKey) {
        event.preventDefault();
        setActiveTool('eyedropper');
      }

      if (event.shiftKey && event.altKey && event.key === 'B' && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        setActiveTool('blend');
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleExportProject, handleImportProject, handleUndo, handleRedo]);

  return (
    <Theme>
      {/* Loading Screen */}
      <StudioLoading isVisible={isLoading} />
      
      {/* Main Studio Interface */}
      <AnimatePresence>
        {!isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="h-screen overflow-hidden studio-bg bg-gray-50 dark:bg-black flex flex-col"
          >
        {/* Top Menu Bar */}
        <motion.header
          initial={{ y: -60 }}
          animate={{ y: 0 }}
          className="studio-panel bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/10 p-4 flex items-center justify-between z-40"
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <LayersIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900 dark:text-white">
                  Azure Image Studio
                </h1>
                {isEditingProjectName ? (
                  <input
                    type="text"
                    value={tempProjectName}
                    onChange={(e) => setTempProjectName(e.target.value)}
                    onBlur={handleProjectNameSave}
                    onKeyDown={handleProjectNameKeyDown}
                    className="text-xs text-gray-500 dark:text-gray-400 bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 outline-none min-w-0"
                    autoFocus
                  />
                ) : (
                  <p 
                    className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    onClick={handleProjectNameEdit}
                    title="Click to rename project"
                  >
                    {projectName}
                  </p>
                )}
              </div>
            </div>
            
            {/* Menu Bar */}
            <MenuProvider>
              <MenuBar
                onNewProject={handleNewProject}
                onOpenProject={handleImportProject}
                onSaveProject={handleSaveProject}
                onExportProject={handleExportProject}
                onImportProject={handleImportProject}
                onClose={handleClose}
                showConsole={showConsole}
                showAssetsPanel={showAssetsPanel}
                showHistoryPanel={showHistoryPanel}
                showPromptBox={showPromptBox}
                onToggleConsole={() => setShowConsole(!showConsole)}
                onToggleAssetsPanel={() => setShowAssetsPanel(!showAssetsPanel)}
                onToggleHistoryPanel={() => setShowHistoryPanel(!showHistoryPanel)}
                onTogglePromptBox={() => setShowPromptBox(!showPromptBox)}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onResetZoom={handleResetZoom}
                onToggleFullscreen={handleToggleFullscreen}
                activeTool={activeTool}
                onToolChange={handleToolChange}
                onShowSizeModal={handleSizeModalOpen}
                onClearCanvas={handleClearCanvas}
                onUndo={handleUndo}
                onRedo={handleRedo}
                onShowKeyboardShortcuts={handleShowKeyboardShortcuts}
                onShowAbout={handleShowAbout}
                onShowDocumentation={handleShowDocumentation}
                onShowGitHub={handleShowGitHub}
                onShowSupport={handleShowSupport}
              />
            </MenuProvider>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Project Info"
            >
              <InfoCircledIcon className="w-4 h-4" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExportProject}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Export Project (Cmd+S)"
            >
              <DownloadIcon className="w-4 h-4" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleImportProject}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Import Project (Cmd+O)"
            >
              <UploadIcon className="w-4 h-4" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Share"
            >
              <Share1Icon className="w-4 h-4" />
            </motion.button>

            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2" />

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowConsole(!showConsole)}
              className={`p-2 rounded-lg transition-colors ${
                showConsole 
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              title="Toggle Console"
            >
              <HamburgerMenuIcon className="w-4 h-4" />
            </motion.button>

            <ThemeToggle />
          </div>
        </motion.header>

        {/* Main Studio Area */}
        <div className="flex-1 flex relative overflow-hidden">
          {/* Left Toolbar */}
          <Toolbar activeTool={activeTool} onToolChange={handleToolChange} />

          <Canvas
                  activeTool={activeTool}
                  currentImage={currentImage}
                  onImageLoad={setCurrentImage}
                  isGenerating={isGenerating}
                  isInpaintMode={isInpaintMode}
                  generatedImage={generatedImage}
                  zoom={zoom}
                  onZoomChange={setZoom}
                />

          {/* Console Sidebar */}
          <ConsoleSidebar
            requestLog={requestLog as Record<string, unknown> | null}
            responseLog={responseLog as Record<string, unknown> | null}
            isOpen={showConsole}
            onToggle={() => setShowConsole(!showConsole)}
          />
        </div>

        
        {/* Assets Panel */}
        <AssetsPanel
          isOpen={showAssetsPanel}
          onClose={() => setShowAssetsPanel(false)}
          onAssetSelect={(asset) => {
            setCurrentImage(asset.url);
            setShowAssetsPanel(false);
          }}
        />
        
        {/* History Panel */}
        <HistoryPanel
          isOpen={showHistoryPanel}
          onClose={() => setShowHistoryPanel(false)}
          onReplay={(entry) => {
            if (entry.prompt) {
              // Re-run the generation with the same parameters
              setShowHistoryPanel(false);
              setShowPromptBox(true);
            }
          }}
        />
        
        {/* Generation Panel */}
        <GenerationPanel
          isOpen={showGenerationPanel}
          onClose={() => setShowGenerationPanel(false)}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
          progress={generationProgress}
        />

        {/* Status Bar */}
        <motion.div
          initial={{ y: 60 }}
          animate={{ y: 0 }}
          className="studio-panel bg-white/80 dark:bg-black/80 backdrop-blur-xl border-t border-gray-200 dark:border-white/10 p-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400"
        >
          <div className="flex items-center gap-4 pl-2">
            <span>Tool: {activeTool}</span>
            <span>Model: {currentModel}</span>

            {isGenerating ? (
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                Generating... {Math.round(generationProgress)}%
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Ready
              </span>
            )}

          </div>
          <div className="flex items-center gap-4">
          
         
          <div className="flex items-center gap-4">
            <span>Azure Image Studio v1.0</span>
            <a href="https://github.com/DrHazemAli/azure-image-studio" target="_blank" rel="noopener noreferrer">
            <GitHubLogoIcon className="w-4 h-4" />
           </a>

          
           <a href="https://linkedin.com/in/hazemali" target="_blank" rel="noopener noreferrer">
           <LinkedInLogoIcon className="w-4 h-4" />
           </a>
           
            
          </div>

          </div>
          
          
        </motion.div>

        {/* Error Notification */}
        <ErrorNotification 
          error={error} 
          onDismiss={handleErrorDismiss} 
        />

        {/* Enhanced Prompt Box */}
        {showPromptBox && (
          <EnhancedPromptBox
            onGenerate={(prompt) => {
              handleGenerate({
                prompt,
                model: currentModel,
                size: '1024x1024',
                quality: 'standard',
                count: 1
              });
            }}
            onRandomPrompt={() => {
              const prompts = [
                "A majestic mountain landscape at sunrise with golden light",
                "A futuristic city with flying cars and neon lights",
                "A cozy coffee shop on a rainy day with warm lighting",
                "An underwater scene with colorful coral and tropical fish",
                "A magical forest with glowing mushrooms and fairy lights",
                "A beautiful sunset over a calm ocean with a yacht in the foreground",
                "A man with a beard and a beard"
              ];
              return prompts[Math.floor(Math.random() * prompts.length)];
            }}
            isGenerating={isGenerating}
            progress={generationProgress ? {
              stage: "Generating",
              progress: generationProgress,
              message: "Creating your image...",
              estimatedTime: Math.max(0, Math.round((100 - generationProgress) * 0.3))
            } : null}
            error={error}
            generatedImages={[]}
            onShowImages={() => setShowAssetsPanel(true)}
            count={1}
            currentModel={currentModel}
            onModelChange={setCurrentModel}
            isInpaintMode={isInpaintMode}
            size={currentSize}
            onSizeChange={setCurrentSize}
            attachedImage={attachedImage}
            onAttachedImageRemove={handleAttachedImageRemove}
            onShowSizeModal={handleSizeModalOpen}
            onImageUpload={handleImageUpload}
            models={models}
            getModelName={getModelName}
          />
        )}

        {/* Size Modal */}
        <SizeModal
          isOpen={showSizeModal}
          onClose={handleSizeModalClose}
          currentSize={currentSize}
          currentModel={currentModel}
          onSizeChange={setCurrentSize}
          getModelName={getModelName}
          models={models}
        />

        {/* Keyboard Shortcuts Modal */}
        {showKeyboardShortcuts && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
              <h2 className="text-xl font-bold mb-4">Keyboard Shortcuts</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>New Project</span>
                  <span className="text-gray-500">Cmd+N</span>
                </div>
                <div className="flex justify-between">
                  <span>Open Project</span>
                  <span className="text-gray-500">Cmd+O</span>
                </div>
                <div className="flex justify-between">
                  <span>Save Project</span>
                  <span className="text-gray-500">Cmd+S</span>
                </div>
                <div className="flex justify-between">
                  <span>Generate Tool</span>
                  <span className="text-gray-500">Cmd+G</span>
                </div>
                <div className="flex justify-between">
                  <span>Inpaint Tool</span>
                  <span className="text-gray-500">Cmd+I</span>
                </div>
                <div className="flex justify-between">
                  <span>Toggle Console</span>
                  <span className="text-gray-500">Cmd+Shift+C</span>
                </div>
                <div className="flex justify-between">
                  <span>Undo</span>
                  <span className="text-gray-500">Cmd+Z</span>
                </div>
                <div className="flex justify-between">
                  <span>Redo</span>
                  <span className="text-gray-500">Cmd+Shift+Z</span>
                </div>
                <div className="flex justify-between">
                  <span>Delete Selected</span>
                  <span className="text-gray-500">Delete / Backspace</span>
                </div>
              </div>
              <button
                onClick={() => setShowKeyboardShortcuts(false)}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* About Modal */}
        {showAbout && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
              <h2 className="text-xl font-bold mb-4">About Azure Image Studio</h2>
              <div className="space-y-2 text-sm">
                <p><strong>Version:</strong> 1.0.0</p>
                <p><strong>Description:</strong> A powerful image generation and editing studio powered by Azure AI.</p>
                <p><strong>Author:</strong> Dr. Hazem Ali</p>
                <p><strong>GitHub:</strong> <a href="https://github.com/DrHazemAli/azure-image-studio" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">github.com/DrHazemAli/azure-image-studio</a></p>
              </div>
              <button
                onClick={() => setShowAbout(false)}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Close
              </button>
            </div>
          </div>
        )}

          </motion.div>
        )}
      </AnimatePresence>
    </Theme>
  );
}