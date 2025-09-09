'use client';

import React, { useCallback, useMemo } from 'react';
import { BaseModal } from './base-modal';
import { AspectRatioIcon } from '@radix-ui/react-icons';
import { motion } from 'framer-motion';
import type { ModelInfo, SizeOption } from '@/app/api/models/route';

interface SizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSize: string;
  currentModel: string;
  onSizeChange: (size: string) => void;
  getModelName: (modelId: string) => string;
  models: ModelInfo[];
}

export const SizeModal = React.memo<SizeModalProps>(
  ({
    isOpen,
    onClose,
    currentSize,
    currentModel,
    onSizeChange,
    getModelName,
    models,
  }) => {
    // Memoize supported sizes calculation to prevent unnecessary recalculations
    const supportedSizes = useMemo((): SizeOption[] => {
      const model = models.find((m) => m.id === currentModel);
      return model
        ? model.supportedSizes
        : [
            {
              size: '1024x1024',
              label: 'Square (1:1)',
              aspect: '1:1',
              description: 'Standard size',
            },
            {
              size: '1024x768',
              label: 'Standard (4:3)',
              aspect: '4:3',
              description: 'Default size',
            },
          ];
    }, [models, currentModel]);

    // Memoize model name to prevent unnecessary recalculations
    const modelName = useMemo(
      () => getModelName(currentModel),
      [getModelName, currentModel]
    );

    // Memoize size selection handler to prevent unnecessary rerenders
    const handleSizeSelect = useCallback(
      (size: string) => {
        onSizeChange(size);
        onClose();
      },
      [onSizeChange, onClose]
    );

    return (
      <BaseModal
        isOpen={isOpen}
        onClose={onClose}
        title="Image Size & Aspect Ratio"
        icon={
          <AspectRatioIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        }
        size="lg"
      >
        <div className="space-y-6">
          {/* Current Model Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Current model:</strong> {modelName}
            </p>
          </div>

          {/* Size Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto">
            {supportedSizes.map((sizeOption) => (
              <SizeOptionButton
                key={sizeOption.size}
                sizeOption={sizeOption}
                isSelected={currentSize === sizeOption.size}
                onSelect={handleSizeSelect}
              />
            ))}
          </div>

          {/* Guidelines */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
            <h3 className="font-semibold text-sm mb-3 text-gray-900 dark:text-white flex items-center gap-2">
              💡 Size Guidelines
            </h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <div>
                  <strong>Square (1:1)</strong> - Best for social media,
                  avatars, and balanced compositions
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                <div>
                  <strong>Portrait (2:3, 3:4)</strong> - Ideal for mobile
                  screens and vertical content
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                <div>
                  <strong>Landscape (3:2, 16:9)</strong> - Perfect for headers,
                  banners, and wide scenes
                </div>
              </li>
              {currentModel.includes('flux') && (
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <strong>Ultra sizes</strong> - High resolution for
                    professional use (slower generation)
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>
      </BaseModal>
    );
  }
);

SizeModal.displayName = 'SizeModal';

// Separate component for size option buttons to prevent unnecessary rerenders
const SizeOptionButton = React.memo<{
  sizeOption: SizeOption;
  isSelected: boolean;
  onSelect: (size: string) => void;
}>(({ sizeOption, isSelected, onSelect }) => {
  const handleClick = useCallback(() => {
    onSelect(sizeOption.size);
  }, [onSelect, sizeOption.size]);

  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
        isSelected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-md'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="font-medium text-sm">{sizeOption.label}</div>
        <div className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
          {sizeOption.aspect}
        </div>
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
        {sizeOption.size} • {sizeOption.description}
      </div>
      {/* Visual aspect ratio preview */}
      <div className="flex justify-center">
        <div
          className="border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 rounded"
          style={{
            width:
              sizeOption.aspect === '1:1'
                ? '32px'
                : sizeOption.aspect.startsWith('16:') ||
                    sizeOption.aspect.startsWith('3:2')
                  ? '40px'
                  : '24px',
            height:
              sizeOption.aspect === '1:1'
                ? '32px'
                : sizeOption.aspect.includes(':9') ||
                    sizeOption.aspect === '2:3' ||
                    sizeOption.aspect === '3:4'
                  ? '40px'
                  : '24px',
          }}
        />
      </div>
    </motion.button>
  );
});

SizeOptionButton.displayName = 'SizeOptionButton';
