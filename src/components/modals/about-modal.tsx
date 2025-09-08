'use client';

import React from 'react';
import { BaseModal } from './base-modal';
import { InfoCircledIcon, ExternalLinkIcon, GlobeIcon, GitHubLogoIcon, LinkedInLogoIcon } from '@radix-ui/react-icons';
import appConfig from '@/app/config/app-config.json';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal = React.memo<AboutModalProps>(({ isOpen, onClose }) => {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={`About ${appConfig.app.name}`}
      icon={<InfoCircledIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
      size="md"
    >
      <div className="space-y-6">
        {/* App Info */}
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">AI</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {appConfig.app.name}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Version {appConfig.app.version}
          </p>
        </div>

        {/* Description */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {appConfig.app.description}. 
            Create stunning images, apply advanced filters, and manipulate your creations with professional-grade tools.
          </p>
        </div>


        {/* Author Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Author & Contact
          </h3>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-lg font-bold text-white">
                  {appConfig.author.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {appConfig.author.name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Principal AI & ML Engineer / Architect | Speaker | Founder & CEO of Skytells
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <a
                href={appConfig.author.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors group"
              >
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                  <GlobeIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="font-medium text-sm text-gray-900 dark:text-white">Website</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{appConfig.author.website}</div>
                </div>
                <ExternalLinkIcon className="w-3 h-3 text-gray-400 ml-auto" />
              </a>
              
              <a
                href={appConfig.author.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors group"
              >
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors">
                  <GitHubLogoIcon className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                </div>
                <div>
                  <div className="font-medium text-sm text-gray-900 dark:text-white">GitHub</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{appConfig.author.github}</div>
                </div>
                <ExternalLinkIcon className="w-3 h-3 text-gray-400 ml-auto" />
              </a>
              
              <a
                href={appConfig.author.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors group"
              >
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                  <LinkedInLogoIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="font-medium text-sm text-gray-900 dark:text-white">LinkedIn</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{appConfig.author.linkedin}</div>
                </div>
                <ExternalLinkIcon className="w-3 h-3 text-gray-400 ml-auto" />
              </a>
            </div>
          </div>
        </div>

        {/* Technology Stack */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Built With
          </h3>
          <div className="flex flex-wrap gap-2">
            {[
              'Next.js',
              'React',
              'TypeScript',
              'Azure AI',
              'Fabric.js',
              'Radix UI',
              'Tailwind CSS'
            ].map((tech, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            © 2025 {appConfig.app.name}. Built with ❤️ by {appConfig.author.name} using Azure AI services.
          </p>
        </div>
      </div>
    </BaseModal>
  );
});

AboutModal.displayName = 'AboutModal';
