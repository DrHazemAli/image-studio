"use client";

import { useState } from "react";
import { ContextMenu, type ContextMenuItem } from "./context-menu";
import { useMenuContext } from "./menu-context";

interface ViewMenuProps {
  showConsole: boolean;
  showAssetsPanel: boolean;
  showHistoryPanel: boolean;
  showPromptBox: boolean;
  onToggleConsole: () => void;
  onToggleAssetsPanel: () => void;
  onToggleHistoryPanel: () => void;
  onTogglePromptBox: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onToggleFullscreen: () => void;
}

export function ViewMenu({
  showConsole,
  showAssetsPanel,
  showHistoryPanel,
  showPromptBox,
  onToggleConsole,
  onToggleAssetsPanel,
  onToggleHistoryPanel,
  onTogglePromptBox,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onToggleFullscreen,
}: ViewMenuProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const { activeMenu, setActiveMenu } = useMenuContext();
  const menuId = "view";
  const isOpen = activeMenu === menuId;

  const handleClick = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setPosition({
      x: rect.left,
      y: rect.bottom + 4,
    });
    setActiveMenu(isOpen ? null : menuId);
  };

  const menuItems: ContextMenuItem[] = [
    {
      label: "Console",
      action: onToggleConsole,
      shortcut: showConsole ? "Hide" : "Show",
    },
    {
      label: "Assets Panel",
      action: onToggleAssetsPanel,
      shortcut: showAssetsPanel ? "Hide" : "Show",
    },
    {
      label: "History Panel",
      action: onToggleHistoryPanel,
      shortcut: showHistoryPanel ? "Hide" : "Show",
    },
    {
      label: "Prompt Box",
      action: onTogglePromptBox,
      shortcut: showPromptBox ? "Hide" : "Show",
    },
    {
      separator: true,
      label: "",
      action: () => {},
    },
    {
      label: "Zoom In",
      action: onZoomIn,
      shortcut: "Cmd++",
    },
    {
      label: "Zoom Out",
      action: onZoomOut,
      shortcut: "Cmd+-",
    },
    {
      label: "Reset Zoom",
      action: onResetZoom,
      shortcut: "Cmd+0",
    },
    {
      separator: true,
      label: "",
      action: () => {},
    },
    {
      label: "Toggle Fullscreen",
      action: onToggleFullscreen,
      shortcut: "F11",
    },
  ];

  return (
    <>
      <button
        onClick={handleClick}
        className={`px-3 py-1 text-sm rounded transition-colors ${
          isOpen
            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
        }`}
      >
        View
      </button>
      <ContextMenu
        isOpen={isOpen}
        position={position}
        items={menuItems}
        onClose={() => setActiveMenu(null)}
      />
    </>
  );
}
