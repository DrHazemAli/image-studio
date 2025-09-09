"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cross2Icon } from "@radix-ui/react-icons";

/**
 * Props interface for the SlidingPanel component
 * This is the base component for all right-sliding editing panels
 */
export interface SlidingPanelProps {
  // Panel state
  isOpen: boolean;
  onClose: () => void;

  // Content
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;

  // Layout options
  width?: "sm" | "md" | "lg" | "xl";
  maxHeight?: string;

  // Behavior
  closeOnEscape?: boolean;
  closeOnOverlayClick?: boolean;
  preventBodyScroll?: boolean;

  // Actions
  actions?: React.ReactNode;

  // Styling
  className?: string;
}

/**
 * Reusable sliding panel component
 * Slides in from the right side of the screen (Canva-style)
 * Used for image filters, color adjustments, and other editing tools
 */
export const SlidingPanel: React.FC<SlidingPanelProps> = ({
  isOpen,
  onClose,
  title,
  icon,
  children,
  width = "md",
  maxHeight = "100vh",
  closeOnEscape = true,
  closeOnOverlayClick = true,
  preventBodyScroll = true,
  actions,
  className = "",
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Define width classes
  const widthClasses = {
    sm: "w-80", // 320px
    md: "w-96", // 384px
    lg: "w-[28rem]", // 448px
    xl: "w-[32rem]", // 512px
  };

  // Handle keyboard events
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === "Escape") {
        event.preventDefault();
        onClose();
      }

      // Trap focus within the panel
      if (event.key === "Tab" && panelRef.current) {
        const focusableElements = panelRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[
          focusableElements.length - 1
        ] as HTMLElement;

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeOnEscape, onClose]);

  // Manage focus and body scroll
  useEffect(() => {
    if (isOpen) {
      // Store the previously active element
      previousActiveElement.current = document.activeElement as HTMLElement;

      // Focus the panel for screen readers
      setTimeout(() => {
        panelRef.current?.focus();
      }, 100);

      // Prevent body scroll if requested
      if (preventBodyScroll) {
        document.body.style.overflow = "hidden";
      }
    } else {
      // Restore focus to the previously active element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
        previousActiveElement.current = null;
      }

      // Restore body scroll
      if (preventBodyScroll) {
        document.body.style.overflow = "";
      }
    }

    return () => {
      if (preventBodyScroll) {
        document.body.style.overflow = "";
      }
    };
  }, [isOpen, preventBodyScroll]);

  // Handle overlay click
  const handleOverlayClick = (event: React.MouseEvent) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleOverlayClick}
          />

          {/* Sliding panel */}
          <motion.div
            ref={panelRef}
            className={`
              fixed top-0 right-0 z-50
              ${widthClasses[width]}
              bg-white dark:bg-zinc-900
              border-l border-gray-200 dark:border-zinc-800
              shadow-2xl
              flex flex-col
              focus:outline-none
              ${className}
            `}
            style={{
              height: "100vh",
              maxHeight,
            }}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              duration: 0.4,
            }}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="panel-title"
          >
            {/* Header */}
            <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {icon && (
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      {icon}
                    </div>
                  )}
                  <h2
                    id="panel-title"
                    className="text-lg font-semibold text-gray-900 dark:text-white"
                  >
                    {title}
                  </h2>
                </div>

                <button
                  onClick={onClose}
                  className="
                    p-2 rounded-lg
                    hover:bg-gray-100 dark:hover:bg-zinc-800
                    transition-colors
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  "
                  aria-label="Close panel"
                >
                  <Cross2Icon className="w-4 h-4 text-gray-500 dark:text-zinc-400" />
                </button>
              </div>
            </div>

            {/* Content area with custom scrollbar */}
            <div className="flex-1 overflow-y-auto image-editing-panel">
              <div className="px-6 py-4">{children}</div>
            </div>

            {/* Footer actions (if provided) */}
            {actions && (
              <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 dark:border-zinc-800">
                {actions}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
