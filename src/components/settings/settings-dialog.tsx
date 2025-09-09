"use client";

import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Settings,
  Info,
  Globe,
  Sliders,
  Search,
  User,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GeneralSettings } from "@/components/settings/general-settings";
import { AzureSettings } from "@/components/settings/azure-settings";
import { AdvancedSettings } from "@/components/settings/advanced-settings";
import { AboutSettings } from "@/components/settings/about-settings";
import appConfig from "@/app/config/app-config.json";

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = "general" | "azure" | "advanced" | "about";

const tabs = [
  {
    id: "general" as const,
    label: "General",
    icon: Settings,
    description: "Appearance, interface, and auto-save settings",
  },
  {
    id: "azure" as const,
    label: "Azure",
    icon: Globe,
    description: "API keys, endpoints, and cloud configuration",
  },
  {
    id: "advanced" as const,
    label: "Advanced",
    icon: Sliders,
    description: "Data management and system settings",
  },
  {
    id: "about" as const,
    label: "About",
    icon: Info,
    description: "Application information and features",
  },
];

export function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const filteredTabs = tabs.filter(
    (tab) =>
      tab.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tab.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return <GeneralSettings />;
      case "azure":
        return <AzureSettings />;
      case "advanced":
        return <AdvancedSettings />;
      case "about":
        return <AboutSettings />;
      default:
        return <GeneralSettings />;
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <Dialog.Title className="sr-only">Settings</Dialog.Title>
          <Dialog.Description className="sr-only">
            Configure your application preferences including appearance, Azure
            settings, and advanced options.
          </Dialog.Description>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-full max-w-5xl h-[85vh] max-h-[700px] bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden"
          >
            {/* macOS Window Controls */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200/30 dark:border-gray-700/30">
              <div className="flex items-center gap-2">
                {/* macOS Window Controls */}
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="ml-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Settings
                  </h2>
                </div>
              </div>
              <Dialog.Close asChild>
                <button className="w-6 h-6 rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-700/50 flex items-center justify-center transition-colors">
                  <X className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                </button>
              </Dialog.Close>
            </div>

            <div className="flex h-full">
              {/* Sidebar */}
              <div className="w-64 bg-gray-50/30 dark:bg-gray-800/30 backdrop-blur-sm border-r border-gray-200/30 dark:border-gray-700/30 p-4">
                {/* User Account Section */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/30 dark:bg-gray-700/30 backdrop-blur-sm border border-gray-200/30 dark:border-gray-600/30">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                        {appConfig.admin.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {appConfig.admin.email}
                      </div>
                    </div>
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="p-1 hover:bg-gray-200/50 dark:hover:bg-gray-600/50 rounded-lg transition-colors"
                    >
                      <ChevronDown
                        className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${showUserMenu ? "rotate-180" : ""}`}
                      />
                    </button>
                  </div>

                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 p-2 bg-white/20 dark:bg-gray-700/20 backdrop-blur-sm rounded-lg border border-gray-200/30 dark:border-gray-600/30"
                    >
                      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                        <div>Role: {appConfig.admin.role}</div>
                        <div>ID: {appConfig.admin.user_id.slice(0, 8)}...</div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Search Bar */}
                <div className="mb-4">
                  <div className="relative">
                    <button
                      onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                      className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                    >
                      <Search className="w-4 h-4 text-gray-400" />
                    </button>
                    <input
                      type="text"
                      placeholder="Search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={cn(
                        "w-full pl-10 pr-4 py-2 bg-white/50 dark:bg-gray-900/50 border border-gray-200/50 dark:border-gray-700/50 rounded-lg text-sm placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200",
                        isSearchExpanded ? "opacity-100" : "opacity-70",
                      )}
                    />
                  </div>
                </div>

                <nav className="space-y-0.5">
                  {filteredTabs.map((tab) => {
                    const IconComponent = tab.icon;
                    const isHighlighted =
                      searchQuery &&
                      (tab.label
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                        tab.description
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase()));

                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-200 group relative",
                          activeTab === tab.id
                            ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-700/50"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white",
                          isHighlighted &&
                            "bg-yellow-100/50 dark:bg-yellow-900/20 border border-yellow-200/50 dark:border-yellow-700/50",
                        )}
                      >
                        <IconComponent
                          className={cn(
                            "w-4 h-4 transition-colors flex-shrink-0",
                            activeTab === tab.id
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300",
                          )}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {tab.label}
                          </div>
                          {searchQuery && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {tab.description}
                            </div>
                          )}
                        </div>
                        {isHighlighted && (
                          <div className="w-2 h-2 rounded-full bg-yellow-500 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}

                  {filteredTabs.length === 0 && searchQuery && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                      No settings found for &quot;{searchQuery}&quot;
                    </div>
                  )}
                </nav>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-hidden bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="h-full overflow-y-auto p-8"
                  >
                    {renderTabContent()}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
