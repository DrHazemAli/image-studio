# Tools Reference - Azure Image Studio

This comprehensive guide covers all available tools and their usage in Azure Image Studio.

> ⚠️ **Important**: This is a **community project** and is not affiliated with or endorsed by Microsoft or Azure. It's an independent project that uses Azure AI services.

**Last Updated**: September 8, 2025  
**Version**: 1.0.1

## 🛠️ Tools Overview

Azure Image Studio provides a comprehensive set of tools for image generation, editing, and manipulation. All tools are accessible through the toolbar and can be used with keyboard shortcuts for efficient workflow.

## 🎨 Navigation Tools

### Select Tool (`Cmd+1`)

**Purpose**: Select and manipulate objects on the canvas

**Usage**:

- Click and drag to select areas
- Click on objects to select them
- Hold Shift to add to selection
- Drag to move selected objects

**Features**:

- Multi-object selection
- Transform handles for resizing and rotating
- Move selected elements
- Delete selected objects (Delete key)

**Tool Options**:

- Selection mode (single/multiple)
- Transform constraints
- Snap to grid

### Move Tool (`Cmd+M`)

**Purpose**: Move the entire canvas view

**Usage**:

- Click and drag to pan around the canvas
- Use mouse wheel for zoom
- Double-click to fit to screen

**Features**:

- Smooth panning
- Zoom controls
- Fit to screen
- Reset view

### Hand Tool (`Cmd+H`)

**Purpose**: Pan and navigate the canvas

**Usage**:

- Click and drag to move the view
- Smooth navigation with mouse or trackpad

**Features**:

- Smooth navigation
- Touch-friendly controls
- Precise positioning

### Zoom Tool (`Cmd+2`)

**Purpose**: Zoom in and out of the canvas

**Usage**:

- Click to zoom in
- Shift+click to zoom out
- Drag to zoom to specific area

**Features**:

- Precise zoom control
- Fit to screen
- Zoom to selection
- Zoom presets (25%, 50%, 100%, 200%, 400%)

## 🤖 AI Generation Tools

### Generate Tool (`Cmd+G`)

**Purpose**: Create new images from text descriptions

**Usage**:

1. Select the Generate tool
2. Enter your prompt in the prompt box
3. Choose model and settings
4. Click "Generate"

**Features**:

- Multiple AI models (DALL-E 3, FLUX 1.1 Pro, etc.)
- Quality and style options
- Batch generation
- Real-time progress tracking
- Prompt suggestions

**Tool Options**:

- Model selection
- Size options
- Quality settings
- Style options
- Count (number of images)

**Supported Models**:

- DALL-E 3
- FLUX 1.1 Pro
- FLUX 1 Kontext Pro
- GPT-Image-1
- Florence 2.0

### Edit Tool (`Cmd+E`)

**Purpose**: Modify existing images with AI assistance

**Usage**:

1. Import or select an image
2. Select the Edit tool
3. Describe the changes you want
4. Click "Apply Changes"

**Features**:

- Context-aware editing
- Style transfer
- Object addition/removal
- Color adjustments
- Background changes

**Tool Options**:

- Edit mode (replace, add, remove)
- Style transfer options
- Color adjustment sliders
- Background replacement

### Inpaint Tool (`Cmd+I`)

**Purpose**: Fill in selected areas of images

**Usage**:

1. Select the Inpaint tool
2. Paint over areas you want to modify
3. Enter a description of what should fill the area
4. Click "Inpaint"

**Features**:

- Precise area selection
- Intelligent content filling
- Seamless blending
- Multiple brush sizes

**Tool Options**:

- Brush size
- Brush hardness
- Inpaint mode (fill, replace, extend)
- Blending options

### Background Removal Tool

**Purpose**: Remove backgrounds from images using AI

**Usage**:

1. Select an image
2. Click the Background Removal tool
3. Choose removal model
4. Click "Remove Background"

**Features**:

- Automatic background removal
- Manual refinement with brush tools
- Background replacement options
- Edge refinement
- Transparency support

**Tool Options**:

- Model selection (FLUX.1-Kontext-pro, Florence 2.0, GPT-Image-1)
- Quality settings
- Edge refinement
- Background replacement options

**Supported Models**:

- FLUX.1-Kontext-pro (Recommended)
- Florence 2.0
- GPT-Image-1

## 🎨 Drawing Tools

### Brush Tool (`Cmd+B`)

**Purpose**: Draw and paint on the canvas

**Usage**:

- Click and drag to paint
- Adjust brush settings in tool options

**Features**:

- Adjustable brush size
- Color selection
- Opacity control
- Pressure sensitivity
- Brush presets

**Tool Options**:

- Brush size (1-100px)
- Opacity (0-100%)
- Color picker
- Brush type (round, square, custom)
- Pressure sensitivity

### Eraser Tool (`Shift+E`)

**Purpose**: Erase parts of the image

**Usage**:

- Click and drag to erase
- Adjust eraser settings in tool options

**Features**:

- Adjustable eraser size
- Precise erasing
- Layer-aware erasing
- Opacity control

**Tool Options**:

- Eraser size (1-100px)
- Opacity (0-100%)
- Eraser type (round, square)
- Layer mode (current layer, all layers)

## 📝 Content Tools

### Text Tool (`Cmd+Shift+T`)

**Purpose**: Add text to images

**Usage**:

- Click on canvas to add text
- Double-click to edit existing text
- Drag to move text

**Features**:

- Font selection
- Size and color options
- Text effects
- Positioning controls
- Text alignment

**Tool Options**:

- Font family
- Font size (8-200px)
- Font weight (normal, bold)
- Text color
- Background color
- Text alignment (left, center, right)
- Text effects (shadow, outline, glow)

### Shape Tool (`Cmd+U`)

**Purpose**: Add geometric shapes

**Usage**:

- Click and drag to create shapes
- Hold Shift for perfect shapes
- Use arrow keys to adjust size

**Features**:

- Rectangle, circle, line tools
- Fill and stroke options
- Transform controls
- Shape presets

**Tool Options**:

- Shape type (rectangle, circle, line, polygon)
- Fill color
- Stroke color
- Stroke width
- Corner radius (for rectangles)
- Opacity

## 🔧 Transform Tools

### Crop Tool (`Cmd+4`)

**Purpose**: Crop and resize images

**Usage**:

- Select area to crop
- Press Enter to apply
- Press Escape to cancel

**Features**:

- Aspect ratio locking
- Free-form cropping
- Preview before applying
- Crop presets

**Tool Options**:

- Aspect ratio (free, 1:1, 4:3, 16:9, custom)
- Crop mode (free, fixed ratio)
- Grid overlay
- Snap to edges

### Filters Tool

**Purpose**: Apply image filters and effects

**Usage**:

- Select filter from the list
- Adjust parameters
- Click "Apply" to apply filter

**Features**:

- Multiple filter types
- Adjustable intensity
- Real-time preview
- Filter presets

**Available Filters**:

- **Color Filters**: Brightness, Contrast, Saturation, Hue
- **Blur Effects**: Gaussian, Motion, Radial
- **Artistic Filters**: Oil Painting, Watercolor, Sketch
- **Vintage Effects**: Sepia, Black & White, Film Grain
- **Distortion Effects**: Wave, Ripple, Perspective

**Tool Options**:

- Filter intensity (0-100%)
- Filter mode (normal, overlay, multiply)
- Preset filters
- Custom filter settings

### Image Resize Tool

**Purpose**: Resize images and canvas

**Usage**:

1. Select the Resize tool
2. Enter new dimensions
3. Choose resize method
4. Click "Apply"

**Features**:

- Maintain aspect ratio
- Multiple resize methods
- Canvas resizing
- Batch resizing

**Tool Options**:

- Width and height
- Maintain aspect ratio
- Resize method (nearest neighbor, bilinear, bicubic)
- Canvas resize options
- Units (pixels, percentage)

## 📊 Layer Management

### Layer Manager

**Purpose**: Manage layers and their properties

**Usage**:

- Access through the Layers panel
- Right-click for layer options
- Drag to reorder layers

**Features**:

- Layer visibility toggle
- Layer opacity control
- Layer blending modes
- Layer grouping
- Layer effects

**Layer Operations**:

- **Create Layer**: Add new layer
- **Delete Layer**: Remove selected layer
- **Duplicate Layer**: Copy layer
- **Merge Layers**: Combine layers
- **Group Layers**: Organize layers
- **Lock Layer**: Prevent editing

**Blending Modes**:

- Normal
- Multiply
- Screen
- Overlay
- Soft Light
- Hard Light
- Color Dodge
- Color Burn

## 🎛️ Advanced Tools

### Canvas Tools

#### Canvas Info

**Purpose**: Display canvas information

**Features**:

- Canvas dimensions
- Zoom level
- Color information
- Object count
- Memory usage

#### File Upload Area

**Purpose**: Import images and files

**Features**:

- Drag and drop support
- Multiple file formats
- Batch import
- File validation

**Supported Formats**:

- Images: JPG, PNG, GIF, WebP, BMP
- Maximum file size: 10MB
- Maximum dimensions: 4096x4096

#### Zoom Controls

**Purpose**: Control canvas zoom

**Features**:

- Zoom in/out buttons
- Zoom slider
- Fit to screen
- Zoom to selection
- Zoom presets

### Menu Bar Tools

#### File Menu

- **New Project**: Create new project
- **Open Project**: Load existing project
- **Save Project**: Save current project
- **Export**: Export project or assets
- **Import**: Import project or assets

#### Edit Menu

- **Undo**: Undo last action (`Cmd+Z`)
- **Redo**: Redo last action (`Cmd+Shift+Z`)
- **Cut**: Cut selection (`Cmd+X`)
- **Copy**: Copy selection (`Cmd+C`)
- **Paste**: Paste from clipboard (`Cmd+V`)

#### View Menu

- **Zoom In**: Increase zoom (`Cmd+=`)
- **Zoom Out**: Decrease zoom (`Cmd+-`)
- **Fit to Screen**: Fit canvas to view (`Cmd+0`)
- **Show Grid**: Toggle grid display
- **Show Rulers**: Toggle rulers

#### Tools Menu

- **Select Tool**: Switch to select tool
- **Generate Tool**: Switch to generate tool
- **Edit Tool**: Switch to edit tool
- **Brush Tool**: Switch to brush tool
- **Text Tool**: Switch to text tool

#### Help Menu

- **Keyboard Shortcuts**: Show shortcuts modal
- **About**: Application information
- **Documentation**: Open documentation
- **Support**: Contact support

## ⌨️ Keyboard Shortcuts

### Navigation

- `Cmd+1` - Select Tool
- `Cmd+2` - Zoom Tool
- `Cmd+M` - Move Tool
- `Cmd+H` - Hand Tool
- `Space` - Temporary Hand Tool (hold)

### Generation

- `Cmd+G` - Generate Tool
- `Cmd+E` - Edit Tool
- `Cmd+I` - Inpaint Tool

### Drawing

- `Cmd+B` - Brush Tool
- `Shift+E` - Eraser Tool
- `Cmd+Shift+T` - Text Tool
- `Cmd+U` - Shape Tool

### Transform

- `Cmd+4` - Crop Tool
- `Cmd+T` - Transform Selection
- `Cmd+Shift+T` - Free Transform

### Canvas

- `Cmd+0` - Fit to Screen
- `Cmd+=` - Zoom In
- `Cmd+-` - Zoom Out
- `Cmd+Z` - Undo
- `Cmd+Shift+Z` - Redo

### File Operations

- `Cmd+N` - New Project
- `Cmd+O` - Open Project
- `Cmd+S` - Save Project
- `Cmd+Shift+S` - Save As
- `Cmd+E` - Export

### Selection

- `Cmd+A` - Select All
- `Cmd+D` - Deselect
- `Delete` - Delete Selection
- `Cmd+C` - Copy
- `Cmd+V` - Paste

## 🎯 Tool Combinations

### Common Workflows

#### Image Generation Workflow

1. **Generate Tool** - Create initial image
2. **Edit Tool** - Make modifications
3. **Inpaint Tool** - Fill specific areas
4. **Filters Tool** - Apply effects
5. **Crop Tool** - Final composition

#### Image Editing Workflow

1. **Select Tool** - Select areas to edit
2. **Edit Tool** - Apply AI modifications
3. **Brush Tool** - Manual touch-ups
4. **Text Tool** - Add text elements
5. **Shape Tool** - Add geometric elements

#### Background Removal Workflow

1. **Background Removal Tool** - Remove background
2. **Brush Tool** - Refine edges
3. **Eraser Tool** - Clean up artifacts
4. **Edit Tool** - Add new background

## 🔧 Tool Customization

### Custom Tool Settings

#### Save Tool Presets

- Adjust tool settings
- Click "Save Preset"
- Name your preset
- Access from preset menu

#### Tool Shortcuts

- Go to Settings > Keyboard Shortcuts
- Assign custom shortcuts
- Import/export shortcut sets

#### Tool Panel Layout

- Drag tools to reorder
- Create custom tool groups
- Hide/show tool panels
- Save layout presets

## 📚 Additional Resources

### Documentation

- [User Guide](user-guide.md) - Complete user manual
- [Image Generation Guide](image-generation.md) - AI generation workflows
- [Getting Started](getting-started.md) - Setup and configuration
- [Developer Guide](developer-guide.md) - Development setup
- [API Documentation](api-documentation.md) - Technical reference

### Video Tutorials

- Tool overview and basics
- Advanced tool techniques
- Workflow demonstrations
- Tips and tricks

### Community

- [GitHub Repository](https://github.com/DrHazemAli/azure-image-studio)
- [GitHub Issues](https://github.com/DrHazemAli/azure-image-studio/issues)
- [GitHub Discussions](https://github.com/DrHazemAli/azure-image-studio/discussions)

---

## 🧭 Navigation

<div align="center">

[← Back: Image Generation Guide](image-generation.md) | [Next: Developer Guide →](developer-guide.md)

</div>

---

This guide provides comprehensive information about all available tools in Azure Image Studio. For more specific information, refer to the individual guides for each feature area.
