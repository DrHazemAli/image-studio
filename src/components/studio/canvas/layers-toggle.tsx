'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LayersIcon } from '@radix-ui/react-icons';
import { Button } from '@radix-ui/themes';

interface LayersToggleProps {
  showLayers: boolean;
  onToggleLayers: () => void;
}

export default function LayersToggle({
  showLayers,
  onToggleLayers,
}: LayersToggleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute bottom-4 right-4"
    >
      <Button
        variant={showLayers ? 'solid' : 'ghost'}
        size="2"
        onClick={onToggleLayers}
        className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-lg border border-gray-200 dark:border-gray-800"
      >
        <LayersIcon className="w-4 h-4 mr-2" />
        Layers
      </Button>
    </motion.div>
  );
}
