"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Toolbar, Tool } from "@/components/studio/toolbar";
import { Canvas } from "@/components/studio/canvas";
import logger from "@/lib/logger";
import { type MainCanvasRef } from "@/components/studio/canvas/main-canvas";
import EnhancedPromptBox from "@/components/studio/enhanced-prompt-box";
import {
  GenerationPanel,
  AssetsPanel,
  HistoryPanel,
} from "@/components/studio/panels";
import { ConsoleSidebar } from "@/components/ui/console-sidebar";
import {
  SizeModal,
  ErrorNotification,
  AboutModal,
  ShortcutsModal,
} from "@/components/modals";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SettingsDialog } from "@/components/settings";
import { SyncManager } from "@/components/studio/sync-manager";
import { StudioLoading } from "@/components/studio/studio-loading";
import { MenuBar, MenuProvider } from "@/components/studio/menu-bar";
import { AppSettings } from "@/lib/settings/app-settings";
import type { ModelInfo } from "@/app/api/models/route";
import {
  dbManager,
  type Asset,
  type HistoryEntry,
  type Project,
} from "@/lib/indexeddb";
import { ProjectManager } from "@/lib/project-manager";
import { syncHelper } from "@/lib/sync-helper";
import { ZOOM_CONSTANTS, CANVAS_CONSTANTS } from "@/lib/constants";
import {
  DownloadIcon,
  UploadIcon,
  Share1Icon,
  LayersIcon,
  InfoCircledIcon,
  GitHubLogoIcon,
  LinkedInLogoIcon,
  GearIcon,
} from "@radix-ui/react-icons";
import { Code } from "lucide-react";
import appConfig from "@/app/config/app-config.json";

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

export default function ProjectStudioPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  // App settings instance - memoized to prevent re-creation on every render
  const appSettings = useMemo(() => new AppSettings(), []);

  const [isLoading, setIsLoading] = useState(true);
  const [activeTool, setActiveTool] = useState<Tool>("select");
  const [showGenerationPanel, setShowGenerationPanel] = useState(false);
  const [showPromptBox, setShowPromptBox] = useState(true);
  const [showAssetsPanel, setShowAssetsPanel] = useState(false);
  const [showAssetStorePanel, setShowAssetStorePanel] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [showConsole, setShowConsole] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [requestLog, setRequestLog] = useState<unknown>(null);
  const [responseLog, setResponseLog] = useState<unknown>(null);
  const [projectName, setProjectName] = useState("Untitled Project");
  const [isEditingProjectName, setIsEditingProjectName] = useState(false);
  const [tempProjectName, setTempProjectName] = useState("Untitled Project");
  const [error, setError] = useState<string | null>(null);
  const [currentModel, setCurrentModel] = useState("flux-kontext-pro");
  const [isInpaintMode, setIsInpaintMode] = useState(false);
  const [currentSize, setCurrentSize] = useState("1024x1024");
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [zoom, setZoom] = useState(ZOOM_CONSTANTS.INITIAL_ZOOM);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isAssetStoreEnabled, setIsAssetStoreEnabled] = useState(false);

  // Undo/Redo state
  const [history, setHistory] = useState<
    Array<{
      currentImage: string | null;
      generatedImage: string | null;
      attachedImage: string | null;
      zoom: number;
      timestamp: number;
    }>
  >([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Auto-save functionality (Sync) - integrated with app settings
  const [autoSave, setAutoSave] = useState(() => {
    return appSettings.getUnifiedSetting("autoSave.enabled", true) as boolean;
  });
  // Auto-save duration settings - default 60s, minimum 30s
  const [autoSaveDuration, setAutoSaveDuration] = useState(() => {
    const duration = appSettings.getUnifiedSetting(
      "autoSave.duration",
      60,
    ) as number;
    return Math.max(duration, 30); // Ensure minimum 30 seconds
  });

  // Canvas ref for insert functionality
  const canvasRef = useRef<MainCanvasRef>(null);

  const toggleAutoSave = useCallback(() => {
    const newAutoSave = !autoSave;
    setAutoSave(newAutoSave);

    // Update app settings
    appSettings.updateUnifiedSetting("autoSave.enabled", newAutoSave);

    // Update sync helper
    syncHelper.setEnabled(newAutoSave);

    if (newAutoSave) {
      logger.info("Auto-save (Sync) enabled");
    } else {
      logger.info("Auto-save (Sync) disabled");
      syncHelper.cancelSync(); // Cancel any pending auto-save
    }
  }, [autoSave, appSettings]);

  // Duration control for auto-save - minimum 30 seconds
  const updateAutoSaveDuration = useCallback(
    (duration: number) => {
      const validatedDuration = Math.max(duration, 30); // Ensure minimum 30 seconds
      setAutoSaveDuration(validatedDuration);

      // Update app settings
      appSettings.updateUnifiedSetting("autoSave.duration", validatedDuration);

      syncHelper.setDuration(validatedDuration);
    },
    [appSettings],
  );

  // Unified function to update page title
  const updatePageTitle = useCallback(
    (projectNameParam?: string) => {
      const name = projectNameParam || projectName;
      if (name && name !== "Untitled Project") {
        const newTitle = `${name} - ${appConfig.app.name}`;
        document.title = newTitle;
        logger.log("Page title updated to:", newTitle);
      } else {
        document.title = appConfig.app.name;
        logger.log("Page title updated to:", appConfig.app.name);
      }
    },
    [projectName],
  );

  // Update page title when projectName state changes (additional safety)
  useEffect(() => {
    updatePageTitle();
  }, [projectName, updatePageTitle]);

  // Initialize sync helper with app settings values
  useEffect(() => {
    syncHelper.setEnabled(autoSave);
    syncHelper.setDuration(autoSaveDuration);
  }, [autoSave, autoSaveDuration]); // Include dependencies

  // Sync settings changes with app settings
  useEffect(() => {
    appSettings.updateUnifiedSetting("autoSave.enabled", autoSave);
  }, [autoSave, appSettings]);

  // Load asset store configuration
  useEffect(() => {
    try {
      const assetStoreConfig = appSettings.getUnifiedSetting("assetStore", {
        enabled: false,
        providers: {
          unsplash: { enabled: false, apiKey: "", rateLimit: 50 },
          pexels: { enabled: false, apiKey: "", rateLimit: 200 },
        },
        ui: { defaultView: "grid", itemsPerPage: 20, showAttribution: true },
        cache: { enabled: true, maxItems: 1000, ttl: 60 },
      }) as { enabled: boolean };
      setIsAssetStoreEnabled(assetStoreConfig.enabled);
    } catch (error) {
      logger.error("Failed to load asset store config:", error);
      setIsAssetStoreEnabled(false);
    }
  }, [appSettings]);

  useEffect(() => {
    appSettings.updateUnifiedSetting("autoSave.duration", autoSaveDuration);
  }, [autoSaveDuration, appSettings]);

  // Load project on mount
  useEffect(() => {
    const loadProject = async () => {
      try {
        setIsLoading(true);

        if (projectId) {
          // Load existing project
          const project = await ProjectManager.loadProject(projectId);
          if (project) {
            setCurrentProject(project);
            setProjectName(project.name);
            setCurrentModel(project.settings.currentModel);
            setCurrentSize(project.settings.currentSize);
            setIsInpaintMode(project.settings.isInpaintMode);
            setCurrentImage(project.canvas.currentImage);
            setGeneratedImage(project.canvas.generatedImage);
            setAttachedImage(project.canvas.attachedImage);

            // Restore UI state if available
            if (project.ui) {
              setActiveTool(project.ui.activeTool as Tool);
              // Don't auto-restore generation panel - let user open it manually
              // setShowGenerationPanel(project.ui.showGenerationPanel);
              setShowPromptBox(project.ui.showPromptBox);
              setShowAssetsPanel(project.ui.showAssetsPanel);
              setShowHistoryPanel(project.ui.showHistoryPanel);
              setShowConsole(project.ui.showConsole);
              setShowSizeModal(project.ui.showSizeModal);
              setShowKeyboardShortcuts(project.ui.showKeyboardShortcuts);
              setShowAbout(project.ui.showAbout);
              setZoom(project.ui.zoom);
            }

            // Restore generation state if available
            if (project.generation) {
              setIsGenerating(project.generation.isGenerating);
              setGenerationProgress(project.generation.generationProgress);
              setRequestLog(project.generation.requestLog);
              setResponseLog(project.generation.responseLog);
            }

            // Restore undo/redo history if available
            if (project.history) {
              setHistory(project.history.states);
              setHistoryIndex(project.history.historyIndex);
            }

            // Update page title with project name
            updatePageTitle(project.name);
          } else {
            setError("Project not found");
            // Redirect to studio without project ID
            router.push("/studio");
            return;
          }
        } else {
          // Create new project
          const userId = appConfig.admin.user_id;
          const newProject = await ProjectManager.createProject(
            userId,
            "Untitled Project",
            undefined,
            {
              currentModel: "FLUX.1-Kontext-pro",
              currentSize: "1024x1024",
              isInpaintMode: false,
            },
            {
              currentImage: null,
              generatedImage: null,
              attachedImage: null,
            },
          );
          setCurrentProject(newProject);
          // Redirect to the new project
          router.push(`/studio/${newProject.id}`);
          return;
        }
      } catch (error) {
        logger.error("Failed to load project:", error);
        setError("Failed to load project");
      } finally {
        setIsLoading(false);
      }
    };

    loadProject();
  }, [projectId, router, updatePageTitle]);

  // Save project when state changes
  const saveProject = useCallback(async () => {
    if (!currentProject) return;

    try {
      const updatedProject: Project = {
        ...currentProject,
        name: projectName,
        settings: {
          currentModel,
          currentSize,
          isInpaintMode,
        },
        canvas: {
          currentImage,
          generatedImage,
          attachedImage,
        },
        updated_at: new Date(),
      };

      await ProjectManager.saveProject(updatedProject);
      setCurrentProject(updatedProject);
    } catch (error) {
      logger.error("Failed to save project:", error);
      setError("Failed to save project");
    }
  }, [
    currentProject,
    projectName,
    currentModel,
    currentSize,
    isInpaintMode,
    currentImage,
    generatedImage,
    attachedImage,
  ]);

  // Auto-save project when state changes
  useEffect(() => {
    if (currentProject && !isLoading) {
      const timeoutId = setTimeout(() => {
        saveProject();
      }, 1000); // Debounce saves

      return () => clearTimeout(timeoutId);
    }
  }, [
    currentProject,
    projectName,
    currentModel,
    currentSize,
    isInpaintMode,
    currentImage,
    generatedImage,
    attachedImage,
    saveProject,
    isLoading,
  ]);

  // Handle tool changes
  const handleToolChange = useCallback((tool: Tool) => {
    setActiveTool(tool);

    // Handle panel opening for different tools
    switch (tool) {
      case "generate":
        setShowPromptBox(true);
        setIsInpaintMode(false);
        break;
      case "inpaint":
        setShowPromptBox(true);
        setIsInpaintMode(true);
        break;
      case "assets":
        setShowAssetsPanel(true);
        break;
      case "assetStore":
        setShowAssetStorePanel(true);
        break;
      case "history":
        setShowHistoryPanel(true);
        break;
      case "prompt":
        setShowPromptBox((prev) => !prev);
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
      timestamp: Date.now(),
    };

    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newState);
      // Keep only last N states to prevent memory issues
      return newHistory.slice(-CANVAS_CONSTANTS.MAX_HISTORY_STATES);
    });
    setHistoryIndex((prev) =>
      Math.min(prev + 1, CANVAS_CONSTANTS.MAX_HISTORY_STATES - 1),
    );
  }, [currentImage, generatedImage, attachedImage, zoom, historyIndex]);

  // Handle image attachment
  const handleImageUpload = useCallback(
    (file: File) => {
      // Save current state before upload
      saveToHistory();

      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result as string;
        setAttachedImage(imageData);
      };
      reader.readAsDataURL(file);
    },
    [saveToHistory],
  );

  // Fetch models on component mount (only once)
  const [modelsFetched, setModelsFetched] = useState(false);
  useEffect(() => {
    const fetchModels = async () => {
      if (modelsFetched) return; // Prevent multiple fetches

      try {
        const response = await fetch("/api/models");
        const data = await response.json();
        setModels(data.models);

        // Only set defaults if we don't have a current project AND haven't set model yet
        if (!currentProject && !currentModel) {
          setCurrentModel(data.defaultModel);
          setCurrentSize(data.defaultSize);
        }
        setModelsFetched(true);
      } catch (error) {
        logger.error("Failed to fetch models:", error);
        // Fallback to default values if API fails
        if (!currentProject && !currentModel) {
          setCurrentModel("FLUX.1-Kontext-pro");
          setCurrentSize("1024x1024");
        }
        setModelsFetched(true);
      }
    };

    fetchModels();
  }, [modelsFetched, currentProject, currentModel]); // Include dependencies but use modelsFetched flag

  // Get model name helper - memoized to prevent unnecessary recalculations
  const getModelName = useCallback(
    (modelId: string) => {
      const model = models.find((m) => m.id === modelId);
      return model ? model.name : modelId;
    },
    [models],
  );

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

  // Memoized About modal close handler
  const handleAboutModalClose = useCallback(() => {
    setShowAbout(false);
  }, []);

  // Memoized Shortcuts modal close handler
  const handleShortcutsModalClose = useCallback(() => {
    setShowKeyboardShortcuts(false);
  }, []);

  const handleSettingsModalOpen = useCallback(() => {
    setShowSettings(true);
  }, []);

  const handleSettingsModalClose = useCallback(() => {
    setShowSettings(false);
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

  const handleProjectNameSave = useCallback(async () => {
    if (tempProjectName.trim()) {
      setProjectName(tempProjectName.trim());

      // Update page title immediately
      updatePageTitle(tempProjectName.trim());

      // Immediately save the project name change
      if (currentProject) {
        try {
          const updatedProject: Project = {
            ...currentProject,
            name: tempProjectName.trim(),
            updated_at: new Date(),
          };
          await ProjectManager.saveProject(updatedProject);
          setCurrentProject(updatedProject);
        } catch (error) {
          logger.error("Failed to save project name:", error);
          setError("Failed to save project name");
        }
      }
    }
    setIsEditingProjectName(false);
  }, [tempProjectName, currentProject, updatePageTitle]);

  const handleProjectNameCancel = useCallback(() => {
    setTempProjectName(projectName);
    setIsEditingProjectName(false);
  }, [projectName]);

  const handleProjectNameKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleProjectNameSave();
      } else if (e.key === "Escape") {
        handleProjectNameCancel();
      }
    },
    [handleProjectNameSave, handleProjectNameCancel],
  );

  // Menu bar handlers
  const handleNewProject = useCallback(async () => {
    try {
      const userId = appConfig.admin.user_id;
      const newProject = await ProjectManager.createProject(
        userId,
        "Untitled Project",
        undefined,
        {
          currentModel: "FLUX.1-Kontext-pro",
          currentSize: "1024x1024",
          isInpaintMode: false,
        },
        {
          currentImage: null,
          generatedImage: null,
          attachedImage: null,
        },
      );

      // Redirect to new project
      router.push(`/studio/${newProject.id}`);
    } catch (error) {
      logger.error("Failed to create new project:", error);
      setError("Failed to create new project");
    }
  }, [router]);

  const handleClose = useCallback(() => {
    // In a real app, this would close the window/tab
    logger.log("Close application");
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoom((prev) =>
      Math.min(prev + ZOOM_CONSTANTS.ZOOM_STEP, ZOOM_CONSTANTS.MAX_ZOOM),
    );
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) =>
      Math.max(prev - ZOOM_CONSTANTS.ZOOM_STEP, ZOOM_CONSTANTS.MIN_ZOOM),
    );
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
      setHistoryIndex((prev) => prev - 1);
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setCurrentImage(nextState.currentImage);
      setGeneratedImage(nextState.generatedImage);
      setAttachedImage(nextState.attachedImage);
      setZoom(nextState.zoom);
      setHistoryIndex((prev) => prev + 1);
    }
  }, [history, historyIndex]);

  const handleShowKeyboardShortcuts = useCallback(() => {
    setShowKeyboardShortcuts(true);
  }, []);

  const handleShowAbout = useCallback(() => {
    setShowAbout(true);
  }, []);

  const handleShowDocumentation = useCallback(() => {
    window.open("https://github.com/DrHazemAli/azure-image-studio", "_blank");
  }, []);

  const handleShowGitHub = useCallback(() => {
    window.open("https://github.com/DrHazemAli/azure-image-studio", "_blank");
  }, []);

  const handleShowSupport = useCallback(() => {
    window.open(
      "https://github.com/DrHazemAli/azure-image-studio/issues",
      "_blank",
    );
  }, []);

  // Insert menu handlers
  const handleInsertImage = useCallback(() => {
    // Trigger file upload for image
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        // Convert file to base64 and add to canvas
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageData = e.target?.result as string;
          if (imageData && canvasRef.current) {
            canvasRef.current.addImageToCanvas(imageData);
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }, []);

  const handleInsertLayer = useCallback(() => {
    // Create a new layer - for now just show a notification
    logger.log("Insert new layer");
    // TODO: Implement layer creation logic
  }, []);

  const handleInsertText = useCallback(() => {
    // Switch to text tool
    setActiveTool("text");
  }, []);

  const handleInsertShape = useCallback(() => {
    // Switch to shape tool
    setActiveTool("shape");
  }, []);

  const handleInsertRectangle = useCallback(() => {
    // Switch to shape tool and set rectangle mode
    setActiveTool("shape");
    // TODO: Set specific shape mode to rectangle
  }, []);

  const handleInsertCircle = useCallback(() => {
    // Switch to shape tool and set circle mode
    setActiveTool("shape");
    // TODO: Set specific shape mode to circle
  }, []);

  const handleInsertLine = useCallback(() => {
    // Switch to shape tool and set line mode
    setActiveTool("shape");
    // TODO: Set specific shape mode to line
  }, []);

  const handleInsertFromAssetStore = useCallback(() => {
    setActiveTool("assetStore");
    setShowAssetStorePanel(true);
    logger.info("Insert from asset store requested");
  }, []);

  // Handle project export
  const handleExportProject = useCallback(async () => {
    if (!currentProject) return;

    try {
      const projectData =
        await ProjectManager.exportProjectFromDB(currentProject);
      ProjectManager.downloadProject(projectData);
    } catch (error) {
      logger.error("Export failed:", error);
      setError("Failed to export project");
    }
  }, [currentProject]);

  const handleSaveProject = useCallback(() => {
    handleExportProject();
  }, [handleExportProject]);

  // Handle project import
  const handleImportProject = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const projectData = await ProjectManager.readProjectFromFile(file);
        const userId = appConfig.admin.user_id;
        const result = await ProjectManager.importProjectToDB(
          projectData,
          userId,
        );

        if (result.success && result.project) {
          // Redirect to the imported project
          router.push(`/studio/${result.project.id}`);
        } else {
          setError(result.message);
        }
      } catch (error) {
        logger.error("Import failed:", error);
        setError("Failed to import project");
      }
    };
    input.click();
  }, [router]);

  // Handle image generation
  const handleGenerate = useCallback(
    async (params: GenerationParams) => {
      // Save current state before generation
      saveToHistory();

      setIsGenerating(true);
      setGenerationProgress(0);
      setError(null);
      setGeneratedImage(null); // Clear previous generated image

      try {
        // Simulate progress
        const progressInterval = setInterval(() => {
          setGenerationProgress((prev) => Math.min(prev + 10, 90));
        }, 500);

        const response = await fetch("/api/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            deploymentId: params.model,
            prompt: params.prompt,
            size: params.size,
            outputFormat: "png",
            count: params.count,
            quality: params.quality,
            style: params.style,
            seed: params.seed,
            negativePrompt: params.negativePrompt,
            mode: isInpaintMode ? "edit" : "generate",
            image: isInpaintMode ? attachedImage : undefined,
            mask: undefined, // Could be added later for mask support
          }),
        });

        clearInterval(progressInterval);

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Generation failed");
        }

        setGenerationProgress(100);
        setRequestLog(data.requestLog);
        setResponseLog(data.responseLog);

        // Set the generated image and save to assets & history
        if (data.data && data.data.data && data.data.data[0]) {
          const imageItem = data.data.data[0];

          // Validate that b64_json exists and is not undefined
          if (!imageItem.b64_json) {
            logger.error(
              "Generated image data is missing b64_json field:",
              imageItem,
            );
            setError("Generated image data is invalid - missing image content");
            setResponseLog(
              "Error: Generated image data is missing b64_json field",
            );
            return;
          }

          const imageData = `data:image/png;base64,${imageItem.b64_json}`;
          setCurrentImage(imageData);
          setGeneratedImage(imageData);

          // Save to assets using IndexedDB
          const asset: Asset = {
            id: Date.now().toString(),
            project_id: currentProject?.id || "",
            url: imageData,
            name: `Generated-${new Date().toISOString().slice(0, 16)}`,
            type: "generation" as const,
            timestamp: new Date(),
            prompt: params.prompt,
            model: params.model,
          };

          try {
            await dbManager.saveAsset(asset);
          } catch (error) {
            logger.warn("Failed to save to assets:", error);
          }

          // Save to history using IndexedDB
          const historyEntry: HistoryEntry = {
            id: Date.now().toString(),
            project_id: currentProject?.id || "",
            type: "generation" as const,
            timestamp: new Date(),
            prompt: params.prompt,
            model: params.model,
            settings: { size: params.size, quality: params.quality },
            imageUrl: imageData,
            thumbnailUrl: imageData,
            status: "completed" as const,
          };

          try {
            await dbManager.saveHistoryEntry(historyEntry);
          } catch (error) {
            logger.warn("Failed to save to history:", error);
          }
        }
      } catch (error) {
        logger.error("Generation error:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        setError(errorMessage);
        setResponseLog(errorMessage);
      } finally {
        setIsGenerating(false);
        setTimeout(() => setGenerationProgress(0), 2000);
      }
    },
    [isInpaintMode, attachedImage, saveToHistory, currentProject?.id],
  );

  // Migrate from localStorage to IndexedDB on mount
  useEffect(() => {
    const migrateData = async () => {
      try {
        await dbManager.migrateFromLocalStorage();
      } catch (error) {
        logger.error("Migration failed:", error);
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
          case "s":
            event.preventDefault();
            handleExportProject();
            break;
          case "o":
            event.preventDefault();
            handleImportProject();
            break;
          case "e":
            event.preventDefault();
            handleExportProject();
            break;
          case "z":
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
          case "1":
            event.preventDefault();
            setActiveTool("select");
            break;
          case "m":
            event.preventDefault();
            setActiveTool("move");
            break;
          case "h":
            event.preventDefault();
            setActiveTool("hand");
            break;
          case "2":
            event.preventDefault();
            setActiveTool("zoom");
            break;
          case "g":
            event.preventDefault();
            setActiveTool("generate");
            setShowPromptBox(true);
            break;
          case "3":
            event.preventDefault();
            setActiveTool("assets");
            setShowAssetsPanel(true);
            break;
          case "4":
            event.preventDefault();
            setActiveTool("assetStore");
            setShowAssetStorePanel(true);
            break;
          case "e":
            event.preventDefault();
            setActiveTool("edit");
            break;
          case "b":
            event.preventDefault();
            setActiveTool("brush");
            break;
          case "T":
            if (event.shiftKey) {
              event.preventDefault();
              setActiveTool("text");
            }
            break;
          case "4":
            event.preventDefault();
            setActiveTool("crop");
            break;
          case "i":
            event.preventDefault();
            setActiveTool("inpaint");
            setShowPromptBox(true);
            break;
          case "p":
            event.preventDefault();
            setActiveTool("prompt");
            setShowPromptBox((prev) => !prev);
            break;
          case "u":
            event.preventDefault();
            setActiveTool("shape");
            break;
          case "y":
            event.preventDefault();
            setActiveTool("history");
            setShowHistoryPanel(true);
            break;
        }
      }

      // Special tool shortcuts that don't use Cmd
      if (
        event.shiftKey &&
        event.key === "E" &&
        !event.metaKey &&
        !event.ctrlKey
      ) {
        event.preventDefault();
        setActiveTool("eraser");
      }

      if (event.altKey && !event.metaKey && !event.ctrlKey && !event.shiftKey) {
        event.preventDefault();
        setActiveTool("eyedropper");
      }

      if (
        event.shiftKey &&
        event.altKey &&
        event.key === "B" &&
        !event.metaKey &&
        !event.ctrlKey
      ) {
        event.preventDefault();
        setActiveTool("blend");
      }
    };

    window.addEventListener("keydown", handleKeyDown, { passive: false });
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleExportProject, handleImportProject, handleUndo, handleRedo]);

  if (isLoading) {
    return <StudioLoading isVisible={true} />;
  }

  return (
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
                {appConfig.app.name}
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
              onInsertImage={handleInsertImage}
              onInsertLayer={handleInsertLayer}
              onInsertText={handleInsertText}
              onInsertShape={handleInsertShape}
              onInsertRectangle={handleInsertRectangle}
              onInsertCircle={handleInsertCircle}
              onInsertLine={handleInsertLine}
              onInsertFromAssetStore={handleInsertFromAssetStore}
              isAssetStoreEnabled={isAssetStoreEnabled}
              showConsole={showConsole}
              showAssetsPanel={showAssetsPanel}
              showHistoryPanel={showHistoryPanel}
              showPromptBox={showPromptBox}
              onToggleConsole={() => setShowConsole(!showConsole)}
              onToggleAssetsPanel={() => setShowAssetsPanel(!showAssetsPanel)}
              onToggleHistoryPanel={() =>
                setShowHistoryPanel(!showHistoryPanel)
              }
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
                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                : "hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
            title="Toggle Console"
          >
            <Code className="w-4 h-4" />
          </motion.button>

          {/* Sync Manager */}
          <SyncManager
            currentProject={currentProject}
            projectName={projectName}
            currentModel={currentModel}
            currentSize={currentSize}
            isInpaintMode={isInpaintMode}
            currentImage={currentImage}
            generatedImage={generatedImage}
            attachedImage={attachedImage}
            activeTool={activeTool}
            showGenerationPanel={showGenerationPanel}
            showPromptBox={showPromptBox}
            showAssetsPanel={showAssetsPanel}
            showHistoryPanel={showHistoryPanel}
            showConsole={showConsole}
            showSizeModal={showSizeModal}
            showKeyboardShortcuts={showKeyboardShortcuts}
            showAbout={showAbout}
            zoom={zoom}
            isGenerating={isGenerating}
            generationProgress={generationProgress}
            requestLog={requestLog}
            responseLog={responseLog}
            history={history}
            historyIndex={historyIndex}
            autoSave={autoSave}
            autoSaveDuration={autoSaveDuration}
            onToggleAutoSave={toggleAutoSave}
            onUpdateAutoSaveDuration={updateAutoSaveDuration}
          />

          <ThemeToggle />
        </div>
      </motion.header>

      {/* Main Studio Area */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Left Toolbar */}
        <Toolbar activeTool={activeTool} onToolChange={handleToolChange} />

        <Canvas
          ref={canvasRef}
          activeTool={activeTool}
          currentImage={currentImage}
          onImageLoad={setCurrentImage}
          isGenerating={isGenerating}
          isInpaintMode={isInpaintMode}
          generatedImage={generatedImage}
          zoom={zoom}
          onZoomChange={setZoom}
          showAssetStore={showAssetStorePanel}
          onAssetStoreToggle={() =>
            setShowAssetStorePanel(!showAssetStorePanel)
          }
          onAssetSelect={(asset) => {
            setCurrentImage(asset.url);
            setShowAssetStorePanel(false);
          }}
          projectId={currentProject?.id}
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
        projectId={currentProject?.id}
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
        projectId={currentProject?.id}
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
          <span>
            {appConfig.app.name} v{appConfig.app.version}
          </span>
          <button
            onClick={handleSettingsModalOpen}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Settings"
          >
            <GearIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          <a
            href="https://github.com/DrHazemAli/azure-image-studio"
            target="_blank"
            rel="noopener noreferrer"
          >
            <GitHubLogoIcon className="w-4 h-4" />
          </a>
          <a
            href="https://linkedin.com/in/hazemali"
            target="_blank"
            rel="noopener noreferrer"
          >
            <LinkedInLogoIcon className="w-4 h-4" />
          </a>
        </div>
      </motion.div>

      {/* Error Notification */}
      <ErrorNotification error={error} onDismiss={handleErrorDismiss} />

      {/* Enhanced Prompt Box */}
      {showPromptBox && (
        <EnhancedPromptBox
          onGenerate={(prompt) => {
            handleGenerate({
              prompt,
              model: currentModel,
              size: "1024x1024",
              quality: "standard",
              count: 1,
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
              "A man with a beard and a beard",
            ];
            return prompts[Math.floor(Math.random() * prompts.length)];
          }}
          isGenerating={isGenerating}
          progress={
            generationProgress
              ? {
                  stage: "Generating",
                  progress: generationProgress,
                  message: "Creating your image...",
                  estimatedTime: Math.max(
                    0,
                    Math.round((100 - generationProgress) * 0.3),
                  ),
                }
              : null
          }
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

      {/* About Modal */}
      <AboutModal isOpen={showAbout} onClose={handleAboutModalClose} />

      {/* Shortcuts Modal */}
      <ShortcutsModal
        isOpen={showKeyboardShortcuts}
        onClose={handleShortcutsModalClose}
      />

      {/* Settings Dialog */}
      <SettingsDialog
        isOpen={showSettings}
        onClose={handleSettingsModalClose}
      />
    </motion.div>
  );
}
