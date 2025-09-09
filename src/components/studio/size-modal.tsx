"use client";

import React from "react";
import { motion } from "framer-motion";
import { Cross2Icon, AspectRatioIcon } from "@radix-ui/react-icons";
import type { ModelInfo, SizeOption } from "@/app/api/models/route";

interface SizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSize: string;
  currentModel: string;
  onSizeChange: (size: string) => void;
  getModelName: (modelId: string) => string;
  models: ModelInfo[];
}

export function SizeModal({
  isOpen,
  onClose,
  currentSize,
  currentModel,
  onSizeChange,
  getModelName,
  models,
}: SizeModalProps) {
  // Get supported sizes for current model from API data
  const getSupportedSizes = (): SizeOption[] => {
    const model = models.find((m) => m.id === currentModel);
    return model
      ? model.supportedSizes
      : [
          {
            size: "1024x1024",
            label: "Square (1:1)",
            aspect: "1:1",
            description: "Standard size",
          },
          {
            size: "1024x768",
            label: "Standard (4:3)",
            aspect: "4:3",
            description: "Default size",
          },
        ];
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <AspectRatioIcon className="w-5 h-5" />
            Image Size & Aspect Ratio
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <Cross2Icon className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Current model: <strong>{getModelName(currentModel)}</strong>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto">
          {getSupportedSizes().map((sizeOption) => (
            <motion.button
              key={sizeOption.size}
              onClick={() => {
                onSizeChange(sizeOption.size);
                onClose();
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                currentSize === sizeOption.size
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium text-sm">{sizeOption.label}</div>
                <div className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  {sizeOption.aspect}
                </div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                {sizeOption.size} • {sizeOption.description}
              </div>
              {/* Visual aspect ratio preview */}
              <div className="flex justify-center">
                <div
                  className="border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800"
                  style={{
                    width:
                      sizeOption.aspect === "1:1"
                        ? "32px"
                        : sizeOption.aspect.startsWith("16:") ||
                            sizeOption.aspect.startsWith("3:2")
                          ? "40px"
                          : "24px",
                    height:
                      sizeOption.aspect === "1:1"
                        ? "32px"
                        : sizeOption.aspect.includes(":9") ||
                            sizeOption.aspect === "2:3" ||
                            sizeOption.aspect === "3:4"
                          ? "40px"
                          : "24px",
                  }}
                />
              </div>
            </motion.button>
          ))}
        </div>

        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="font-medium text-sm mb-2 text-gray-900 dark:text-white">
            💡 Size Guidelines
          </h3>
          <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <li>
              • <strong>Square (1:1)</strong> - Best for social media, avatars,
              and balanced compositions
            </li>
            <li>
              • <strong>Portrait (2:3, 3:4)</strong> - Ideal for mobile screens
              and vertical content
            </li>
            <li>
              • <strong>Landscape (3:2, 16:9)</strong> - Perfect for headers,
              banners, and wide scenes
            </li>
            {currentModel.includes("flux") && (
              <li>
                • <strong>Ultra sizes</strong> - High resolution for
                professional use (slower generation)
              </li>
            )}
          </ul>
        </div>
      </motion.div>
    </motion.div>
  );
}
