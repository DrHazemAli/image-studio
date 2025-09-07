'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Theme } from '@radix-ui/themes';
import { Toolbar, Tool } from '@/components/studio/toolbar';
import { Canvas } from '@/components/studio/canvas';
import EnhancedPromptBox from '@/components/studio/enhanced-prompt-box';
import { GenerationPanel } from '@/components/studio/generation-panel';
import { AssetsPanel } from '@/components/studio/assets-panel';
import { HistoryPanel } from '@/components/studio/history-panel';
import { ConsoleSidebar } from '@/components/ui/console-sidebar';
import { SizeModal } from '@/components/studio/size-modal';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import type { ModelInfo } from '@/app/api/models/route';
import { dbManager, type Asset, type HistoryEntry } from '@/lib/indexeddb';
import { 
  HamburgerMenuIcon, 
  DownloadIcon, 
  Share1Icon,
  LayersIcon,
  InfoCircledIcon,
  Cross2Icon,
  ExclamationTriangleIcon,
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
  const [activeTool, setActiveTool] = useState<Tool>('select');
  const [showGenerationPanel, setShowGenerationPanel] = useState(false);
  const [showPromptBox, setShowPromptBox] = useState(true);
  const [showAssetsPanel, setShowAssetsPanel] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [showConsole, setShowConsole] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [requestLog, setRequestLog] = useState<unknown>(null);
  const [responseLog, setResponseLog] = useState<unknown>(null);
  const [projectName, ] = useState('Untitled Project');
  const [error, setError] = useState<string | null>(null);
  const [currentModel, setCurrentModel] = useState('flux-kontext-pro');
  const [isInpaintMode, setIsInpaintMode] = useState(false);
  const [currentSize, setCurrentSize] = useState('1024x1024');
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [models, setModels] = useState<ModelInfo[]>([]);

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

  // Handle image attachment
  const handleImageUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target?.result as string;
      setAttachedImage(imageData);
    };
    reader.readAsDataURL(file);
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

  // Get model name helper
  const getModelName = useCallback((modelId: string) => {
    const model = models.find(m => m.id === modelId);
    return model ? model.name : modelId;
  }, [models]);

  // Handle image generation
  const handleGenerate = useCallback(async (params: GenerationParams) => {
    setIsGenerating(true);
    setGenerationProgress(0);
    setError(null);

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
        const imageData = `data:image/png;base64,${data.data.data[0].b64_json}`;
        setCurrentImage(imageData);
        
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
  }, [isInpaintMode, attachedImage]);

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

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey) {
        switch (event.key) {
          case 's':
            event.preventDefault();
            // TODO: Save project
            break;
          case 'o':
            event.preventDefault();
            // TODO: Open project
            break;
          case 'e':
            event.preventDefault();
            // TODO: Export image
            break;
        }
      }

      // Tool shortcuts - require Cmd key
      if (event.metaKey || event.ctrlKey) {
        switch (event.key) {
          case 'v':
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
          case 'z':
            event.preventDefault();
            setActiveTool('zoom');
            break;
          case 'g':
            event.preventDefault();
            setActiveTool('generate');
            setShowPromptBox(true);
            break;
          case 'a':
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
          case 'c':
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

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <Theme>
      <div className="h-screen overflow-hidden studio-bg bg-gray-50 dark:bg-black flex flex-col">
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
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {projectName}
                </p>
              </div>
            </div>
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
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Export"
            >
              <DownloadIcon className="w-4 h-4" />
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
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className="fixed top-4 right-4 z-60 bg-red-500/90 dark:bg-red-600/90 backdrop-blur-xl text-white p-4 rounded-xl shadow-lg border border-red-400/30 max-w-md"
            >
              <div className="flex items-start gap-3">
                <div className="p-1 bg-red-600 rounded-lg">
                  <ExclamationTriangleIcon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Generation Failed</h4>
                  <p className="text-sm opacity-90">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="p-1 hover:bg-red-600 rounded transition-colors"
                >
                  <Cross2Icon className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
            onAttachedImageRemove={() => setAttachedImage(null)}
            onShowSizeModal={() => setShowSizeModal(true)}
            onImageUpload={handleImageUpload}
            models={models}
            getModelName={getModelName}
          />
        )}

        {/* Size Modal */}
        <SizeModal
          isOpen={showSizeModal}
          onClose={() => setShowSizeModal(false)}
          currentSize={currentSize}
          currentModel={currentModel}
          onSizeChange={setCurrentSize}
          getModelName={getModelName}
          models={models}
        />

      
      </div>
    </Theme>
  );
}