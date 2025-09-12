"use client";

import React, {
  useState,
  useMemo,
  useCallback,
  lazy,
  Suspense,
  useRef,
  useEffect,
} from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  X,
  Settings,
  Info,
  Globe,
  Sliders,
  Search,
  User,
  ChevronDown,
  Package,
  Terminal,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { config } from "@/lib/settings";
import appConfig from "@/app/config/app-config.json";
import {
  GeneralSettingsSkeleton,
  AzureSettingsSkeleton,
  ModelsSettingsSkeleton,
  AdvancedSettingsSkeleton,
  AboutSettingsSkeleton,
  LoggerSettingsSkeleton,
} from "@/components/settings/settings-skeletons";

// Lazy load settings components
const GeneralSettings = lazy(() =>
  import("@/components/settings/general-settings").then((m) => ({
    default: m.GeneralSettings,
  })),
);
const AzureSettings = lazy(() =>
  import("@/components/settings/azure-settings").then((m) => ({
    default: m.AzureSettings,
  })),
);
const ModelsSettings = lazy(() =>
  import("@/components/settings/models-settings").then((m) => ({
    default: m.ModelsSettings,
  })),
);
const AdvancedSettings = lazy(() =>
  import("@/components/settings/advanced-settings").then((m) => ({
    default: m.AdvancedSettings,
  })),
);
const AboutSettings = lazy(() =>
  import("@/components/settings/about-settings").then((m) => ({
    default: m.AboutSettings,
  })),
);
const LoggerSettings = lazy(() =>
  import("@/components/settings/logger-settings").then((m) => ({
    default: m.LoggerSettings,
  })),
);
const AssetStoreSettings = lazy(() =>
  import("@/components/settings/asset-store-settings").then((m) => ({
    default: m.AssetStoreSettings,
  })),
);

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab =
  | "general"
  | "azure"
  | "models"
  | "assetStore"
  | "advanced"
  | "logger"
  | "about";

const getTabs = (developerMode: boolean, isDevelopment: boolean) => {
  const baseTabs: Array<{
    id: SettingsTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
  }> = [
    {
      id: "general",
      label: "General",
      icon: Settings,
      description: "Appearance, interface, and auto-save settings",
    },
    {
      id: "azure",
      label: "Azure",
      icon: Globe,
      description: "API keys, endpoints, and cloud configuration",
    },
    {
      id: "models",
      label: "Models",
      icon: Package,
      description: "AI image generation models configuration",
    },
    {
      id: "assetStore",
      label: "Asset Store",
      icon: ExternalLink,
      description: "External asset providers and stock photos",
    },
    {
      id: "advanced",
      label: "Advanced",
      icon: Sliders,
      description: "Data management and system settings",
    },
  ];

  // Add logger tab only if developer mode is enabled and in development
  if (developerMode && isDevelopment) {
    baseTabs.push({
      id: "logger",
      label: "Logger",
      icon: Terminal,
      description: "Development logging configuration",
    });
  }

  baseTabs.push({
    id: "about",
    label: "About",
    icon: Info,
    description: "Application information and features",
  });

  return baseTabs;
};

export function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [developerMode, setDeveloperMode] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const initializationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize dialog state when opened - show instantly, load data async
  useEffect(() => {
    if (isOpen && !isDataLoaded) {
      // Show modal instantly, then load data asynchronously
      setIsDataLoaded(false);

      // Clear any existing timeout
      if (initializationTimeoutRef.current) {
        clearTimeout(initializationTimeoutRef.current);
      }

      // Load data after a short delay to allow modal to render first
      initializationTimeoutRef.current = setTimeout(() => {
        setSearchQuery("");
        setDebouncedSearchQuery("");
        if (searchInputRef.current) {
          searchInputRef.current.blur();
        }
        // Load developer mode setting
        setDeveloperMode(config("developer.mode", false) as boolean);
        setIsDataLoaded(true);
      }, 50); // Very short delay to allow modal to show first
    } else if (!isOpen) {
      setIsDataLoaded(false);
      if (initializationTimeoutRef.current) {
        clearTimeout(initializationTimeoutRef.current);
      }
    }

    return () => {
      if (initializationTimeoutRef.current) {
        clearTimeout(initializationTimeoutRef.current);
      }
    };
  }, [isOpen, isDataLoaded]);

  // Listen for developer mode changes
  useEffect(() => {
    const handleDeveloperModeChange = (event: CustomEvent) => {
      setDeveloperMode(event.detail.enabled);
    };

    window.addEventListener(
      "developerModeChanged",
      handleDeveloperModeChange as EventListener,
    );
    return () => {
      window.removeEventListener(
        "developerModeChanged",
        handleDeveloperModeChange as EventListener,
      );
    };
  }, []);

  // Listen for external requests to open a specific settings tab
  useEffect(() => {
    const handleOpenSettingsTab = (event: CustomEvent) => {
      const tab = event.detail?.tab as SettingsTab | undefined;
      if (tab) {
        setActiveTab(tab);
      }
    };

    window.addEventListener("openSettingsTab", handleOpenSettingsTab as EventListener);
    return () => {
      window.removeEventListener(
        "openSettingsTab",
        handleOpenSettingsTab as EventListener,
      );
    };
  }, []);

  // Handle logger tab availability changes
  useEffect(() => {
    const isDevelopment = process.env.NODE_ENV === "development";
    const tabs = getTabs(developerMode, isDevelopment);
    const isLoggerTabAvailable = tabs.some((tab) => tab.id === "logger");

    // If currently on logger tab but it's no longer available, switch to general
    if (activeTab === "logger" && !isLoggerTabAvailable) {
      setActiveTab("general");
    }
  }, [developerMode, activeTab]);

  // Debounce search input (only when data is loaded)
  useEffect(() => {
    if (!isDataLoaded) return;

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
  }, [searchQuery, isDataLoaded]);

  // Memoize filtered tabs to prevent unnecessary recalculations
  const filteredTabs = useMemo(() => {
    const isDevelopment = process.env.NODE_ENV === "development";
    const tabs = getTabs(developerMode, isDevelopment);

    if (!debouncedSearchQuery.trim()) return tabs;

    const query = debouncedSearchQuery.toLowerCase();
    return tabs.filter(
      (tab) =>
        tab.label.toLowerCase().includes(query) ||
        tab.description.toLowerCase().includes(query),
    );
  }, [debouncedSearchQuery, developerMode]);

  // Memoize tab content to prevent unnecessary re-renders
  const renderTabContent = useCallback(() => {
    // Show skeleton while data is loading
    if (!isDataLoaded) {
      return <GeneralSettingsSkeleton />;
    }

    switch (activeTab) {
      case "general":
        return (
          <Suspense fallback={<GeneralSettingsSkeleton />}>
            <GeneralSettings />
          </Suspense>
        );
      case "azure":
        return (
          <Suspense fallback={<AzureSettingsSkeleton />}>
            <AzureSettings />
          </Suspense>
        );
      case "models":
        return (
          <Suspense fallback={<ModelsSettingsSkeleton />}>
            <ModelsSettings />
          </Suspense>
        );
      case "assetStore":
        return (
          <Suspense fallback={<GeneralSettingsSkeleton />}>
            <AssetStoreSettings />
          </Suspense>
        );
      case "advanced":
        return (
          <Suspense fallback={<AdvancedSettingsSkeleton />}>
            <AdvancedSettings />
          </Suspense>
        );
      case "logger":
        return (
          <Suspense fallback={<LoggerSettingsSkeleton />}>
            <LoggerSettings />
          </Suspense>
        );
      case "about":
        return (
          <Suspense fallback={<AboutSettingsSkeleton />}>
            <AboutSettings />
          </Suspense>
        );
      default:
        return (
          <Suspense fallback={<GeneralSettingsSkeleton />}>
            <GeneralSettings />
          </Suspense>
        );
    }
  }, [activeTab, isDataLoaded]);

  // Memoize search handlers
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isDataLoaded) return;
      setSearchQuery(e.target.value);
    },
    [isDataLoaded],
  );

  const handleTabChange = useCallback(
    (tabId: SettingsTab) => {
      // Check if logger tab is available
      const isDevelopment = process.env.NODE_ENV === "development";
      const tabs = getTabs(developerMode, isDevelopment);
      const isLoggerTabAvailable = tabs.some((tab) => tab.id === "logger");

      // If trying to access logger tab but it's not available, switch to general
      if (tabId === "logger" && !isLoggerTabAvailable) {
        setActiveTab("general");
      } else {
        setActiveTab(tabId);
      }

      // Only clear search if data is loaded
      if (isDataLoaded) {
        setSearchQuery("");
        setDebouncedSearchQuery("");
        // Blur search input to prevent focus issues
        if (searchInputRef.current) {
          searchInputRef.current.blur();
        }
      }
    },
    [isDataLoaded, developerMode],
  );

  const toggleSearchExpanded = useCallback(() => {
    setIsSearchExpanded((prev) => !prev);
  }, []);

  const toggleUserMenu = useCallback(() => {
    setShowUserMenu((prev) => !prev);
  }, []);

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <Dialog.Title className="sr-only">Settings</Dialog.Title>
          <Dialog.Description className="sr-only">
            Configure your application preferences including appearance, Azure
            settings, and advanced options.
          </Dialog.Description>
          <div className="w-full max-w-5xl h-[85vh] max-h-[700px] bg-white/80 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
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
                    Settings
                  </h2>
                </div>
              </div>
              <Dialog.Close asChild>
                <button className="w-6 h-6 rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-700/50 flex items-center justify-center transition-colors">
                  <X className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                </button>
              </Dialog.Close>
            </div>

            <div className="flex h-full">
              {/* Sidebar */}
              <div className="w-64 bg-gray-50/30 dark:bg-zinc-800/30 backdrop-blur-sm border-r border-gray-200/30 dark:border-gray-700/30 p-4">
                {/* User Account Section */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/30 dark:bg-gray-700/30 backdrop-blur-sm border border-gray-200/30 dark:border-gray-600/30">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                        {appConfig.admin.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {appConfig.admin.email}
                      </div>
                    </div>
                    <button
                      onClick={toggleUserMenu}
                      className="p-1 hover:bg-gray-200/50 dark:hover:bg-gray-600/50 rounded-lg transition-colors duration-150"
                      style={{ willChange: "auto" }}
                    >
                      <ChevronDown
                        className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-150 ${showUserMenu ? "rotate-180" : ""}`}
                      />
                    </button>
                  </div>

                  {showUserMenu && (
                    <div className="mt-2 p-2 bg-white/20 dark:bg-gray-700/20 backdrop-blur-sm rounded-lg border border-gray-200/30 dark:border-gray-600/30">
                      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                        <div>Role: {appConfig.admin.role}</div>
                        <div>ID: {appConfig.admin.user_id.slice(0, 8)}...</div>
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
                        className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                      >
                        <Search className="w-4 h-4 text-gray-400" />
                      </button>
                      <input
                        ref={searchInputRef}
                        type="search"
                        placeholder="Search"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        disabled={!isDataLoaded}
                        autoComplete="new-password"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck="false"
                        data-lpignore="true"
                        data-form-type="other"
                        data-1p-ignore="true"
                        data-bwignore="true"
                        name="settings-search"
                        id="settings-search"
                        className={cn(
                          "w-full pl-10 pr-4 py-2 bg-white/50 dark:bg-gray-900/50 border border-gray-200/50 dark:border-gray-700/50 rounded-lg text-sm placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-colors duration-150",
                          isSearchExpanded ? "opacity-100" : "opacity-70",
                          !isDataLoaded && "opacity-50 cursor-not-allowed",
                        )}
                        style={{ willChange: "auto" }}
                      />
                    </div>
                  </form>
                </div>

                <nav className="space-y-0.5">
                  {filteredTabs.map((tab) => {
                    const IconComponent = tab.icon;
                    const isHighlighted =
                      debouncedSearchQuery &&
                      (tab.label
                        .toLowerCase()
                        .includes(debouncedSearchQuery.toLowerCase()) ||
                        tab.description
                          .toLowerCase()
                          .includes(debouncedSearchQuery.toLowerCase()));

                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors duration-150 group relative",
                          activeTab === tab.id
                            ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-700/50"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white",
                          isHighlighted &&
                            "bg-yellow-100/50 dark:bg-yellow-900/20 border border-yellow-200/50 dark:border-yellow-700/50",
                        )}
                        style={{ willChange: "auto" }}
                      >
                        <IconComponent
                          className={cn(
                            "w-4 h-4 transition-colors flex-shrink-0",
                            activeTab === tab.id
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300",
                          )}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {tab.label}
                          </div>
                          {debouncedSearchQuery && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {tab.description}
                            </div>
                          )}
                        </div>
                        {isHighlighted && (
                          <div className="w-2 h-2 rounded-full bg-yellow-500 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}

                  {filteredTabs.length === 0 && debouncedSearchQuery && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                      No settings found for &quot;{debouncedSearchQuery}&quot;
                    </div>
                  )}
                </nav>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-hidden bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
                <div className="max-h-[calc(700px-80px)] overflow-y-auto p-8">
                  {renderTabContent()}
                </div>
                {/* Loading indicator for data loading */}
                {!isDataLoaded && (
                  <div className="absolute top-4 right-4">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
