


// ConfigKey: Azure Configuration Object Key, Store: Cookies
export const AZURE_CONFIG_OBJECT_KEY = 'az_config';

// ConfigKey: Azure Models Object Key, Store: localStorage
export const AZURE_MODELS_CONFIG_KEY = 'azure.models';

// Canvas and Zoom Constants
export const ZOOM_CONSTANTS = {
  // Zoom limits
  MIN_ZOOM: 10 as number,
  MAX_ZOOM: 400 as number,
  DEFAULT_ZOOM: 100 as number,
  INITIAL_ZOOM: 90 as number,

  // Zoom increment/decrement step
  ZOOM_STEP: 25 as number,

  // Auto-zoom settings
  AUTO_ZOOM_MIN: 15 as number, // Minimum zoom for auto-fit
};

// Tool constants
export const TOOL_CONSTANTS = {
  // Brush settings
  DEFAULT_BRUSH_SIZE: 10 as number,
  MIN_BRUSH_SIZE: 1 as number,
  MAX_BRUSH_SIZE: 100 as number,

  // Default colors
  DEFAULT_BRUSH_COLOR: '#000000' as string,

  // Default active tool
  DEFAULT_ACTIVE_TOOL: 'select' as string,
};

// Canvas settings
export const CANVAS_CONSTANTS = {
  // Canvas dimensions
  DEFAULT_WIDTH: 1024 as number,
  DEFAULT_HEIGHT: 1024 as number,

  // History settings
  MAX_HISTORY_STATES: 50 as number,
};

// UI Panel Constants
export const UI_CONSTANTS = {
  // Panel visibility defaults
  PANELS: {
    SHOW_GENERATION_PANEL: true,
    SHOW_PROMPT_BOX: true,
    SHOW_ASSETS_PANEL: false,
    SHOW_HISTORY_PANEL: false,
    SHOW_CONSOLE: false,
    SHOW_SIZE_MODAL: false,
    SHOW_KEYBOARD_SHORTCUTS: false,
    SHOW_ABOUT: false,
  },

  // Modal states
  MODALS: {
    SHOW_SIZE_MODAL: false,
    SHOW_KEYBOARD_SHORTCUTS: false,
    SHOW_ABOUT: false,
  },
};

// Model and Generation Constants
export const MODEL_CONSTANTS = {
  // Default model settings
  DEFAULT_MODEL: 'FLUX.1-Kontext-pro',
  DEFAULT_SIZE: '1024x1024',
  DEFAULT_INPAINT_MODE: false,

  // Generation state
  GENERATION: {
    IS_GENERATING: false,
    PROGRESS: 0,
    REQUEST_LOG: null,
    RESPONSE_LOG: null,
  },
};

// Project Constants
export const PROJECT_CONSTANTS = {
  // Default project settings
  DEFAULT_USER_ID: 'default-user',
  DEFAULT_PROJECT_NAME: 'Untitled Project',

  // Canvas defaults
  CANVAS: {
    CURRENT_IMAGE: null,
    GENERATED_IMAGE: null,
    ATTACHED_IMAGE: null,
  },

  // History defaults
  HISTORY: {
    STATES: [],
    HISTORY_INDEX: -1,
  },

  // Metadata defaults
  METADATA: {
    TAGS: [],
    AUTHOR: 'Azure Image Studio',
  },
};
