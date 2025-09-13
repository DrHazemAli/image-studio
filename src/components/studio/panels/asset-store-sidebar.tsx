"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRightIcon,
  MagnifyingGlassIcon,
  GridIcon,
  ListBulletIcon,
  ImageIcon,
  ArchiveIcon,
  ExternalLinkIcon,
  DownloadIcon,
  MixerHorizontalIcon,
  Cross2Icon,
} from "@radix-ui/react-icons";
import { getUnifiedSetting } from "@/lib/settings";
import type { Asset, AssetStoreConfig } from "@/types/asset-store";

interface AssetStoreSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onAssetSelect?: (asset: Asset) => void;
  projectId?: string;
}

export function AssetStoreSidebar({
  isOpen,
  onToggle,
  onAssetSelect,
}: AssetStoreSidebarProps) {
  const [activeTab, setActiveTab] = useState<
    "featured" | "search" | "categories"
  >("featured");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<
    "unsplash" | "pexels"
  >("unsplash");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  const [categories, setCategories] = useState<string[]>([]);
  const [enabledProviders, setEnabledProviders] = useState<
    Array<"unsplash" | "pexels">
  >(["unsplash", "pexels"]);

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    size: "all", // all, small, medium, large
    aspectRatio: "all", // all, square, landscape, portrait
    orientation: "all", // all, landscape, portrait, square
    color: "all", // all, black_and_white, black, white, etc.
    minWidth: "",
    minHeight: "",
    maxWidth: "",
    maxHeight: "",
  });

  // Intersection observer for infinite scroll
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Load featured assets function
  const loadFeaturedAssets = useCallback(
    async (page = 1, append = false) => {
      if (page === 1) {
        setIsLoading(true);
        setError(null);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const response = await fetch("/api/asset-store/featured", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            provider: selectedProvider,
            page,
            per_page: 20,
          }),
        });
        if (response.ok) {
          const data = await response.json();
          const newAssets = data.data || [];

          if (append) {
            setAssets((prev) => [...prev, ...newAssets]);
          } else {
            setAssets(newAssets);
          }

          setHasMore(data.hasMore || false);
          setTotalResults(data.total || newAssets.length);
          setCurrentPage(page);
        } else {
          setError("Failed to load featured assets");
        }
      } catch (error) {
        console.error("Failed to load featured assets:", error);
        setError("Failed to load featured assets");
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [selectedProvider],
  );

  // Search assets function
  const searchAssets = useCallback(
    async (query?: string, page = 1, append = false) => {
      const searchTerm = query || searchQuery;
      if (!searchTerm.trim()) return;

      if (page === 1) {
        setIsLoading(true);
        setError(null);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const searchParams: Record<string, any> = {
          query: searchTerm,
          provider: selectedProvider,
          page,
          per_page: 20,
        };

        // Add filters to search parameters
        if (filters.orientation !== "all") {
          searchParams.orientation = filters.orientation;
        }
        if (filters.color !== "all") {
          searchParams.color = filters.color;
        }
        if (filters.minWidth) {
          searchParams.min_width = parseInt(filters.minWidth);
        }
        if (filters.minHeight) {
          searchParams.min_height = parseInt(filters.minHeight);
        }
        if (filters.maxWidth) {
          searchParams.max_width = parseInt(filters.maxWidth);
        }
        if (filters.maxHeight) {
          searchParams.max_height = parseInt(filters.maxHeight);
        }

        const response = await fetch("/api/asset-store/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(searchParams),
        });

        if (response.ok) {
          const data = await response.json();
          let filteredAssets = data.data || [];

          // Apply client-side filters for size and aspect ratio
          if (filters.size !== "all") {
            filteredAssets = filteredAssets.filter((asset: Asset) => {
              const width = asset.metadata.width || 0;
              const height = asset.metadata.height || 0;
              const pixelCount = width * height;

              switch (filters.size) {
                case "small":
                  return pixelCount < 500000; // < 500k pixels
                case "medium":
                  return pixelCount >= 500000 && pixelCount < 2000000; // 500k - 2M pixels
                case "large":
                  return pixelCount >= 2000000; // > 2M pixels
                default:
                  return true;
              }
            });
          }

          if (filters.aspectRatio !== "all") {
            filteredAssets = filteredAssets.filter((asset: Asset) => {
              const width = asset.metadata.width || 0;
              const height = asset.metadata.height || 0;
              const aspectRatio = width / height;

              switch (filters.aspectRatio) {
                case "square":
                  return aspectRatio >= 0.9 && aspectRatio <= 1.1;
                case "landscape":
                  return aspectRatio > 1.1;
                case "portrait":
                  return aspectRatio < 0.9;
                default:
                  return true;
              }
            });
          }

          if (append) {
            setAssets((prev) => [...prev, ...filteredAssets]);
          } else {
            setAssets(filteredAssets);
          }

          setHasMore(data.hasMore || false);
          setTotalResults(data.total || filteredAssets.length);
          setCurrentPage(page);
        } else {
          setError("Failed to search assets");
        }
      } catch (error) {
        console.error("Failed to search assets:", error);
        setError("Failed to search assets");
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [searchQuery, selectedProvider, filters],
  );

  // Load enabled providers from settings
  useEffect(() => {
    const loadEnabledProviders = () => {
      try {
        // First check what's in localStorage
        const rawSettings = localStorage.getItem("az_settings");
        console.log("Raw localStorage az_settings:", rawSettings);

        const config = getUnifiedSetting(
          "assetStore",
          null,
          "localStorage",
        ) as AssetStoreConfig | null;
        console.log("Asset store config loaded:", config);
        console.log("Config providers:", config?.providers);
        console.log("Unsplash enabled:", config?.providers?.unsplash?.enabled);
        console.log("Pexels enabled:", config?.providers?.pexels?.enabled);

        const enabled: Array<"unsplash" | "pexels"> = [];

        if (config?.providers?.unsplash?.enabled) enabled.push("unsplash");
        if (config?.providers?.pexels?.enabled) enabled.push("pexels");

        console.log("Enabled providers:", enabled);
        setEnabledProviders(enabled);

        // Set selected provider to first enabled provider if current one is not enabled
        if (enabled.length > 0 && !enabled.includes(selectedProvider)) {
          setSelectedProvider(enabled[0]);
        }
      } catch (error) {
        console.error("Failed to load asset store config:", error);
      }
    };

    loadEnabledProviders();
  }, [selectedProvider]);

  // Also load settings when component mounts
  useEffect(() => {
    const loadEnabledProviders = () => {
      try {
        // First check what's in localStorage
        const rawSettings = localStorage.getItem("az_settings");
        console.log("Raw localStorage az_settings:", rawSettings);

        const config = getUnifiedSetting(
          "assetStore",
          null,
          "localStorage",
        ) as AssetStoreConfig | null;
        console.log("Asset store config loaded:", config);
        console.log("Config providers:", config?.providers);
        console.log("Unsplash enabled:", config?.providers?.unsplash?.enabled);
        console.log("Pexels enabled:", config?.providers?.pexels?.enabled);

        const enabled: Array<"unsplash" | "pexels"> = [];

        if (config?.providers?.unsplash?.enabled) enabled.push("unsplash");
        if (config?.providers?.pexels?.enabled) enabled.push("pexels");

        console.log("Enabled providers:", enabled);
        setEnabledProviders(enabled);

        // Set selected provider to first enabled provider if current one is not enabled
        if (enabled.length > 0 && !enabled.includes(selectedProvider)) {
          setSelectedProvider(enabled[0]);
        }
      } catch (error) {
        console.error("Failed to load asset store config:", error);
      }
    };

    loadEnabledProviders();
  }, [selectedProvider]);

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch(
          `/api/asset-store/categories?assetType=photo&provider=${selectedProvider}`,
        );
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories || []);
        }
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    };
    loadCategories();
  }, [selectedProvider]);

  // Load featured assets on mount
  useEffect(() => {
    if (isOpen && activeTab === "featured") {
      setCurrentPage(1);
      setAssets([]);
      setHasMore(true);
      loadFeaturedAssets();
    }
  }, [isOpen, activeTab, loadFeaturedAssets]);

  // Load assets when search query changes (with debounce)
  useEffect(() => {
    if (activeTab === "search" && searchQuery.trim()) {
      setCurrentPage(1);
      setAssets([]);
      setHasMore(true);
      const timeoutId = setTimeout(() => {
        searchAssets();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery, activeTab, searchAssets]);

  // Load assets when category changes
  useEffect(() => {
    if (activeTab === "categories" && selectedCategory !== "all") {
      setCurrentPage(1);
      setAssets([]);
      setHasMore(true);
      searchAssets(selectedCategory);
    }
  }, [selectedCategory, activeTab, searchAssets]);

  const handleAssetSelect = (asset: Asset) => {
    onAssetSelect?.(asset);
    onToggle(); // Close sidebar after selection
  };

  const handleDownload = async (asset: Asset) => {
    try {
      const response = await fetch(asset.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${asset.id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download asset:", error);
    }
  };

  // Filter handlers
  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      size: "all",
      aspectRatio: "all",
      orientation: "all",
      color: "all",
      minWidth: "",
      minHeight: "",
      maxWidth: "",
      maxHeight: "",
    });
  };

  const applyFilters = () => {
    // Reset pagination and trigger search with current filters
    setCurrentPage(1);
    setAssets([]);
    setHasMore(true);

    if (activeTab === "search" && searchQuery.trim()) {
      searchAssets();
    } else if (activeTab === "featured") {
      loadFeaturedAssets();
    } else if (activeTab === "categories" && selectedCategory !== "all") {
      searchAssets(selectedCategory);
    }
  };

  // Load more assets function
  const loadMoreAssets = useCallback(() => {
    if (isLoadingMore || !hasMore) return;

    const nextPage = currentPage + 1;

    if (activeTab === "search" && searchQuery.trim()) {
      searchAssets(searchQuery, nextPage, true);
    } else if (activeTab === "featured") {
      loadFeaturedAssets(nextPage, true);
    } else if (activeTab === "categories" && selectedCategory !== "all") {
      searchAssets(selectedCategory, nextPage, true);
    }
  }, [
    activeTab,
    searchQuery,
    selectedCategory,
    currentPage,
    hasMore,
    isLoadingMore,
    searchAssets,
    loadFeaturedAssets,
  ]);

  // Intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !isLoadingMore) {
          loadMoreAssets();
        }
      },
      {
        threshold: 0.1,
        rootMargin: "100px",
      },
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [hasMore, isLoadingMore, loadMoreAssets]);

  // Skeleton loading components
  const renderSkeletonGrid = () => (
    <div
      className={viewMode === "grid" ? "grid grid-cols-2 gap-2" : "space-y-2"}
    >
      {Array.from({ length: 6 }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.1 }}
          className={`bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse ${
            viewMode === "grid"
              ? "aspect-square"
              : "flex items-center gap-3 p-3 h-16"
          }`}
        >
          {viewMode === "grid" ? (
            <div className="w-full h-full bg-gray-300 dark:bg-gray-600 rounded-lg" />
          ) : (
            <>
              <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2" />
              </div>
            </>
          )}
        </motion.div>
      ))}
    </div>
  );

  const renderLoadingMore = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center py-4"
    >
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Loading more...
        </span>
      </div>
    </motion.div>
  );

  const renderAssetGrid = () => {
    if (isLoading) {
      return renderSkeletonGrid();
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      );
    }

    if (assets.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <ImageIcon className="w-12 h-12 text-gray-400 mb-4" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {activeTab === "search"
              ? "No assets found"
              : "No featured assets available"}
          </p>
        </div>
      );
    }

    return (
      <>
        <motion.div
          className={
            viewMode === "grid" ? "grid grid-cols-2 gap-2" : "space-y-2"
          }
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {assets.map((asset) => (
            <motion.div
              key={asset.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`group relative bg-white/50 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg overflow-hidden cursor-pointer transition-all duration-150 hover:bg-white/70 dark:hover:bg-gray-700/70 will-change-transform ${
                viewMode === "grid"
                  ? "aspect-square"
                  : "flex items-center gap-3 p-3"
              }`}
              whileHover={{ scale: 1.01 }}
              onClick={() => handleAssetSelect(asset)}
            >
              {viewMode === "grid" ? (
                <>
                  <img
                    src={asset.thumbnail || asset.url}
                    alt={asset.name || "Asset"}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(asset);
                      }}
                      className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors duration-150"
                    >
                      <DownloadIcon className="w-3 h-3 text-white" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(asset.url, "_blank");
                      }}
                      className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors duration-150"
                    >
                      <ExternalLinkIcon className="w-3 h-3 text-white" />
                    </button>
                  </div>
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-1 text-xs font-medium bg-blue-500/90 text-white rounded-md">
                      {asset.provider}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <img
                    src={asset.thumbnail || asset.url}
                    alt={asset.name || "Asset"}
                    className="w-12 h-12 rounded-lg object-cover"
                    loading="lazy"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {asset.name || "Untitled"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {asset.provider} • {asset.metadata.width}×
                      {asset.metadata.height}
                    </p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(asset);
                      }}
                      className="p-2 hover:bg-gray-100/50 dark:hover:bg-gray-600/50 rounded-lg transition-colors duration-150"
                    >
                      <DownloadIcon className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(asset.url, "_blank");
                      }}
                      className="p-2 hover:bg-gray-100/50 dark:hover:bg-gray-600/50 rounded-lg transition-colors duration-150"
                    >
                      <ExternalLinkIcon className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Infinite scroll trigger and loading more indicator */}
        {hasMore && (
          <div ref={loadMoreRef} className="mt-4">
            {isLoadingMore && renderLoadingMore()}
          </div>
        )}

        {/* End of results indicator */}
        {!hasMore && assets.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-4 text-center"
          >
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <div className="w-8 h-px bg-gray-300 dark:bg-gray-600" />
              <span>No more assets</span>
              <div className="w-8 h-px bg-gray-300 dark:bg-gray-600" />
            </div>
          </motion.div>
        )}
      </>
    );
  };

  const renderFilterPanel = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed top-58 left-38 w-68 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg shadow-lg z-50 ml-2"
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">
            Filters
          </h3>
          <div className="flex gap-2">
            <button
              onClick={clearFilters}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              Clear All
            </button>
            <button
              onClick={() => setShowFilters(false)}
              className="w-6 h-6 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-700 flex items-center justify-center"
            >
              <Cross2Icon className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {/* Filter Grid - 2 items per row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Size Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Size
              </label>
              <select
                value={filters.size}
                onChange={(e) => handleFilterChange("size", e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="all">All Sizes</option>
                <option value="small">Small (&lt; 500K pixels)</option>
                <option value="medium">Medium (500K - 2M pixels)</option>
                <option value="large">Large (&gt; 2M pixels)</option>
              </select>
            </div>

            {/* Aspect Ratio Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Aspect Ratio
              </label>
              <select
                value={filters.aspectRatio}
                onChange={(e) =>
                  handleFilterChange("aspectRatio", e.target.value)
                }
                className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="all">All Ratios</option>
                <option value="square">Square (1:1)</option>
                <option value="landscape">Landscape (&gt; 1:1)</option>
                <option value="portrait">Portrait (&lt; 1:1)</option>
              </select>
            </div>

            {/* Orientation Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Orientation
              </label>
              <select
                value={filters.orientation}
                onChange={(e) =>
                  handleFilterChange("orientation", e.target.value)
                }
                className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="all">All Orientations</option>
                <option value="landscape">Landscape</option>
                <option value="portrait">Portrait</option>
                <option value="square">Square</option>
              </select>
            </div>

            {/* Color Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Color
              </label>
              <select
                value={filters.color}
                onChange={(e) => handleFilterChange("color", e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="all">All Colors</option>
                <option value="black_and_white">Black & White</option>
                <option value="black">Black</option>
                <option value="white">White</option>
                <option value="yellow">Yellow</option>
                <option value="orange">Orange</option>
                <option value="red">Red</option>
                <option value="purple">Purple</option>
                <option value="magenta">Magenta</option>
                <option value="green">Green</option>
                <option value="teal">Teal</option>
                <option value="blue">Blue</option>
              </select>
            </div>
          </div>

          {/* Dimension Filters */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Dimensions
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <input
                  type="number"
                  placeholder="Min Width"
                  value={filters.minWidth}
                  onChange={(e) =>
                    handleFilterChange("minWidth", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Min Height"
                  value={filters.minHeight}
                  onChange={(e) =>
                    handleFilterChange("minHeight", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Max Width"
                  value={filters.maxWidth}
                  onChange={(e) =>
                    handleFilterChange("maxWidth", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Max Height"
                  value={filters.maxHeight}
                  onChange={(e) =>
                    handleFilterChange("maxHeight", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
            </div>
          </div>

          {/* Apply Button */}
          <button
            onClick={applyFilters}
            className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors duration-150"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <motion.div
      className="relative z-30 h-full w-0 overflow-hidden"
      animate={{
        width: isOpen ? 400 : 0,
      }}
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
    >
      <div className="h-full w-full bg-white dark:bg-black border-r border-gray-200 dark:border-zinc-800 flex flex-col will-change-transform contain-layout">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-900 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
              <ArchiveIcon className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Asset Store
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Browse and download assets
              </p>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="w-6 h-6 rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-700/50 flex items-center justify-center transition-colors duration-150"
          >
            <ChevronRightIcon className="w-3 h-3 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col min-h-0"
            >
              {/* Tabs */}
              <div className="flex gap-1 p-3 border-b border-gray-200 dark:border-zinc-900 flex-shrink-0">
                {[
                  { id: "featured", label: "Featured" },
                  { id: "search", label: "Search" },
                  { id: "categories", label: "Categories" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() =>
                      setActiveTab(
                        tab.id as "featured" | "search" | "categories",
                      )
                    }
                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150 ${
                      activeTab === tab.id
                        ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-700/50"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              {activeTab === "search" && (
                <div className="p-4 border-b border-gray-200 dark:border-zinc-900 flex-shrink-0">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search assets..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white/50 dark:bg-gray-900/50 border border-gray-200/50 dark:border-gray-700/50 rounded-lg text-sm placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-colors duration-150"
                      />
                    </div>
                    <select
                      value={selectedProvider}
                      onChange={(e) =>
                        setSelectedProvider(
                          e.target.value as "unsplash" | "pexels",
                        )
                      }
                      className="px-3 py-2 bg-white/50 dark:bg-gray-900/50 border border-gray-200/50 dark:border-gray-700/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-colors duration-150"
                    >
                      {enabledProviders.map((provider) => (
                        <option key={provider} value={provider}>
                          {provider.charAt(0).toUpperCase() + provider.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Categories */}
              {activeTab === "categories" && (
                <div className="p-4 border-b border-gray-200 dark:border-zinc-900 flex-shrink-0">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-white/50 dark:bg-gray-900/50 border border-gray-200/50 dark:border-gray-700/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-colors duration-150"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* View Mode Toggle and Filters */}
              <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-zinc-900 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {totalResults > 0
                      ? `${assets.length} of ${totalResults} assets`
                      : `${assets.length} assets`}
                  </span>
                  {/* Filter Icon */}
                  <div className="relative">
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className={`p-1.5 rounded-md transition-colors duration-150 ${
                        showFilters ||
                        Object.values(filters).some(
                          (v) => v !== "all" && v !== "",
                        )
                          ? "bg-blue-500/20 text-blue-600 dark:text-blue-400"
                          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/50 dark:hover:bg-gray-700/50"
                      }`}
                      title="Filters"
                    >
                      <MixerHorizontalIcon className="w-4 h-4" />
                    </button>

                    {/* Filter Panel */}
                    <AnimatePresence>
                      {showFilters && renderFilterPanel()}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="flex gap-1 bg-gray-100/50 dark:bg-gray-800/50 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-md transition-colors duration-150 ${
                      viewMode === "grid"
                        ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    <GridIcon className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-md transition-colors duration-150 ${
                      viewMode === "list"
                        ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    <ListBulletIcon className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Assets Grid/List - This is the scrollable area */}
              <div className="flex-1 overflow-y-auto min-h-0 will-change-scroll transform-gpu">
                <div className="p-4">{renderAssetGrid()}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
