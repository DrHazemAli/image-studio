'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClockIcon,
  Cross2Icon,
  MagicWandIcon,
  Pencil2Icon,
  ImageIcon,
  TrashIcon,
  PlayIcon
} from '@radix-ui/react-icons';
import { Button, TextField } from '@radix-ui/themes';
import { dbManager, type HistoryEntry } from '@/lib/indexeddb';

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onReplay?: (entry: HistoryEntry) => void;
}

export function HistoryPanel({ isOpen, onClose, onReplay }: HistoryPanelProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'generation' | 'edit' | 'upload'>('all');

  // Load history from IndexedDB on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const loadedHistory = await dbManager.getHistory();
        setHistory(loadedHistory);
      } catch (error) {
        console.error('Failed to load history:', error);
      }
    };
    loadHistory();
  }, []);

  // Save history to IndexedDB whenever history changes
  useEffect(() => {
    if (history.length > 0) {
      // Save each history entry individually to IndexedDB
      history.forEach(entry => {
        dbManager.saveHistoryEntry(entry).catch(console.error);
      });
    }
  }, [history]);

  const filteredHistory = history.filter(entry => {
    const matchesFilter = filter === 'all' || entry.type === filter;
    const matchesSearch = (entry.prompt && entry.prompt.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         (entry.model && entry.model.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const handleDeleteEntry = async (entryId: string) => {
    try {
      await dbManager.deleteHistoryEntry(entryId);
      setHistory(prev => prev.filter(entry => entry.id !== entryId));
    } catch (error) {
      console.error('Failed to delete history entry:', error);
    }
  };

  const handleClearHistory = async () => {
    try {
      await dbManager.clearHistory();
      setHistory([]);
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'generation':
        return <MagicWandIcon className="w-4 h-4" />;
      case 'edit':
        return <Pencil2Icon className="w-4 h-4" />;
      default:
        return <ImageIcon className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 dark:text-green-400';
      case 'failed':
        return 'text-red-600 dark:text-red-400';
      case 'in-progress':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
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
          className="bg-white dark:bg-black/95 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl">
                <ClockIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  History
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {filteredHistory.length} entries
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {history.length > 0 && (
                <Button
                  variant="soft"
                  color="red"
                  size="2"
                  onClick={handleClearHistory}
                >
                  Clear All
                </Button>
              )}
              <Button variant="ghost" onClick={onClose}>
                <Cross2Icon className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-gray-900/30">
            <div className="flex items-center gap-4">
              {/* Search */}
              <TextField.Root
                placeholder="Search history..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              >
              </TextField.Root>

              {/* Filter */}
              <div className="flex gap-1 bg-gray-200 dark:bg-gray-800 rounded-lg p-1">
                {['all', 'generation', 'edit', 'upload'].map((type) => (
                  <button
                    key={type}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onClick={() => setFilter(type as any)}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors capitalize ${
                      filter === type
                        ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* History List */}
          <div className="overflow-y-auto max-h-[60vh]">
            {filteredHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <ClockIcon className="w-16 h-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No history yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                  Your image generations and edits will appear here.
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {filteredHistory.map((entry) => (
                  <motion.div
                    key={entry.id}
                    className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800/50 group transition-colors"
                    whileHover={{ x: 4 }}
                  >
                    {/* Thumbnail */}
                    {entry.thumbnailUrl || entry.imageUrl ? (
                      <img
                        src={entry.thumbnailUrl || entry.imageUrl}
                        alt="Result"
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                        {getTypeIcon(entry.type)}
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(entry.type)}
                          <span className="font-medium text-gray-900 dark:text-white capitalize">
                            {entry.type}
                          </span>
                        </div>
                        <div className={`text-xs px-2 py-1 rounded-full ${getStatusColor(entry.status)}`}>
                          {entry.status}
                        </div>
                      </div>

                      {entry.prompt && (
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-1 truncate">
                          {entry.prompt}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>{entry.timestamp.toLocaleString()}</span>
                        {entry.model && <span>• {entry.model}</span>}
                        {entry.settings && (
                          <span>• {entry.settings.size}</span>
                        )}
                      </div>

                      {entry.error && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                          {entry.error}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {entry.status === 'completed' && onReplay && (
                        <Button
                          size="1"
                          variant="soft"
                          onClick={() => onReplay(entry)}
                          title="Replay generation"
                        >
                          <PlayIcon className="w-3 h-3" />
                        </Button>
                      )}
                      <Button
                        size="1"
                        variant="soft"
                        color="red"
                        onClick={() => handleDeleteEntry(entry.id)}
                        title="Delete entry"
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