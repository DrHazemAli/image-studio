"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cross2Icon,
  MagnifyingGlassIcon,
  GridIcon,
  ListBulletIcon,
  ImageIcon,
  VideoIcon,
  SquareIcon,
  FrameIcon,
  SymbolIcon,
  UploadIcon,
  ChevronDownIcon,
  CheckIcon,
} from "@radix-ui/react-icons";
import { Button, TextField, Badge } from "@radix-ui/themes";
import * as Select from "@radix-ui/react-select";
import {
  Asset,
  AssetType,
  ViewMode,
  AssetSearchParams,
} from "@/types/asset-store";
import { config } from "@/lib/settings";

interface AssetStorePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onAssetSelect?: (asset: Asset) => void;
  projectId?: string;
}

type TabType = "photos" | "videos" | "shapes" | "frames" | "icons" | "uploads";

const TABS = [
  {
    id: "photos" as TabType,
    label: "Photos",
    icon: ImageIcon,
    assetType: "photo" as AssetType,
  },
  {
    id: "videos" as TabType,
    label: "Videos",
    icon: VideoIcon,
    assetType: "video" as AssetType,
  },
  {
    id: "shapes" as TabType,
    label: "Shapes",
    icon: SquareIcon,
    assetType: "shape" as AssetType,
  },
  {
    id: "frames" as TabType,
    label: "Frames",
    icon: FrameIcon,
    assetType: "frame" as AssetType,
  },
  {
    id: "icons" as TabType,
    label: "Icons",
    icon: SymbolIcon,
    assetType: "icon" as AssetType,
  },
  {
    id: "uploads" as TabType,
    label: "Uploads",
    icon: UploadIcon,
    assetType: "upload" as AssetType,
  },
];

export function AssetStorePanel({
  isOpen,
  onClose,
  onAssetSelect,
  projectId,
}: AssetStorePanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>("photos");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedColor, setSelectedColor] = useState<string>("all");
  const [selectedOrientation, setSelectedOrientation] = useState<string>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [totalResults, setTotalResults] = useState(0);

  // Load settings from config
  const assetStoreEnabled = useMemo(() => {
    return config("assetStore.enabled", true) as boolean;
  }, []);

  const defaultView = useMemo(() => {
    return config("assetStore.ui.defaultView", "grid") as ViewMode;
  }, []);

  const itemsPerPage = useMemo(() => {
    return config("assetStore.ui.itemsPerPage", 20) as number;
  }, []);

  const showAttribution = useMemo(() => {
    return config("assetStore.ui.showAttribution", true) as boolean;
  }, []);

  // Initialize view mode from settings
  useEffect(() => {
    setViewMode(defaultView);
  }, [defaultView]);

  // Load categories when tab changes
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch(
          `/api/asset-store/categories?assetType=${TABS.find((t) => t.id === activeTab)?.assetType || "photo"}`,
        );
        const data = await response.json();
        if (data.success) {
          setCategories(["all", ...data.categories]);
        }
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    };

    if (isOpen) {
      loadCategories();
    }
  }, [activeTab, isOpen]);

  // Load assets when tab or filters change
  const loadAssets = useCallback(
    async (page = 1, reset = false) => {
      if (!assetStoreEnabled) {
        setError("Asset store is disabled. Please enable it in settings.");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const currentTab = TABS.find((t) => t.id === activeTab);
        if (!currentTab) return;

        const searchParams: AssetSearchParams = {
          query: searchQuery || undefined,
          category: selectedCategory !== "all" ? selectedCategory : undefined,
          color: selectedColor !== "all" ? selectedColor : undefined,
          orientation:
            selectedOrientation !== "all"
              ? (selectedOrientation as "landscape" | "portrait" | "square")
              : undefined,
          page,
          perPage: itemsPerPage,
          sortBy: "relevant",
        };

        const response = await fetch("/api/asset-store/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...searchParams,
            assetType: currentTab.assetType,
          }),
        });

        const data = await response.json();

        if (data.success) {
          if (reset) {
            setAssets(data.data);
          } else {
            setAssets((prev) => [...prev, ...data.data]);
          }
          setHasMore(data.hasMore);
          setTotalResults(data.total);
          setCurrentPage(page);
        } else {
          setError(data.error || "Failed to load assets");
        }
      } catch (error) {
        console.error("Failed to load assets:", error);
        setError("Failed to load assets");
      } finally {
        setLoading(false);
      }
    },
    [
      activeTab,
      searchQuery,
      selectedCategory,
      selectedColor,
      selectedOrientation,
      itemsPerPage,
      assetStoreEnabled,
    ],
  );

  // Load featured assets on tab change
  useEffect(() => {
    if (isOpen) {
      setAssets([]);
      setCurrentPage(1);
      setSearchQuery("");
      setSelectedCategory("all");
      setSelectedColor("all");
      setSelectedOrientation("all");
      loadAssets(1, true);
    }
  }, [activeTab, isOpen, loadAssets]);

  // Handle search
  const handleSearch = useCallback(() => {
    setCurrentPage(1);
    loadAssets(1, true);
  }, [loadAssets]);

  // Handle load more
  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadAssets(currentPage + 1, false);
    }
  }, [loading, hasMore, currentPage, loadAssets]);

  // Handle asset selection
  const handleAssetSelect = useCallback(
    (asset: Asset) => {
      onAssetSelect?.(asset);
      onClose();
    },
    [onAssetSelect, onClose],
  );

  // Handle tab change
  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
  }, []);

  if (!isOpen) return null;

  const currentTabInfo = TABS.find((t) => t.id === activeTab);
  const filteredAssets = assets.filter((asset) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        asset.name.toLowerCase().includes(query) ||
        asset.tags.some((tag) => tag.toLowerCase().includes(query)) ||
        asset.category.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-black/95 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                <ImageIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Asset Store
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {totalResults > 0
                    ? `${totalResults} assets`
                    : "Browse assets"}
                </p>
              </div>
            </div>

            <Button variant="ghost" onClick={onClose}>
              <Cross2Icon className="w-5 h-5" />
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex items-center border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-gray-900/30">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-white dark:bg-black"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Search and Filters */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-gray-900/30">
            <div className="flex items-center gap-4 flex-1">
              {/* Search */}
              <TextField.Root
                placeholder={`Search ${currentTabInfo?.label.toLowerCase()}...`}
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchQuery(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
                className="w-64"
              >
                <TextField.Slot>
                  <MagnifyingGlassIcon height="16" width="16" />
                </TextField.Slot>
              </TextField.Root>

              {/* Category Filter */}
              <Select.Root
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <Select.Trigger className="w-32">
                  <Select.Value placeholder="Category" />
                </Select.Trigger>
                <Select.Content>
                  {categories.map((category) => (
                    <Select.Item key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>

              {/* Color Filter (only for photos) */}
              {activeTab === "photos" && (
                <Select.Root
                  value={selectedColor}
                  onValueChange={setSelectedColor}
                >
                  <Select.Trigger className="w-24">
                    <Select.Value placeholder="Color" />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="all">All Colors</Select.Item>
                    <Select.Item value="black_and_white">B&W</Select.Item>
                    <Select.Item value="black">Black</Select.Item>
                    <Select.Item value="white">White</Select.Item>
                    <Select.Item value="yellow">Yellow</Select.Item>
                    <Select.Item value="orange">Orange</Select.Item>
                    <Select.Item value="red">Red</Select.Item>
                    <Select.Item value="purple">Purple</Select.Item>
                    <Select.Item value="magenta">Magenta</Select.Item>
                    <Select.Item value="green">Green</Select.Item>
                    <Select.Item value="teal">Teal</Select.Item>
                    <Select.Item value="blue">Blue</Select.Item>
                  </Select.Content>
                </Select.Root>
              )}

              {/* Orientation Filter (only for photos) */}
              {activeTab === "photos" && (
                <Select.Root
                  value={selectedOrientation}
                  onValueChange={setSelectedOrientation}
                >
                  <Select.Trigger className="w-28">
                    <Select.Value placeholder="Orientation" />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="all">All</Select.Item>
                    <Select.Item value="landscape">Landscape</Select.Item>
                    <Select.Item value="portrait">Portrait</Select.Item>
                    <Select.Item value="square">Square</Select.Item>
                  </Select.Content>
                </Select.Root>
              )}

              {/* Search Button */}
              <Button onClick={handleSearch} disabled={loading}>
                Search
              </Button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-1 bg-gray-200 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <GridIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "list"
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <ListBulletIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Assets Grid/List */}
          <div className="p-4 overflow-y-auto max-h-[60vh]">
            {loading && assets.length === 0 ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-500 dark:text-gray-400">
                    Loading assets...
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
                  <Cross2Icon className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Error Loading Assets
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-4">
                  {error}
                </p>
                <Button onClick={() => loadAssets(1, true)}>Try Again</Button>
              </div>
            ) : filteredAssets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No assets found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                  {searchQuery
                    ? "Try adjusting your search terms or filters"
                    : "No assets available for this category"}
                </p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {filteredAssets.map((asset) => (
                  <motion.div
                    key={asset.id}
                    className="group relative bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden aspect-square cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                    onClick={() => handleAssetSelect(asset)}
                  >
                    <img
                      src={asset.thumbnail}
                      alt={asset.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="text-center text-white p-2">
                        <p className="text-sm font-medium truncate">
                          {asset.name}
                        </p>
                        {showAttribution && asset.metadata.attribution && (
                          <p className="text-xs opacity-75 truncate">
                            {asset.metadata.attribution}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Provider Badge */}
                    <div className="absolute top-2 left-2">
                      <Badge
                        color={
                          asset.provider === "unsplash"
                            ? "blue"
                            : asset.provider === "pexels"
                              ? "green"
                              : "gray"
                        }
                        variant="soft"
                      >
                        {asset.provider}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredAssets.map((asset) => (
                  <motion.div
                    key={asset.id}
                    className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 cursor-pointer group"
                    whileHover={{ x: 4 }}
                    onClick={() => handleAssetSelect(asset)}
                  >
                    <img
                      src={asset.thumbnail}
                      alt={asset.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />

                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {asset.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {asset.category} • {asset.metadata.width}×
                        {asset.metadata.height}
                        {showAttribution && asset.metadata.attribution && (
                          <span className="block text-xs">
                            {asset.metadata.attribution}
                          </span>
                        )}
                      </div>
                    </div>

                    <Badge
                      color={
                        asset.provider === "unsplash"
                          ? "blue"
                          : asset.provider === "pexels"
                            ? "green"
                            : "gray"
                      }
                      variant="soft"
                    >
                      {asset.provider}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Load More Button */}
            {hasMore && !loading && (
              <div className="flex justify-center mt-6">
                <Button onClick={handleLoadMore} variant="outline">
                  Load More
                </Button>
              </div>
            )}

            {/* Loading More Indicator */}
            {loading && assets.length > 0 && (
              <div className="flex justify-center mt-4">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
