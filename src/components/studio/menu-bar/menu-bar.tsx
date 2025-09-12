"use client";

import { FileMenu } from "./file-menu";
import { InsertMenu } from "./insert-menu";
import { ViewMenu } from "./view-menu";
import { ToolsMenu } from "./tools-menu";
import { HelpMenu } from "./help-menu";
import type { Tool } from "@/components/studio/toolbar";

interface MenuBarProps {
  // File menu props
  onNewProject: () => void;
  onOpenProject: () => void;
  onSaveProject: () => void;
  onExportProject: () => void;
  onImportProject: () => void;
  onClose: () => void;

  // Insert menu props
  onInsertImage: () => void;
  onInsertLayer: () => void;
  onInsertText: () => void;
  onInsertShape: () => void;
  onInsertRectangle: () => void;
  onInsertCircle: () => void;
  onInsertLine: () => void;
  onInsertFromAssetStore: () => void;
  isAssetStoreEnabled: boolean;

  // View menu props
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

  // Tools menu props
  activeTool: Tool;
  onToolChange: (tool: Tool) => void;
  onShowSizeModal: () => void;
  onClearCanvas: () => void;
  onUndo: () => void;
  onRedo: () => void;

  // Help menu props
  onShowKeyboardShortcuts: () => void;
  onShowAbout: () => void;
  onShowDocumentation: () => void;
  onShowGitHub: () => void;
  onShowSupport: () => void;
}

export function MenuBar({
  onNewProject,
  onOpenProject,
  onSaveProject,
  onExportProject,
  onImportProject,
  onClose,
  onInsertImage,
  onInsertLayer,
  onInsertText,
  onInsertShape,
  onInsertRectangle,
  onInsertCircle,
  onInsertLine,
  onInsertFromAssetStore,
  isAssetStoreEnabled,
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
  activeTool,
  onToolChange,
  onShowSizeModal,
  onClearCanvas,
  onUndo,
  onRedo,
  onShowKeyboardShortcuts,
  onShowAbout,
  onShowDocumentation,
  onShowGitHub,
  onShowSupport,
}: MenuBarProps) {
  return (
    <div className="flex items-center gap-1">
      <FileMenu
        onNewProject={onNewProject}
        onOpenProject={onOpenProject}
        onSaveProject={onSaveProject}
        onExportProject={onExportProject}
        onImportProject={onImportProject}
        onClose={onClose}
      />

      <InsertMenu
        onInsertImage={onInsertImage}
        onInsertLayer={onInsertLayer}
        onInsertText={onInsertText}
        onInsertShape={onInsertShape}
        onInsertRectangle={onInsertRectangle}
        onInsertCircle={onInsertCircle}
        onInsertLine={onInsertLine}
        onInsertFromAssetStore={onInsertFromAssetStore}
        isAssetStoreEnabled={isAssetStoreEnabled}
      />

      <ViewMenu
        showConsole={showConsole}
        showAssetsPanel={showAssetsPanel}
        showHistoryPanel={showHistoryPanel}
        showPromptBox={showPromptBox}
        onToggleConsole={onToggleConsole}
        onToggleAssetsPanel={onToggleAssetsPanel}
        onToggleHistoryPanel={onToggleHistoryPanel}
        onTogglePromptBox={onTogglePromptBox}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        onResetZoom={onResetZoom}
        onToggleFullscreen={onToggleFullscreen}
      />

      <ToolsMenu
        activeTool={activeTool}
        onToolChange={onToolChange}
        onShowSizeModal={onShowSizeModal}
        onClearCanvas={onClearCanvas}
        onUndo={onUndo}
        onRedo={onRedo}
      />

      <HelpMenu
        onShowKeyboardShortcuts={onShowKeyboardShortcuts}
        onShowAbout={onShowAbout}
        onShowDocumentation={onShowDocumentation}
        onShowGitHub={onShowGitHub}
        onShowSupport={onShowSupport}
      />
    </div>
  );
}
