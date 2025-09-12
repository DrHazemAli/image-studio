# AI Image Studio CLI - User Guide

This comprehensive guide will help you master the AI Image Studio CLI for AI-powered image generation and editing.

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Configuration Management](#configuration-management)
3. [Image Generation](#image-generation)
4. [Model Management](#model-management)
5. [Asset Management](#asset-management)
6. [Development Tools](#development-tools)
7. [Advanced Usage](#advanced-usage)
8. [Troubleshooting](#troubleshooting)
9. [Best Practices](#best-practices)

## 🚀 Getting Started

### Installation

Choose your preferred installation method:

```bash
# Option 1: Global installation (recommended)
npm install -g image-studio-cli

# Option 2: Use with npx (no installation)
npx image-studio-cli --help

# Option 3: Install from source
git clone https://github.com/DrHazemAli/image-studio.git
cd image-studio/cli
npm install && npm run build
```

### First-Time Setup

1. **Initialize Configuration**

   ```bash
   image-studio config init
   ```

2. **Set API Key**

   ```bash
   image-studio config set-api-key
   ```

3. **Configure Azure Endpoints**
   Edit `src/app/config/azure-config.json` with your Azure endpoints.

4. **Validate Setup**
   ```bash
   image-studio config validate
   image-studio config test
   ```

### Quick Test

Generate your first image:

```bash
image-studio generate single --prompt "a beautiful sunset over mountains"
```

## ⚙️ Configuration Management

### Configuration Files

The CLI uses two main configuration files:

- **`src/app/config/azure-config.json`** - Azure endpoints and models
- **`.image-studio-cli.json`** - CLI-specific settings

### Azure Configuration Structure

```json
{
  "endpoints": [
    {
      "id": "primary",
      "name": "Primary Endpoint",
      "baseUrl": "https://your-endpoint.openai.azure.com",
      "apiVersion": "2025-04-01-preview",
      "deployments": [
        {
          "id": "dalle-3",
          "name": "DALL-E 3",
          "deploymentName": "your-dalle-3-deployment",
          "maxSize": "1024x1024",
          "supportedFormats": ["png", "jpeg"],
          "description": "High-quality image generation"
        }
      ]
    }
  ],
  "defaultSettings": {
    "outputFormat": "png",
    "size": "1024x1024",
    "n": 1
  }
}
```

### Configuration Commands

#### Initialize Configuration

```bash
# Create default configuration
image-studio config init

# Force overwrite existing config
image-studio config init --force
```

#### Validate Configuration

```bash
# Check configuration validity
image-studio config validate

# Test with actual API call
image-studio config test --model dalle-3
```

#### Manage API Keys

```bash
# Set API key interactively
image-studio config set-api-key

# Set API key directly
image-studio config set-api-key --key your-api-key-here

# Use environment variable
export AZURE_API_KEY=your-api-key-here
```

#### View Configuration

```bash
# Show full configuration
image-studio config show

# Hide sensitive information
image-studio config show --hide-sensitive
```

## 🎨 Image Generation

### Single Image Generation

#### Basic Generation

```bash
# Simple prompt
image-studio generate single --prompt "a cat sitting on a windowsill"

# With specific model
image-studio generate single --prompt "a futuristic city" --model dalle-3

# High quality
image-studio generate single --prompt "a sunset" --quality hd --size 1024x1024
```

#### Advanced Options

```bash
# Multiple images
image-studio generate single --prompt "a flower" --count 4

# Custom output location
image-studio generate single --prompt "a landscape" --output ./my-images

# Specific format
image-studio generate single --prompt "a portrait" --format jpeg

# With style
image-studio generate single --prompt "a painting" --style vivid

# Reproducible results
image-studio generate single --prompt "a building" --seed 12345

# Negative prompts
image-studio generate single --prompt "a clean room" --negative-prompt "messy, cluttered"
```

### Batch Generation

#### From File

```bash
# Create prompts file
echo -e "a beautiful sunset\na mountain landscape\na city skyline\na peaceful lake" > prompts.txt

# Generate from file
image-studio generate batch --file prompts.txt --output ./batch-images

# With custom settings
image-studio generate batch --file prompts.txt --model flux-1-1-pro --quality hd --delay 2000
```

#### Batch Options

```bash
# Control concurrency
image-studio generate batch --file prompts.txt --max-concurrent 2

# Custom delay between requests
image-studio generate batch --file prompts.txt --delay 3000

# Verbose output
image-studio generate batch --file prompts.txt --verbose
```

### Interactive Generation

```bash
# Guided interactive mode
image-studio generate interactive
```

This will prompt you for:

- Image prompt
- Model selection
- Image size
- Quality level
- Number of images

## 🤖 Model Management

### List Available Models

```bash
# Table format (default)
image-studio models list

# JSON format
image-studio models list --format json

# With detailed information
image-studio models list --verbose
```

### Model Information

```bash
# Get detailed model info
image-studio models info --model dalle-3

# Information includes:
# - Model capabilities
# - Supported sizes
# - Endpoint details
# - API version
```

### Test Models

```bash
# Test specific model
image-studio models test --model flux-1-1-pro

# Custom test prompt
image-studio models test --model dalle-3 --prompt "a test image"

# Don't save test image
image-studio models test --model dalle-3 --no-save
```

### Check Model Status

```bash
# Check all models
image-studio models status

# Shows:
# - Online/offline status
# - Error messages
# - Response times
```

## 📁 Asset Management

### List Assets

```bash
# List all assets
image-studio assets list

# Filter by type
image-studio assets list --type generation

# Sort by date
image-studio assets list --sort date

# Limit results
image-studio assets list --limit 20

# JSON output
image-studio assets list --format json
```

### Export Assets

```bash
# Export to different format
image-studio assets export --format webp

# Export with quality settings
image-studio assets export --format jpeg --quality 85

# Resize during export
image-studio assets export --resize 512x512

# Filter by type
image-studio assets export --filter generation

# Custom output directory
image-studio assets export --output ./exports
```

### Clean Assets

```bash
# Clean files older than 7 days
image-studio assets clean --older-than 7d

# Clean files older than 1 month
image-studio assets clean --older-than 30d

# Dry run (see what would be deleted)
image-studio assets clean --older-than 7d --dry-run

# Skip confirmation
image-studio assets clean --older-than 7d --confirm
```

### Organize Assets

```bash
# Organize by date
image-studio assets organize --by-date

# Organize by model
image-studio assets organize --by-model

# Organize by type
image-studio assets organize --by-type

# Preview organization
image-studio assets organize --by-date --dry-run
```

## 🛠️ Development Tools

### Start Development Server

```bash
# Start on default port (3000)
image-studio dev start

# Custom port
image-studio dev start --port 8080

# Don't open browser
image-studio dev start --no-open
```

### Setup Development Environment

```bash
# Full setup
image-studio dev setup

# Skip dependency installation
image-studio dev setup --skip-deps

# Skip configuration setup
image-studio dev setup --skip-config
```

### Test Endpoints

```bash
# Test specific endpoint
image-studio dev test --endpoint https://your-endpoint.openai.azure.com

# Test with specific API key
image-studio dev test --endpoint https://your-endpoint.openai.azure.com --key your-key
```

### View Logs

```bash
# Show recent logs
image-studio dev logs

# Show specific number of lines
image-studio dev logs --lines 100

# Follow logs in real-time
image-studio dev logs --follow
```

## 🚀 Advanced Usage

### Environment Variables

```bash
# Set API key
export AZURE_API_KEY=your-api-key-here

# Set configuration path
export AZURE_IMAGE_STUDIO_CONFIG_PATH=/path/to/config.json

# Set output directory
export AZURE_IMAGE_STUDIO_OUTPUT_DIR=/path/to/output

# Enable verbose logging
export VERBOSE=true
```

### Scripting and Automation

#### Bash Script Example

```bash
#!/bin/bash

# Generate images for social media
image-studio generate batch --file social-prompts.txt --output ./social-media

# Export for web
image-studio assets export --format webp --quality 80 --resize 800x600

# Clean old assets
image-studio assets clean --older-than 30d --confirm
```

#### Node.js Script Example

```javascript
const { spawn } = require("child_process");

async function generateImages(prompts) {
  return new Promise((resolve, reject) => {
    const child = spawn("image-studio", [
      "generate",
      "batch",
      "--file",
      prompts,
      "--output",
      "./generated",
    ]);

    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Process exited with code ${code}`));
    });
  });
}
```

### CI/CD Integration

#### GitHub Actions Example

```yaml
name: Generate Images
on: [push]

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: "18"

      - name: Install CLI
        run: npm install -g image-studio-cli

      - name: Generate Images
        env:
          AZURE_API_KEY: ${{ secrets.AZURE_API_KEY }}
        run: |
          image-studio config init
          image-studio generate batch --file prompts.txt
```

### Custom Configuration

#### Multiple Endpoints

```json
{
  "endpoints": [
    {
      "id": "openai",
      "name": "OpenAI Endpoint",
      "baseUrl": "https://openai.openai.azure.com",
      "apiVersion": "2025-04-01-preview",
      "deployments": [
        {
          "id": "dalle-3",
          "name": "DALL-E 3",
          "deploymentName": "dalle-3",
          "maxSize": "1024x1024",
          "supportedFormats": ["png", "jpeg"]
        }
      ]
    },
    {
      "id": "flux",
      "name": "FLUX Endpoint",
      "baseUrl": "https://flux.openai.azure.com",
      "apiVersion": "2025-04-01-preview",
      "deployments": [
        {
          "id": "flux-1-1-pro",
          "name": "FLUX 1.1 Pro",
          "deploymentName": "flux-1-1-pro",
          "maxSize": "1024x1024",
          "supportedFormats": ["png", "jpeg"]
        }
      ]
    }
  ]
}
```

## 🚨 Troubleshooting

### Common Issues

#### Configuration Issues

```bash
# Check configuration
image-studio config show

# Validate configuration
image-studio config validate

# Test configuration
image-studio config test
```

#### API Key Issues

```bash
# Check if API key is set
echo $AZURE_API_KEY

# Set API key
image-studio config set-api-key

# Test with specific key
image-studio dev test --key your-key
```

#### Model Issues

```bash
# List available models
image-studio models list

# Check model status
image-studio models status

# Test specific model
image-studio models test --model your-model-id
```

#### Generation Issues

```bash
# Test with simple prompt
image-studio generate single --prompt "test" --verbose

# Check model availability
image-studio models status

# Validate configuration
image-studio config validate
```

### Debug Mode

Enable verbose logging:

```bash
# Set verbose mode
export VERBOSE=true

# Or use --verbose flag
image-studio generate single --prompt "test" --verbose
```

### Log Files

Check log files for detailed error information:

```bash
# Development logs
cat logs/development.log

# CLI logs
cat ~/.image-studio-cli/logs/cli.log

# Follow logs
tail -f logs/development.log
```

### Error Codes

Common error codes and solutions:

- **401 Unauthorized**: Check API key
- **403 Forbidden**: Check endpoint permissions
- **404 Not Found**: Check model deployment name
- **429 Too Many Requests**: Reduce request frequency
- **500 Internal Server Error**: Check Azure service status

## 🎯 Best Practices

### Performance Optimization

1. **Batch Processing**

   ```bash
   # Use batch processing for multiple images
   image-studio generate batch --file prompts.txt --max-concurrent 3
   ```

2. **Appropriate Sizes**

   ```bash
   # Use smaller sizes for testing
   image-studio generate single --prompt "test" --size 256x256

   # Use full size for final images
   image-studio generate single --prompt "final" --size 1024x1024
   ```

3. **Rate Limiting**
   ```bash
   # Add delays between requests
   image-studio generate batch --file prompts.txt --delay 2000
   ```

### Security Best Practices

1. **API Key Management**

   ```bash
   # Use environment variables
   export AZURE_API_KEY=your-key

   # Don't commit API keys to version control
   echo "AZURE_API_KEY=your-key" >> .env.local
   echo ".env.local" >> .gitignore
   ```

2. **Configuration Security**
   ```bash
   # Hide sensitive information
   image-studio config show --hide-sensitive
   ```

### Organization Best Practices

1. **Asset Organization**

   ```bash
   # Organize by date
   image-studio assets organize --by-date

   # Organize by project
   image-studio assets organize --by-model
   ```

2. **Regular Cleanup**

   ```bash
   # Clean old assets weekly
   image-studio assets clean --older-than 7d
   ```

3. **Backup Important Assets**
   ```bash
   # Export important assets
   image-studio assets export --filter generation --output ./backup
   ```

### Prompt Engineering

1. **Effective Prompts**

   ```bash
   # Good: Specific and descriptive
   image-studio generate single --prompt "a photorealistic portrait of a golden retriever, sitting pose, golden hour lighting, shallow depth of field"

   # Better: Include technical details
   image-studio generate single --prompt "professional photograph of a golden retriever, 85mm lens, f/2.8, golden hour, bokeh background, high resolution"
   ```

2. **Negative Prompts**

   ```bash
   # Use negative prompts to avoid unwanted elements
   image-studio generate single --prompt "a clean modern kitchen" --negative-prompt "messy, cluttered, dirty"
   ```

3. **Style Consistency**
   ```bash
   # Use consistent style keywords
   image-studio generate single --prompt "a landscape painting in impressionist style"
   ```

---

This guide covers the essential features and workflows of the AI Image Studio CLI. For more detailed information, see:

- [CLI README](../README.md) - Installation and quick start
- [CLI API Documentation](./CLI-API-Documentation.md) - Technical reference

Happy generating! 🎨
