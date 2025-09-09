"use client";

import React, { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ZoomInIcon } from "@radix-ui/react-icons";

interface FileUploadAreaProps {
  onImageLoad?: (imageData: string) => void;
  isLoadingImage: boolean;
  imageLoaded: boolean;
}

export default function FileUploadArea({
  onImageLoad,
  isLoadingImage,
  imageLoaded,
}: FileUploadAreaProps) {
  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !onImageLoad) return;

      console.log("File selected:", file.name, file.type, file.size);

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          console.log("File read successfully, calling onImageLoad...");
          onImageLoad(result);
        }
      };
      reader.readAsDataURL(file);

      // Clear the input to allow selecting the same file again
      e.target.value = "";
    },
    [onImageLoad, isLoadingImage],
  );

  return (
    <AnimatePresence>
      {!imageLoaded && !isLoadingImage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="pointer-events-auto"
          >
            <label htmlFor="file-upload" className="cursor-pointer block">
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-800 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <ZoomInIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <div className="text-sm">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      Upload Image
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 ml-2">
                      or start editing with tools
                    </span>
                  </div>
                  <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-xs">
                    Browse
                  </div>
                </div>
              </motion.div>
            </label>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
