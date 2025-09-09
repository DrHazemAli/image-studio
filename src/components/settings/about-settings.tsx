'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Info,
  Github,
  Linkedin,
  ExternalLink,
  Heart,
  Star,
  Sliders,
  Globe,
} from 'lucide-react';
import { config } from '@/lib/settings';

export function AboutSettings() {
  const appConfig = {
    name: 'Azure Image Studio',
    version: '1.0.1',
    description: 'AI-powered image generation and editing platform',
    author: 'Hazem Ali',
    github: 'https://github.com/DrHazemAli/azure-image-studio',
    linkedin: 'https://linkedin.com/in/hazemali',
    website: 'https://www.skytells.ai',
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          About Azure Image Studio
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Learn more about this application and its features
        </p>
      </div>

      {/* Application Info */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-5 h-5 text-purple-500" />
          <h4 className="font-medium text-gray-900 dark:text-white">
            Application Information
          </h4>
        </div>

        <div className="p-6 rounded-xl bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <span className="text-2xl">🎨</span>
            </div>
            <div className="flex-1">
              <h5 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {appConfig.name}
              </h5>
              <p className="text-gray-600 dark:text-gray-300 mb-3">
                {appConfig.description}
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span>Version {appConfig.version}</span>
                <span>•</span>
                <span>Built with Next.js & React</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-5 h-5 text-purple-500" />
          <h4 className="font-medium text-gray-900 dark:text-white">
            Key Features
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              icon: '🎨',
              title: 'AI Image Generation',
              desc: 'Create stunning images with DALL-E 3 and FLUX models',
            },
            {
              icon: '✏️',
              title: 'Image Editing',
              desc: 'Edit and enhance your images with powerful tools',
            },
            {
              icon: '🎭',
              title: 'Background Removal',
              desc: 'AI-powered background removal and replacement',
            },
            {
              icon: '⚡',
              title: 'Real-time Processing',
              desc: 'Fast and efficient image processing',
            },
            {
              icon: '🎨',
              title: 'Multiple Formats',
              desc: 'Support for PNG, JPEG, and other formats',
            },
            {
              icon: '🔧',
              title: 'Customizable',
              desc: 'Highly customizable interface and settings',
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transition-colors"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{feature.icon}</span>
                <div>
                  <h6 className="font-medium text-gray-900 dark:text-white mb-1">
                    {feature.title}
                  </h6>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {feature.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Author Info */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Heart className="w-5 h-5 text-purple-500" />
          <h4 className="font-medium text-gray-900 dark:text-white">
            Created by
          </h4>
        </div>

        <div className="p-6 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <span className="text-2xl text-white">👨‍💻</span>
            </div>
            <div className="flex-1">
              <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                {appConfig.author}
              </h5>
              <p className="text-gray-600 dark:text-gray-300 mb-3">
                Full-stack developer passionate about AI and modern web
                technologies
              </p>
              <div className="flex items-center gap-4">
                <a
                  href={appConfig.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                >
                  <Github className="w-4 h-4" />
                  GitHub
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href={appConfig.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href={appConfig.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Website
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Current Settings Summary */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-5 h-5 text-purple-500" />
          <h4 className="font-medium text-gray-900 dark:text-white">
            Current Settings
          </h4>
        </div>

        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Theme:</span>
              <span className="ml-2 text-gray-900 dark:text-white capitalize">
                {config('theme', 'system')}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">
                Auto-save:
              </span>
              <span className="ml-2 text-gray-900 dark:text-white">
                {config('autoSave.enabled', true) ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">
                Animations:
              </span>
              <span className="ml-2 text-gray-900 dark:text-white">
                {config('ui.animations', true) ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Console:</span>
              <span className="ml-2 text-gray-900 dark:text-white">
                {config('ui.showConsole', false) ? 'Visible' : 'Hidden'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Made with ❤️ using Next.js, React, and Azure AI services
        </p>
      </div>
    </div>
  );
}
