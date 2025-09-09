"use client";

import { useState } from "react";
import { ContextMenu, type ContextMenuItem } from "./context-menu";
import { useMenuContext } from "./menu-context";

interface InsertMenuProps {
  onInsertImage: () => void;
  onInsertLayer: () => void;
  onInsertText: () => void;
  onInsertShape: () => void;
  onInsertRectangle: () => void;
  onInsertCircle: () => void;
  onInsertLine: () => void;
}

export function InsertMenu({
  onInsertImage,
  onInsertLayer,
  onInsertText,
  onInsertShape,
  onInsertRectangle,
  onInsertCircle,
  onInsertLine,
}: InsertMenuProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const { activeMenu, setActiveMenu } = useMenuContext();
  const menuId = "insert";
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
      label: "Image",
      action: onInsertImage,
      shortcut: "Cmd+I",
    },
    {
      label: "Layer",
      action: onInsertLayer,
      shortcut: "Cmd+L",
    },
    {
      label: "Text",
      action: onInsertText,
      shortcut: "Cmd+T",
    },
    {
      separator: true,
      label: "",
      action: () => {},
    },
    {
      label: "Shape",
      action: onInsertShape,
    },
    {
      label: "Rectangle",
      action: onInsertRectangle,
      shortcut: "Cmd+R",
    },
    {
      label: "Circle",
      action: onInsertCircle,
      shortcut: "Cmd+C",
    },
    {
      label: "Line",
      action: onInsertLine,
      shortcut: "Cmd+Shift+L",
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
        Insert
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
