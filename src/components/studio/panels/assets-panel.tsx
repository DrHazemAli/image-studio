"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  StackIcon,
  Cross2Icon,
  ImageIcon,
  DownloadIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  GridIcon,
  ListBulletIcon,
} from "@radix-ui/react-icons";
import { Button, TextField } from "@radix-ui/themes";
import { dbManager, type Asset } from "@/lib/indexeddb";

interface AssetsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onAssetSelect?: (asset: Asset) => void;
  projectId?: string;
}

export function AssetsPanel({
  isOpen,
  onClose,
  onAssetSelect,
  projectId,
}: AssetsPanelProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<
    "all" | "generation" | "edit" | "upload"
  >("all");

  // Load assets from IndexedDB on mount
  useEffect(() => {
    const loadAssets = async () => {
      try {
        const loadedAssets = await dbManager.getAssets(projectId);
        setAssets(loadedAssets);
      } catch (error) {
        console.error("Failed to load assets:", error);
      }
    };
    loadAssets();
  }, [projectId]);

  // Save assets to IndexedDB whenever assets change
  useEffect(() => {
    if (assets.length > 0) {
      // Save each asset individually to IndexedDB
      assets.forEach((asset) => {
        dbManager.saveAsset(asset).catch(console.error);
      });
    }
  }, [assets]);

  const filteredAssets = assets
    .filter((asset) => {
      const matchesFilter = filter === "all" || asset.type === filter;
      const matchesSearch =
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (asset.prompt &&
          asset.prompt.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const handleDeleteAsset = async (assetId: string) => {
    try {
      await dbManager.deleteAsset(assetId);
      setAssets((prev) => prev.filter((asset) => asset.id !== assetId));
    } catch (error) {
      console.error("Failed to delete asset:", error);
    }
  };

  const handleDownloadAsset = (asset: Asset) => {
    const link = document.createElement("a");
    link.href = asset.url;
    link.download = `${asset.name}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

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
          className="bg-white dark:bg-black/95 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[80vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                <StackIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Assets Library
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {filteredAssets.length} items
                </p>
              </div>
            </div>

            <Button variant="ghost" onClick={onClose}>
              <Cross2Icon className="w-5 h-5" />
            </Button>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-gray-900/30">
            <div className="flex items-center gap-4">
              {/* Search */}
              <TextField.Root
                placeholder="Search assets..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchQuery(e.target.value)
                }
                className="w-64"
              >
                <TextField.Slot>
                  <MagnifyingGlassIcon height="16" width="16" />
                </TextField.Slot>
              </TextField.Root>

              {/* Filter */}
              <div className="flex gap-1 bg-gray-200 dark:bg-gray-800 rounded-lg p-1">
                {["all", "generation", "edit", "upload"].map((type) => (
                  <button
                    key={type}
                    onClick={() =>
                      setFilter(
                        type as "all" | "generation" | "edit" | "upload",
                      )
                    }
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors capitalize ${
                      filter === type
                        ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* View Mode */}
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
            {filteredAssets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <ImageIcon className="w-16 h-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No assets yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                  Your generated images and uploads will appear here. Start by
                  creating or uploading images.
                </p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {filteredAssets.map((asset) => (
                  <motion.div
                    key={asset.id}
                    className="group relative bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden aspect-square cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                    onClick={() => onAssetSelect?.(asset)}
                  >
                    <img
                      src={asset.url}
                      alt={asset.name}
                      className="w-full h-full object-cover"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        size="1"
                        variant="soft"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadAsset(asset);
                        }}
                      >
                        <DownloadIcon className="w-3 h-3" />
                      </Button>
                      <Button
                        size="1"
                        variant="soft"
                        color="red"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAsset(asset.id);
                        }}
                      >
                        <TrashIcon className="w-3 h-3" />
                      </Button>
                    </div>

                    {/* Type Badge */}
                    <div className="absolute top-2 left-2">
                      <div
                        className={`px-2 py-1 rounded-md text-xs font-medium ${
                          asset.type === "generation"
                            ? "bg-blue-500 text-white"
                            : asset.type === "edit"
                              ? "bg-purple-500 text-white"
                              : "bg-green-500 text-white"
                        }`}
                      >
                        {asset.type}
                      </div>
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
                    onClick={() => onAssetSelect?.(asset)}
                  >
                    <img
                      src={asset.url}
                      alt={asset.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />

                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {asset.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {asset.prompt && (
                          <span className="block truncate max-w-md">
                            {asset.prompt}
                          </span>
                        )}
                        <span>{asset.timestamp.toLocaleDateString()}</span>
                        {asset.model && (
                          <span className="ml-2">• {asset.model}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="1"
                        variant="soft"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadAsset(asset);
                        }}
                      >
                        <DownloadIcon className="w-3 h-3" />
                      </Button>
                      <Button
                        size="1"
                        variant="soft"
                        color="red"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAsset(asset.id);
                        }}
                      >
                        <TrashIcon className="w-3 h-3" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
