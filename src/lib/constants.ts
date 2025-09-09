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
};

// Canvas settings
export const CANVAS_CONSTANTS = {
  // Canvas dimensions
  DEFAULT_WIDTH: 1024 as number,
  DEFAULT_HEIGHT: 1024 as number,

  // History settings
  MAX_HISTORY_STATES: 50 as number,
};
