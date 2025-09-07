'use client'

import React from 'react';
import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Button, Badge } from "@radix-ui/themes";
import {
  PlusIcon,
  ShuffleIcon,
  QuestionMarkCircledIcon,
  ArrowUpIcon,
  UpdateIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ImageIcon,
  Cross2Icon,
  AspectRatioIcon,
  FileIcon,
  CameraIcon,
} from "@radix-ui/react-icons";
import type { ModelInfo } from '@/app/api/models/route';

export interface GenerationProgress {
  stage: string;
  progress: number;
  message: string;
  estimatedTime?: number;
}

export interface ExploreImage {
  id: string;
  url: string;
  prompt: string;
  model: string;
  aspectRatio: string;
  version: string;
  likes: number;
  createdAt: Date;
}

interface EnhancedPromptBoxProps {
  onGenerate: (prompt: string) => void;
  onRandomPrompt: () => string;
  isGenerating: boolean;
  progress: GenerationProgress | null;
  error: string | null;
  generatedImages: ExploreImage[];
  onShowImages: () => void;
  size?: string;
  count?: number;
  currentModel?: string;
  onModelChange?: (model: string) => void;
  prompt?: string; // External control of prompt
  onPromptChange?: (prompt: string) => void; // Callback when prompt changes
  isInpaintMode?: boolean; // Whether inpaint mode is active
  attachedImage?: string | null; // Attached image preview
  onAttachedImageRemove?: () => void; // Remove attached image
  onShowSizeModal?: () => void; // Show size modal
  onSizeChange?: (size: string) => void; // Handle size changes
  onImageUpload?: (file: File) => void; // Handle image upload
  models?: ModelInfo[]; // Available models
  getModelName?: (modelId: string) => string; // Get model display name
}

export default function EnhancedPromptBox({
  onGenerate,
  onRandomPrompt,
  isGenerating,
  progress,
  error,
  generatedImages,
  onShowImages,
  size = "1024x1024",
  count = 1,
  currentModel = "dalle-3",
  onModelChange,
  prompt,
  onPromptChange,
  isInpaintMode = false,
  attachedImage,
  onAttachedImageRemove,
  onShowSizeModal,
  onImageUpload,
  models = [],
  getModelName = (id) => id,
}: EnhancedPromptBoxProps) {
  const [localPrompt, setLocalPrompt] = useState("");
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [textareaHeight, setTextareaHeight] = useState(24);
  const [showHelpGuide, setShowHelpGuide] = useState(false);
  const [showAttachMenuLocal, setShowAttachMenuLocal] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePromptChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setLocalPrompt(newValue);
    onPromptChange?.(newValue);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    const newHeight = Math.min(Math.max(textarea.scrollHeight, 18), 200);
    textarea.style.height = `${newHeight}px`;
    setTextareaHeight(newHeight);
  }, [onPromptChange]);

  const updateTextareaHeight = useCallback((textarea: HTMLTextAreaElement) => {
    textarea.style.height = 'auto';
    const newHeight = Math.min(Math.max(textarea.scrollHeight, 18), 200);
    textarea.style.height = `${newHeight}px`;
    setTextareaHeight(newHeight);
  }, []);

  const handleProgrammaticTextChange = useCallback((newText: string) => {
    setLocalPrompt(newText);
    onPromptChange?.(newText);
    
    // Update height after state change
    setTimeout(() => {
      const textarea = containerRef.current?.querySelector('textarea');
      if (textarea) {
        updateTextareaHeight(textarea);
      }
    }, 0);
  }, [updateTextareaHeight, onPromptChange]);

  // Handle external prompt changes
  useEffect(() => {
    if (prompt !== undefined && prompt !== localPrompt) {
      handleProgrammaticTextChange(prompt);
    }
  }, [prompt, localPrompt, handleProgrammaticTextChange]);

  // Close dropdown menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowModelSelector(false);
        setShowHelpGuide(false);
        setShowAttachMenuLocal(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  const handleGenerate = useCallback(() => {
    if (!localPrompt.trim()) return;
    onGenerate(localPrompt.trim());
  }, [localPrompt, onGenerate]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  }, [handleGenerate]);

  const generateRandomPrompt = useCallback(() => {
    const randomPrompt = onRandomPrompt();
    handleProgrammaticTextChange(randomPrompt);
  }, [onRandomPrompt, handleProgrammaticTextChange]);

  return (
    <motion.div 
      className="fixed bottom-12 left-1/2 z-50 -translate-x-1/2 transform px-6"
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ 
        opacity: 1, 
        y: 0, 
        scale: 1
      }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <motion.div
        ref={containerRef}
        className="w-full max-w-full "
        animate={{
          width: (isFocused || localPrompt.trim()) ? "800px" : "600px"
        }}
        transition={{ 
          duration: 0.4, 
          ease: "easeOut",
          type: "tween"
        }}
        initial={{
          width: "600px"
        }}
        style={{
          maxWidth: (isFocused || localPrompt.trim()) ? "800px" : "600px"
        }}
      >
      <div className="relative">
        {/* Glassy background with enhanced effects */}
        <motion.div 
          className="bg-white/80 dark:bg-black/80 border-gray-200/50 dark:border-white/10 absolute inset-0 rounded-full border shadow-2xl backdrop-blur-xl"
          whileHover={{ scale: 1.02 }}
          animate={{
            height: Math.max(textareaHeight + 32, 56), // 32px for padding, minimum 56px
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        ></motion.div>

        {/* Content */}
        <motion.div 
          className="relative flex items-center gap-4 p-4 rounded-full min-h-[56px]"
          animate={{
            height: Math.max(textareaHeight + 32, 56), // 32px for padding, minimum 56px
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {/* Left side controls */}
          <div className="flex items-center gap-3">
            {/* Attach Button with Dropdown */}
            <div className="relative mt-1"
                 id="attach-button-container"
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  size="2"
                  variant="ghost"
                  className={`text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/50 dark:hover:bg-white/10 !rounded-full transition-all duration-300 hover:shadow-lg ${
                    showAttachMenuLocal ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' : ''
                  }`}
                  onClick={() => {
                    setShowAttachMenuLocal(prev => !prev);
                  }}
                >
                  <motion.div
                    animate={{ rotate: showAttachMenuLocal ? 45 : 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                  >
                    <PlusIcon className="w-5 h-5" />
                  </motion.div>
                </Button>
              </motion.div>

              {/* Attach Menu Dropdown */}
              {showAttachMenuLocal && (
                <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg min-w-[180px] z-50">
                  <div className="p-2">
                    <label className="block cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          onImageUpload?.(file);
                          setShowAttachMenuLocal(false);
                        }}
                        className="hidden"
                      />
                      <div className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-left transition-colors">
                        <FileIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <div>
                          <div className="font-medium text-sm">Upload Image</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {isInpaintMode ? 'Select image to edit' : 'Add reference image'}
                          </div>
                        </div>
                      </div>
                    </label>
                    
                    <button
                      onClick={() => {
                        // TODO: Implement camera capture
                        setShowAttachMenuLocal(false);
                      }}
                      className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-left transition-colors"
                    >
                      <CameraIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <div>
                        <div className="font-medium text-sm">Take Photo</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Use camera</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="!rounded-full mt-1"
            >
              <Button
                size="2"
                variant="ghost"
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/50 dark:hover:bg-white/10 !rounded-full transition-all duration-300 hover:shadow-lg"
                onClick={generateRandomPrompt}
              >
                <ShuffleIcon className="w-5 h-5" />
              </Button>
            </motion.div>
            
            {generatedImages.length > 0 && (
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  size="2"
                  variant="ghost"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/50 dark:hover:bg-white/10 relative rounded-full transition-all duration-300 hover:shadow-lg"
                  onClick={onShowImages}
                >
                  <ImageIcon className="w-5 h-5" />
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  >
                    <Badge className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center p-0 shadow-lg">
                      {generatedImages.length}
                    </Badge>
                  </motion.div>
                </Button>
              </motion.div>
            )}
            
            {/* Model Selector */}
            <div className="relative">
              <motion.button
                onClick={() => setShowModelSelector(!showModelSelector)}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100/50 dark:bg-gray-800/50 rounded-full text-sm font-medium hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-all duration-300 hover:shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <motion.span 
                  className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <span className="text-white text-xs">🤖</span>
                </motion.span>
                {isFocused || localPrompt.trim() ? (
                  getModelName(currentModel)
                ) : (
                 <></>
                )}
               
              </motion.button>
              
              {/* Model Selector Dropdown */}
              {showModelSelector && (
                <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg min-w-[200px] z-50 ">
                  <div className="p-2">
                    {models.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => {
                          onModelChange?.(model.id);
                          setShowModelSelector(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-left ${
                          currentModel === model.id ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''
                        }`}
                      >
                        <div>
                          <div className="font-medium text-sm flex items-center gap-2">
                            {model.name}
                            {model.supportsInpaint && (
                              <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded">
                                Inpaint
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{model.provider}</div>
                        </div>
                        <div className="flex flex-col gap-1">
                          {model.primary && (
                            <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-1 rounded">Primary</span>
                          )}
                          {model.premium && (
                            <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 px-2 py-1 rounded">Pro</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                {isFocused || localPrompt.trim() ? (
                <Badge 
                  variant="surface" 
                  className="hidden lg:block bg-gray-100/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 !rounded-lg px-3 py-1 shadow-sm cursor-pointer"
                  onClick={() => onShowSizeModal?.()}
                >
                 {size}
                 </Badge>
                ) : (
                  <Badge variant="surface" 
                  className="hidden lg:block bg-gray-100/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 !rounded-lg px-3 py-1 shadow-sm cursor-pointer"
                  onClick={() => onShowSizeModal?.()}
                >
                  S
                </Badge>
                )}
              </motion.div>
            </motion.div>


            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Badge variant="surface" className="hidden lg:block bg-gray-100/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 !rounded-lg px-3 py-1 shadow-sm">
                {count}x
              </Badge>


              
            </motion.div>

             {/* Inpaint Mode Indicator */}
             {isInpaintMode && (
                <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Badge variant="outline" color="orange" className="hidden lg:block !rounded-lg px-3 py-1 shadow-sm">
                  EDIT
                </Badge>
  
  
                
              </motion.div>
              )}

            {/* Attached Image Preview */}
            {attachedImage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative"
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-blue-500 dark:border-blue-400 shadow-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={attachedImage}
                    alt="Attached"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => onAttachedImageRemove?.()}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs transition-colors"
                >
                  <Cross2Icon className="w-3 h-3" />
                </button>
              </motion.div>
            )}
          </div>

          {/* Main input */}
          <motion.div 
            className="flex-1 min-w-0 p-0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="relative flex-1 mt-1">
              <textarea
                placeholder={isInpaintMode ? "Describe how to edit the selected area..." : "Describe your image..."}
                value={localPrompt}
                onChange={handlePromptChange}
                onKeyDown={handleKeyDown}
                onFocus={handleFocus}
                rows={1}
                onBlur={handleBlur}
                className="w-full bg-transparent border-0 outline-none resize-none text-md text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 transition-all duration-300 focus:placeholder:text-gray-400 dark:focus:placeholder:text-gray-500"
                style={{
                  minHeight: "18px",
                  maxHeight: "200px",
                  height: `${textareaHeight}px`,
                  minWidth: "200px",
                }}
              />
              
             
            </div>
          </motion.div>

          {/* Right side controls */}
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                size="2"
                variant="ghost"
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/50 dark:hover:bg-white/10 rounded-full transition-all duration-300 hover:shadow-lg"
                onClick={() => setShowHelpGuide(!showHelpGuide)}
              >
                <QuestionMarkCircledIcon className="w-5 h-5" />
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                size="3"
                className="!rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                onClick={handleGenerate}
                disabled={isGenerating || !localPrompt.trim()}
              >
                <motion.div
                  animate={isGenerating ? { rotate: 360 } : { rotate: 0 }}
                  transition={isGenerating ? { duration: 1, repeat: Infinity, ease: "linear" } : { duration: 0.3 }}
                >
                  {isGenerating ? <UpdateIcon className="w-5 h-5" /> : <ArrowUpIcon className="w-5 h-5" />}
                </motion.div>
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Progress */}
        {progress && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: error ? 0 : 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-white/90 dark:bg-black/90 border-gray-200/50 dark:border-white/10 absolute right-0 bottom-full left-0 mb-2 rounded-2xl border p-4 shadow-lg backdrop-blur-sm"
          >
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-gray-900 dark:text-white">{progress.stage}</span>
              <span className="text-gray-600 dark:text-gray-400">{progress.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2 overflow-hidden">
              <motion.div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress.progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{progress.message}</p>
            {progress.estimatedTime && (
              <p className="text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-1 text-xs">
                <ClockIcon className="w-3 h-3" />
                Estimated time: {progress.estimatedTime}s
              </p>
            )}
          </motion.div>
        )}

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute right-0 bottom-full left-0 mb-2"
          >
            <motion.div 
              className="flex items-center gap-2 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-3 text-red-700 dark:text-red-300 shadow-lg"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: 2 }}
              >
                <ExclamationTriangleIcon className="w-4 h-4" />
              </motion.div>
              {error}
            </motion.div>
          </motion.div>
        )}

        {/* Help Guide */}
        {showHelpGuide && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute right-0 bottom-full left-0 mb-2"
          >
            <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl p-6 max-w-md mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {isInpaintMode ? '🎨 Inpaint Mode Guide' : '✨ Generation Guide'}
                </h3>
                <button
                  onClick={() => setShowHelpGuide(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  ✕
                </button>
              </div>
              
              {isInpaintMode ? (
                <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                  <div>
                    <h4 className="font-medium mb-1">📌 How to use Inpaint Mode:</h4>
                    <ul className="space-y-1 text-xs list-disc list-inside pl-2">
                      <li>Select an area on the canvas to edit</li>
                      <li>Describe what you want in that area</li>
                      <li>The AI will modify only the selected region</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-1">🤖 Supported Models:</h4>
                    <ul className="space-y-1 text-xs list-disc list-inside pl-2">
                      <li><strong>FLUX.1 Kontext Pro</strong> - Primary editing model (8x faster)</li>
                      <li><strong>GPT-image-1</strong> - Precise edits and modifications</li>
                      <li><strong>Florence 2.0</strong> - Background removal & segmentation</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-1">💡 Pro Tips:</h4>
                    <ul className="space-y-1 text-xs list-disc list-inside pl-2">
                      <li>Be specific about what you want to change</li>
                      <li>Use &ldquo;replace X with Y&rdquo; for clear instructions</li>
                      <li>Try &ldquo;remove the background&rdquo; with Florence 2.0</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                  <div>
                    <h4 className="font-medium mb-1">🎯 Writing Great Prompts:</h4>
                    <ul className="space-y-1 text-xs list-disc list-inside pl-2">
                      <li>Be specific about style, colors, and composition</li>
                      <li>Mention lighting and mood</li>
                      <li>Include art styles if desired</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-1">⌨️ Keyboard Shortcuts:</h4>
                    <ul className="space-y-1 text-xs list-disc list-inside pl-2">
                      <li><kbd>Enter</kbd> - Generate image</li>
                      <li><kbd>Shift+Enter</kbd> - New line</li>
                      <li><kbd>I</kbd> - Toggle inpaint mode</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

      </div>
      </motion.div>
    </motion.div>
  );
}