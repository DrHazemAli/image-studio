# Configuration Guide

**Last Updated**: September 8, 2025

This comprehensive guide covers all aspects of configuring Image Studio, from basic setup to advanced customization options.

## 📋 Table of Contents

- [🚀 Quick Start](#-quick-start)
- [🔧 Environment Configuration](#-environment-configuration)
- [⚙️ Azure Configuration](#️-azure-configuration)
- [🤖 Model Configuration](#-model-configuration)
- [🎨 Application Configuration](#-application-configuration)
- [🛠️ Advanced Configuration](#️-advanced-configuration)
- [🔍 Configuration Validation](#-configuration-validation)
- [🚨 Troubleshooting](#-troubleshooting)
- [📚 Additional Resources](#-additional-resources)

## 🚀 Quick Start

### Prerequisites

- Azure subscription with AI services access
- Azure OpenAI Service account (for DALL-E 3 and GPT-Image-1)
- Azure AI Foundry access (for FLUX models)

### Basic Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/DrHazemAli/image-studio.git
   cd image-studio
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Azure credentials
   ```

4. **Configure Azure services**
   - Update `src/app/config/azure-config.json`
   - Update `src/app/config/azure-models.json`
   - Update `src/app/config/app-config.json`

5. **Start the application**
   ```bash
   npm run dev
   ```

## 🔧 Environment Configuration

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Azure API Configuration
AZURE_API_KEY=your_azure_api_key_here

# This is optional, The backend routes will replace the <env.AZURE_API_BASE_URL> with the actual url with this value
AZURE_API_BASE_URL=https://your-resource.openai.azure.com

```

### Environment Variable Details

| Variable             | Required | Description                           | Example                                  |
| -------------------- | -------- | ------------------------------------- | ---------------------------------------- |
| `AZURE_API_KEY`      | ✅ Yes   | Your Azure API key for authentication | `abc123...`                              |
| `AZURE_API_BASE_URL` | No       | Your Azure OpenAI endpoint URL        | `https://your-resource.openai.azure.com` |

### Security Best Practices

- **Never commit `.env.local`** to version control
- **Use environment-specific keys** for development, staging, and production
- **Rotate API keys regularly** for security
- **Use Azure Key Vault** for production deployments

## ⚙️ Azure Configuration

### Azure Config File (`src/app/config/azure-config.json`)

This file defines your Azure endpoints and basic deployment settings:

```json
{
  "endpoints": [
    {
      "id": "primary",
      "name": "Primary Endpoint",
      "baseUrl": "<env.AZURE_API_BASE_URL>",
      "apiVersion": "2025-04-01-preview",
      "deployments": [
        {
          "id": "dalle-3",
          "name": "DALL-E 3",
          "deploymentName": "dalle-3",
          "maxSize": "1024x1024",
          "supportedFormats": ["png", "jpeg"],
          "description": "High-quality image generation with DALL-E 3"
        }
      ]
    }
  ],
  "defaultSettings": {
    "outputFormat": "png",
    "size": "1024x1024",
    "n": 1
  },
  "ui": {
    "theme": "light",
    "showConsole": true,
    "animationsEnabled": true
  }
}
```

### Configuration Structure

#### Endpoints

- **`id`**: Unique identifier for the endpoint
- **`name`**: Display name for the endpoint
- **`baseUrl`**: Azure endpoint URL (use `<env.AZURE_API_BASE_URL>` for environment variable)
- **`apiVersion`**: Azure API version
- **`deployments`**: Array of model deployments

#### Deployments

- **`id`**: Unique identifier for the deployment
- **`name`**: Display name for the model
- **`deploymentName`**: Actual deployment name in Azure
- **`maxSize`**: Maximum image size supported
- **`supportedFormats`**: Supported output formats
- **`description`**: Human-readable description

#### Default Settings

- **`outputFormat`**: Default output format (png, jpeg)
- **`size`**: Default image size
- **`n`**: Default number of images to generate

#### UI Settings

- **`theme`**: Default theme (light, dark, system)
- **`showConsole`**: Whether to show the console panel
- **`animationsEnabled`**: Whether to enable animations

## 🤖 Model Configuration

### Azure Models File (`src/app/config/azure-models.json`)

This comprehensive file defines all available models, their capabilities, and configuration:

```json
{
  "imageModels": {
    "generation": {
      "openai": [
        {
          "id": "dalle-3",
          "name": "DALL-E 3",
          "description": "High-quality image generation with natural and vivid styles",
          "provider": "Azure OpenAI",
          "apiVersion": "2024-10-21",
          "capabilities": ["text-to-image"],
          "supportedSizes": [
            {
              "size": "1024x1024",
              "label": "Square (1:1)",
              "aspect": "1:1",
              "description": "Standard size"
            }
          ],
          "supportedFormats": ["png", "jpeg"],
          "styleOptions": ["natural", "vivid"],
          "qualityLevels": ["standard", "hd"],
          "maxImages": 1,
          "requiresApproval": false,
          "features": {
            "highQuality": true,
            "styleControl": true,
            "contentFiltering": true
          }
        }
      ]
    }
  }
}
```

### Model Configuration Structure

#### Model Properties

- **`id`**: Unique model identifier
- **`name`**: Display name
- **`description`**: Model description
- **`provider`**: Service provider (Azure OpenAI, Black Forest Labs, Microsoft)
- **`apiVersion`**: API version for the model
- **`capabilities`**: Array of supported capabilities
- **`supportedSizes`**: Available image sizes
- **`supportedFormats`**: Supported output formats
- **`maxImages`**: Maximum images per request
- **`requiresApproval`**: Whether model requires Azure approval
- **`features`**: Model-specific features

#### Supported Capabilities

- **`text-to-image`**: Generate images from text prompts
- **`image-editing`**: Edit existing images
- **`inpainting`**: Fill in selected areas
- **`outpainting`**: Extend image borders
- **`image-to-image`**: Transform images based on prompts
- **`context-aware-editing`**: Smart editing based on context
- **`style-transfer`**: Apply artistic styles

#### Size Configuration

```json
{
  "size": "1024x1024",
  "label": "Square (1:1)",
  "aspect": "1:1",
  "description": "Standard size"
}
```

### Adding New Models

1. **Add to Azure Models File**

   ```json
   {
     "id": "new-model",
     "name": "New Model",
     "description": "Description of the new model",
     "provider": "Provider Name",
     "apiVersion": "2024-12-01",
     "capabilities": ["text-to-image"],
     "supportedSizes": [
       {
         "size": "1024x1024",
         "label": "Square (1:1)",
         "aspect": "1:1",
         "description": "Standard size"
       }
     ],
     "supportedFormats": ["png", "jpeg"],
     "maxImages": 1,
     "requiresApproval": false,
     "features": {
       "highQuality": true
     }
   }
   ```

2. **Add to Azure Config File**

   ```json
   {
     "id": "new-model",
     "name": "New Model",
     "deploymentName": "new-model-deployment",
     "maxSize": "1024x1024",
     "supportedFormats": ["png", "jpeg"],
     "description": "Description of the new model"
   }
   ```

3. **Update Endpoints Configuration**
   ```json
   {
     "modelId": "new-model",
     "deploymentName": "new-model-deployment",
     "enabled": true
   }
   ```

## 🎨 Application Configuration

### App Config File (`src/app/config/app-config.json`)

This file controls application behavior, UI settings, and feature toggles:

```json
{
  "app": {
    "name": "Image Studio",
    "version": "1.0.1",
    "description": "AI-powered image generation and editing platform",
    "environment": "development",
    "github": "https://github.com/DrHazemAli/image-studio"
  },
  "features": {
    "floatingImageToolbar": {
      "enabled": true,
      "defaultPosition": {
        "x": 100,
        "y": 100
      },
      "collapsible": true,
      "smartPositioning": true
    },
    "backgroundRemoval": {
      "enabled": true,
      "defaultModel": "FLUX.1-Kontext-pro",
      "models": [
        {
          "id": "FLUX.1-Kontext-pro",
          "name": "FLUX 1 Kontext Pro",
          "provider": "Microsoft Azure",
          "description": "Microsoft's advanced vision-language model",
          "capabilities": ["background-removal", "image-editing", "inpainting"],
          "recommended": true,
          "speed": "fast",
          "quality": "high"
        }
      ]
    }
  },
  "ui": {
    "theme": {
      "default": "system",
      "options": ["light", "dark", "system"]
    },
    "animations": {
      "enabled": true,
      "duration": "normal",
      "easing": "ease-out"
    },
    "toolbar": {
      "position": "left",
      "collapsible": true,
      "showShortcuts": true
    },
    "canvas": {
      "defaultZoom": 100,
      "zoomStep": 25,
      "minZoom": 10,
      "maxZoom": 500,
      "gridEnabled": false,
      "snapToGrid": false
    }
  }
}
```

### Feature Configuration

#### Floating Image Toolbar

- **`enabled`**: Enable/disable the floating toolbar
- **`defaultPosition`**: Default position (x, y coordinates)
- **`collapsible`**: Whether toolbar can be collapsed
- **`smartPositioning`**: Auto-positioning based on image location

#### Background Removal

- **`enabled`**: Enable/disable background removal feature
- **`defaultModel`**: Default model for background removal
- **`models`**: Available models for background removal
- **`defaultSettings`**: Default quality and format settings

#### Image Generation

- **`enabled`**: Enable/disable image generation
- **`defaultModel`**: Default model for generation
- **`defaultSize`**: Default image size
- **`defaultOutputFormat`**: Default output format

#### Image Editing

- **`enabled`**: Enable/disable image editing
- **`tools`**: Available editing tools and their status

### UI Configuration

#### Theme Settings

- **`default`**: Default theme (light, dark, system)
- **`options`**: Available theme options

#### Animation Settings

- **`enabled`**: Enable/disable animations
- **`duration`**: Animation duration (fast, normal, slow)
- **`easing`**: Animation easing function

#### Toolbar Settings

- **`position`**: Toolbar position (left, right, top, bottom)
- **`collapsible`**: Whether toolbar can be collapsed
- **`showShortcuts`**: Whether to show keyboard shortcuts

#### Canvas Settings

- **`defaultZoom`**: Default zoom level (percentage)
- **`zoomStep`**: Zoom increment/decrement step
- **`minZoom`**: Minimum zoom level
- **`maxZoom`**: Maximum zoom level
- **`gridEnabled`**: Whether to show grid
- **`snapToGrid`**: Whether to snap to grid

#### Panel Settings

- **`showConsole`**: Whether to show console panel
- **`showLayers`**: Whether to show layers panel
- **`showHistory`**: Whether to show history panel
- **`showAssets`**: Whether to show assets panel

## 🛠️ Advanced Configuration

### Performance Settings

```json
{
  "performance": {
    "imageProcessing": {
      "maxImageSize": 4096,
      "compressionQuality": 0.9,
      "enableWebWorkers": true
    },
    "canvas": {
      "renderingMode": "webgl",
      "enableImageCache": true,
      "maxCacheSize": 100
    },
    "api": {
      "requestTimeout": 30000,
      "retryDelay": 1000,
      "maxRetries": 3
    }
  }
}
```

#### Image Processing

- **`maxImageSize`**: Maximum image size in pixels
- **`compressionQuality`**: Image compression quality (0.0-1.0)
- **`enableWebWorkers`**: Use web workers for processing

#### Canvas Performance

- **`renderingMode`**: Canvas rendering mode (webgl, canvas2d)
- **`enableImageCache`**: Enable image caching
- **`maxCacheSize`**: Maximum number of cached images

#### API Performance

- **`requestTimeout`**: Request timeout in milliseconds
- **`retryDelay`**: Delay between retries in milliseconds
- **`maxRetries`**: Maximum number of retry attempts

### Security Settings

```json
{
  "security": {
    "fileUpload": {
      "maxFileSize": 10485760,
      "allowedFormats": ["jpg", "jpeg", "png", "webp", "bmp"],
      "validateImageHeaders": true
    },
    "api": {
      "enableCors": true,
      "rateLimit": {
        "enabled": true,
        "windowMs": 900000,
        "maxRequests": 100
      }
    }
  }
}
```

#### File Upload Security

- **`maxFileSize`**: Maximum file size in bytes (10MB default)
- **`allowedFormats`**: Allowed image formats
- **`validateImageHeaders`**: Validate image file headers

#### API Security

- **`enableCors`**: Enable Cross-Origin Resource Sharing
- **`rateLimit`**: Rate limiting configuration
  - **`enabled`**: Enable rate limiting
  - **`windowMs`**: Time window in milliseconds (15 minutes default)
  - **`maxRequests`**: Maximum requests per window

### Integration Settings

```json
{
  "integrations": {
    "azure": {
      "enabled": true,
      "configFile": "azure-config.json",
      "modelsFile": "azure-models.json"
    },
    "analytics": {
      "enabled": false,
      "provider": null
    }
  }
}
```

#### Azure Integration

- **`enabled`**: Enable Azure integration
- **`configFile`**: Azure configuration file path
- **`modelsFile`**: Azure models file path

#### Analytics Integration

- **`enabled`**: Enable analytics tracking
- **`provider`**: Analytics provider (null, google-analytics, etc.)

### Debugging Settings

```json
{
  "debugging": {
    "enableConsoleLogging": false,
    "logLevel": "info",
    "enablePerformanceMonitoring": false
  }
}
```

#### Debugging Options

- **`enableConsoleLogging`**: Enable console logging
- **`logLevel`**: Log level (debug, info, warn, error)
- **`enablePerformanceMonitoring`**: Enable performance monitoring

## 🔍 Configuration Validation

### Automatic Validation

The application automatically validates configuration on startup:

1. **API Key Validation**: Checks if `AZURE_API_KEY` is set
2. **Endpoint Validation**: Validates Azure endpoint URLs
3. **Model Validation**: Checks model deployment configurations
4. **File Validation**: Validates configuration file syntax

### Manual Validation

Use the configuration API endpoint to validate your setup:

```bash
curl http://localhost:3000/api/config
```

### Validation Response

```json
{
  "config": {
    "endpoints": [...],
    "defaultSettings": {...},
    "ui": {...}
  },
  "hasApiKey": true,
  "configErrors": [],
  "isValid": true
}
```

### Common Validation Errors

| Error                             | Cause                   | Solution                 |
| --------------------------------- | ----------------------- | ------------------------ |
| `Azure API key not found`         | Missing `AZURE_API_KEY` | Set environment variable |
| `Invalid endpoint URL`            | Malformed base URL      | Check URL format         |
| `Model deployment not found`      | Missing deployment      | Verify deployment name   |
| `Configuration file syntax error` | Invalid JSON            | Validate JSON syntax     |

## 🚨 Troubleshooting

### Common Issues

#### 1. API Key Issues

**Problem**: "Azure API key not configured"
**Solution**:

- Check `.env.local` file exists
- Verify `AZURE_API_KEY` is set correctly
- Ensure no extra spaces or quotes

#### 2. Endpoint Connection Issues

**Problem**: "Failed to connect to Azure endpoint"
**Solution**:

- Verify `AZURE_API_BASE_URL` is correct
- Check network connectivity
- Ensure Azure service is active

#### 3. Model Deployment Issues

**Problem**: "Model deployment not found"
**Solution**:

- Verify deployment name in Azure portal
- Check `azure-config.json` deployment names
- Ensure deployment is active

#### 4. Configuration File Issues

**Problem**: "Invalid configuration file"
**Solution**:

- Validate JSON syntax
- Check file paths
- Ensure all required fields are present

### Debug Mode

Enable debug mode for detailed logging:

```json
{
  "debugging": {
    "enableConsoleLogging": true,
    "logLevel": "debug",
    "enablePerformanceMonitoring": true
  }
}
```

### Configuration Testing

Test your configuration with the CLI:

```bash
# Test configuration
npm run cli -- config validate

# Test model connectivity
npm run cli -- models list

# Test generation
npm run cli -- generate --prompt "test image" --model dalle-3
```

## 📚 Additional Resources

### Documentation

- [Getting Started Guide](getting-started.md) - Initial setup and configuration
- [User Guide](user-guide.md) - Complete user manual
- [Developer Guide](developer-guide.md) - Development setup and architecture
- [API Documentation](api-documentation.md) - Technical API reference
- [Architecture Guide](architecture.md) - System design overview

### External Resources

- [Azure OpenAI Service Documentation](https://docs.microsoft.com/en-us/azure/cognitive-services/openai/)
- [Azure AI Foundry Documentation](https://docs.microsoft.com/en-us/azure/ai-services/ai-foundry/)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [JSON Schema Validation](https://json-schema.org/)

### Support

- [GitHub Issues](https://github.com/DrHazemAli/image-studio/issues) - Bug reports and feature requests
- [GitHub Discussions](https://github.com/DrHazemAli/image-studio/discussions) - Community support
- [Azure Support](https://azure.microsoft.com/en-us/support/) - Azure service support

---

## 🧭 Navigation

<div align="center">

[← Back: Getting Started Guide](getting-started.md) | [Next: User Guide →](user-guide.md)

</div>

---

**Need help?** Check out our [Getting Started Guide](getting-started.md) for quick setup instructions or visit our [GitHub repository](https://github.com/DrHazemAli/image-studio) for the latest updates.

Made with ❤️ by the Image Studio community
