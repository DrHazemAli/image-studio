'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  GridIcon,
  ListBulletIcon,
  ImageIcon,
  ArchiveIcon,
  ExternalLinkIcon,
  DownloadIcon,
} from '@radix-ui/react-icons';
import { getUnifiedSetting } from '@/lib/settings';
import type { Asset, AssetStoreConfig } from '@/types/asset-store';

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
  projectId,
}: AssetStoreSidebarProps) {
  const [activeTab, setActiveTab] = useState<'featured' | 'search' | 'categories'>('featured');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<'unsplash' | 'pexels'>('unsplash');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [enabledProviders, setEnabledProviders] = useState<Array<'unsplash' | 'pexels'>>(['unsplash', 'pexels']);



  // Load enabled providers from settings
  useEffect(() => {
    const loadEnabledProviders = () => {
      try {
        // First check what's in localStorage
        const rawSettings = localStorage.getItem('az_settings');
        console.log('Raw localStorage az_settings:', rawSettings);
        
        const config = getUnifiedSetting('assetStore', null, 'localStorage') as AssetStoreConfig | null;
        console.log('Asset store config loaded:', config);
        console.log('Config providers:', config?.providers);
        console.log('Unsplash enabled:', config?.providers?.unsplash?.enabled);
        console.log('Pexels enabled:', config?.providers?.pexels?.enabled);
        
        const enabled: Array<'unsplash' | 'pexels'> = [];
        
        if (config?.providers?.unsplash?.enabled) enabled.push('unsplash');
        if (config?.providers?.pexels?.enabled) enabled.push('pexels');
        
        console.log('Enabled providers:', enabled);
        setEnabledProviders(enabled);
        
        // Set selected provider to first enabled provider if current one is not enabled
        if (enabled.length > 0 && !enabled.includes(selectedProvider)) {
          setSelectedProvider(enabled[0]);
        }
      } catch (error) {
        console.error('Failed to load asset store config:', error);
      }
    };

    loadEnabledProviders();
  }, [selectedProvider]);

  // Also load settings when component mounts
  useEffect(() => {
    const loadEnabledProviders = () => {
      try {
        // First check what's in localStorage
        const rawSettings = localStorage.getItem('az_settings');
        console.log('Raw localStorage az_settings:', rawSettings);
        
        const config = getUnifiedSetting('assetStore', null, 'localStorage') as AssetStoreConfig | null;
        console.log('Asset store config loaded:', config);
        console.log('Config providers:', config?.providers);
        console.log('Unsplash enabled:', config?.providers?.unsplash?.enabled);
        console.log('Pexels enabled:', config?.providers?.pexels?.enabled);
        
        const enabled: Array<'unsplash' | 'pexels'> = [];
        
        if (config?.providers?.unsplash?.enabled) enabled.push('unsplash');
        if (config?.providers?.pexels?.enabled) enabled.push('pexels');
        
        console.log('Enabled providers:', enabled);
        setEnabledProviders(enabled);
        
        // Set selected provider to first enabled provider if current one is not enabled
        if (enabled.length > 0 && !enabled.includes(selectedProvider)) {
          setSelectedProvider(enabled[0]);
        }
      } catch (error) {
        console.error('Failed to load asset store config:', error);
      }
    };

    loadEnabledProviders();
  }, [selectedProvider]);

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch(`/api/asset-store/categories?assetType=photo&provider=${selectedProvider}`);
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories || []);
        }
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };
    loadCategories();
  }, [selectedProvider]);

  // Load featured assets on mount
  useEffect(() => {
    if (isOpen && activeTab === 'featured') {
      loadFeaturedAssets();
    }
  }, [isOpen, activeTab]);

  // Load assets when search query changes (with debounce)
  useEffect(() => {
    if (activeTab === 'search' && searchQuery.trim()) {
      const timeoutId = setTimeout(() => {
        searchAssets();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery, activeTab]);

  // Load assets when category changes
  useEffect(() => {
    if (activeTab === 'categories' && selectedCategory !== 'all') {
      searchAssets(selectedCategory);
    }
  }, [selectedCategory, activeTab]);

  const loadFeaturedAssets = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/asset-store/featured', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: selectedProvider,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setAssets(data.data || []);
      } else {
        setError('Failed to load featured assets');
      }
    } catch (error) {
      console.error('Failed to load featured assets:', error);
      setError('Failed to load featured assets');
    } finally {
      setIsLoading(false);
    }
  };

  const searchAssets = async (query?: string) => {
    const searchTerm = query || searchQuery;
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/asset-store/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchTerm,
          provider: selectedProvider,
          per_page: 20,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAssets(data.data || []);
      } else {
        setError('Failed to search assets');
      }
    } catch (error) {
      console.error('Failed to search assets:', error);
      setError('Failed to search assets');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssetSelect = (asset: Asset) => {
    onAssetSelect?.(asset);
    onToggle(); // Close sidebar after selection
  };

  const handleDownload = async (asset: Asset) => {
    try {
      const response = await fetch(asset.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${asset.id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download asset:', error);
    }
  };

  const renderAssetGrid = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        </div>
      );
    }

    if (assets.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <ImageIcon className="w-12 h-12 text-gray-400 mb-4" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {activeTab === 'search' ? 'No assets found' : 'No featured assets available'}
          </p>
        </div>
      );
    }

    return (
      <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-2' : 'space-y-2'}>
        {assets.map((asset) => (
          <motion.div
            key={asset.id}
            className={`group relative bg-white/30 dark:bg-gray-700/30 backdrop-blur-sm border border-gray-200/30 dark:border-gray-600/30 rounded-lg overflow-hidden cursor-pointer transition-all duration-150 hover:bg-white/50 dark:hover:bg-gray-700/50 ${
              viewMode === 'grid' ? 'aspect-square' : 'flex items-center gap-3 p-3'
            }`}
            whileHover={{ scale: 1.02 }}
            onClick={() => handleAssetSelect(asset)}
          >
            {viewMode === 'grid' ? (
              <>
                <img
                  src={asset.thumbnail || asset.url}
                  alt={asset.name || 'Asset'}
                  className="w-full h-full object-cover"
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
                      window.open(asset.url, '_blank');
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
                  alt={asset.name || 'Asset'}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {asset.name || 'Untitled'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {asset.provider} • {asset.metadata.width}×{asset.metadata.height}
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
                      window.open(asset.url, '_blank');
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
      </div>
    );
  };

  return (
    <motion.div
      className="relative z-70 h-full w-0 overflow-hidden"
      animate={{
        width: isOpen ? 400 : 0,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="h-full w-full bg-white dark:bg-black border-r border-gray-200 dark:border-zinc-800">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-900">
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
                className="flex-1 flex flex-col"
              >
                {/* Tabs */}
                <div className="flex gap-1 p-3 border-b border-gray-200 dark:border-zinc-900">
                  {[
                    { id: 'featured', label: 'Featured' },
                    { id: 'search', label: 'Search' },
                    { id: 'categories', label: 'Categories' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150 ${
                        activeTab === tab.id
                          ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-700/50'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Search Bar */}
                {activeTab === 'search' && (
                  <div className="p-4 border-b border-gray-200 dark:border-zinc-900">
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
                        onChange={(e) => setSelectedProvider(e.target.value as 'unsplash' | 'pexels')}
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
                {activeTab === 'categories' && (
                  <div className="p-4 border-b border-gray-200 dark:border-zinc-900">
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

                {/* View Mode Toggle */}
                <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-zinc-900">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {assets.length} assets
                  </span>
                  <div className="flex gap-1 bg-gray-100/50 dark:bg-gray-800/50 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-md transition-colors duration-150 ${
                        viewMode === 'grid'
                          ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <GridIcon className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-md transition-colors duration-150 ${
                        viewMode === 'list'
                          ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <ListBulletIcon className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Assets Grid/List */}
                <div className="flex-1 overflow-y-auto">
                  <div className="p-4">
                    {renderAssetGrid()}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
