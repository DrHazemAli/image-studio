"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagicWandIcon,
  Cross2Icon,
  PlayIcon,
  UpdateIcon,
  ChevronDownIcon,
  ImageIcon,
  VideoIcon,
  QuestionMarkCircledIcon,
  ArrowUpIcon,
} from "@radix-ui/react-icons";
import { Button, Badge } from "@radix-ui/themes";
import * as Select from "@radix-ui/react-select";

interface GlassyPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (params: {
    prompt: string;
    model: string;
    size: string;
    quality: string;
    count: number;
  }) => void;
  isGenerating?: boolean;
  progress?: number;
}

const models = [
  {
    id: "gpt-image-1",
    name: "GPT-Image-1",
    provider: "Azure OpenAI",
    premium: true,
  },
  {
    id: "dalle-3",
    name: "DALL-E 3",
    provider: "Azure OpenAI",
    premium: false,
  },
  {
    id: "flux-1-1-pro",
    name: "FLUX 1.1 Pro",
    provider: "Black Forest Labs",
    premium: false,
  },
  {
    id: "flux-1-kontext-pro",
    name: "FLUX Kontext Pro",
    provider: "Black Forest Labs",
    premium: false,
  },
];

const quickPrompts = [
  "A majestic dragon soaring through cloudy skies at sunset",
  "A cyberpunk cityscape with neon lights reflecting on wet streets",
  "An astronaut floating in space with Earth in the background",
  "A cozy library with floating books and magical lighting",
];

export function GlassyPrompt({
  isOpen,
  onClose,
  onGenerate,
  isGenerating = false,
  progress = 0,
}: GlassyPromptProps) {
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState("dalle-3");
  const [size, setSize] = useState("1024x1024");
  const [quality, setQuality] = useState("hd");
  const [count, setCount] = useState(1);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const selectedModelData = models.find((m) => m.id === selectedModel);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  const handleGenerate = () => {
    if (!prompt.trim()) return;

    onGenerate({
      prompt: prompt.trim(),
      model: selectedModel,
      size,
      quality,
      count,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleGenerate();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center pb-8 p-4"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
          onClick={onClose}
        >
          {/* Ultra Glassy Backdrop Blur */}
          <div className="absolute inset-0 backdrop-blur-2xl" />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 50 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25,
              duration: 0.4,
            }}
            className="relative w-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Main Ultra Glassy Container - Inspired by the image */}
            <div className="relative bg-black/80 backdrop-blur-3xl border border-gray-600/30 rounded-3xl shadow-2xl overflow-hidden">
              {/* Top Input Area */}
              <div className="relative p-6">
                {/* Main Prompt Input */}
                <div className="relative">
                  <div className="flex items-center gap-4 bg-gray-800/50 border border-gray-600/30 rounded-2xl p-4 backdrop-blur-sm">
                    <div className="p-2 bg-gray-700/50 rounded-lg">
                      <MagicWandIcon className="w-5 h-5 text-white" />
                    </div>
                    <textarea
                      ref={textareaRef}
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Describe your image..."
                      className="flex-1 bg-transparent border-0 outline-none text-white placeholder-gray-400 resize-none text-lg min-h-[60px] max-h-[120px]"
                      disabled={isGenerating}
                      rows={1}
                    />
                    <motion.button
                      onClick={handleGenerate}
                      disabled={!prompt.trim() || isGenerating}
                      className="p-3 bg-white text-black rounded-xl hover:bg-gray-100 disabled:bg-gray-600 disabled:text-gray-400 transition-all"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isGenerating ? (
                        <UpdateIcon className="w-5 h-5 animate-spin" />
                      ) : (
                        <ArrowUpIcon className="w-5 h-5" />
                      )}
                    </motion.button>
                  </div>

                  {/* Character count */}
                  <div className="absolute -bottom-6 right-2 text-xs text-gray-500">
                    {prompt.length}/500
                  </div>
                </div>

                {/* Bottom Control Bar - Like in the image */}
                <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-600/30">
                  <div className="flex items-center gap-3">
                    {/* Image Type Button */}
                    <motion.div
                      className="flex items-center gap-2 bg-gray-800/50 border border-gray-600/30 rounded-full px-4 py-2 text-white cursor-pointer"
                      whileHover={{ backgroundColor: "rgba(55, 65, 81, 0.7)" }}
                    >
                      <ImageIcon className="w-4 h-4" />
                      <span className="text-sm">Image</span>
                    </motion.div>

                    {/* Aspect Ratio */}
                    <Select.Root value={size} onValueChange={setSize}>
                      <Select.Trigger className="flex items-center gap-2 bg-gray-800/50 border border-gray-600/30 rounded-full px-4 py-2 text-white hover:bg-gray-700/50 transition-colors">
                        <div className="w-4 h-4 border border-gray-400 rounded-sm" />
                        <span className="text-sm">
                          {size === "1024x1024"
                            ? "2:3"
                            : size === "1792x1024"
                              ? "16:9"
                              : "3:2"}
                        </span>
                        <ChevronDownIcon className="w-3 h-3" />
                      </Select.Trigger>
                      <Select.Portal>
                        <Select.Content className="bg-gray-900/95 backdrop-blur-xl border border-gray-600/50 rounded-xl shadow-2xl p-2 z-50">
                          <Select.Viewport>
                            <Select.Item
                              value="1024x1792"
                              className="p-3 rounded-lg hover:bg-gray-800/50 cursor-pointer text-white"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-3 h-4 border border-gray-400 rounded-sm" />
                                <span>2:3 (Portrait)</span>
                              </div>
                            </Select.Item>
                            <Select.Item
                              value="1024x1024"
                              className="p-3 rounded-lg hover:bg-gray-800/50 cursor-pointer text-white"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-4 h-4 border border-gray-400 rounded-sm" />
                                <span>1:1 (Square)</span>
                              </div>
                            </Select.Item>
                            <Select.Item
                              value="1792x1024"
                              className="p-3 rounded-lg hover:bg-gray-800/50 cursor-pointer text-white"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-4 h-3 border border-gray-400 rounded-sm" />
                                <span>16:9 (Landscape)</span>
                              </div>
                            </Select.Item>
                          </Select.Viewport>
                        </Select.Content>
                      </Select.Portal>
                    </Select.Root>

                    {/* Video Button (Disabled) */}
                    <div className="flex items-center gap-2 bg-gray-800/30 border border-gray-600/20 rounded-full px-4 py-2 text-gray-500 cursor-not-allowed">
                      <VideoIcon className="w-4 h-4" />
                      <span className="text-sm">1v</span>
                    </div>

                    {/* More Options */}
                    <motion.div
                      className="flex items-center gap-2 bg-gray-800/50 border border-gray-600/30 rounded-full px-4 py-2 text-white cursor-pointer"
                      whileHover={{ backgroundColor: "rgba(55, 65, 81, 0.7)" }}
                    >
                      <div className="w-4 h-4 bg-gray-600 rounded-sm" />
                    </motion.div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Help */}
                    <motion.div
                      className="p-2 hover:bg-gray-800/50 rounded-lg cursor-pointer"
                      whileHover={{ scale: 1.05 }}
                    >
                      <QuestionMarkCircledIcon className="w-4 h-4 text-gray-400" />
                    </motion.div>

                    {/* Close */}
                    <motion.div
                      onClick={onClose}
                      className="p-2 hover:bg-gray-800/50 rounded-lg cursor-pointer"
                      whileHover={{ scale: 1.05 }}
                    >
                      <Cross2Icon className="w-4 h-4 text-gray-400" />
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Generation Progress */}
              <AnimatePresence>
                {isGenerating && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-gray-600/30 bg-gray-900/50 p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-white">
                        Generating with {selectedModelData?.name}...
                      </span>
                      <span className="text-sm font-mono text-blue-400">
                        {Math.round(progress)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <motion.div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="p-6 space-y-6">
                {/* Model Selection */}
                <div>
                  <label className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2 block">
                    AI Model
                  </label>
                  <Select.Root
                    value={selectedModel}
                    onValueChange={setSelectedModel}
                  >
                    <Select.Trigger className="w-full p-3 bg-white/20 dark:bg-white/5 border border-white/30 dark:border-white/10 rounded-xl hover:bg-white/30 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 backdrop-blur-sm transition-all text-gray-900 dark:text-white">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {selectedModelData?.name}
                          </span>
                          {selectedModelData?.premium && (
                            <Badge
                              size="1"
                              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white"
                            >
                              Pro
                            </Badge>
                          )}
                        </div>
                        <Select.Icon>
                          <ChevronDownIcon />
                        </Select.Icon>
                      </div>
                    </Select.Trigger>

                    <Select.Portal>
                      <Select.Content className="bg-white/90 dark:bg-black/90 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-xl shadow-2xl p-2 z-50">
                        <Select.Viewport>
                          {models.map((model) => (
                            <Select.Item
                              key={model.id}
                              value={model.id}
                              className="p-3 rounded-lg hover:bg-white/20 dark:hover:bg-white/10 cursor-pointer transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium flex items-center gap-2 text-gray-900 dark:text-white">
                                    {model.name}
                                    {model.premium && (
                                      <Badge
                                        size="1"
                                        className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white"
                                      >
                                        Pro
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-600 dark:text-gray-400">
                                    {model.provider}
                                  </div>
                                </div>
                              </div>
                              <Select.ItemIndicator />
                            </Select.Item>
                          ))}
                        </Select.Viewport>
                      </Select.Content>
                    </Select.Portal>
                  </Select.Root>
                </div>

                {/* Prompt Input */}
                <div>
                  <label className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2 block">
                    Describe your image
                  </label>
                  <div className="relative">
                    <textarea
                      ref={textareaRef}
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="A beautiful landscape with mountains and a serene lake..."
                      className="w-full min-h-[120px] p-4 bg-white/20 dark:bg-white/5 border border-white/30 dark:border-white/10 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent backdrop-blur-sm transition-all text-gray-900 dark:text-white placeholder-gray-600 dark:placeholder-gray-400"
                      disabled={isGenerating}
                    />
                    <div className="absolute bottom-3 right-3 text-xs text-gray-500 dark:text-gray-400 bg-white/20 dark:bg-black/20 px-2 py-1 rounded-lg backdrop-blur-sm">
                      {prompt.length}/500
                    </div>
                  </div>

                  {/* Quick Prompts */}
                  <div className="mt-3">
                    <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Quick ideas
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {quickPrompts.slice(0, 2).map((quickPrompt, index) => (
                        <button
                          key={index}
                          onClick={() => setPrompt(quickPrompt)}
                          className="px-3 py-1.5 text-xs bg-white/20 dark:bg-white/5 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-white/30 dark:hover:bg-white/10 transition-colors backdrop-blur-sm border border-white/20 dark:border-white/10"
                          disabled={isGenerating}
                        >
                          {quickPrompt.slice(0, 35)}...
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Quick Settings */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2 block">
                      Size
                    </label>
                    <Select.Root value={size} onValueChange={setSize}>
                      <Select.Trigger className="w-full p-2.5 bg-white/20 dark:bg-white/5 border border-white/30 dark:border-white/10 rounded-lg text-sm backdrop-blur-sm text-gray-900 dark:text-white">
                        <Select.Value />
                        <Select.Icon>
                          <ChevronDownIcon />
                        </Select.Icon>
                      </Select.Trigger>
                      <Select.Portal>
                        <Select.Content className="bg-white/90 dark:bg-black/90 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-lg shadow-xl p-1">
                          <Select.Viewport>
                            <Select.Item
                              value="1024x1024"
                              className="p-2 hover:bg-white/20 dark:hover:bg-white/10 rounded text-sm text-gray-900 dark:text-white"
                            >
                              Square (1024×1024)
                            </Select.Item>
                            <Select.Item
                              value="1792x1024"
                              className="p-2 hover:bg-white/20 dark:hover:bg-white/10 rounded text-sm text-gray-900 dark:text-white"
                            >
                              Landscape (1792×1024)
                            </Select.Item>
                            <Select.Item
                              value="1024x1792"
                              className="p-2 hover:bg-white/20 dark:hover:bg-white/10 rounded text-sm text-gray-900 dark:text-white"
                            >
                              Portrait (1024×1792)
                            </Select.Item>
                          </Select.Viewport>
                        </Select.Content>
                      </Select.Portal>
                    </Select.Root>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2 block">
                      Quality
                    </label>
                    <Select.Root value={quality} onValueChange={setQuality}>
                      <Select.Trigger className="w-full p-2.5 bg-white/20 dark:bg-white/5 border border-white/30 dark:border-white/10 rounded-lg text-sm backdrop-blur-sm text-gray-900 dark:text-white">
                        <Select.Value />
                        <Select.Icon>
                          <ChevronDownIcon />
                        </Select.Icon>
                      </Select.Trigger>
                      <Select.Portal>
                        <Select.Content className="bg-white/90 dark:bg-black/90 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-lg shadow-xl p-1">
                          <Select.Viewport>
                            <Select.Item
                              value="standard"
                              className="p-2 hover:bg-white/20 dark:hover:bg-white/10 rounded text-sm text-gray-900 dark:text-white"
                            >
                              Standard
                            </Select.Item>
                            <Select.Item
                              value="hd"
                              className="p-2 hover:bg-white/20 dark:hover:bg-white/10 rounded text-sm text-gray-900 dark:text-white"
                            >
                              HD
                            </Select.Item>
                          </Select.Viewport>
                        </Select.Content>
                      </Select.Portal>
                    </Select.Root>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2 block">
                      Count
                    </label>
                    <Select.Root
                      value={count.toString()}
                      onValueChange={(v) => setCount(Number(v))}
                    >
                      <Select.Trigger className="w-full p-2.5 bg-white/20 dark:bg-white/5 border border-white/30 dark:border-white/10 rounded-lg text-sm backdrop-blur-sm text-gray-900 dark:text-white">
                        <Select.Value />
                        <Select.Icon>
                          <ChevronDownIcon />
                        </Select.Icon>
                      </Select.Trigger>
                      <Select.Portal>
                        <Select.Content className="bg-white/90 dark:bg-black/90 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-lg shadow-xl p-1">
                          <Select.Viewport>
                            {[1, 2, 3, 4].map((num) => (
                              <Select.Item
                                key={num}
                                value={num.toString()}
                                className="p-2 hover:bg-white/20 dark:hover:bg-white/10 rounded text-sm text-gray-900 dark:text-white"
                              >
                                {num} image{num !== 1 ? "s" : ""}
                              </Select.Item>
                            ))}
                          </Select.Viewport>
                        </Select.Content>
                      </Select.Portal>
                    </Select.Root>
                  </div>
                </div>

                {/* Generation Progress */}
                <AnimatePresence>
                  {isGenerating && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-blue-500/10 dark:bg-blue-500/5 border border-blue-500/20 dark:border-blue-500/10 rounded-xl p-4 backdrop-blur-sm"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                          Generating with {selectedModelData?.name}...
                        </span>
                        <span className="text-sm font-mono text-blue-600 dark:text-blue-400">
                          {Math.round(progress)}%
                        </span>
                      </div>
                      <div className="w-full bg-blue-200/30 dark:bg-blue-800/30 rounded-full h-2">
                        <motion.div
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={handleGenerate}
                    disabled={!prompt.trim() || isGenerating}
                    size="3"
                    className="flex-1 bg-gradient-to-r from-blue-500/90 to-purple-600/90 hover:from-blue-600/90 hover:to-purple-700/90 text-white backdrop-blur-sm border-0 shadow-lg"
                  >
                    {isGenerating ? (
                      <>
                        <UpdateIcon className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <PlayIcon className="w-4 h-4 mr-2" />
                        Generate Image
                      </>
                    )}
                  </Button>
                </div>

                {/* Keyboard Hint */}
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center bg-white/5 dark:bg-white/5 rounded-lg p-2 backdrop-blur-sm">
                  Press{" "}
                  <kbd className="px-1.5 py-0.5 bg-white/20 dark:bg-white/10 rounded text-xs">
                    ⌘ Enter
                  </kbd>{" "}
                  to generate •{" "}
                  <kbd className="px-1.5 py-0.5 bg-white/20 dark:bg-white/10 rounded text-xs">
                    Esc
                  </kbd>{" "}
                  to close
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
