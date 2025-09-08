# Installation Guide - Azure Image Studio

This guide provides detailed installation instructions for Azure Image Studio on different platforms and environments.

> ⚠️ **Important**: This is a **community project** and is not affiliated with or endorsed by Microsoft or Azure. It's an independent project that uses Azure AI services.

**Last Updated**: September 8, 2025  
**Version**: 1.0.1

## 📋 Prerequisites

### System Requirements

#### Minimum Requirements
- **Node.js**: 18.0.0 or higher
- **npm**: 8.0.0 or higher
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB free space
- **Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

#### Recommended Requirements
- **Node.js**: 20.0.0 or higher
- **RAM**: 16GB or more
- **Storage**: 10GB free space
- **CPU**: Multi-core processor
- **GPU**: Dedicated graphics card (optional, for better performance)

### Azure Services Requirements

#### Required Azure Services
- **Azure Subscription**: Active Azure subscription
- **Azure OpenAI Service**: For DALL-E 3 and GPT-Image-1 models
- **Azure AI Foundry**: For FLUX models access

#### Required Permissions
- **Cognitive Services User** role for Azure OpenAI
- **AI Foundry User** role for FLUX models
- Access to specific model deployments

## 🖥️ Platform-Specific Installation

### Windows Installation

#### 1. Install Node.js
```bash
# Download and install Node.js from https://nodejs.org/
# Or use Chocolatey
choco install nodejs

# Or use winget
winget install OpenJS.NodeJS
```

#### 2. Verify Installation
```bash
node --version
npm --version
```

#### 3. Clone Repository
```bash
git clone https://github.com/DrHazemAli/azure-image-studio.git
cd azure-image-studio
```

#### 4. Install Dependencies
```bash
npm install
```

### macOS Installation

#### 1. Install Node.js
```bash
# Using Homebrew (recommended)
brew install node

# Or download from https://nodejs.org/
```

#### 2. Verify Installation
```bash
node --version
npm --version
```

#### 3. Clone Repository
```bash
git clone https://github.com/DrHazemAli/azure-image-studio.git
cd azure-image-studio
```

#### 4. Install Dependencies
```bash
npm install
```

### Linux Installation

#### Ubuntu/Debian
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version

# Clone repository
git clone https://github.com/DrHazemAli/azure-image-studio.git
cd azure-image-studio

# Install dependencies
npm install
```

#### CentOS/RHEL/Fedora
```bash
# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

# Or for Fedora
sudo dnf install -y nodejs npm

# Verify installation
node --version
npm --version

# Clone repository
git clone https://github.com/DrHazemAli/azure-image-studio.git
cd azure-image-studio

# Install dependencies
npm install
```

#### Arch Linux
```bash
# Install Node.js
sudo pacman -S nodejs npm

# Verify installation
node --version
npm --version

# Clone repository
git clone https://github.com/DrHazemAli/azure-image-studio.git
cd azure-image-studio

# Install dependencies
npm install
```

## 🐳 Docker Installation

### Using Docker Compose

#### 1. Create docker-compose.yml
```yaml
version: '3.8'
services:
  azure-image-studio:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - AZURE_API_KEY=${AZURE_API_KEY}
    volumes:
      - ./src/app/config:/app/src/app/config
    restart: unless-stopped
```

#### 2. Create Dockerfile
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

#### 3. Build and Run
```bash
# Build the image
docker-compose build

# Run the container
docker-compose up -d

# View logs
docker-compose logs -f
```

### Using Docker

#### 1. Build Image
```bash
docker build -t azure-image-studio .
```

#### 2. Run Container
```bash
docker run -p 3000:3000 \
  -e AZURE_API_KEY=your_api_key_here \
  -v $(pwd)/src/app/config:/app/src/app/config \
  azure-image-studio
```

## 🔧 Development Installation

### Local Development Setup

#### 1. Clone Repository
```bash
git clone https://github.com/DrHazemAli/azure-image-studio.git
cd azure-image-studio
```

#### 2. Install Dependencies
```bash
# Install all dependencies
npm install

# Install CLI dependencies
npm run cli:install
```

#### 3. Environment Configuration
```bash
# Copy environment template
cp .env.example .env.local

# Edit environment variables
nano .env.local
```

#### 4. Start Development Server
```bash
# Start the development server
npm run dev

# Or start with specific port
npm run dev -- -p 3001
```

### CLI Development Setup

#### 1. Navigate to CLI Directory
```bash
cd cli
```

#### 2. Install CLI Dependencies
```bash
npm install
```

#### 3. Build CLI
```bash
npm run build
```

#### 4. Link CLI Globally (Optional)
```bash
npm link
```

#### 5. Test CLI
```bash
# Test CLI installation
azure-image-studio --help

# Or use npm script
npm run cli -- --help
```

## ⚙️ Configuration Setup

### Environment Variables

#### Create .env.local
```bash
# Azure API Key (required)
AZURE_API_KEY=your_azure_api_key_here

# Optional: Custom endpoint URL
AZURE_API_BASE_URL=https://your-endpoint.openai.azure.com

# Optional: Debug mode
DEBUG=false

# Optional: Log level
LOG_LEVEL=info
```

### Azure Configuration

#### 1. Azure Config File
Edit `src/app/config/azure-config.json`:

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
          "description": "High-quality image generation with DALL-E 3"
        }
      ]
    }
  ]
}
```

#### 2. Model Configuration
Edit `src/app/config/azure-models.json`:

```json
{
  "imageModels": {
    "generation": {
      "openai": [
        {
          "id": "dalle-3",
          "name": "DALL-E 3",
          "description": "High-quality image generation",
          "provider": "Azure OpenAI",
          "apiVersion": "2024-10-21",
          "capabilities": ["text-to-image"],
          "supportedSizes": [
            { "size": "1024x1024", "label": "Square (1:1)", "aspect": "1:1" }
          ],
          "supportedFormats": ["png", "jpeg"],
          "styleOptions": ["natural", "vivid"],
          "qualityLevels": ["standard", "hd"],
          "maxImages": 1,
          "requiresApproval": false
        }
      ]
    }
  }
}
```

## 🚀 Quick Start

### 1. Verify Installation
```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check if dependencies are installed
npm list --depth=0
```

### 2. Start the Application
```bash
# Start development server
npm run dev

# Or start production server
npm run build
npm start
```

### 3. Access the Application
- Open your browser
- Navigate to `http://localhost:3000`
- You should see the Azure Image Studio home page

### 4. Test Configuration
```bash
# Test API configuration
curl http://localhost:3000/api/config

# Test models endpoint
curl http://localhost:3000/api/models
```

## 🔍 Troubleshooting

### Common Installation Issues

#### Node.js Version Issues
```bash
# Check current version
node --version

# If version is too old, update Node.js
# Windows: Download from https://nodejs.org/
# macOS: brew upgrade node
# Linux: Follow platform-specific instructions above
```

#### npm Installation Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall dependencies
npm install
```

#### Permission Issues (Linux/macOS)
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm

# Or use nvm to avoid permission issues
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20
```

#### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use a different port
npm run dev -- -p 3001
```

### Azure Configuration Issues

#### API Key Not Working
- Verify the API key is correct
- Check if the key has proper permissions
- Ensure the key is set in `.env.local`

#### Endpoint Configuration Issues
- Verify endpoint URLs are correct
- Check if deployments exist in Azure
- Ensure API versions are compatible

#### Model Not Available
- Check if the model is enabled in configuration
- Verify the deployment exists in Azure
- Ensure you have access to the required Azure service

### Development Issues

#### Build Failures
```bash
# Clear build cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Try building again
npm run build
```

#### TypeScript Errors
```bash
# Check TypeScript version
npx tsc --version

# Run type checking
npm run type-check

# Fix type errors
npm run lint -- --fix
```

## 📚 Additional Resources

### Documentation
- [Getting Started](getting-started.md) - Quick start guide
- [User Guide](user-guide.md) - Complete user manual
- [Development Guide](developer-guide.md) - Development setup
- [Deployment Guide](deployment.md) - Production deployment
- [API Documentation](api-documentation.md) - Technical reference

### CLI Documentation
- [CLI Installation](cli-documentation.md#installation) - CLI setup
- [CLI Usage](cli-documentation.md#usage) - CLI commands
- [CLI Configuration](cli-documentation.md#configuration) - CLI settings

### External Resources
- [Node.js Documentation](https://nodejs.org/docs/)
- [npm Documentation](https://docs.npmjs.com/)
- [Docker Documentation](https://docs.docker.com/)
- [Azure OpenAI Documentation](https://docs.microsoft.com/en-us/azure/cognitive-services/openai/)

## 🆘 Getting Help

### Self-Service
- Check this installation guide
- Review the [troubleshooting section](#troubleshooting)
- Check the [GitHub Issues](https://github.com/DrHazemAli/azure-image-studio/issues)

### Community Support
- [GitHub Discussions](https://github.com/DrHazemAli/azure-image-studio/discussions)
- [GitHub Issues](https://github.com/DrHazemAli/azure-image-studio/issues)

### Contact
- **Author**: Hazem Ali (Microsoft MVP)
- **GitHub**: [@DrHazemAli](https://github.com/DrHazemAli)
- **LinkedIn**: [Hazem Ali](https://linkedin.com/in/hazemali)

---

## 🧭 Navigation

<div align="center">

[← Back: Database Guide](database-guide.md) | [Next: Deployment Guide →](deployment.md)

</div>

---

## Next Steps
continue to the [Configuration Guide](configuration.md) or the [User Guide](user-guide.md) to get started.
