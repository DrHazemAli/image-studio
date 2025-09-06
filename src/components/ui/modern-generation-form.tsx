'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MagicWandIcon, 
  ImageIcon, 
  GearIcon,
  ChevronDownIcon,
  ArrowRightIcon,
  UpdateIcon,
  Cross2Icon
} from '@radix-ui/react-icons';
import * as Select from '@radix-ui/react-select';
import { Button, Progress, Badge, Separator } from '@radix-ui/themes';
import { ModelSelector } from './model-selector';
import { AzureDeployment } from '@/types/azure';

interface ModernGenerationFormProps {
  deployments: AzureDeployment[];
  selectedDeployment: string;
  onDeploymentChange: (deploymentId: string) => void;
  onGenerate: (params: {
    prompt: string;
    size: string;
    format: string;
    count: number;
  }) => void;
  isGenerating: boolean;
  progress: number;
}

const IMAGE_SIZES = [
  { value: '512x512', label: '512×512', aspect: 'Square' },
  { value: '768x768', label: '768×768', aspect: 'Square' },
  { value: '1024x1024', label: '1024×1024', aspect: 'Square' },
  { value: '1024x1792', label: '1024×1792', aspect: 'Portrait' },
  { value: '1792x1024', label: '1792×1024', aspect: 'Landscape' }
];

const IMAGE_FORMATS = [
  { value: 'png', label: 'PNG', desc: 'High quality with transparency' },
  { value: 'jpeg', label: 'JPEG', desc: 'Compressed, smaller file size' }
];

const IMAGE_COUNTS = [1, 2, 3, 4];

export function ModernGenerationForm({
  deployments,
  selectedDeployment,
  onDeploymentChange,
  onGenerate,
  isGenerating,
  progress
}: ModernGenerationFormProps) {
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState('1024x1024');
  const [format, setFormat] = useState('png');
  const [count, setCount] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const selectedModel = deployments.find(d => d.id === selectedDeployment);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [prompt]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isGenerating) {
      onGenerate({
        prompt: prompt.trim(),
        size,
        format,
        count
      });
    }
  };

  const samplePrompts = [
    "A futuristic city at sunset with flying cars",
    "A serene mountain lake with perfect reflections",
    "An astronaut painting in space",
    "A cyberpunk cat with neon lights"
  ];

  return (
    <div className="w-full max-w-4xl mx-auto">
      <motion.div
        layout
        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-800/50 rounded-2xl shadow-xl"
      >
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                <ImageIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Azure Image Generator
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  AI-powered image creation
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="2"
                onClick={() => setShowSettings(!showSettings)}
                className={`transition-colors ${showSettings ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
              >
                <GearIcon className="h-4 w-4" />
                Settings
              </Button>
            </div>
          </div>

          {/* Model Selector */}
          <div className="mb-6">
            <ModelSelector
              deployments={deployments}
              selectedDeployment={selectedDeployment}
              onDeploymentChange={onDeploymentChange}
              disabled={isGenerating}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Main Prompt Area */}
          <div className="px-6 pb-4">
            <div className="relative">
              <motion.div
                layout
                className={`relative rounded-xl border transition-all duration-300 ${
                  isExpanded 
                    ? 'border-blue-500 dark:border-blue-400 shadow-lg' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <textarea
                  ref={textareaRef}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onFocus={() => setIsExpanded(true)}
                  onBlur={() => setIsExpanded(false)}
                  placeholder="Describe the image you want to create..."
                  disabled={isGenerating}
                  rows={1}
                  className="w-full min-h-[60px] p-4 bg-transparent resize-none outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50"
                  style={{ maxHeight: '200px' }}
                />
                
                {/* Floating action button */}
                <motion.div
                  className="absolute bottom-3 right-3"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    type="submit"
                    disabled={!prompt.trim() || isGenerating}
                    size="2"
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <UpdateIcon className="h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowRightIcon className="h-4 w-4" />
                    )}
                  </Button>
                </motion.div>
              </motion.div>

              {/* Sample prompts */}
              {!prompt && !isExpanded && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 flex flex-wrap gap-2"
                >
                  {samplePrompts.map((sample, index) => (
                    <motion.button
                      key={index}
                      type="button"
                      onClick={() => setPrompt(sample)}
                      className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {sample}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </div>
          </div>

          {/* Generation Progress */}
          <AnimatePresence>
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-6 pb-4"
              >
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Generating your image...
                    </span>
                    <span className="text-sm font-mono text-blue-600 dark:text-blue-400">
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <Progress 
                    value={progress} 
                    className="w-full h-2 bg-white/50 dark:bg-gray-800/50" 
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Advanced Settings */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="border-t border-gray-200 dark:border-gray-700"
              >
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Generation Settings
                    </h3>
                    <Button
                      variant="ghost"
                      size="1"
                      onClick={() => setShowSettings(false)}
                    >
                      <Cross2Icon className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Size Selection */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                        Image Size
                      </label>
                      <div className="grid gap-2">
                        {IMAGE_SIZES.map((sizeOption) => (
                          <motion.button
                            key={sizeOption.value}
                            type="button"
                            onClick={() => setSize(sizeOption.value)}
                            disabled={isGenerating}
                            className={`p-3 rounded-lg border text-left transition-all ${
                              size === sizeOption.value
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            } disabled:opacity-50`}
                            whileHover={{ scale: size !== sizeOption.value ? 1.02 : 1 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="font-medium text-sm">{sizeOption.label}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {sizeOption.aspect}
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Format Selection */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                        Format
                      </label>
                      <div className="space-y-2">
                        {IMAGE_FORMATS
                          .filter(fmt => selectedModel?.supportedFormats.includes(fmt.value))
                          .map((formatOption) => (
                            <motion.button
                              key={formatOption.value}
                              type="button"
                              onClick={() => setFormat(formatOption.value)}
                              disabled={isGenerating}
                              className={`w-full p-3 rounded-lg border text-left transition-all ${
                                format === formatOption.value
                                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                              } disabled:opacity-50`}
                              whileHover={{ scale: format !== formatOption.value ? 1.02 : 1 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className="font-medium text-sm">{formatOption.label}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {formatOption.desc}
                              </div>
                            </motion.button>
                          ))}
                      </div>
                    </div>

                    {/* Count Selection */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                        Number of Images
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {IMAGE_COUNTS.map((countOption) => (
                          <motion.button
                            key={countOption}
                            type="button"
                            onClick={() => setCount(countOption)}
                            disabled={isGenerating}
                            className={`p-3 rounded-lg border text-center transition-all ${
                              count === countOption
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            } disabled:opacity-50`}
                            whileHover={{ scale: count !== countOption ? 1.05 : 1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <div className="font-medium">{countOption}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {countOption === 1 ? 'image' : 'images'}
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Action Bar */}
          <div className="p-6 pt-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="soft" color="blue">
                  {selectedModel?.name || 'No model selected'}
                </Badge>
                <Separator orientation="vertical" className="h-4" />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {size} • {format.toUpperCase()} • {count} {count === 1 ? 'image' : 'images'}
                </span>
              </div>

              {!showSettings && (
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    disabled={!prompt.trim() || isGenerating}
                    size="3"
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg disabled:opacity-50"
                  >
                    <MagicWandIcon className="h-4 w-4" />
                    {isGenerating ? 'Generating...' : 'Generate Image'}
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}