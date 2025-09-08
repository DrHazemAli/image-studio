'use client';

import { useState } from 'react';
import { ContextMenu, type ContextMenuItem } from './context-menu';
import { useMenuContext } from './menu-context';
import appConfig from "@/app/config/app-config.json";
interface HelpMenuProps {
  onShowKeyboardShortcuts: () => void;
  onShowAbout: () => void;
  onShowDocumentation: () => void;
  onShowGitHub: () => void;
  onShowSupport: () => void;
}

export function HelpMenu({
  onShowKeyboardShortcuts,
  onShowAbout,
  onShowDocumentation,
  onShowGitHub,
  onShowSupport,
}: HelpMenuProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const { activeMenu, setActiveMenu } = useMenuContext();
  const menuId = 'help';
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
      label: 'Keyboard Shortcuts',
      action: onShowKeyboardShortcuts,
      shortcut: '?',
    },
    {
      label: 'Documentation',
      action: onShowDocumentation,
    },
    {
      separator: true,
      label: '',
      action: () => {},
    },
    {
      label: 'GitHub Repository',
      action: onShowGitHub,
    },
    {
      label: 'Support',
      action: onShowSupport,
    },
    {
      separator: true,
      label: '',
      action: () => {},
    },
    {
      label: `About ${appConfig.app.name}`,
      action: onShowAbout,
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
        Help
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
