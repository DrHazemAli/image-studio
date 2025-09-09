"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import * as Tooltip from "@radix-ui/react-tooltip";
import { ResetIcon } from "@radix-ui/react-icons";

/**
 * Props interface for the AdjustmentSlider component
 */
export interface AdjustmentSliderProps {
  // Value control
  value: number;
  onChange: (value: number) => void;
  onChangeComplete?: (value: number) => void; // Called when user stops interacting

  // Range and step
  min: number;
  max: number;
  step?: number;
  defaultValue?: number;

  // Labeling
  label: string;
  unit?: string; // '%', 'px', '°', etc.
  description?: string;

  // Visual customization
  color?: "blue" | "red" | "green" | "orange" | "purple" | "gray";
  showValue?: boolean;
  showReset?: boolean;
  disabled?: boolean;

  // Layout
  orientation?: "horizontal" | "vertical";
  size?: "sm" | "md" | "lg";

  // Advanced features
  formatValue?: (value: number) => string;
  parseValue?: (input: string) => number;
  marks?: { value: number; label: string }[];

  // Styling
  className?: string;
}

/**
 * Professional image adjustment slider component
 * Features real-time preview, text input, reset functionality, and accessibility
 */
export const AdjustmentSlider: React.FC<AdjustmentSliderProps> = ({
  value,
  onChange,
  onChangeComplete,
  min,
  max,
  step = 1,
  defaultValue = 0,
  label,
  unit = "",
  description,
  color = "blue",
  showValue = true,
  showReset = true,
  disabled = false,
  orientation = "horizontal",
  size = "md",
  formatValue,
  parseValue,
  marks,
  className = "",
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(
    (value ?? defaultValue ?? 0).toString(),
  );
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, value: 0 });

  const sliderRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // Color theme mappings
  const colorThemes = {
    blue: {
      track: "bg-blue-500",
      thumb: "bg-blue-600 border-blue-700",
      focus: "ring-blue-500",
      reset: "text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20",
    },
    red: {
      track: "bg-red-500",
      thumb: "bg-red-600 border-red-700",
      focus: "ring-red-500",
      reset: "text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20",
    },
    green: {
      track: "bg-green-500",
      thumb: "bg-green-600 border-green-700",
      focus: "ring-green-500",
      reset: "text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20",
    },
    orange: {
      track: "bg-orange-500",
      thumb: "bg-orange-600 border-orange-700",
      focus: "ring-orange-500",
      reset: "text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20",
    },
    purple: {
      track: "bg-purple-500",
      thumb: "bg-purple-600 border-purple-700",
      focus: "ring-purple-500",
      reset: "text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20",
    },
    gray: {
      track: "bg-gray-500",
      thumb: "bg-gray-600 border-gray-700",
      focus: "ring-gray-500",
      reset: "text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900/20",
    },
  };

  const theme = colorThemes[color] || colorThemes.blue; // Fallback to blue theme

  // Size configurations
  const sizeConfig = {
    sm: { height: "h-4", thumb: "w-4 h-4", track: "h-1" },
    md: { height: "h-5", thumb: "w-5 h-5", track: "h-2" },
    lg: { height: "h-6", thumb: "w-6 h-6", track: "h-2.5" },
  };

  const config = sizeConfig[size];

  // Sync input value with prop value
  useEffect(() => {
    if (!isEditing) {
      setInputValue((value ?? defaultValue ?? 0).toString());
    }
  }, [value, isEditing, defaultValue]);

  // Calculate percentage for positioning
  const safeValue = value ?? defaultValue ?? 0;
  const percentage = ((safeValue - min) / (max - min)) * 100;

  // Format display value
  const getDisplayValue = useCallback(
    (val: number) => {
      if (formatValue) return formatValue(val);
      return `${val}${unit}`;
    },
    [formatValue, unit],
  );

  // Handle slider interaction
  const handleSliderInteraction = useCallback(
    (clientX: number) => {
      if (!trackRef.current || disabled || typeof clientX !== "number") return;

      try {
        const rect = trackRef.current.getBoundingClientRect();
        if (!rect.width) return; // Avoid division by zero

        const progress = Math.max(
          0,
          Math.min(1, (clientX - rect.left) / rect.width),
        );
        const newValue =
          Math.round((min + progress * (max - min)) / step) * step;
        const clampedValue = Math.max(min, Math.min(max, newValue));

        if (!isNaN(clampedValue) && isFinite(clampedValue)) {
          onChange(clampedValue);
        }
      } catch (error) {
        console.warn("Error in slider interaction:", error);
      }
    },
    [min, max, step, onChange, disabled],
  );

  // Mouse/touch event handlers
  const handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      if (disabled || !event.clientX) return;

      event.preventDefault();
      setIsDragging(true);
      setDragStart({ x: event.clientX, value: safeValue });
      handleSliderInteraction(event.clientX);
    },
    [disabled, safeValue, handleSliderInteraction],
  );

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!isDragging) return;
      handleSliderInteraction(event.clientX);
    },
    [isDragging, handleSliderInteraction],
  );

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      onChangeComplete?.(safeValue);
    }
  }, [isDragging, safeValue, onChangeComplete]);

  // Set up mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Handle text input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputSubmit = () => {
    let newValue: number;

    if (parseValue) {
      newValue = parseValue(inputValue);
    } else {
      newValue = parseFloat(inputValue);
    }

    if (!isNaN(newValue)) {
      const clampedValue = Math.max(min, Math.min(max, newValue));
      onChange(clampedValue);
      onChangeComplete?.(clampedValue);
    }

    setIsEditing(false);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleInputSubmit();
    } else if (e.key === "Escape") {
      setInputValue(value.toString());
      setIsEditing(false);
    }
  };

  // Handle reset
  const handleReset = () => {
    const resetValue = defaultValue ?? 0;
    onChange(resetValue);
    onChangeComplete?.(resetValue);
  };

  // Check if value is at default
  const isAtDefault = safeValue === (defaultValue ?? 0);

  return (
    <Tooltip.Provider>
      <div className={`space-y-3 ${className}`}>
        {/* Header with label and value */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {label}
            </label>
            {description && (
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full text-xs flex items-center justify-center cursor-help">
                    ?
                  </div>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-2 rounded-lg text-sm max-w-xs z-50"
                    sideOffset={5}
                  >
                    {description}
                    <Tooltip.Arrow className="fill-gray-900 dark:fill-gray-100" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Value display/input */}
            {showValue &&
              (isEditing ? (
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  onBlur={handleInputSubmit}
                  onKeyDown={handleInputKeyDown}
                  className="w-16 px-2 py-1 text-sm text-right bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  autoFocus
                />
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="min-w-[3rem] px-2 py-1 text-sm text-right font-mono text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                >
                  {getDisplayValue(safeValue)}
                </button>
              ))}

            {/* Reset button */}
            {showReset && !isAtDefault && (
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <motion.button
                    onClick={handleReset}
                    className={`p-1 rounded transition-colors ${theme.reset}`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    disabled={disabled}
                  >
                    <ResetIcon className="w-3 h-3" />
                  </motion.button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    className="bg-gray-900 text-white px-2 py-1 rounded text-xs z-50"
                    sideOffset={5}
                  >
                    Reset to {getDisplayValue(defaultValue ?? 0)}
                    <Tooltip.Arrow className="fill-gray-900" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            )}
          </div>
        </div>

        {/* Slider track and thumb */}
        <div className="relative">
          <div
            ref={trackRef}
            className={`
              relative w-full ${config.track}
              bg-gray-200 dark:bg-gray-700 rounded-full
              cursor-pointer
              ${disabled ? "cursor-not-allowed opacity-50" : ""}
            `}
            onMouseDown={handleMouseDown}
          >
            {/* Progress track */}
            <div
              className={`absolute inset-y-0 left-0 ${theme.track} rounded-full transition-all duration-150`}
              style={{ width: `${Math.max(0, Math.min(100, percentage))}%` }}
            />

            {/* Marks */}
            {marks &&
              marks.map((mark) => {
                const markPercentage = ((mark.value - min) / (max - min)) * 100;
                return (
                  <div
                    key={mark.value}
                    className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-0.5 h-full bg-white dark:bg-gray-300 rounded-full"
                    style={{ left: `${markPercentage}%` }}
                  />
                );
              })}

            {/* Thumb */}
            <motion.div
              className={`
                absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2
                ${config.thumb} ${theme.thumb}
                rounded-full border-2 shadow-lg
                cursor-grab active:cursor-grabbing
                focus:outline-none focus:ring-2 ${theme.focus} focus:ring-offset-2
                ${disabled ? "cursor-not-allowed" : ""}
              `}
              style={{ left: `${Math.max(0, Math.min(100, percentage))}%` }}
              whileHover={!disabled ? { scale: 1.1 } : {}}
              whileTap={!disabled ? { scale: 0.9 } : {}}
              animate={{
                scale: isDragging ? 1.2 : 1,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              tabIndex={disabled ? -1 : 0}
              role="slider"
              aria-valuemin={min}
              aria-valuemax={max}
              aria-valuenow={safeValue}
              aria-label={label}
            />
          </div>

          {/* Value labels for marks */}
          {marks && (
            <div className="flex justify-between mt-1">
              {marks.map((mark) => (
                <span
                  key={mark.value}
                  className="text-xs text-gray-500 dark:text-gray-400"
                >
                  {mark.label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Tooltip.Provider>
  );
};
