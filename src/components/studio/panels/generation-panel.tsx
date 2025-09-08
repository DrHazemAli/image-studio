'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagicWandIcon,
  ImageIcon,
  GearIcon,
  Cross2Icon,
  ChevronDownIcon,
  PlayIcon,
  StopIcon,
  UpdateIcon,
  DownloadIcon,
  CopyIcon,
  ShuffleIcon
} from '@radix-ui/react-icons';
import { Button, Progress, Badge, Separator, Slider } from '@radix-ui/themes';
import * as Select from '@radix-ui/react-select';
import * as Tabs from '@radix-ui/react-tabs';

interface GenerationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (params: GenerationParams) => void;
  isGenerating?: boolean;
  progress?: number;
}

interface GenerationParams {
  prompt: string;
  model: string;
  size: string;
  style?: string;
  quality: string;
  count: number;
  seed?: number;
  negativePrompt?: string;
}

const models = [
  {
    id: 'gpt-image-1',
    name: 'GPT-Image-1',
    provider: 'Azure OpenAI',
    capabilities: ['generation', 'editing', 'inpainting'],
    premium: true
  },
  {
    id: 'dalle-3',
    name: 'DALL-E 3',
    provider: 'Azure OpenAI',
    capabilities: ['generation'],
    premium: false
  },
  {
    id: 'flux-1-1-pro',
    name: 'FLUX 1.1 Pro',
    provider: 'Black Forest Labs',
    capabilities: ['generation'],
    premium: false
  },
  {
    id: 'flux-1-kontext-pro',
    name: 'FLUX Kontext Pro',
    provider: 'Black Forest Labs',
    capabilities: ['generation', 'editing', 'context'],
    premium: false
  }
];

const presetPrompts = [
  "A majestic dragon soaring through cloudy skies at sunset",
  "A cyberpunk cityscape with neon lights reflecting on wet streets",
  "An astronaut floating in space with Earth in the background",
  "A cozy library with floating books and magical lighting",
  "A photorealistic portrait of a wise old wizard",
  "A serene Japanese garden with cherry blossoms and koi pond"
];

export function GenerationPanel({ isOpen, onClose, onGenerate, isGenerating = false, progress = 0 }: GenerationPanelProps) {
  const [activeTab, setActiveTab] = useState('generate');
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('dalle-3');
  const [size, setSize] = useState('1024x1024');
  const [style, setStyle] = useState('vivid');
  const [quality, setQuality] = useState('hd');
  const [count, setCount] = useState(1);
  const [seed, setSeed] = useState<number | undefined>();
  const [negativePrompt, setNegativePrompt] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const selectedModelData = models.find(m => m.id === selectedModel);

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    
    onGenerate({
      prompt,
      model: selectedModel,
      size,
      style,
      quality,
      count,
      seed,
      negativePrompt: negativePrompt.trim() || undefined
    });
  };

  const handlePresetClick = (presetPrompt: string) => {
    setPrompt(presetPrompt);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const randomizeSeed = () => {
    setSeed(Math.floor(Math.random() * 1000000));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 w-full max-w-4xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                <MagicWandIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  AI Image Studio
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Generate and edit images with Azure AI models
                </p>
              </div>
            </div>
            
            <Button variant="ghost" onClick={onClose}>
              <Cross2Icon className="w-5 h-5" />
            </Button>
          </div>

          <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
            {/* Tab Navigation */}
            <Tabs.List className="flex border-b border-gray-200 dark:border-gray-800">
              <Tabs.Trigger
                value="generate"
                className="flex-1 px-6 py-3 text-sm font-medium border-b-2 border-transparent hover:text-blue-600 dark:hover:text-blue-400 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 transition-colors"
              >
                Generate
              </Tabs.Trigger>
              <Tabs.Trigger
                value="edit"
                className="flex-1 px-6 py-3 text-sm font-medium border-b-2 border-transparent hover:text-blue-600 dark:hover:text-blue-400 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 transition-colors"
              >
                Edit
              </Tabs.Trigger>
              <Tabs.Trigger
                value="history"
                className="flex-1 px-6 py-3 text-sm font-medium border-b-2 border-transparent hover:text-blue-600 dark:hover:text-blue-400 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 transition-colors"
              >
                History
              </Tabs.Trigger>
            </Tabs.List>

            {/* Generate Tab */}
            <Tabs.Content value="generate" className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="space-y-6">
                {/* Model Selection */}
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                    AI Model
                  </label>
                  <Select.Root value={selectedModel} onValueChange={setSelectedModel}>
                    <Select.Trigger className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-gray-300 dark:hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <Select.Value />
                      <Select.Icon>
                        <ChevronDownIcon />
                      </Select.Icon>
                    </Select.Trigger>
                    
                    <Select.Portal>
                      <Select.Content className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl p-2 z-50">
                        <Select.Viewport>
                          {models.map((model) => (
                            <Select.Item
                              key={model.id}
                              value={model.id}
                              className="p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium flex items-center gap-2">
                                    {model.name}
                                    {model.premium && (
                                      <Badge size="1" color="gold">Pro</Badge>
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {model.provider} • {model.capabilities.join(', ')}
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
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                    Prompt
                  </label>
                  <div className="relative">
                    <textarea
                      ref={textareaRef}
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Describe the image you want to generate..."
                      className="w-full min-h-[120px] p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isGenerating}
                    />
                    <div className="absolute bottom-3 right-3 text-xs text-gray-500 dark:text-gray-400">
                      {prompt.length}/500
                    </div>
                  </div>
                  
                  {/* Preset Prompts */}
                  <div className="mt-3">
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                      Quick Start
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {presetPrompts.slice(0, 3).map((preset, index) => (
                        <button
                          key={index}
                          onClick={() => handlePresetClick(preset)}
                          className="px-3 py-1.5 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                        >
                          {preset.slice(0, 30)}...
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Generation Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Size Selection */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                      Size
                    </label>
                    <Select.Root value={size} onValueChange={setSize}>
                      <Select.Trigger className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                        <Select.Value />
                        <Select.Icon><ChevronDownIcon /></Select.Icon>
                      </Select.Trigger>
                      <Select.Portal>
                        <Select.Content className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl p-2">
                          <Select.Viewport>
                            <Select.Item value="1024x1024" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                              1024 × 1024 (Square)
                            </Select.Item>
                            <Select.Item value="1792x1024" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                              1792 × 1024 (Landscape)
                            </Select.Item>
                            <Select.Item value="1024x1792" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                              1024 × 1792 (Portrait)
                            </Select.Item>
                          </Select.Viewport>
                        </Select.Content>
                      </Select.Portal>
                    </Select.Root>
                  </div>

                  {/* Quality */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                      Quality
                    </label>
                    <Select.Root value={quality} onValueChange={setQuality}>
                      <Select.Trigger className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                        <Select.Value />
                        <Select.Icon><ChevronDownIcon /></Select.Icon>
                      </Select.Trigger>
                      <Select.Portal>
                        <Select.Content className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl p-2">
                          <Select.Viewport>
                            <Select.Item value="standard" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                              Standard
                            </Select.Item>
                            <Select.Item value="hd" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                              HD
                            </Select.Item>
                            <Select.Item value="high" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                              High (GPT-Image)
                            </Select.Item>
                          </Select.Viewport>
                        </Select.Content>
                      </Select.Portal>
                    </Select.Root>
                  </div>
                </div>

                {/* Advanced Settings */}
                <div>
                  <Button
                    variant="ghost"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="mb-4"
                  >
                    <GearIcon className="w-4 h-4 mr-2" />
                    Advanced Settings
                    <ChevronDownIcon className={`w-4 h-4 ml-2 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                  </Button>

                  <AnimatePresence>
                    {showAdvanced && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Seed */}
                          <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                              Seed
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="number"
                                value={seed || ''}
                                onChange={(e) => setSeed(e.target.value ? Number(e.target.value) : undefined)}
                                placeholder="Random"
                                className="flex-1 p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                              />
                              <Button size="1" variant="ghost" onClick={randomizeSeed}>
                                <ShuffleIcon className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Count */}
                          <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                              Count: {count}
                            </label>
                            <Slider
                              value={[count]}
                              onValueChange={(value) => setCount(value[0])}
                              min={1}
                              max={4}
                              step={1}
                              className="w-full"
                            />
                          </div>
                        </div>

                        {/* Negative Prompt */}
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                            Negative Prompt
                          </label>
                          <textarea
                            value={negativePrompt}
                            onChange={(e) => setNegativePrompt(e.target.value)}
                            placeholder="What you don't want to see in the image..."
                            className="w-full h-20 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg resize-none text-sm"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Generation Progress */}
                <AnimatePresence>
                  {isGenerating && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                          Generating with {selectedModelData?.name}...
                        </span>
                        <span className="text-sm font-mono text-blue-600 dark:text-blue-400">
                          {Math.round(progress)}%
                        </span>
                      </div>
                      <Progress value={progress} className="w-full" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                  <Button
                    onClick={handleGenerate}
                    disabled={!prompt.trim() || isGenerating}
                    size="3"
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
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
                  
                  {isGenerating && (
                    <Button variant="outline" size="3">
                      <StopIcon className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </Tabs.Content>

            {/* Edit Tab */}
            <Tabs.Content value="edit" className="p-6">
              <div className="text-center py-12">
                <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Image Editing
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Upload or select an image to start editing with AI
                </p>
              </div>
            </Tabs.Content>

            {/* History Tab */}
            <Tabs.Content value="history" className="p-6">
              <div className="text-center py-12">
                <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Generation History
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Your recent generations will appear here
                </p>
              </div>
            </Tabs.Content>
          </Tabs.Root>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}