# Azure Image Studio CLI - API Documentation

This document provides comprehensive technical documentation for the Azure Image Studio CLI, including command specifications, configuration schemas, and integration details.

## 📋 Table of Contents

1. [Command Reference](#command-reference)
2. [Configuration Schema](#configuration-schema)
3. [API Integration](#api-integration)
4. [Error Handling](#error-handling)
5. [Exit Codes](#exit-codes)
6. [Environment Variables](#environment-variables)
7. [File Formats](#file-formats)
8. [Integration Examples](#integration-examples)

## 🔧 Command Reference

### Global Options

All commands support these global options:

```bash
azure-image-studio [command] [options] [--global-options]
```

**Global Options:**
- `-v, --verbose`: Enable verbose output
- `--no-color`: Disable colored output
- `--config <path>`: Path to configuration file
- `-h, --help`: Show help information
- `--version`: Show version information

### Configuration Commands

#### `config init`

Initialize Azure configuration with default settings.

```bash
azure-image-studio config init [options]
```

**Options:**
- `-f, --force`: Overwrite existing configuration

**Exit Codes:**
- `0`: Success
- `1`: Error (configuration already exists and --force not used)
- `2`: Error (failed to create configuration)

**Example:**
```bash
azure-image-studio config init --force
```

#### `config validate`

Validate current configuration and check for errors.

```bash
azure-image-studio config validate
```

**Exit Codes:**
- `0`: Configuration is valid
- `1`: Configuration is invalid

**Output Format:**
```json
{
  "isValid": true,
  "errors": []
}
```

#### `config set-api-key`

Set Azure API key securely.

```bash
azure-image-studio config set-api-key [options]
```

**Options:**
- `-k, --key <key>`: API key to set

**Exit Codes:**
- `0`: Success
- `1`: Error (invalid API key format)

#### `config show`

Display current configuration.

```bash
azure-image-studio config show [options]
```

**Options:**
- `--hide-sensitive`: Hide sensitive information

**Output Format:**
```json
{
  "endpoints": [...],
  "defaultSettings": {...},
  "apiKey": "***",
  "cliConfig": {...}
}
```

#### `config test`

Test configuration by making a simple API call.

```bash
azure-image-studio config test [options]
```

**Options:**
- `-m, --model <model>`: Model to test with

**Exit Codes:**
- `0`: Test successful
- `1`: Test failed

### Generation Commands

#### `generate single`

Generate a single image from a text prompt.

```bash
azure-image-studio generate single [options]
```

**Options:**
- `-p, --prompt <prompt>`: Text prompt for image generation
- `-m, --model <model>`: Model to use for generation
- `-s, --size <size>`: Image size (e.g., 1024x1024)
- `-q, --quality <quality>`: Image quality (standard, hd)
- `-c, --count <count>`: Number of images to generate (1-4)
- `-o, --output <path>`: Output directory for generated images
- `-f, --format <format>`: Output format (png, jpeg)
- `--style <style>`: Image style (natural, vivid)
- `--seed <seed>`: Seed for reproducible results
- `--negative-prompt <prompt>`: Negative prompt
- `--verbose`: Show detailed output

**Exit Codes:**
- `0`: Generation successful
- `1`: Generation failed
- `2`: Invalid parameters

**Output Files:**
- Generated images saved to specified output directory
- Metadata files (`.json`) with generation details

#### `generate batch`

Generate multiple images from a file containing prompts.

```bash
azure-image-studio generate batch [options]
```

**Options:**
- `-f, --file <file>`: File containing prompts (one per line)
- `-m, --model <model>`: Model to use for generation
- `-s, --size <size>`: Image size (e.g., 1024x1024)
- `-q, --quality <quality>`: Image quality (standard, hd)
- `-o, --output <path>`: Output directory for generated images
- `--delay <ms>`: Delay between requests in milliseconds (default: 1000)
- `--max-concurrent <count>`: Maximum concurrent requests (default: 3)
- `--verbose`: Show detailed output

**Input File Format:**
```
A beautiful sunset over mountains
A futuristic city with flying cars
A peaceful lake with swans
```

**Exit Codes:**
- `0`: All generations successful
- `1`: Some generations failed
- `2`: Invalid input file

#### `generate interactive`

Interactive image generation with guided prompts.

```bash
azure-image-studio generate interactive
```

**Interactive Prompts:**
1. Image prompt (required)
2. Model selection (from available models)
3. Image size (1024x1024, 1024x1792, 1792x1024)
4. Quality level (standard, hd)
5. Number of images (1-4)

**Exit Codes:**
- `0`: Generation successful
- `1`: Generation failed
- `2`: User cancelled

### Model Commands

#### `models list`

List all available AI models.

```bash
azure-image-studio models list [options]
```

**Options:**
- `--format <format>`: Output format (table, json)
- `--verbose`: Show detailed information

**Output Format (JSON):**
```json
{
  "models": [
    {
      "id": "dalle-3",
      "name": "DALL-E 3",
      "provider": "Azure OpenAI",
      "supportsInpaint": false,
      "primary": true,
      "premium": false,
      "supportedSizes": [
        {
          "size": "1024x1024",
          "label": "Square (1:1)",
          "aspect": "1:1",
          "description": "Square format"
        }
      ]
    }
  ]
}
```

#### `models info`

Show detailed information about a specific model.

```bash
azure-image-studio models info --model <model-id>
```

**Output Format:**
```json
{
  "id": "dalle-3",
  "name": "DALL-E 3",
  "deploymentName": "dalle-3",
  "provider": "Azure OpenAI",
  "endpoint": "https://openai.openai.azure.com",
  "apiVersion": "2025-04-01-preview",
  "maxSize": "1024x1024",
  "supportedFormats": ["png", "jpeg"],
  "description": "High-quality image generation with DALL-E 3"
}
```

#### `models test`

Test a model with a simple generation request.

```bash
azure-image-studio models test [options]
```

**Options:**
- `-m, --model <model>`: Model ID to test
- `-p, --prompt <prompt>`: Test prompt (default: "A simple test image")
- `--no-save`: Don't save the generated image

**Exit Codes:**
- `0`: Test successful
- `1`: Test failed
- `2`: Model not found

#### `models status`

Check the status of all configured models.

```bash
azure-image-studio models status
```

**Output Format:**
```json
{
  "models": [
    {
      "id": "dalle-3",
      "name": "DALL-E 3",
      "status": "online",
      "responseTime": 2.5,
      "lastChecked": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Asset Commands

#### `assets list`

List all generated assets.

```bash
azure-image-studio assets list [options]
```

**Options:**
- `--format <format>`: Output format (table, json)
- `--type <type>`: Filter by type (generation, upload, edit)
- `--limit <number>`: Limit number of results (default: 50)
- `--sort <field>`: Sort by field (name, date, size)

**Output Format (JSON):**
```json
{
  "assets": [
    {
      "id": "generated-1234567890-1",
      "name": "generated-1234567890-1.png",
      "url": "/path/to/asset.png",
      "type": "generation",
      "timestamp": "2024-01-15T10:30:00Z",
      "prompt": "a beautiful sunset",
      "model": "dalle-3",
      "size": "1024x1024",
      "quality": "standard"
    }
  ],
  "total": 1,
  "filtered": 1
}
```

#### `assets export`

Export assets to different formats or locations.

```bash
azure-image-studio assets export [options]
```

**Options:**
- `-f, --format <format>`: Export format (png, jpeg, webp)
- `-o, --output <path>`: Output directory (default: ./exports)
- `--quality <quality>`: Export quality (1-100, default: 90)
- `--resize <size>`: Resize images (e.g., 512x512)
- `--filter <type>`: Filter by type (generation, upload, edit)

**Exit Codes:**
- `0`: Export successful
- `1`: Export failed
- `2`: No assets found

#### `assets clean`

Clean up old or unused assets.

```bash
azure-image-studio assets clean [options]
```

**Options:**
- `--older-than <time>`: Remove files older than specified time (e.g., 7d, 30d, 1y)
- `--dry-run`: Show what would be deleted without actually deleting
- `--confirm`: Skip confirmation prompt

**Time Format:**
- `7d`: 7 days
- `30d`: 30 days
- `1m`: 1 month
- `1y`: 1 year

**Exit Codes:**
- `0`: Cleanup successful
- `1`: Cleanup failed
- `2`: User cancelled

#### `assets organize`

Organize assets into folders.

```bash
azure-image-studio assets organize [options]
```

**Options:**
- `--by-date`: Organize by creation date
- `--by-model`: Organize by AI model
- `--by-type`: Organize by asset type
- `--dry-run`: Show what would be organized without actually moving files

**Exit Codes:**
- `0`: Organization successful
- `1`: Organization failed
- `2`: User cancelled

### Development Commands

#### `dev start`

Start the Azure Image Studio development server.

```bash
azure-image-studio dev start [options]
```

**Options:**
- `-p, --port <port>`: Port to run on (default: 3000)
- `--no-open`: Don't open browser automatically

**Exit Codes:**
- `0`: Server started successfully
- `1`: Server failed to start
- `2`: Port already in use

#### `dev setup`

Set up development environment.

```bash
azure-image-studio dev setup [options]
```

**Options:**
- `--skip-deps`: Skip dependency installation
- `--skip-config`: Skip configuration setup

**Exit Codes:**
- `0`: Setup successful
- `1`: Setup failed

#### `dev test`

Test Azure endpoint connectivity.

```bash
azure-image-studio dev test [options]
```

**Options:**
- `-e, --endpoint <url>`: Endpoint URL to test
- `-k, --key <key>`: API key to use for testing

**Exit Codes:**
- `0`: Test successful
- `1`: Test failed
- `2`: Invalid endpoint

#### `dev logs`

Show development logs.

```bash
azure-image-studio dev logs [options]
```

**Options:**
- `-f, --follow`: Follow log output
- `--lines <number>`: Number of lines to show (default: 50)

**Exit Codes:**
- `0`: Success
- `1`: No logs found

## 📋 Configuration Schema

### Azure Configuration Schema

```typescript
interface AzureConfig {
  endpoints: AzureEndpoint[];
  defaultSettings: {
    outputFormat: string;
    size: string;
    n: number;
  };
  ui: {
    theme: string;
    showConsole: boolean;
    animationsEnabled: boolean;
  };
}

interface AzureEndpoint {
  id: string;
  name: string;
  baseUrl: string;
  apiVersion: string;
  deployments: AzureDeployment[];
}

interface AzureDeployment {
  id: string;
  name: string;
  deploymentName: string;
  maxSize: string;
  supportedFormats: string[];
  description: string;
}
```

### CLI Configuration Schema

```typescript
interface CliConfig {
  apiKey?: string;
  configPath?: string;
  outputDir?: string;
  defaultModel?: string;
  defaultSize?: string;
  defaultQuality?: string;
  verbose?: boolean;
}
```

### Model Configuration Schema

```typescript
interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  supportsInpaint: boolean;
  primary?: boolean;
  premium?: boolean;
  supportedSizes: SizeOption[];
}

interface SizeOption {
  size: string;
  label: string;
  aspect: string;
  description: string;
}
```

## 🔌 API Integration

### Azure OpenAI API Integration

The CLI integrates with Azure OpenAI services using the following endpoints:

#### Image Generation Endpoint
```
POST {baseUrl}/openai/deployments/{deploymentName}/images/generations?api-version={apiVersion}
```

**Request Body:**
```json
{
  "prompt": "a beautiful sunset",
  "output_format": "png",
  "n": 1,
  "size": "1024x1024",
  "quality": "standard",
  "style": "natural"
}
```

**Response:**
```json
{
  "created": 1640995200,
  "data": [
    {
      "b64_json": "base64-encoded-image-data",
      "revised_prompt": "a beautiful sunset over mountains"
    }
  ]
}
```

#### Image Editing Endpoint
```
POST {baseUrl}/openai/deployments/{deploymentName}/images/edits?api-version={apiVersion}
```

**Request (multipart/form-data):**
- `image`: Image file
- `mask`: Mask file (optional)
- `prompt`: Text prompt
- `response_format`: Output format
- `n`: Number of images
- `size`: Image size

### Error Response Format

```json
{
  "error": {
    "code": "InvalidRequest",
    "message": "The request is invalid",
    "details": [
      {
        "code": "InvalidParameter",
        "message": "The prompt parameter is required"
      }
    ]
  }
}
```

## 🚨 Error Handling

### Error Types

1. **Configuration Errors**
   - Missing configuration file
   - Invalid configuration format
   - Missing API key
   - Invalid endpoint URLs

2. **API Errors**
   - Authentication failures
   - Rate limiting
   - Model unavailability
   - Invalid parameters

3. **File System Errors**
   - Permission denied
   - Disk space insufficient
   - Invalid file paths

4. **Network Errors**
   - Connection timeout
   - DNS resolution failure
   - SSL certificate issues

### Error Response Format

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req-123456",
    "endpoint": "https://openai.openai.azure.com"
  }
}
```

## 🔢 Exit Codes

| Code | Description |
|------|-------------|
| 0 | Success |
| 1 | General error |
| 2 | Invalid parameters |
| 3 | Configuration error |
| 4 | API error |
| 5 | File system error |
| 6 | Network error |
| 7 | User cancelled |
| 8 | Permission denied |

## 🌍 Environment Variables

### Required Variables

```bash
# Azure API Key (required for all operations)
AZURE_API_KEY=your_azure_api_key_here
```

### Optional Variables

```bash
# Configuration file path
AZURE_IMAGE_STUDIO_CONFIG_PATH=/path/to/config.json

# Output directory
AZURE_IMAGE_STUDIO_OUTPUT_DIR=/path/to/output

# Default model
AZURE_IMAGE_STUDIO_DEFAULT_MODEL=dalle-3

# Default size
AZURE_IMAGE_STUDIO_DEFAULT_SIZE=1024x1024

# Default quality
AZURE_IMAGE_STUDIO_DEFAULT_QUALITY=standard

# Verbose logging
VERBOSE=true

# Disable colors
NO_COLOR=true
```

## 📄 File Formats

### Prompts File Format

Plain text file with one prompt per line:

```
A beautiful sunset over mountains
A futuristic city with flying cars
A peaceful lake with swans
A majestic eagle in flight
```

### Metadata File Format

JSON file containing generation metadata:

```json
{
  "id": "generated-1234567890-1",
  "prompt": "a beautiful sunset",
  "model": "dalle-3",
  "size": "1024x1024",
  "quality": "standard",
  "style": "natural",
  "seed": 12345,
  "negativePrompt": "messy, cluttered",
  "timestamp": "2024-01-15T10:30:00Z",
  "type": "generation",
  "endpoint": "https://openai.openai.azure.com",
  "deploymentName": "dalle-3"
}
```

### Log File Format

Structured log entries:

```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "level": "info",
  "message": "Image generation started",
  "context": {
    "command": "generate",
    "model": "dalle-3",
    "prompt": "a beautiful sunset"
  }
}
```

## 🔗 Integration Examples

### Node.js Integration

```javascript
const { spawn } = require('child_process');
const path = require('path');

class AzureImageStudioCLI {
  constructor(configPath) {
    this.configPath = configPath;
  }

  async generateImage(prompt, options = {}) {
    return new Promise((resolve, reject) => {
      const args = ['generate', 'single', '--prompt', prompt];
      
      if (options.model) args.push('--model', options.model);
      if (options.size) args.push('--size', options.size);
      if (options.quality) args.push('--quality', options.quality);
      if (options.output) args.push('--output', options.output);
      if (options.format) args.push('--format', options.format);
      
      const child = spawn('azure-image-studio', args, {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve({ success: true, output: stdout });
        } else {
          reject(new Error(`CLI failed with code ${code}: ${stderr}`));
        }
      });
    });
  }

  async listModels() {
    return new Promise((resolve, reject) => {
      const child = spawn('azure-image-studio', ['models', 'list', '--format', 'json'], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          try {
            const models = JSON.parse(stdout);
            resolve(models);
          } catch (error) {
            reject(new Error('Failed to parse models JSON'));
          }
        } else {
          reject(new Error(`CLI failed with code ${code}: ${stderr}`));
        }
      });
    });
  }
}

// Usage
const cli = new AzureImageStudioCLI();
cli.generateImage('a beautiful sunset', { model: 'dalle-3', size: '1024x1024' })
  .then(result => console.log('Success:', result))
  .catch(error => console.error('Error:', error));
```

### Python Integration

```python
import subprocess
import json
import os

class AzureImageStudioCLI:
    def __init__(self, config_path=None):
        self.config_path = config_path
        self.env = os.environ.copy()
        if config_path:
            self.env['AZURE_IMAGE_STUDIO_CONFIG_PATH'] = config_path

    def generate_image(self, prompt, **options):
        args = ['azure-image-studio', 'generate', 'single', '--prompt', prompt]
        
        if 'model' in options:
            args.extend(['--model', options['model']])
        if 'size' in options:
            args.extend(['--size', options['size']])
        if 'quality' in options:
            args.extend(['--quality', options['quality']])
        if 'output' in options:
            args.extend(['--output', options['output']])
        if 'format' in options:
            args.extend(['--format', options['format']])
        
        try:
            result = subprocess.run(args, capture_output=True, text=True, env=self.env)
            if result.returncode == 0:
                return {'success': True, 'output': result.stdout}
            else:
                return {'success': False, 'error': result.stderr}
        except Exception as e:
            return {'success': False, 'error': str(e)}

    def list_models(self):
        args = ['azure-image-studio', 'models', 'list', '--format', 'json']
        
        try:
            result = subprocess.run(args, capture_output=True, text=True, env=self.env)
            if result.returncode == 0:
                return json.loads(result.stdout)
            else:
                return {'error': result.stderr}
        except Exception as e:
            return {'error': str(e)}

# Usage
cli = AzureImageStudioCLI()
result = cli.generate_image('a beautiful sunset', model='dalle-3', size='1024x1024')
if result['success']:
    print('Success:', result['output'])
else:
    print('Error:', result['error'])
```

### Bash Script Integration

```bash
#!/bin/bash

# Azure Image Studio CLI wrapper script
CLI="azure-image-studio"
OUTPUT_DIR="./generated-images"

# Function to generate image
generate_image() {
    local prompt="$1"
    local model="${2:-dalle-3}"
    local size="${3:-1024x1024}"
    local quality="${4:-standard}"
    
    echo "Generating image: $prompt"
    
    if $CLI generate single \
        --prompt "$prompt" \
        --model "$model" \
        --size "$size" \
        --quality "$quality" \
        --output "$OUTPUT_DIR"; then
        echo "✅ Image generated successfully"
        return 0
    else
        echo "❌ Image generation failed"
        return 1
    fi
}

# Function to list models
list_models() {
    echo "Available models:"
    $CLI models list --format json | jq -r '.models[] | "\(.id): \(.name)"'
}

# Function to check status
check_status() {
    echo "Checking model status..."
    $CLI models status
}

# Main script logic
case "$1" in
    "generate")
        generate_image "$2" "$3" "$4" "$5"
        ;;
    "models")
        list_models
        ;;
    "status")
        check_status
        ;;
    *)
        echo "Usage: $0 {generate|models|status}"
        echo "  generate <prompt> [model] [size] [quality]"
        echo "  models"
        echo "  status"
        exit 1
        ;;
esac
```

---

This API documentation provides comprehensive technical details for integrating with the Azure Image Studio CLI. For more information, see:

- [CLI User Guide](./CLI-User-Guide.md) - User-focused documentation
- [CLI README](../README.md) - Installation and quick start
