# Image Studio CLI

A powerful command-line interface for Image Studio - AI-powered image generation and editing platform.

![Image Studio CLI](https://img.shields.io/badge/Azure-Image%20Studio%20CLI-blue?style=for-the-badge&logo=microsoft-azure)
![Version](https://img.shields.io/badge/Version-1.0.0-green?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)

## 🚀 Overview

The Image Studio CLI provides a comprehensive command-line interface for interacting with Azure AI services for image generation and editing. It's designed for developers, content creators, and automation workflows who need programmatic access to AI image generation capabilities.

**Key Features:**

- 🎨 **Image Generation**: Create images from text prompts using DALL-E 3, FLUX, and other Azure AI models
- ⚙️ **Configuration Management**: Easy setup and management of Azure endpoints and API keys
- 📦 **Batch Processing**: Generate multiple images from files or scripts
- 🛠️ **Development Tools**: Start development servers, test endpoints, and manage assets
- 📁 **Asset Management**: Organize, export, and clean up generated images
- 📋 **Project Management**: Create, export, and import projects with templates and metadata
- 🔧 **Automation Ready**: Perfect for CI/CD pipelines and automated workflows

## 📋 Prerequisites

- **Node.js 18+** installed on your system
- **Azure subscription** with access to AI services
- **Azure OpenAI Service** account (for DALL-E 3 and GPT-Image-1 models)
- **Azure AI Foundry** access (for FLUX models)

## 🛠️ Installation

### Option 1: Install from NPM (Recommended)

```bash
npm install -g image-studio-cli
```

### Option 2: Install from Source

```bash
# Clone the repository
git clone https://github.com/DrHazemAli/image-studio.git
cd image-studio/cli

# Install dependencies
npm install

# Build the CLI
npm run build

# Link globally (optional)
npm link
```

### Option 3: Use with npx (No Installation)

```bash
npx image-studio-cli --help
```

## 🚀 Quick Start

### 1. Initialize Configuration

```bash
# Initialize the configuration
image-studio config init

# Set your Azure API key
image-studio config set-api-key
```

### 2. Configure Azure Endpoints

Edit the generated configuration file at `src/app/config/azure-config.json`:

```json
{
  "endpoints": [
    {
      "id": "primary",
      "name": "Primary Endpoint",
      "baseUrl": "https://your-openai-endpoint.openai.azure.com",
      "apiVersion": "2025-04-01-preview",
      "deployments": [
        {
          "id": "dalle-3",
          "name": "DALL-E 3",
          "deploymentName": "your-dalle-3-deployment",
          "maxSize": "1024x1024",
          "supportedFormats": ["png", "jpeg"],
          "description": "High-quality image generation with DALL-E 3"
        }
      ]
    }
  ]
}
```

### 3. Validate Configuration

```bash
# Test your configuration
image-studio config validate

# Test with a simple generation
image-studio config test
```

### 4. Generate Your First Image

```bash
# Generate a single image
image-studio generate --prompt "a beautiful sunset over mountains"

# Interactive generation with prompts
image-studio generate interactive
```

## 📚 Command Reference

### Configuration Commands

#### `config init`

Initialize Azure configuration with default settings.

```bash
image-studio config init [--force]
```

**Options:**

- `--force`: Overwrite existing configuration

#### `config validate`

Validate current configuration and check for errors.

```bash
image-studio config validate
```

#### `config set-api-key`

Set your Azure API key securely.

```bash
image-studio config set-api-key [--key <key>]
```

**Options:**

- `--key <key>`: API key to set (if not provided, will prompt)

#### `config show`

Display current configuration (with option to hide sensitive data).

```bash
image-studio config show [--hide-sensitive]
```

#### `config test`

Test configuration by making a simple API call.

```bash
image-studio config test [--model <model>]
```

### Generation Commands

#### `generate single`

Generate a single image from a text prompt.

```bash
image-studio generate single [options]
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

**Examples:**

```bash
# Basic generation
image-studio generate single --prompt "a cat sitting on a windowsill"

# High-quality generation with specific model
image-studio generate single --prompt "a futuristic city" --model dalle-3 --quality hd --size 1024x1024

# Generate multiple variations
image-studio generate single --prompt "a sunset" --count 4 --output ./my-images
```

#### `generate batch`

Generate multiple images from a file containing prompts.

```bash
image-studio generate batch [options]
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

**Example:**

```bash
# Create a prompts file
echo -e "a beautiful sunset\na mountain landscape\na city skyline" > prompts.txt

# Generate images from file
image-studio generate batch --file prompts.txt --output ./batch-images
```

#### `generate interactive`

Interactive image generation with guided prompts.

```bash
image-studio generate interactive
```

### Model Commands

#### `models list`

List all available AI models.

```bash
image-studio models list [options]
```

**Options:**

- `--format <format>`: Output format (table, json)
- `--verbose`: Show detailed information

#### `models info`

Show detailed information about a specific model.

```bash
image-studio models info --model <model-id>
```

#### `models test`

Test a model with a simple generation request.

```bash
image-studio models test --model <model-id> [options]
```

**Options:**

- `-p, --prompt <prompt>`: Test prompt (default: "A simple test image")
- `--no-save`: Don't save the generated image

#### `models status`

Check the status of all configured models.

```bash
image-studio models status
```

### Asset Management Commands

#### `assets list`

List all generated assets.

```bash
image-studio assets list [options]
```

**Options:**

- `--format <format>`: Output format (table, json)
- `--type <type>`: Filter by type (generation, upload, edit)
- `--limit <number>`: Limit number of results (default: 50)
- `--sort <field>`: Sort by field (name, date, size)

#### `assets export`

Export assets to different formats or locations.

```bash
image-studio assets export [options]
```

**Options:**

- `-f, --format <format>`: Export format (png, jpeg, webp)
- `-o, --output <path>`: Output directory (default: ./exports)
- `--quality <quality>`: Export quality (1-100, default: 90)
- `--resize <size>`: Resize images (e.g., 512x512)
- `--filter <type>`: Filter by type (generation, upload, edit)

#### `assets clean`

Clean up old or unused assets.

```bash
image-studio assets clean [options]
```

**Options:**

- `--older-than <time>`: Remove files older than specified time (e.g., 7d, 30d, 1y)
- `--dry-run`: Show what would be deleted without actually deleting
- `--confirm`: Skip confirmation prompt

#### `assets organize`

Organize assets into folders.

```bash
image-studio assets organize [options]
```

**Options:**

- `--by-date`: Organize by creation date
- `--by-model`: Organize by AI model
- `--by-type`: Organize by asset type
- `--dry-run`: Show what would be organized without actually moving files

### Project Commands

#### `project create`

Create a new project with templates and metadata.

```bash
image-studio project create [options]
```

**Options:**

- `-n, --name <name>`: Project name
- `-d, --description <description>`: Project description
- `--template <template>`: Project template (blank, social-media, product, art)

**Examples:**

```bash
# Create a blank project
image-studio project create --name "My Art Project"

# Create a social media campaign project
image-studio project create --name "Social Campaign" --template social-media

# Interactive project creation
image-studio project create
```

#### `project list`

List all available projects.

```bash
image-studio project list [options]
```

**Options:**

- `--format <format>`: Output format (table, json)

#### `project export`

Export a project to a portable format.

```bash
image-studio project export [options]
```

**Options:**

- `-n, --name <name>`: Project name to export
- `-o, --output <path>`: Output file path (default: ./exports)
- `--format <format>`: Export format (zip, tar)
- `--include-assets`: Include generated assets (default: true)
- `--include-config`: Include configuration files (default: true)

**Examples:**

```bash
# Export project to ZIP
image-studio project export --name "My Project" --format zip

# Export without assets
image-studio project export --name "My Project" --include-assets false
```

#### `project import`

Import a project from a portable format.

```bash
image-studio project import [options]
```

**Options:**

- `-f, --file <file>`: Project file to import
- `--overwrite`: Overwrite existing project if it exists

**Examples:**

```bash
# Import project from ZIP
image-studio project import --file my-project.zip

# Import with overwrite
image-studio project import --file my-project.zip --overwrite
```

#### `project delete`

Delete a project and all its assets.

```bash
image-studio project delete [options]
```

**Options:**

- `-n, --name <name>`: Project name to delete
- `--confirm`: Skip confirmation prompt

### Development Commands

#### `dev start`

Start the Image Studio development server.

```bash
image-studio dev start [options]
```

**Options:**

- `-p, --port <port>`: Port to run on (default: 3000)
- `--no-open`: Don't open browser automatically

#### `dev setup`

Set up development environment.

```bash
image-studio dev setup [options]
```

**Options:**

- `--skip-deps`: Skip dependency installation
- `--skip-config`: Skip configuration setup

#### `dev test`

Test Azure endpoint connectivity.

```bash
image-studio dev test [options]
```

**Options:**

- `-e, --endpoint <url>`: Endpoint URL to test
- `-k, --key <key>`: API key to use for testing

#### `dev logs`

Show development logs.

```bash
image-studio dev logs [options]
```

**Options:**

- `-f, --follow`: Follow log output
- `--lines <number>`: Number of lines to show (default: 50)

## 🔧 Configuration

### Environment Variables

The CLI supports several environment variables:

```bash
# Azure API Key (required)
AZURE_API_KEY=your_azure_api_key_here

# Configuration file path (optional)
AZURE_IMAGE_STUDIO_CONFIG_PATH=/path/to/config.json

# Output directory (optional)
AZURE_IMAGE_STUDIO_OUTPUT_DIR=/path/to/output

# Verbose logging (optional)
VERBOSE=true
```

### Configuration Files

The CLI uses two main configuration files:

1. **`src/app/config/azure-config.json`** - Azure endpoints and model configuration
2. **`.image-studio-cli.json`** - CLI-specific settings

### CLI Configuration Schema

```json
{
  "apiKey": "your-api-key",
  "configPath": "/path/to/config.json",
  "outputDir": "/path/to/output",
  "defaultModel": "dalle-3",
  "defaultSize": "1024x1024",
  "defaultQuality": "standard",
  "verbose": false
}
```

## 🎯 Use Cases

### Content Creation

```bash
# Generate social media images
image-studio generate batch --file social-prompts.txt --output ./social-media

# Create product mockups
image-studio generate single --prompt "product mockup of a smartphone" --model dalle-3 --quality hd
```

### Development and Testing

```bash
# Test new models
image-studio models test --model flux-1-1-pro

# Validate configuration
image-studio config validate

# Start development server
image-studio dev start
```

### Automation and CI/CD

```bash
# Generate images in CI pipeline
image-studio generate batch --file ci-prompts.txt --output ./generated-assets

# Clean up old assets
image-studio assets clean --older-than 30d --confirm
```

### Asset Management

```bash
# Organize by date
image-studio assets organize --by-date

# Export for web
image-studio assets export --format webp --quality 80 --resize 800x600

# List recent assets
image-studio assets list --sort date --limit 10
```

## 🚨 Troubleshooting

### Common Issues

#### "Configuration not found"

```bash
# Initialize configuration
image-studio config init

# Check configuration
image-studio config show
```

#### "API key not found"

```bash
# Set API key
image-studio config set-api-key

# Or set environment variable
export AZURE_API_KEY=your_key_here
```

#### "Model not available"

```bash
# List available models
image-studio models list

# Check model status
image-studio models status

# Test specific model
image-studio models test --model your-model-id
```

#### "Generation failed"

```bash
# Check configuration
image-studio config validate

# Test with simple prompt
image-studio generate single --prompt "test" --model your-model-id

# Check verbose output
image-studio generate single --prompt "test" --verbose
```

### Debug Mode

Enable verbose logging for detailed debugging:

```bash
# Set verbose mode
export VERBOSE=true

# Or use --verbose flag
image-studio generate single --prompt "test" --verbose
```

### Log Files

The CLI creates log files in the following locations:

- **Development logs**: `./logs/development.log`
- **Error logs**: `./logs/error.log`
- **CLI logs**: `~/.image-studio-cli/logs/`

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](../CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/DrHazemAli/image-studio.git
cd image-studio/cli

# Install dependencies
npm install

# Build the CLI
npm run build

# Run tests
npm test

# Run in development mode
npm run dev
```

### Code Style

The project uses:

- **TypeScript** for type safety
- **ESLint** for code quality
- **Prettier** for code formatting
- **Jest** for testing

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 🙏 Acknowledgments

- **Microsoft Azure AI Services** - For providing the AI infrastructure
- **OpenAI** - For the powerful AI models available through Azure
- **Black Forest Labs** - For the FLUX models
- **The open-source community** - For inspiration and contributions

## 📞 Support

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/DrHazemAli/image-studio/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/DrHazemAli/image-studio/discussions)
- 📧 **Contact**: [GitHub Profile](https://github.com/DrHazemAli)

---

**⭐ If you find this CLI helpful, please give it a star! It helps us grow and improve.**

Made with ❤️ by [Hazem Ali](https://github.com/DrHazemAli) and the community
