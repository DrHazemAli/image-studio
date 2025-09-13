"use client";

import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
  memo,
} from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import {
  X,
  FolderOpen,
  Search,
  User,
  ChevronDown,
  Download,
  Upload,
  Trash2,
  Eye,
  Calendar,
  FileText,
  MoreVertical,
  RefreshCw,
  Grid3X3,
  List,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProjectManager } from "@/lib/project-manager";
import { dbManager, type Project, type Asset } from "@/lib/indexeddb";
import appConfig from "@/app/config/app-config.json";

interface ProjectsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectSelect?: (project: Project) => void;
}

interface ProjectWithStats extends Project {
  assetCount: number;
  lastActivity: string;
  size: string;
}

// Memoized table row component for performance
const TableRow = memo(({ 
  project, 
  showProjectMenu, 
  toggleProjectMenu, 
  handleProjectSelect, 
  handleExportProject, 
  handleDeleteProject, 
  isExporting 
}: {
  project: ProjectWithStats;
  showProjectMenu: string | null;
  toggleProjectMenu: (projectId: string) => void;
  handleProjectSelect: (project: ProjectWithStats) => void;
  handleExportProject: (project: ProjectWithStats) => void;
  handleDeleteProject: (project: ProjectWithStats) => void;
  isExporting: boolean;
}) => (
  <tr className="group hover:scale-[0.98] transition-all duration-200 ease-out mb-2">
    <td className="w-[40%] min-w-0 px-6 py-4  group-hover:bg-white/80 dark:group-hover:bg-gray-800/80 group-hover:shadow-lg group-hover:mx-2 group-hover:my-1 rounded-l-full">
      <div className="flex items-center min-w-0">
        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
          <FolderOpen className="w-4 h-4 text-white" />
        </div>
        <div className="ml-3 flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 dark:text-white truncate" title={project.name}>
            {project.name}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 truncate" title={project.id}>
            {project.id}
          </div>
        </div>
      </div>
    </td>
    <td className="w-[15%] px-6 py-4 max-w-0 group-hover:bg-white/80 dark:group-hover:bg-gray-800/80 group-hover:my-1">
      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 min-w-0">
        <FileText className="w-4 h-4 mr-1 flex-shrink-0" />
        <span className="truncate">{project.assetCount}</span>
      </div>
    </td>
    <td className="w-[15%] px-6 py-4 max-w-0 group-hover:bg-white/80 dark:group-hover:bg-gray-800/80 group-hover:my-1">
      <div className="text-sm text-gray-500 dark:text-gray-400 truncate" title={project.size}>
        {project.size}
      </div>
    </td>
    <td className="w-[20%] px-6 py-4 max-w-0 group-hover:bg-white/80 dark:group-hover:bg-gray-800/80 group-hover:my-1">
      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 min-w-0">
        <Calendar className="w-4 h-4 mr-1 flex-shrink-0" />
        <span className="truncate" title={project.lastActivity}>{project.lastActivity}</span>
      </div>
    </td>
    <td className="w-[10%] px-6 py-4 text-right max-w-0 group-hover:bg-white/80 dark:group-hover:bg-gray-800/80 group-hover:shadow-lg group-hover:mx-2 group-hover:my-1 rounded-r-full">
      <div className="flex items-center justify-end gap-2 min-w-0">
        <button
          onClick={() => handleProjectSelect(project)}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
          title="Open Project"
        >
          <Eye className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleExportProject(project)}
          disabled={isExporting}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
          title="Export Project"
        >
          <Download className="w-4 h-4" />
        </button>
        <div className="relative">
          <button
            onClick={() => toggleProjectMenu(project.id)}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            title="More Options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {showProjectMenu === project.id && (
            <div className="absolute right-0 top-8 z-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[120px]">
              <button
                onClick={() => {
                  handleExportProject(project);
                  toggleProjectMenu("");
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={() => {
                  handleDeleteProject(project);
                  toggleProjectMenu("");
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </td>
  </tr>
));

TableRow.displayName = "TableRow";

// Memoized card component for performance
const ProjectCard = memo(({ 
  project, 
  showProjectMenu, 
  toggleProjectMenu, 
  handleProjectSelect, 
  handleExportProject, 
  handleDeleteProject, 
  isExporting 
}: {
  project: ProjectWithStats;
  showProjectMenu: string | null;
  toggleProjectMenu: (projectId: string) => void;
  handleProjectSelect: (project: ProjectWithStats) => void;
  handleExportProject: (project: ProjectWithStats) => void;
  handleDeleteProject: (project: ProjectWithStats) => void;
  isExporting: boolean;
}) => (
  <div className="group relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-4 hover:shadow-lg transition-all duration-200">
    {/* Project Header */}
    <div className="flex items-start justify-between mb-3">
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
          {project.name}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
          {project.settings.currentModel}
        </p>
      </div>
      <button
        onClick={() => toggleProjectMenu(project.id)}
        className="p-1 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
      >
        <MoreVertical className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      </button>
    </div>

    {/* Project Stats */}
    <div className="space-y-2 mb-4">
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <FileText className="w-3 h-3" />
        <span>{project.assetCount} assets</span>
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <Calendar className="w-3 h-3" />
        <span>{project.lastActivity}</span>
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400">
        Size: {project.size}
      </div>
    </div>

    {/* Project Actions */}
    <div className="flex gap-2">
      <button
        onClick={() => handleProjectSelect(project)}
        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg transition-colors duration-150 text-sm"
      >
        <Eye className="w-4 h-4" />
        Open
      </button>
      <button
        onClick={() => handleExportProject(project)}
        disabled={isExporting}
        className="px-3 py-2 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 rounded-lg transition-colors duration-150 disabled:opacity-50"
        title="Export"
      >
        <Download className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      </button>
    </div>

    {/* Project Menu */}
    {showProjectMenu === project.id && (
      <div className="absolute top-12 right-4 z-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[120px]">
        <button
          onClick={() => {
            handleExportProject(project);
            toggleProjectMenu("");
          }}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
        <button
          onClick={() => {
            handleDeleteProject(project);
            toggleProjectMenu("");
          }}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>
    )}
  </div>
));

ProjectCard.displayName = "ProjectCard";

export function ProjectsDialog({ isOpen, onClose, onProjectSelect }: ProjectsDialogProps) {
  const [projects, setProjects] = useState<ProjectWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "created" | "modified">("modified");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [showProjectMenu, setShowProjectMenu] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [displayMode, setDisplayMode] = useState<"card" | "table">("card");
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load projects on mount
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setIsLoading(true);
        const allProjects = await dbManager.getProjects();
        
        // Enhance projects with stats
        const projectsWithStats: ProjectWithStats[] = await Promise.all(
          allProjects.map(async (project: Project) => {
            const assets = await dbManager.getAssets(project.id);
            
            // Calculate project size (rough estimate)
            const imageSize = (project.canvas.currentImage?.length || 0) + 
                            (project.canvas.generatedImage?.length || 0) + 
                            (project.canvas.attachedImage?.length || 0);
            const assetsSize = assets.reduce((total: number, asset: Asset) => total + (asset.url?.length || 0), 0);
            const totalSize = imageSize + assetsSize;
            
            // Format size
            const formatSize = (bytes: number) => {
              if (bytes === 0) return "0 B";
              const k = 1024;
              const sizes = ["B", "KB", "MB", "GB"];
              const i = Math.floor(Math.log(bytes) / Math.log(k));
              return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
            };

            return {
              ...project,
              assetCount: assets.length,
              lastActivity: project.updated_at.toLocaleDateString(),
              size: formatSize(totalSize),
            };
          })
        );

        setProjects(projectsWithStats);
      } catch (error) {
        console.error("Failed to load projects:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      loadProjects();
    }
  }, [isOpen]);

  // Debounce search input
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Filter and sort projects
  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projects;

    // Filter by search query
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = projects.filter(
        (project) =>
          project.name.toLowerCase().includes(query) ||
          project.id.toLowerCase().includes(query)
      );
    }

    // Sort projects
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "created":
          comparison = a.created_at.getTime() - b.created_at.getTime();
          break;
        case "modified":
          comparison = a.updated_at.getTime() - b.updated_at.getTime();
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [projects, debouncedSearchQuery, sortBy, sortOrder]);

  // Virtual scrolling for table view
  const ROW_HEIGHT = 80; // Approximate row height (increased for better spacing)
  const VISIBLE_ROWS = Math.ceil((containerHeight || 400) / ROW_HEIGHT) + 3; // Buffer rows with fallback
  const startIndex = Math.max(0, Math.floor((scrollTop || 0) / ROW_HEIGHT) - 1);
  const endIndex = Math.min(startIndex + VISIBLE_ROWS, filteredAndSortedProjects.length);
  const visibleProjects = filteredAndSortedProjects.slice(startIndex, endIndex);
  const totalHeight = filteredAndSortedProjects.length * ROW_HEIGHT;
  const offsetY = startIndex * ROW_HEIGHT;

  // Handlers
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleSortChange = useCallback((newSortBy: "name" | "created" | "modified") => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(newSortBy);
      setSortOrder("desc");
    }
  }, [sortBy, sortOrder]);

  const handleProjectSelect = useCallback((project: ProjectWithStats) => {
    if (onProjectSelect) {
      onProjectSelect(project);
    }
    onClose();
  }, [onProjectSelect, onClose]);

  const handleExportProject = useCallback(async (project: ProjectWithStats) => {
    try {
      setIsExporting(true);
      const projectData = await ProjectManager.exportProjectFromDB(project);
      ProjectManager.downloadProject(projectData);
    } catch (error) {
      console.error("Failed to export project:", error);
    } finally {
      setIsExporting(false);
    }
  }, []);

  const handleImportProject = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const handleFileImport = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      const projectData = await ProjectManager.readProjectFromFile(file);
      const userId = appConfig.admin.user_id;
      const result = await ProjectManager.importProjectToDB(projectData, userId);
      
      if (result.success && result.project) {
        // Reload projects
        const allProjects = await dbManager.getProjects();
        const projectsWithStats: ProjectWithStats[] = await Promise.all(
          allProjects.map(async (project: Project) => {
            const assets = await dbManager.getAssets(project.id);
            
            const imageSize = (project.canvas.currentImage?.length || 0) + 
                            (project.canvas.generatedImage?.length || 0) + 
                            (project.canvas.attachedImage?.length || 0);
            const assetsSize = assets.reduce((total: number, asset: Asset) => total + (asset.url?.length || 0), 0);
            const totalSize = imageSize + assetsSize;
            
            const formatSize = (bytes: number) => {
              if (bytes === 0) return "0 B";
              const k = 1024;
              const sizes = ["B", "KB", "MB", "GB"];
              const i = Math.floor(Math.log(bytes) / Math.log(k));
              return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
            };

            return {
              ...project,
              assetCount: assets.length,
              lastActivity: project.updated_at.toLocaleDateString(),
              size: formatSize(totalSize),
            };
          })
        );

        setProjects(projectsWithStats);
      }
    } catch (error) {
      console.error("Failed to import project:", error);
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, []);

  const handleDeleteProject = useCallback(async (project: ProjectWithStats) => {
    if (window.confirm(`Are you sure you want to delete "${project.name}"? This action cannot be undone.`)) {
      try {
        await dbManager.deleteProject(project.id);
        setProjects(prev => prev.filter(p => p.id !== project.id));
      } catch (error) {
        console.error("Failed to delete project:", error);
      }
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    try {
      setIsLoading(true);
      const allProjects = await dbManager.getProjects();
      
      const projectsWithStats: ProjectWithStats[] = await Promise.all(
        allProjects.map(async (project: Project) => {
          const assets = await dbManager.getAssets(project.id);
          
          const imageSize = (project.canvas.currentImage?.length || 0) + 
                          (project.canvas.generatedImage?.length || 0) + 
                          (project.canvas.attachedImage?.length || 0);
          const assetsSize = assets.reduce((total: number, asset: Asset) => total + (asset.url?.length || 0), 0);
          const totalSize = imageSize + assetsSize;
          
          const formatSize = (bytes: number) => {
            if (bytes === 0) return "0 B";
            const k = 1024;
            const sizes = ["B", "KB", "MB", "GB"];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
          };

          return {
            ...project,
            assetCount: assets.length,
            lastActivity: project.updated_at.toLocaleDateString(),
            size: formatSize(totalSize),
          };
        })
      );

      setProjects(projectsWithStats);
    } catch (error) {
      console.error("Failed to refresh projects:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleSearchExpanded = useCallback(() => {
    setIsSearchExpanded((prev) => !prev);
  }, []);

  const toggleUserMenu = useCallback(() => {
    setShowUserMenu((prev) => !prev);
  }, []);

  const toggleProjectMenu = useCallback((projectId: string | null) => {
    setShowProjectMenu(projectId === showProjectMenu ? null : projectId);
  }, [showProjectMenu]);

  // Scroll handlers for virtual scrolling
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const handleContainerResize = useCallback((element: HTMLDivElement | null) => {
    if (element) {
      setContainerHeight(element.clientHeight);
    }
  }, []);

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <Dialog.Title className="sr-only">Projects</Dialog.Title>
          <Dialog.Description className="sr-only">
            Manage your saved projects including viewing, editing, deleting, importing, and exporting.
          </Dialog.Description>
          <div className="w-full max-w-6xl h-[85vh] max-h-[700px] bg-white/80 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
            {/* macOS Window Controls */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200/30 dark:border-gray-700/30">
              <div className="flex items-center gap-2">
                {/* macOS Window Controls */}
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="ml-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Projects
                  </h2>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Display Mode Toggle */}
                <div className="flex items-center bg-gray-100/50 dark:bg-gray-800/50 rounded-lg p-1">
                  <button
                    onClick={() => setDisplayMode("card")}
                    className={cn(
                      "p-1.5 rounded-md transition-colors",
                      displayMode === "card"
                        ? "bg-white dark:bg-gray-700 shadow-sm"
                        : "hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
                    )}
                    title="Card View"
                  >
                    <Grid3X3 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                  <button
                    onClick={() => setDisplayMode("table")}
                    className={cn(
                      "p-1.5 rounded-md transition-colors",
                      displayMode === "table"
                        ? "bg-white dark:bg-gray-700 shadow-sm"
                        : "hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
                    )}
                    title="Table View"
                  >
                    <List className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
                <button
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="p-2 rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors disabled:opacity-50"
                  title="Refresh"
                >
                  <RefreshCw className={`w-4 h-4 text-gray-600 dark:text-gray-400 ${isLoading ? "animate-spin" : ""}`} />
                </button>
                <Dialog.Close asChild>
                  <button className="w-6 h-6 rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-700/50 flex items-center justify-center transition-colors">
                    <X className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                  </button>
                </Dialog.Close>
              </div>
            </div>

            <div className="flex h-full">
              {/* Sidebar */}
              <div className="w-60 bg-gray-50/30 dark:bg-zinc-800/30 backdrop-blur-sm border-r border-gray-200/30 dark:border-gray-700/30 flex flex-col">
                <ScrollArea.Root className="flex-1">
                  <ScrollArea.Viewport className="h-full">
                    <div className="p-4 mt-4">
                      {/* User Account Section */}
                      <div className="mb-4">
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-white/30 dark:bg-gray-700/30 backdrop-blur-sm border border-gray-200/30 dark:border-gray-600/30">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 dark:text-white text-xs truncate">
                        {appConfig.admin.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {appConfig.admin.email}
                      </div>
                    </div>
                    <button
                      onClick={toggleUserMenu}
                      className="p-1 hover:bg-gray-200/50 dark:hover:bg-gray-600/50 rounded-lg transition-colors duration-150 flex-shrink-0"
                    >
                      <ChevronDown
                        className={`w-3 h-3 text-gray-500 dark:text-gray-400 transition-transform duration-150 ${showUserMenu ? "rotate-180" : ""}`}
                      />
                    </button>
                  </div>

                  {showUserMenu && (
                    <div className="mt-2 p-2 bg-white/20 dark:bg-gray-700/20 backdrop-blur-sm rounded-lg border border-gray-200/30 dark:border-gray-600/30">
                      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
                        <div className="truncate">Role: {appConfig.admin.role}</div>
                        <div className="truncate">ID: {appConfig.admin.user_id.slice(0, 6)}...</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Search Bar */}
                <div className="mb-4">
                  <form autoComplete="off" onSubmit={(e) => e.preventDefault()}>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={toggleSearchExpanded}
                        className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none"
                      >
                        <Search className="w-3 h-3 text-gray-400" />
                      </button>
                      <input
                        ref={searchInputRef}
                        type="search"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        autoComplete="new-password"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck="false"
                        className={cn(
                          "w-full pl-7 pr-3 py-2 bg-white/50 dark:bg-gray-900/50 border border-gray-200/50 dark:border-gray-700/50 rounded-lg text-xs placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-colors duration-150",
                          isSearchExpanded ? "opacity-100" : "opacity-70",
                        )}
                      />
                    </div>
                  </form>
                </div>

                {/* Sort Options */}
                <div className="mb-4">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Sort by</div>
                  <div className="space-y-1">
                    {[
                      { key: "modified", label: "Modified" },
                      { key: "created", label: "Created" },
                      { key: "name", label: "Name" },
                    ].map((option) => (
                      <button
                        key={option.key}
                        onClick={() => handleSortChange(option.key as "name" | "created" | "modified")}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors duration-150",
                          sortBy === option.key
                            ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-700/50"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50"
                        )}
                      >
                        <span className="truncate">{option.label}</span>
                        {sortBy === option.key && (
                          <span className="text-xs flex-shrink-0 ml-1">
                            {sortOrder === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <button
                    onClick={handleImportProject}
                    disabled={isImporting}
                    className="w-full flex items-center gap-2 px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg transition-colors duration-150 disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4" />
                    {isImporting ? "Importing..." : "Import Project"}
                  </button>
                </div>

                      {/* Stats */}
                      <div className="mt-6 p-3 bg-white/20 dark:bg-gray-700/20 backdrop-blur-sm rounded-lg border border-gray-200/30 dark:border-gray-600/30">
                        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                          <div>Total Projects: {projects.length}</div>
                          <div>Total Assets: {projects.reduce((sum, p) => sum + p.assetCount, 0)}</div>
                        </div>
                      </div>
                    </div>
                  </ScrollArea.Viewport>
                  <ScrollArea.Scrollbar
                    className="flex touch-none select-none transition-colors"
                    orientation="vertical"
                  >
                    <ScrollArea.Thumb className="relative flex-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                  </ScrollArea.Scrollbar>
                </ScrollArea.Root>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-hidden bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
                <ScrollArea.Root className="h-[calc(100vh-440px)]">
                  <ScrollArea.Viewport 
                    className="h-full"
                    onScroll={handleScroll}
                    ref={handleContainerResize}
                  >
                    <div className="p-6">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : filteredAndSortedProjects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                      <FolderOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        {debouncedSearchQuery ? "No projects found" : "No projects yet"}
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-4">
                        {debouncedSearchQuery 
                          ? `No projects match "${debouncedSearchQuery}"`
                          : "Create your first project to get started"
                        }
                      </p>
                    </div>
                  ) : displayMode === "card" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredAndSortedProjects.map((project) => (
                        <ProjectCard
                          key={project.id}
                          project={project}
                          showProjectMenu={showProjectMenu}
                          toggleProjectMenu={toggleProjectMenu}
                          handleProjectSelect={handleProjectSelect}
                          handleExportProject={handleExportProject}
                          handleDeleteProject={handleDeleteProject}
                          isExporting={isExporting}
                        />
                      ))}
                    </div>
                  ) : (
                    /* Table View */
                    <div className="flex justify-center">
                      <div className="w-full max-w-6xl overflow-hidden mb-6">
                        <div className="overflow-x-auto">
                          <table className="w-full  table border-collapse">
                          <tbody>
                            {displayMode === "table" && filteredAndSortedProjects.length > 20 ? (
                              // Virtual scrolling for large lists
                              <>
                                <tr style={{ height: offsetY }} />
                                {visibleProjects.map((project) => (
                                  <TableRow
                                    key={project.id}
                                    project={project}
                                    showProjectMenu={showProjectMenu}
                                    toggleProjectMenu={toggleProjectMenu}
                                    handleProjectSelect={handleProjectSelect}
                                    handleExportProject={handleExportProject}
                                    handleDeleteProject={handleDeleteProject}
                                    isExporting={isExporting}
                                  />
                                ))}
                                <tr style={{ height: totalHeight - offsetY - (visibleProjects.length * ROW_HEIGHT) }} />
                              </>
                            ) : (
                              // Regular rendering for small lists
                              filteredAndSortedProjects.map((project) => (
                                <TableRow
                                  key={project.id}
                                  project={project}
                                  showProjectMenu={showProjectMenu}
                                  toggleProjectMenu={toggleProjectMenu}
                                  handleProjectSelect={handleProjectSelect}
                                  handleExportProject={handleExportProject}
                                  handleDeleteProject={handleDeleteProject}
                                  isExporting={isExporting}
                                />
                              ))
                            )}
                          </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                    </div>
                  </ScrollArea.Viewport>
                  <ScrollArea.Scrollbar
                    className="flex touch-none select-none transition-colors"
                    orientation="vertical"
                  >
                    <ScrollArea.Thumb className="relative flex-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                  </ScrollArea.Scrollbar>
                </ScrollArea.Root>
              </div>
            </div>
          </div>

          {/* Hidden file input for import */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileImport}
            className="hidden"
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
