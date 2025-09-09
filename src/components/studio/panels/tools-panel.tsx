/* eslint-disable */
"use client";
import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FrameIcon,
  CropIcon,
  SquareIcon,
  TextIcon,
  MixerHorizontalIcon,
  ImageIcon,
  LayersIcon,
  ChevronRightIcon,
  ChevronDownIcon,
} from "@radix-ui/react-icons";
import { FabricObject } from "fabric";

// Import all tool components
import ImageResizeTool from "@/components/studio/tools/image-resize-tool";
import CropTool from "@/components/studio/tools/crop-tool";
import ShapesTool from "@/components/studio/tools/shapes-tool";
import TextTool from "@/components/studio/tools/text-tool";
import FiltersTool from "@/components/studio/tools/filters-tool";

interface ToolsPanelProps {
  selectedObject: FabricObject | null;
  onImageTransform: (transform: any) => void;
  onCrop: (cropArea: any) => void;
  onAddShape: (shapeType: string, style: any) => void;
  onAddText: (text: string, style: any) => void;
  onApplyFilter: (settings: any) => void;
}

interface ToolSection {
  id: string;
  name: string;
  icon: React.ReactNode;
  tools: Tool[];
}

interface Tool {
  id: string;
  name: string;
  icon: React.ReactNode;
  component: React.ComponentType<any>;
  props: any;
  disabled?: boolean;
}

const TOOL_SECTIONS: ToolSection[] = [
  {
    id: "image",
    name: "Image Tools",
    icon: <ImageIcon className="w-4 h-4" />,
    tools: [
      {
        id: "resize",
        name: "Resize & Transform",
        icon: <FrameIcon className="w-4 h-4" />,
        component: ImageResizeTool,
        props: {},
        disabled: false,
      },
      {
        id: "crop",
        name: "Crop Image",
        icon: <CropIcon className="w-4 h-4" />,
        component: CropTool,
        props: {},
        disabled: false,
      },
      {
        id: "filters",
        name: "Apply Filters",
        icon: <MixerHorizontalIcon className="w-4 h-4" />,
        component: FiltersTool,
        props: {},
        disabled: false,
      },
    ],
  },
  {
    id: "shapes",
    name: "Shapes & Text",
    icon: <SquareIcon className="w-4 h-4" />,
    tools: [
      {
        id: "shapes",
        name: "Add Shapes",
        icon: <SquareIcon className="w-4 h-4" />,
        component: ShapesTool,
        props: {},
        disabled: false,
      },
      {
        id: "text",
        name: "Add Text",
        icon: <TextIcon className="w-4 h-4" />,
        component: TextTool,
        props: {},
        disabled: false,
      },
    ],
  },
];

export default function ToolsPanel({
  selectedObject,
  onImageTransform,
  onCrop,
  onAddShape,
  onAddText,
  onApplyFilter,
}: ToolsPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["image"]),
  );
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  }, []);

  const openTool = useCallback((toolId: string) => {
    setActiveTool(toolId);
  }, []);

  const closeTool = useCallback(() => {
    setActiveTool(null);
  }, []);

  const getToolProps = useCallback(
    (toolId: string) => {
      const baseProps = {
        isOpen: activeTool === toolId,
        onClose: closeTool,
      };

      switch (toolId) {
        case "resize":
          return {
            ...baseProps,
            selectedImage: selectedObject,
            onImageTransform,
          };
        case "crop":
          return {
            ...baseProps,
            selectedImage: selectedObject,
            onCrop,
          };
        case "shapes":
          return {
            ...baseProps,
            onAddShape,
          };
        case "text":
          return {
            ...baseProps,
            onAddText,
          };
        case "filters":
          return {
            ...baseProps,
            selectedImage: selectedObject,
            onApplyFilter,
          };
        default:
          return baseProps;
      }
    },
    [
      activeTool,
      selectedObject,
      onImageTransform,
      onCrop,
      onAddShape,
      onAddText,
      onApplyFilter,
      closeTool,
    ],
  );

  const isToolDisabled = useCallback(
    (tool: Tool) => {
      if (tool.disabled) return true;

      // Image tools require an image to be selected
      if (["resize", "crop", "filters"].includes(tool.id)) {
        return !selectedObject || selectedObject.type !== "image";
      }

      return false;
    },
    [selectedObject],
  );

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <LayersIcon className="w-5 h-5" />
          Tools
        </h3>
      </div>

      {/* Tools List */}
      <div className="flex-1 overflow-y-auto">
        {TOOL_SECTIONS.map((section) => (
          <div
            key={section.id}
            className="border-b border-gray-100 dark:border-gray-700"
          >
            {/* Section Header */}
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                {section.icon}
                <span className="font-medium text-gray-900 dark:text-white">
                  {section.name}
                </span>
              </div>
              {expandedSections.has(section.id) ? (
                <ChevronDownIcon className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRightIcon className="w-4 h-4 text-gray-500" />
              )}
            </button>

            {/* Section Tools */}
            <AnimatePresence>
              {expandedSections.has(section.id) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="pb-2">
                    {section.tools.map((tool) => {
                      const disabled = isToolDisabled(tool);
                      const ToolComponent = tool.component;

                      return (
                        <div key={tool.id}>
                          <button
                            onClick={() => !disabled && openTool(tool.id)}
                            disabled={disabled}
                            className={`w-full p-3 pl-12 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center gap-3 ${
                              disabled
                                ? "opacity-50 cursor-not-allowed"
                                : "cursor-pointer"
                            }`}
                          >
                            {tool.icon}
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {tool.name}
                            </span>
                          </button>

                          {/* Render Tool Component */}
                          <ToolComponent {...getToolProps(tool.id)} />
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {selectedObject ? (
            <div>
              <div className="font-medium">Selected: {selectedObject.type}</div>
              <div className="text-xs mt-1">
                {selectedObject.type === "image" && (
                  <>
                    Size:{" "}
                    {Math.round(selectedObject.width! * selectedObject.scaleX!)}{" "}
                    ×{" "}
                    {Math.round(
                      selectedObject.height! * selectedObject.scaleY!,
                    )}{" "}
                    px
                  </>
                )}
              </div>
            </div>
          ) : (
            "No object selected"
          )}
        </div>
      </div>
    </div>
  );
}
