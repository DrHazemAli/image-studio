"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  ZoomInIcon,
  ZoomOutIcon,
  ResetIcon,
  FrameIcon,
} from "@radix-ui/react-icons";
import { Button } from "@radix-ui/themes";
import { ZOOM_CONSTANTS } from "@/lib/constants";

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}

export default function ZoomControls({
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
}: ZoomControlsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute bottom-4 left-4 flex items-center gap-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-xl p-2 shadow-lg border border-gray-200 dark:border-gray-800"
    >
      <Button
        variant="ghost"
        size="1"
        onClick={onZoomOut}
        disabled={zoom <= ZOOM_CONSTANTS.MIN_ZOOM}
      >
        <ZoomOutIcon className="w-4 h-4" />
      </Button>

      <div className="px-3 py-1 text-sm font-mono min-w-[60px] text-center">
        {zoom}%
      </div>

      <Button
        variant="ghost"
        size="1"
        onClick={onZoomIn}
        disabled={zoom >= ZOOM_CONSTANTS.MAX_ZOOM}
      >
        <ZoomInIcon className="w-4 h-4" />
      </Button>

      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

      <Button variant="ghost" size="1" onClick={onResetZoom} title="Reset Zoom">
        <ResetIcon className="w-4 h-4" />
      </Button>

      <Button
        variant="ghost"
        size="1"
        onClick={() => {
          // Fit to viewport logic would go here
          console.log("Fit to viewport");
        }}
        title="Fit to Viewport"
      >
        <FrameIcon className="w-4 h-4" />
      </Button>
    </motion.div>
  );
}
