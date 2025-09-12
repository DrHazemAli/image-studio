"use client";

import React from "react";
import { BaseModal } from "./base-modal";
import { KeyboardIcon } from "@radix-ui/react-icons";

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutGroup {
  title: string;
  shortcuts: Array<{
    action: string;
    keys: string;
    description?: string;
  }>;
}

export const ShortcutsModal = React.memo<ShortcutsModalProps>(
  ({ isOpen, onClose }) => {
    const shortcutGroups: ShortcutGroup[] = [
      {
        title: "Project Management",
        shortcuts: [
          {
            action: "New Project",
            keys: "Cmd+N",
            description: "Create a new project",
          },
          {
            action: "Open Project",
            keys: "Cmd+O",
            description: "Open existing project",
          },
          {
            action: "Save Project",
            keys: "Cmd+S",
            description: "Save current project",
          },
          {
            action: "Export Project",
            keys: "Cmd+E",
            description: "Export project files",
          },
        ],
      },
      {
        title: "Tools & Generation",
        shortcuts: [
          {
            action: "Generate Tool",
            keys: "Cmd+G",
            description: "Open generation panel",
          },
          {
            action: "Inpaint Tool",
            keys: "Cmd+I",
            description: "Activate inpaint tool",
          },
          {
            action: "Crop Tool",
            keys: "Cmd+C",
            description: "Activate crop tool",
          },
          {
            action: "Text Tool",
            keys: "Cmd+T",
            description: "Add text to canvas",
          },
          {
            action: "Shapes Tool",
            keys: "Cmd+Shift+S",
            description: "Add shapes",
          },
          {
            action: "Filters Tool",
            keys: "Cmd+F",
            description: "Apply filters",
          },
        ],
      },
      {
        title: "Canvas & View",
        shortcuts: [
          {
            action: "Zoom In",
            keys: "Cmd+Plus",
            description: "Zoom into canvas",
          },
          {
            action: "Zoom Out",
            keys: "Cmd+Minus",
            description: "Zoom out of canvas",
          },
          {
            action: "Fit to Screen",
            keys: "Cmd+0",
            description: "Fit canvas to screen",
          },
          {
            action: "Toggle Layers",
            keys: "Cmd+L",
            description: "Show/hide layers panel",
          },
          {
            action: "Toggle Assets",
            keys: "Cmd+A",
            description: "Show/hide assets panel",
          },
        ],
      },
      {
        title: "Editing",
        shortcuts: [
          { action: "Undo", keys: "Cmd+Z", description: "Undo last action" },
          {
            action: "Redo",
            keys: "Cmd+Shift+Z",
            description: "Redo last undone action",
          },
          {
            action: "Copy",
            keys: "Cmd+C",
            description: "Copy selected object",
          },
          {
            action: "Paste",
            keys: "Cmd+V",
            description: "Paste copied object",
          },
          {
            action: "Delete",
            keys: "Delete",
            description: "Delete selected object",
          },
          {
            action: "Select All",
            keys: "Cmd+A",
            description: "Select all objects",
          },
        ],
      },
      {
        title: "Application",
        shortcuts: [
          {
            action: "Toggle Theme",
            keys: "Cmd+Shift+T",
            description: "Switch between light/dark mode",
          },
          {
            action: "Show Shortcuts",
            keys: "Cmd+?",
            description: "Show this shortcuts modal",
          },
          {
            action: "Show About",
            keys: "Cmd+Shift+A",
            description: "Show about modal",
          },
          { action: "Quit", keys: "Cmd+Q", description: "Close application" },
        ],
      },
    ];

    const renderKey = (key: string) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;

      if (key.includes("Cmd")) {
        return key.replace("Cmd", isMac ? "⌘" : "Ctrl");
      }
      if (key.includes("Shift")) {
        return key.replace("Shift", "⇧");
      }
      if (key.includes("Plus")) {
        return key.replace("Plus", "+");
      }
      if (key.includes("Minus")) {
        return key.replace("Minus", "-");
      }
      return key;
    };

    return (
      <BaseModal
        isOpen={isOpen}
        onClose={onClose}
        title="Keyboard Shortcuts"
        icon={
          <KeyboardIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        }
        size="lg"
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Master these keyboard shortcuts to work faster and more
              efficiently
            </p>
          </div>

          {/* Shortcut Groups */}
          <div className="space-y-6">
            {shortcutGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                  {group.title}
                </h3>
                <div className="grid gap-2">
                  {group.shortcuts.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {shortcut.action}
                        </div>
                        {shortcut.description && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {shortcut.description}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.split("+").map((key, keyIndex) => (
                          <React.Fragment key={keyIndex}>
                            <kbd className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono text-gray-700 dark:text-gray-300 shadow-sm">
                              {renderKey(key.trim())}
                            </kbd>
                            {keyIndex < shortcut.keys.split("+").length - 1 && (
                              <span className="text-gray-400 mx-1">+</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                💡 <strong>Tip:</strong> You can always press{" "}
                <kbd className="px-1 py-0.5 bg-blue-100 dark:bg-blue-800 rounded text-xs">
                  Cmd+?
                </kbd>{" "}
                to open this shortcuts reference anytime.
              </p>
            </div>
          </div>
        </div>
      </BaseModal>
    );
  },
);

ShortcutsModal.displayName = "ShortcutsModal";
