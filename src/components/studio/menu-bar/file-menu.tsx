"use client";

import { useState } from "react";
import { ContextMenu, type ContextMenuItem } from "./context-menu";
import { useMenuContext } from "./menu-context";

interface FileMenuProps {
  onNewProject: () => void;
  onOpenProject: () => void;
  onShowProjects: () => void;
  onSaveProject: () => void;
  onExportProject: () => void;
  onImportProject: () => void;
  onClose: () => void;
}

export function FileMenu({
  onNewProject,
  onOpenProject,
  onShowProjects,
  onSaveProject,
  onExportProject,
  onImportProject,
  onClose,
}: FileMenuProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const { activeMenu, setActiveMenu } = useMenuContext();
  const menuId = "file";
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
      label: "New Project",
      action: onNewProject,
      shortcut: "Cmd+N",
    },
    {
      label: "Open Project",
      action: onOpenProject,
      shortcut: "Cmd+O",
    },
    {
      label: "Projects",
      action: onShowProjects,
      shortcut: "Cmd+Shift+P",
    },
    {
      separator: true,
      label: "",
      action: () => {},
    },
    {
      label: "Save Project",
      action: onSaveProject,
      shortcut: "Cmd+S",
    },
    {
      label: "Export Project",
      action: onExportProject,
      shortcut: "Cmd+E",
    },
    {
      label: "Import Project",
      action: onImportProject,
    },
    {
      separator: true,
      label: "",
      action: () => {},
    },
    {
      label: "Close",
      action: onClose,
      shortcut: "Cmd+W",
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
        File
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
