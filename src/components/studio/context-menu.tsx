'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FrameIcon,
  DownloadIcon,
  UploadIcon,
  TrashIcon,
  CopyIcon,
  ClipboardIcon,
} from '@radix-ui/react-icons';

interface ContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  onResize: () => void;
  onFitToCanvas?: () => void;
  onDownload?: () => void;
  onUpload?: () => void;
  onClear?: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
  hasImage: boolean;
}

interface ContextMenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  separator?: boolean;
}

export default function ContextMenu({
  isOpen,
  position,
  onClose,
  onResize,
  onFitToCanvas,
  onDownload,
  onUpload,
  onClear,
  onCopy,
  onPaste,
  hasImage,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape, { passive: false });
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  const menuItems: ContextMenuItem[] = [
    {
      id: 'resize',
      label: 'Resize Canvas',
      icon: <FrameIcon className="w-4 h-4" />,
      onClick: () => {
        onResize();
        onClose();
      },
    },
    {
      id: 'fitToCanvas',
      label: 'Fit Image to Canvas',
      icon: <FrameIcon className="w-4 h-4" />,
      onClick: () => {
        onFitToCanvas?.();
        onClose();
      },
      disabled: !hasImage || !onFitToCanvas,
    },
    {
      id: 'separator1',
      label: '',
      icon: null,
      onClick: () => {},
      separator: true,
    },
    {
      id: 'upload',
      label: 'Upload Image',
      icon: <UploadIcon className="w-4 h-4" />,
      onClick: () => {
        onUpload?.();
        onClose();
      },
      disabled: !onUpload,
    },
    {
      id: 'download',
      label: 'Download Image',
      icon: <DownloadIcon className="w-4 h-4" />,
      onClick: () => {
        onDownload?.();
        onClose();
      },
      disabled: !hasImage || !onDownload,
    },
    {
      id: 'separator2',
      label: '',
      icon: null,
      onClick: () => {},
      separator: true,
    },
    {
      id: 'copy',
      label: 'Copy Canvas',
      icon: <CopyIcon className="w-4 h-4" />,
      onClick: () => {
        onCopy?.();
        onClose();
      },
      disabled: !hasImage || !onCopy,
    },
    {
      id: 'paste',
      label: 'Paste Image',
      icon: <ClipboardIcon className="w-4 h-4" />,
      onClick: () => {
        onPaste?.();
        onClose();
      },
      disabled: !onPaste,
    },
    {
      id: 'separator3',
      label: '',
      icon: null,
      onClick: () => {},
      separator: true,
    },
    {
      id: 'clear',
      label: 'Clear Canvas',
      icon: <TrashIcon className="w-4 h-4" />,
      onClick: () => {
        onClear?.();
        onClose();
      },
      disabled: !hasImage || !onClear,
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[180px]"
          style={{
            left: position.x,
            top: position.y,
            maxHeight: '400px',
            overflowY: 'auto',
          }}
        >
          {menuItems.map((item) => {
            if (item.separator) {
              return (
                <div
                  key={item.id}
                  className="h-px bg-gray-200 dark:bg-gray-700 my-1"
                />
              );
            }

            return (
              <button
                key={item.id}
                onClick={item.onClick}
                disabled={item.disabled}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 transition-colors"
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
