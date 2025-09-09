'use client';

import { useState } from 'react';
import { ContextMenu, type ContextMenuItem } from './context-menu';
import { useMenuContext } from './menu-context';
import type { Tool } from '@/components/studio/toolbar';

interface ToolsMenuProps {
  activeTool: Tool;
  onToolChange: (tool: Tool) => void;
  onShowSizeModal: () => void;
  onClearCanvas: () => void;
  onUndo: () => void;
  onRedo: () => void;
}

export function ToolsMenu({
  activeTool,
  onToolChange,
  onShowSizeModal,
  onClearCanvas,
  onUndo,
  onRedo,
}: ToolsMenuProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const { activeMenu, setActiveMenu } = useMenuContext();
  const menuId = 'tools';
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
      label: 'Select Tool',
      action: () => onToolChange('select'),
      shortcut: 'Cmd+1',
    },
    {
      label: 'Move Tool',
      action: () => onToolChange('move'),
      shortcut: 'Cmd+M',
    },
    {
      label: 'Hand Tool',
      action: () => onToolChange('hand'),
      shortcut: 'Cmd+H',
    },
    {
      label: 'Zoom Tool',
      action: () => onToolChange('zoom'),
      shortcut: 'Cmd+2',
    },
    {
      separator: true,
      label: '',
      action: () => {},
    },
    {
      label: 'Generate Tool',
      action: () => onToolChange('generate'),
      shortcut: 'Cmd+G',
    },
    {
      label: 'Inpaint Tool',
      action: () => onToolChange('inpaint'),
      shortcut: 'Cmd+I',
    },
    {
      label: 'Edit Tool',
      action: () => onToolChange('edit'),
      shortcut: 'Cmd+E',
    },
    {
      label: 'Brush Tool',
      action: () => onToolChange('brush'),
      shortcut: 'Cmd+B',
    },
    {
      label: 'Text Tool',
      action: () => onToolChange('text'),
      shortcut: 'Cmd+Shift+T',
    },
    {
      label: 'Crop Tool',
      action: () => onToolChange('crop'),
      shortcut: 'Cmd+4',
    },
    {
      label: 'Shape Tool',
      action: () => onToolChange('shape'),
      shortcut: 'Cmd+U',
    },
    {
      separator: true,
      label: '',
      action: () => {},
    },
    {
      label: 'Canvas Size',
      action: onShowSizeModal,
    },
    {
      label: 'Clear Canvas',
      action: onClearCanvas,
    },
    {
      separator: true,
      label: '',
      action: () => {},
    },
    {
      label: 'Undo',
      action: onUndo,
      shortcut: 'Cmd+Z',
    },
    {
      label: 'Redo',
      action: onRedo,
      shortcut: 'Cmd+Shift+Z',
    },
  ];

  return (
    <>
      <button
        onClick={handleClick}
        className={`px-3 py-1 text-sm rounded transition-colors ${
          isOpen
            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
      >
        Tools
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
