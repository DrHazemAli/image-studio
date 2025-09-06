'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import * as Select from '@radix-ui/react-select';
import { ChevronDownIcon, MagicWandIcon, ImageIcon } from '@radix-ui/react-icons';
import { 
  Card, 
  Flex, 
  Text, 
  TextArea, 
  Button, 
  Box, 
  Progress,
  Separator 
} from '@radix-ui/themes';
import { ModelSelector } from './model-selector';
import { AzureDeployment } from '@/types/azure';

interface GenerationFormProps {
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
  { value: '512x512', label: '512×512' },
  { value: '768x768', label: '768×768' },
  { value: '1024x1024', label: '1024×1024' },
  { value: '1024x1792', label: '1024×1792 (Portrait)' },
  { value: '1792x1024', label: '1792×1024 (Landscape)' }
];

const IMAGE_FORMATS = [
  { value: 'png', label: 'PNG' },
  { value: 'jpeg', label: 'JPEG' }
];

const IMAGE_COUNTS = [
  { value: '1', label: '1 image' },
  { value: '2', label: '2 images' },
  { value: '3', label: '3 images' },
  { value: '4', label: '4 images' }
];

export function GenerationForm({
  deployments,
  selectedDeployment,
  onDeploymentChange,
  onGenerate,
  isGenerating,
  progress
}: GenerationFormProps) {
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState('1024x1024');
  const [format, setFormat] = useState('png');
  const [count, setCount] = useState('1');

  const selectedModel = deployments.find(d => d.id === selectedDeployment);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isGenerating) {
      onGenerate({
        prompt: prompt.trim(),
        size,
        format,
        count: parseInt(count)
      });
    }
  };

  const SelectTrigger = ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
    <Select.Trigger 
      className="inline-flex items-center justify-between rounded px-3 py-2 text-sm leading-none h-9 bg-white border border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 data-[placeholder]:text-gray-500 min-w-[120px] disabled:opacity-50"
      {...props}
    >
      {children}
      <Select.Icon className="ml-2">
        <ChevronDownIcon />
      </Select.Icon>
    </Select.Trigger>
  );

  const SelectContent = ({ children }: { children: React.ReactNode }) => (
    <Select.Portal>
      <Select.Content className="overflow-hidden bg-white rounded-md shadow-lg border border-gray-200 z-50">
        <Select.Viewport className="p-1">
          {children}
        </Select.Viewport>
      </Select.Content>
    </Select.Portal>
  );

  const SelectItem = ({ value, children }: { value: string; children: React.ReactNode }) => (
    <Select.Item
      value={value}
      className="text-sm leading-none rounded-sm flex items-center h-8 px-3 relative select-none data-[disabled]:text-gray-400 data-[disabled]:pointer-events-none data-[highlighted]:outline-none data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-900 cursor-pointer"
    >
      <Select.ItemText>{children}</Select.ItemText>
    </Select.Item>
  );

  return (
    <Card className="w-full max-w-2xl">
      <Box p="6">
        <Flex align="center" gap="2" className="mb-6">
          <ImageIcon size="20" />
          <Text size="5" weight="bold">
            Azure Image Generator
          </Text>
        </Flex>

        <form onSubmit={handleSubmit} className="space-y-6">
          <ModelSelector
            deployments={deployments}
            selectedDeployment={selectedDeployment}
            onDeploymentChange={onDeploymentChange}
            disabled={isGenerating}
          />

          <Box>
            <Text size="2" weight="medium" className="mb-2 block">
              Prompt
            </Text>
            <TextArea
              placeholder="Describe the image you want to generate..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isGenerating}
              rows={4}
              className="w-full resize-none"
            />
          </Box>

          <Flex gap="4" wrap="wrap">
            <Box className="flex-1 min-w-[120px]">
              <Text size="2" weight="medium" className="mb-2 block">
                Size
              </Text>
              <Select.Root value={size} onValueChange={setSize} disabled={isGenerating}>
                <SelectTrigger>
                  <Select.Value />
                </SelectTrigger>
                <SelectContent>
                  {IMAGE_SIZES.map((sizeOption) => (
                    <SelectItem key={sizeOption.value} value={sizeOption.value}>
                      {sizeOption.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select.Root>
            </Box>

            <Box className="flex-1 min-w-[120px]">
              <Text size="2" weight="medium" className="mb-2 block">
                Format
              </Text>
              <Select.Root value={format} onValueChange={setFormat} disabled={isGenerating}>
                <SelectTrigger>
                  <Select.Value />
                </SelectTrigger>
                <SelectContent>
                  {IMAGE_FORMATS
                    .filter(fmt => selectedModel?.supportedFormats.includes(fmt.value))
                    .map((formatOption) => (
                      <SelectItem key={formatOption.value} value={formatOption.value}>
                        {formatOption.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select.Root>
            </Box>

            <Box className="flex-1 min-w-[120px]">
              <Text size="2" weight="medium" className="mb-2 block">
                Count
              </Text>
              <Select.Root value={count} onValueChange={setCount} disabled={isGenerating}>
                <SelectTrigger>
                  <Select.Value />
                </SelectTrigger>
                <SelectContent>
                  {IMAGE_COUNTS.map((countOption) => (
                    <SelectItem key={countOption.value} value={countOption.value}>
                      {countOption.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select.Root>
            </Box>
          </Flex>

          {isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <Flex justify="between" align="center">
                <Text size="2" color="gray">
                  Generating image...
                </Text>
                <Text size="2" color="gray">
                  {Math.round(progress)}%
                </Text>
              </Flex>
              <Progress value={progress} className="w-full" />
            </motion.div>
          )}

          <Separator />

          <Button
            type="submit"
            disabled={!prompt.trim() || isGenerating}
            size="3"
            className="w-full"
          >
            <MagicWandIcon />
            {isGenerating ? 'Generating...' : 'Generate Image'}
          </Button>
        </form>
      </Box>
    </Card>
  );
}