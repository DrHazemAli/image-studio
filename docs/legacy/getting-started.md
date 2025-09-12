# Getting Started Guide

**Last Updated**: September 8, 2025  
**Version**: 1.0.3

Welcome to Azure GenAI Image Studio! This guide will help you get up and running quickly with our AI-powered image generation and editing platform.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [First Steps](#first-steps)
6. [Basic Usage](#basic-usage)
7. [Next Steps](#next-steps)

## Quick Start

The fastest way to get started is to follow these steps:

1. **Install Dependencies**: Run `npm install` in the project root
2. **Configure Azure**: Set up your Azure API credentials
3. **Start Development Server**: Run `npm run dev`
4. **Open Browser**: Navigate to `http://localhost:3000`

## Prerequisites

Before you begin, ensure you have:

- **Node.js**: Version 18.0 or higher
- **npm**: Version 8.0 or higher
- **Azure Account**: With access to Azure OpenAI Service
- **Git**: For version control

### System Requirements

- **Operating System**: Windows 10+, macOS 10.15+, or Linux
- **Memory**: 8GB RAM minimum, 16GB recommended
- **Storage**: 2GB free space
- **Browser**: Chrome 90+, Firefox 88+, Safari 14+, or Edge 90+

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/image-studio.git
cd image-studio
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

## Configuration

### Azure API Configuration

1. **Get Azure API Key**:
   - Go to Azure Portal
   - Navigate to your Azure OpenAI resource
   - Copy your API key

2. **Set Environment Variables**:
   ```bash
   AZURE_API_KEY=your_azure_api_key_here
   AZURE_API_BASE_URL=https://your-resource.openai.azure.com
   ```

### Model Configuration

The application supports multiple AI models. Configure them in `src/app/config/azure-models.json`:

```json
{
  "models": [
    {
      "id": "dall-e-3",
      "name": "DALL-E 3",
      "provider": "azure",
      "capabilities": ["generate", "edit"]
    }
  ]
}
```

For detailed configuration options, see the [Configuration Guide](configuration.md).

## First Steps

### 1. Start the Development Server

```bash
npm run dev
```

### 2. Open the Application

Navigate to `http://localhost:3000` in your browser.

### 3. Verify Setup

- Check that the application loads without errors
- Verify your Azure API connection in the settings
- Test a simple image generation

## Basic Usage

### Creating Your First Image

1. **Enter a Prompt**: Type a descriptive prompt in the input field
2. **Select Model**: Choose from available AI models
3. **Configure Settings**: Adjust size, quality, and style options
4. **Generate**: Click the generate button
5. **View Results**: Your generated image will appear in the gallery

### Project Management

- **Create Project**: Click "New Project" to start a new workspace
- **Save Project**: Use Ctrl+S to save your current work
- **Load Project**: Open existing projects from the project menu
- **Export Project**: Save your project as a file

### Asset Management

- **Save Assets**: Generated images are automatically saved
- **Organize**: Use tags and categories to organize your assets
- **Export**: Download images in various formats (PNG, JPG, WebP)

## Next Steps

Now that you have the basics working, explore these advanced features:

### For Users

- **[User Guide](user-guide.md)** - Complete user manual
- **[Image Generation Guide](image-generation.md)** - Advanced generation techniques
- **[Tools Reference](tools-reference.md)** - All available tools and features

### For Developers

- **[Developer Guide](developer-guide.md)** - Development setup and guidelines
- **[Architecture Guide](architecture.md)** - System architecture overview
- **[API Documentation](api-documentation.md)** - API reference and examples

### Additional Resources

- **[Installation Guide](installation.md)** - Detailed installation instructions
- **[Deployment Guide](deployment.md)** - Production deployment guide
- **[CLI Documentation](cli-documentation.md)** - Command-line interface guide

## Troubleshooting

### Common Issues

**Application won't start**:

- Check Node.js version: `node --version`
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`

**Azure API errors**:

- Verify your API key is correct
- Check your Azure resource is active
- Ensure you have sufficient quota

**Images not generating**:

- Check your internet connection
- Verify Azure API configuration
- Try a simpler prompt first

### Getting Help

- **Documentation**: Check the relevant guide for your issue
- **GitHub Issues**: Report bugs and request features
- **Community**: Join our Discord server for support

## Support

For additional help:

- **Documentation**: [Complete Documentation Index](README.md)
- **Issues**: [GitHub Issues](https://github.com/your-username/image-studio/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/image-studio/discussions)

---

[← Back to Documentation Index](README.md) | [Next: Configuration Guide →](configuration.md)
