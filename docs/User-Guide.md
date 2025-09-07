# User Guide - Azure Image Studio

This comprehensive guide will help you master Azure Image Studio's features and create amazing images with AI assistance.

> ⚠️ **Important**: This is a **community project** and is not affiliated with or endorsed by Microsoft or Azure. It's an independent project that uses Azure AI services.

## 🎯 Getting Started

### Launching the Studio

1. **From the Home Page**: Click "Launch Azure Image Studio" to open the full-featured studio
2. **Direct Access**: Navigate to `/studio` in your browser
3. **First Time Setup**: The studio will guide you through initial configuration

### Studio Interface Overview

The studio is divided into several key areas:

- **🎨 Canvas**: Main workspace for image editing and generation with Fabric.js
- **🛠️ Toolbar**: Tool selection and navigation controls
- **📝 Prompt Box**: AI generation interface
- **📁 Assets Panel**: Asset management and organization
- **📚 History Panel**: Generation and editing history
- **🖥️ Console**: Real-time API logging and debugging

## 🎨 Canvas Tools

### Navigation Tools

#### Select Tool (`Cmd+1`)
- **Purpose**: Select and manipulate objects on the canvas
- **Usage**: Click and drag to select areas
- **Features**: Move, resize, and transform selected elements

#### Move Tool (`Cmd+M`)
- **Purpose**: Move the entire canvas view
- **Usage**: Click and drag to pan around the canvas
- **Features**: Navigate large images or zoomed views

#### Hand Tool (`Cmd+H`)
- **Purpose**: Pan and navigate the canvas
- **Usage**: Click and drag to move the view
- **Features**: Smooth navigation with mouse or trackpad

#### Zoom Tool (`Cmd+2`)
- **Purpose**: Zoom in and out of the canvas
- **Usage**: Click to zoom in, Shift+click to zoom out
- **Features**: Precise zoom control and fit-to-screen

### AI Generation Tools

#### Generate Tool (`Cmd+G`)
- **Purpose**: Create new images from text descriptions
- **Usage**: 
  1. Select the Generate tool
  2. Enter your prompt in the prompt box
  3. Choose model and settings
  4. Click "Generate"
- **Features**: 
  - Multiple AI models (DALL-E 3, FLUX 1.1 Pro, etc.)
  - Quality and style options
  - Batch generation
  - Real-time progress tracking

#### Edit Tool (`Cmd+E`)
- **Purpose**: Modify existing images with AI assistance
- **Usage**:
  1. Import or select an image
  2. Select the Edit tool
  3. Describe the changes you want
  4. Click "Apply Changes"
- **Features**:
  - Context-aware editing
  - Style transfer
  - Object addition/removal
  - Color adjustments

#### Inpaint Tool (`Cmd+I`)
- **Purpose**: Fill in selected areas of images
- **Usage**:
  1. Select the Inpaint tool
  2. Paint over areas you want to modify
  3. Enter a description of what should fill the area
  4. Click "Inpaint"
- **Features**:
  - Precise area selection
  - Intelligent content filling
  - Seamless blending

### Drawing Tools

#### Brush Tool (`Cmd+B`)
- **Purpose**: Draw and paint on the canvas
- **Usage**: Click and drag to paint
- **Features**:
  - Adjustable brush size
  - Color selection
  - Opacity control
  - Pressure sensitivity

#### Eraser Tool (`Shift+E`)
- **Purpose**: Erase parts of the image
- **Usage**: Click and drag to erase
- **Features**:
  - Adjustable eraser size
  - Precise erasing
  - Layer-aware erasing

### Content Tools

#### Text Tool (`Cmd+Shift+T`)
- **Purpose**: Add text to images
- **Usage**: Click on canvas to add text
- **Features**:
  - Font selection
  - Size and color options
  - Text effects
  - Positioning controls

#### Shape Tool (`Cmd+U`)
- **Purpose**: Add geometric shapes
- **Usage**: Click and drag to create shapes
- **Features**:
  - Rectangle, circle, line tools
  - Fill and stroke options
  - Transform controls

### Transform Tools

#### Crop Tool (`Cmd+4`)
- **Purpose**: Crop and resize images
- **Usage**: Select area and press Enter
- **Features**:
  - Aspect ratio locking
  - Free-form cropping
  - Preview before applying

#### Filters Tool
- **Purpose**: Apply image filters and effects
- **Usage**: Select filter and adjust parameters
- **Features**:
  - Multiple filter types
  - Adjustable intensity
  - Real-time preview

## 🤖 AI Generation

### Text-to-Image Generation

#### Basic Generation
1. **Select Model**: Choose from available AI models
2. **Enter Prompt**: Describe the image you want to create
3. **Set Parameters**:
   - **Size**: Choose image dimensions
   - **Quality**: Select quality level
   - **Style**: Pick artistic style (if available)
   - **Count**: Number of images to generate
4. **Generate**: Click the generate button

#### Advanced Generation
- **Negative Prompts**: Specify what you don't want
- **Seed Values**: For reproducible results
- **Style Options**: Natural vs. vivid styles
- **Quality Levels**: Standard vs. HD quality

### Image Editing

#### Context-Aware Editing
1. **Import Image**: Load the image you want to edit
2. **Select Edit Tool**: Choose the appropriate editing tool
3. **Describe Changes**: Tell the AI what modifications to make
4. **Apply Changes**: Let the AI process your request

#### Style Transfer
1. **Select Source Image**: Choose the image to modify
2. **Choose Style**: Select the artistic style to apply
3. **Adjust Intensity**: Control how strong the effect is
4. **Apply Style**: Generate the stylized version

### Batch Generation

#### Multiple Images
1. **Set Count**: Choose how many images to generate
2. **Enter Prompt**: Describe the images you want
3. **Configure Settings**: Set parameters for all images
4. **Generate Batch**: Create multiple variations

## 📁 Asset Management

### Assets Panel

#### Viewing Assets
- **Grid View**: Thumbnail grid of all assets
- **List View**: Detailed list with metadata
- **Search**: Find assets by name or tags
- **Filter**: Filter by type, date, or tags

#### Organizing Assets
- **Folders**: Create folders to organize assets
- **Tags**: Add tags for easy categorization
- **Favorites**: Mark important assets
- **Recent**: Quick access to recently used assets

#### Asset Operations
- **Import**: Drag and drop or use import button
- **Export**: Save assets in various formats
- **Delete**: Remove unwanted assets
- **Duplicate**: Create copies of assets

### Project Management

#### Creating Projects
1. **New Project**: Start a new project
2. **Set Name**: Give your project a descriptive name
3. **Choose Template**: Select from available templates
4. **Configure Settings**: Set project preferences

#### Project Organization
- **Assets**: All project assets in one place
- **History**: Complete generation and editing history
- **Settings**: Project-specific configurations
- **Export**: Export entire projects

## 📚 History Management

### History Panel

#### Viewing History
- **Timeline View**: Chronological list of all actions
- **Thumbnail View**: Visual representation of generations
- **Search**: Find specific generations by prompt or date
- **Filter**: Filter by type, model, or date

#### History Operations
- **Replay**: Regenerate previous generations
- **Modify**: Edit previous prompts and regenerate
- **Export**: Save history entries as assets
- **Delete**: Remove unwanted history entries

#### History Details
- **Prompt**: Original generation prompt
- **Model**: AI model used
- **Parameters**: All generation settings
- **Result**: Generated image
- **Timestamp**: When the generation occurred

## 🎛️ Advanced Features

### Console Monitoring

#### Real-time Logging
- **API Requests**: See all API calls in real-time
- **Response Data**: View API responses and errors
- **Performance**: Monitor generation times
- **Debugging**: Troubleshoot issues

#### Console Features
- **Filter Logs**: Filter by type or severity
- **Export Logs**: Save logs for debugging
- **Clear Logs**: Clear console history
- **Search**: Find specific log entries

### Configuration

#### Model Settings
- **Available Models**: See all configured models
- **Model Capabilities**: View what each model can do
- **Endpoint Status**: Check model availability
- **Performance**: Monitor model performance

#### User Preferences
- **Theme**: Light or dark mode
- **UI Scale**: Adjust interface size
- **Shortcuts**: Customize keyboard shortcuts
- **Notifications**: Configure alerts and notifications

## 🚀 Tips and Best Practices

### Prompt Writing

#### Effective Prompts
- **Be Specific**: Describe exactly what you want
- **Include Details**: Mention style, colors, composition
- **Use Keywords**: Include relevant artistic terms
- **Avoid Negatives**: Focus on what you want, not what you don't

#### Prompt Examples
- **Good**: "A photorealistic portrait of a golden retriever sitting in a sunny garden, soft lighting, shallow depth of field"
- **Better**: "A professional photograph of a golden retriever, sitting pose, golden hour lighting, bokeh background, 85mm lens, high resolution"

### Model Selection

#### Choose the Right Model
- **DALL-E 3**: Best for creative, artistic images
- **FLUX 1.1 Pro**: Excellent for photorealistic images
- **FLUX Kontext Pro**: Ideal for image editing and modifications
- **GPT-Image-1**: Advanced features like inpainting and outpainting

### Performance Tips

#### Optimization
- **Use Appropriate Sizes**: Don't generate larger than needed
- **Batch Similar Requests**: Group similar generations
- **Cache Results**: Save frequently used generations
- **Monitor Usage**: Keep track of API usage

#### Troubleshooting
- **Check Console**: Look for error messages
- **Verify Configuration**: Ensure models are properly configured
- **Test with Simple Prompts**: Start with basic prompts
- **Check Network**: Ensure stable internet connection

## 🎨 Creative Workflows

### Basic Workflow
1. **Plan**: Decide what you want to create
2. **Generate**: Create initial images
3. **Refine**: Edit and improve results
4. **Export**: Save final images

### Advanced Workflow
1. **Research**: Gather inspiration and references
2. **Sketch**: Create rough concepts
3. **Generate**: Create multiple variations
4. **Edit**: Refine and combine elements
5. **Polish**: Final adjustments and effects
6. **Export**: Save in appropriate formats

### Collaborative Workflow
1. **Share Assets**: Export and share with team
2. **Document Process**: Keep notes on successful prompts
3. **Iterate**: Refine based on feedback
4. **Version Control**: Keep track of different versions

## 🔧 Troubleshooting

### Common Issues

#### Generation Failures
- **Check Prompt**: Ensure prompt is clear and appropriate
- **Verify Model**: Confirm model is available and configured
- **Check Limits**: Ensure you haven't exceeded rate limits
- **Try Different Model**: Switch to an alternative model

#### Performance Issues
- **Reduce Size**: Use smaller image dimensions
- **Check Network**: Ensure stable internet connection
- **Clear Cache**: Clear browser cache and restart
- **Update Browser**: Ensure you're using a recent browser

#### UI Issues
- **Refresh Page**: Reload the application
- **Check Console**: Look for JavaScript errors
- **Clear Storage**: Clear browser storage
- **Disable Extensions**: Try with extensions disabled

### Getting Help

#### Self-Service
- **Check Documentation**: Review this guide and other docs
- **Console Logs**: Look for error messages in console
- **Test with Simple Cases**: Try basic prompts first
- **Check Configuration**: Verify settings are correct

#### Support Resources
- **GitHub Issues**: Report bugs and request features
- **Documentation**: Comprehensive guides and references
- **Community**: Connect with other users
- **Updates**: Check for latest versions and fixes

---

This guide covers the essential features and workflows of Azure Image Studio. For more detailed information, see:

- [Getting Started](Getting-Started.md) - Initial setup and configuration
- [API Documentation](API-Documentation.md) - Technical reference
- [Architecture Guide](Architecture.md) - System design overview
- [CLI Documentation](../cli/README.md) - Command-line interface guide
- [CLI User Guide](../cli/docs/CLI-User-Guide.md) - Comprehensive CLI usage guide

Happy creating! 🎨