'use client';

import React from 'react';
import { motion } from 'framer-motion';
import * as Tooltip from '@radix-ui/react-tooltip';

/**
 * Props interface for the ImageToolButton component
 * This component represents individual tool buttons in the floating image toolbar
 */
export interface ImageToolButtonProps {
  // Tool identification
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  
  // Visual states
  isActive?: boolean;
  isDisabled?: boolean;
  isProcessing?: boolean;
  
  // Interaction handlers
  onClick: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  
  // Visual customization
  tooltip?: string;
  shortcut?: string;
  className?: string;
  variant?: 'default' | 'primary' | 'danger';
  size?: 'small' | 'medium' | 'large';
}

/**
 * Reusable image tool button component
 * Used throughout the floating image toolbar for consistent styling and behavior
 */
export const ImageToolButton: React.FC<ImageToolButtonProps> = ({
  id,
  name,
  icon: Icon,
  isActive = false,
  isDisabled = false,
  isProcessing = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
  tooltip,
  shortcut,
  className = '',
  variant = 'default',
  size = 'medium'
}) => {
  // Define size classes based on size prop
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-10 h-10', 
    large: 'w-12 h-12'
  };

  // Define icon size classes
  const iconSizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6'
  };

  // Define variant styles
  const getVariantClasses = () => {
    if (isDisabled) {
      return 'bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-zinc-600 cursor-not-allowed';
    }

    if (isActive) {
      switch (variant) {
        case 'primary':
          return 'bg-blue-500 text-white shadow-lg ring-2 ring-blue-500/20';
        case 'danger':
          return 'bg-red-500 text-white shadow-lg ring-2 ring-red-500/20';
        default:
          return 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-lg';
      }
    }

    // Default hover states
    switch (variant) {
      case 'primary':
        return 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-blue-200 dark:border-blue-800';
      case 'danger':
        return 'bg-white dark:bg-zinc-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-800';
      default:
        return 'bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-700 border border-gray-200 dark:border-zinc-600';
    }
  };

  // Handle click events
  const handleClick = () => {
    if (!isDisabled && !isProcessing) {
      onClick();
    }
  };

  const buttonContent = (
    <motion.button
      className={`
        ${sizeClasses[size]}
        ${getVariantClasses()}
        relative rounded-xl flex items-center justify-center
        transition-all duration-200 backdrop-blur-sm
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        ${className}
      `}
      onClick={handleClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      disabled={isDisabled}
      whileHover={!isDisabled ? { scale: 1.05 } : {}}
      whileTap={!isDisabled ? { scale: 0.95 } : {}}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        delay: 0.1 
      }}
    >
      {/* Processing spinner overlay */}
      {isProcessing && (
        <motion.div
          className="absolute inset-0 rounded-xl bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className={`${iconSizeClasses[size]} border-2 border-transparent border-t-current rounded-full`}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>
      )}
      
      {/* Main icon */}
      <Icon className={`${iconSizeClasses[size]} transition-colors duration-200`} />
      
      {/* Active indicator */}
      {isActive && (
        <motion.div
          className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-zinc-800"
          layoutId={`active-indicator-${id}`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
      
      {/* Keyboard shortcut indicator */}
      {shortcut && !isActive && (
        <div className="absolute -bottom-1 -right-1 min-w-[16px] h-4 bg-gray-700 dark:bg-zinc-300 text-white dark:text-zinc-700 rounded text-xs flex items-center justify-center px-1 font-mono text-[10px]">
          {shortcut.length === 1 ? shortcut : '⌘'}
        </div>
      )}
    </motion.button>
  );

  // Wrap with tooltip if provided
  if (tooltip) {
    return (
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          {buttonContent}
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="bg-gray-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-3 py-2 rounded-lg text-sm font-medium shadow-lg max-w-xs z-50"
            side="top"
            sideOffset={8}
          >
            <div className="flex flex-col gap-1">
              <span className="font-semibold">{name}</span>
              {tooltip !== name && (
                <span className="text-xs opacity-80">{tooltip}</span>
              )}
              {shortcut && (
                <span className="text-xs opacity-70 font-mono">{shortcut}</span>
              )}
            </div>
            <Tooltip.Arrow className="fill-gray-900 dark:fill-zinc-100" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    );
  }

  return buttonContent;
};