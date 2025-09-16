# AI Image Studio

AI Image Studio is a cutting-edge image generation and editing platform that harnesses the full power of Azure AI services. Built and maintained by Microsoft MVPs and AI Community Experts, this professional-grade solution delivers state-of-the-art AI capabilities through an intuitive, modern interface. Whether you're creating stunning visuals, editing professional content, or building automated image workflows, AI Image Studio provides the tools and performance you need to transform your creative vision into reality.

![AI Image Studio](https://github.com/DrHazemAli/image-studio/blob/main/public/image-studio.jpg)

<div align="center">

![AI Image Studio](https://img.shields.io/badge/Azure-Image%20Studio-blue?style=for-the-badge&logo=microsoft-azure)
![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![React](https://img.shields.io/badge/React-19.1.0-blue?style=for-the-badge&logo=react)

[![Version](https://img.shields.io/badge/Version-1.0.3-green?style=for-the-badge)](https://github.com/DrHazemAli/image-studio)
[![Community Project](https://img.shields.io/badge/Type-Community%20Project-orange?style=for-the-badge)](https://github.com/DrHazemAli/image-studio)
[![Microsoft MVP](https://img.shields.io/badge/Author-Microsoft%20MVP-purple?style=for-the-badge)](https://github.com/DrHazemAli)
[![Code Coverage](https://img.shields.io/badge/Code%20Coverage-85%25-brightgreen?style=for-the-badge)](CODE_COVERAGE.md)
[![Last Updated](https://img.shields.io/badge/Last%20Updated-September%2010%2C%202025-blue?style=for-the-badge)](https://github.com/DrHazemAli/image-studio)

</div>

<div align="center">

[![GitHub stars](https://img.shields.io/github/stars/DrHazemAli/image-studio?style=social)](https://github.com/DrHazemAli/image-studio/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/DrHazemAli/image-studio?style=social)](https://github.com/DrHazemAli/image-studio/network/members)
[![GitHub issues](https://img.shields.io/github/issues/DrHazemAli/image-studio)](https://github.com/DrHazemAli/image-studio/issues)
[![GitHub pull requests](https://img.shields.io/github/issues-pr/DrHazemAli/image-studio)](https://github.com/DrHazemAli/image-studio/pulls)

</div>

**A community-built image editing and generation platform that leverages Azure AI services**

<div align="center">

[![Deploy to Azure](https://aka.ms/deploytoazurebutton)](https://portal.azure.com/#create/Microsoft.AppService/WebAppFromGitHub/name/ai-image-studio&repoUrl=https://github.com/DrHazemAli/image-studio)

</div>

## 📋 Table of Contents

- [🚀 Overview](#-overview)
- [✨ Features](#-features)
- [🏗️ Architecture](#️-architecture)
- [🚀 Quick Start](#-quick-start)
- [⚙️ Configuration](#️-configuration)
- [🎨 Usage](#-usage)
- [📁 Project Structure](#-project-structure)
- [🗺️ What's Coming Next](#️-whats-coming-next)
- [📚 Documentation](#-documentation)
- [🤝 Contributing](#-contributing)
- [👥 Contributors](#-contributors)
- [📞 Support](#-support)
- [📄 License](#-license)
- [👨‍💻 Author](#️-author)
- [🙏 Acknowledgments](#-acknowledgments)

## 🚀 Overview

AI Image Studio is a community-developed, production-ready platform that integrates with Azure AI services to provide professional-grade image generation and editing capabilities. This independent project is built with modern web technologies and offers both a simple generation interface and a full-featured studio environment for advanced image manipulation.

**Note**: This is not an official Microsoft or Azure product, but rather a community project that utilizes Azure's AI services.

**✅ Production Status**: AI Image Studio is currently **production-ready** (v1.0.3) with comprehensive features implemented and documented. The platform is stable and ready for professional use. Please see our [Development Roadmap](docs/legacy/roadmap.md) for current status and planned features.

## ✨ Features

### 🎨 **Professional AI Image Studio**

- **Advanced Canvas**: Full-featured image editing workspace with multiple tools
- **Layer Management**: Professional layer-based editing system with Fabric.js
- **Asset Library**: Built-in asset management and organization with IndexedDB
- **History Panel**: Complete generation and editing history tracking
- **Real-time Console**: Detailed API request/response logging
- **Tool System**: Comprehensive set of AI-powered editing and generation tools
- **Powerful AI Tools**: AI-powered image generation, editing, inpainting, outpainting, and more
- **Asset Store**: Enjoy millions of high-quality stockimages, graphics, and design elements
- **Azure AI**: Enjoy the full power of Azure AI services with multiple models and features

### 🖥️ **Command-Line Interface**

- **CLI Tool**: Powerful command-line interface for automation and scripting
- **Batch Processing**: Generate multiple images from files or scripts
- **Asset Management**: Organize, export, and clean up generated images
- **Project Management**: Create, export, and import projects with templates and metadata
- **Development Tools**: Start servers, test endpoints, and manage configurations
- **CI/CD Ready**: Perfect for automated workflows and deployment pipelines

### 🤖 **AI Model Support**

- **DALL-E 3**: High-quality image generation with precise instruction following
- **FLUX 1.1 Pro**: Advanced image generation with superior quality
- **FLUX 1 Kontext Pro**: Context-aware image generation and editing
- **GPT-Image-1**: Latest model with enhanced capabilities including image editing and inpainting (requires approval)
- **Florence 2.0**: Microsoft's vision-language model for advanced image understanding
- **Extended AI Models**: Add / Remove AI models with ease with integrated Azure AI services

### 🛠️ **Advanced Capabilities**

- **Text-to-Image**: Generate images from natural language descriptions
- **Image Editing**: Modify existing images with AI-powered tools
- **Inpainting/Outpainting**: Fill or extend image areas intelligently
- **Image-to-Image**: Transform images based on text prompts
- **Background Removal**: AI-powered background removal and replacement
- **Batch Generation**: Create multiple images simultaneously
- **Quality Control**: Multiple quality levels and output formats

### 🎯 **User Experience**

- **Modern UI**: Beautiful, responsive interface built with Radix UI
- **Dark/Light Theme**: Seamless theme switching
- **Smooth Animations**: Framer Motion powered interactions
- **Mobile Responsive**: Optimized for all device sizes
- **Real-time Progress**: Live generation progress tracking
- **Keyboard Shortcuts**: Professional keyboard shortcuts for all tools
- **Easy to use UI**: Intuitive UIs including settings interface for seamless configuration

## 🏗️ Architecture

### **Frontend Stack**

- **Next.js 15.5.2** - React framework with App Router
- **React 19.1.0** - Latest React with concurrent features
- **TypeScript 5.0** - Type-safe development
- **Tailwind CSS 4.0** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Smooth animations and transitions
- **Fabric.js** - Advanced canvas manipulation

### **Backend Integration**

- **Azure OpenAI Service** - AI model integration
- **Azure AI Foundry** - FLUX model integration
- **RESTful API** - Clean API architecture
- **Configuration Management** - Flexible model and endpoint configuration
- **Error Handling** - Comprehensive error management

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Azure subscription with AI services access
- Azure OpenAI Service account (for DALL-E 3 and GPT-Image-1)
- Azure AI Foundry access (for FLUX models)

### Installation

> **Note**: For production deployments, please use the **stable branch** which contains the latest stable release, The main branch may contain experimental features and should be used for development and testing only.

1. **Clone the repository**

   ```bash
   git clone https://github.com/DrHazemAli/image-studio.git
   cd image-studio
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure Azure services**
   - Set up your Azure API key in `.env.local`
   - Configure endpoints in `src/app/config/azure-config.json`
   - Set up model deployments in `src/app/config/azure-models.json`

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### CLI Tool (Optional)

The project includes a powerful CLI tool for command-line image generation and automation:

1. **Install CLI dependencies**

   ```bash
   npm run cli:install
   ```

2. **Build the CLI**

   ```bash
   npm run cli:build
   ```

3. **Use the CLI**

   ```bash
   # Initialize configuration
   npm run cli -- config init

   # Generate images
   npm run cli -- generate --prompt "a beautiful sunset"

   # Create a project
   npm run cli -- project create --name "My Project"

   # List available models
   npm run cli -- models list
   ```

For detailed CLI documentation, see [CLI README](cli/README.md).

### Project Management Features

The CLI includes powerful project management capabilities:

- **Project Templates**: Pre-configured templates for social media, product photography, art collections, and more
- **Export/Import**: Portable project formats (ZIP/TAR) for sharing and backup
- **Asset Organization**: Automatic organization of generated images by project
- **Metadata Tracking**: Complete generation history and settings for each project
- **Collaboration**: Share projects with team members or clients

## ⚙️ Configuration

### Azure Configuration

The platform uses a flexible configuration system located in `src/app/config/`:

- **`azure-config.json`**: Main configuration for endpoints and deployments
- **`azure-models.json`**: Detailed model specifications and capabilities

### Environment Variables

```bash
# Azure API Key (used for all models)
AZURE_API_KEY=your_azure_api_key_here

# This is optional, The backend routes will replace the <env.AZURE_API_BASE_URL> with the actual url with this value
AZURE_API_BASE_URL=your_azure_api_base_url_here
```

> ⚙️ **Configuration Details**: Each model requires its own endpoint configuration. See the [Settings Guide](wiki/settings-guide.mdx) for complete setup instructions.

## 🎨 Usage

### Simple Generation

1. Visit the home page
2. Enter your image prompt
3. Select model and parameters
4. Click "Generate"

### Professional Studio

1. Click "Launch AI Image Studio"
2. Use the toolbar to select tools
3. Generate or import images
4. Edit using the advanced canvas
5. Save and export your work

> 📖 **Detailed Usage**: Check out our comprehensive [Features Guide](wiki/features-guide.mdx) for detailed instructions on all features and workflows.

## 📁 Project Structure

```
image-studio/
├── src/                    # Next.js Application
│   ├── app/               # Next.js App Router
│   │   ├── api/           # API routes
│   │   ├── config/        # Configuration files
│   │   ├── studio/        # Studio page
│   │   └── globals.css    # Global styles
│   ├── components/        # React components
│   │   ├── studio/        # Studio-specific components
│   │   │   ├── canvas/    # Canvas components
│   │   │   ├── tools/     # Tool components
│   │   │   └── panels/    # Panel components
│   │   └── ui/            # Reusable UI components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility libraries
│   └── types/             # TypeScript type definitions
├── cli/                   # Command-Line Interface
│   ├── src/               # CLI source code
│   │   ├── commands/      # CLI commands
│   │   ├── lib/           # CLI utilities
│   │   └── types/         # CLI type definitions
│   ├── docs/              # CLI documentation
│   └── package.json       # CLI dependencies
├── wiki/                  # Comprehensive documentation (MDX format)
│   ├── quick-start-guide.mdx # Setup and configuration guide
│   ├── settings-guide.mdx    # Comprehensive configuration reference
│   ├── features-guide.mdx    # Detailed usage instructions
│   ├── api-documentation.mdx # Technical API reference
│   ├── technical-architecture.mdx # System design overview
│   ├── installation-guide.mdx # Installation instructions
│   ├── azure-deployment-guide.mdx # Deployment guide
│   ├── cli-guide.mdx      # CLI guide
│   └── troubleshooting-guide.mdx # Common issues and solutions
└── docs/                  # Legacy documentation and redirects
    ├── README.md          # Documentation redirect
    └── legacy/            # Historical documentation
        ├── contributing.md    # Contribution guide
        ├── roadmap.md         # Development roadmap
        └── [other legacy docs] # Additional historical documentation
```

## 🗺️ What's Coming Next

We're actively developing exciting new features:

1. **Advanced Canvas Features** - Enhanced editing tools and professional capabilities
2. **Enhanced AI Features** - Style transfer, image upscaling, and advanced AI processing
3. **Performance Optimization** - Improved caching, memory management, and database optimization

**Future Plans:**

- **Project Sharing** - Share projects with team members, clients, and the community
- **Cloud Storage with Azure** - Seamless cloud-based asset management and cross-device access
- **User Authentication** - User accounts and collaboration features

For detailed information about our development timeline and planned features, see our [Development Roadmap](docs/legacy/roadmap.md).

> 📚 **Need detailed setup instructions?** Check out our comprehensive [Quick Start Guide](wiki/quick-start-guide.mdx)

## 📚 Documentation

> 📚 **Documentation Location**: All documentation has been moved to the **[wiki/](wiki/)** directory for better organization and maintenance.

### User Documentation

- 🚀 **[Quick Start Guide](wiki/quick-start-guide.mdx)** - Complete setup and configuration guide
- ⚙️ **[Settings Guide](wiki/settings-guide.mdx)** - Comprehensive configuration reference
- 📖 **[Features Guide](wiki/features-guide.mdx)** - Detailed usage instructions for all features
- 🎨 **[AI Image Guide](wiki/ai-image-guide.mdx)** - AI generation workflows and best practices
- 🛠️ **[Tools Reference](wiki/tools-reference.mdx)** - Complete tools reference and usage guide
- 🏪 **[Asset Store Guide](wiki/asset-store-guide.mdx)** - Asset management and organization

### Developer Documentation

- 🔧 **[Development Guide](wiki/development-guide.mdx)** - Development setup and architecture
- 📡 **[API Documentation](wiki/api-documentation.mdx)** - Technical reference and examples
- 🏗️ **[Technical Architecture](wiki/technical-architecture.mdx)** - System design and technical details
- 🚀 **[Installation Guide](wiki/installation-guide.mdx)** - Detailed installation instructions
- ☁️ **[Azure Deployment Guide](wiki/azure-deployment-guide.mdx)** - Production deployment instructions
- 🔐 **[Security Guide](wiki/security-guide.mdx)** - Security best practices and guidelines
- ⚡ **[Performance Guide](wiki/performance-guide.mdx)** - Performance optimization and monitoring

### Command-Line Interface

- 🖥️ **[CLI Guide](wiki/cli-guide.mdx)** - Comprehensive CLI guide
- 📖 **[CLI User Guide](cli/docs/CLI-User-Guide.md)** - CLI usage instructions
- 🔧 **[CLI API Documentation](cli/docs/CLI-API-Documentation.md)** - CLI technical reference

### Azure & Models

- 🔧 **[Azure Setup Guide](wiki/azure-setup-guide.mdx)** - Azure service configuration
- 🤖 **[Adding Models Guide](wiki/adding-models-guide.mdx)** - Model configuration and management
- 📊 **[Project Management Guide](wiki/project-management-guide.mdx)** - Project organization and workflows

### Community & Development

- 🤝 **[Contributing Guide](docs/legacy/contributing.md)** - How to contribute to the project
- 🗺️ **[Development Roadmap](docs/legacy/roadmap.md)** - Current status and planned features
- 🧪 **[Code Coverage & Testing](CODE_COVERAGE.md)** - Testing strategy and quality metrics
- 🔧 **[Troubleshooting Guide](wiki/troubleshooting-guide.mdx)** - Common issues and solutions

## 🤝 Contributing

This is a **community-driven project**! We welcome contributions from developers of all skill levels. This project is not affiliated with Microsoft or Azure, but rather is an independent community effort that integrates with Azure AI services.

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 👥 Contributors

<div align="center">

### Thank you to all our amazing contributors! 🎉

[![Contributors](https://contrib.rocks/image?repo=DrHazemAli/image-studio)](https://github.com/DrHazemAli/image-studio/graphs/contributors)

</div>

## 📞 Support

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/DrHazemAli/image-studio/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/DrHazemAli/image-studio/discussions)
- 📧 **Contact**: [GitHub Profile](https://github.com/DrHazemAli)
- 📖 **Documentation**: [Wiki](https://github.com/DrHazemAli/image-studio/wiki)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Hazem Ali** - Microsoft MVP

- GitHub: [@DrHazemAli](https://github.com/DrHazemAli)
- LinkedIn: [Hazem Ali](https://linkedin.com/in/drhazemali)

## 🙏 Acknowledgments

- **Microsoft Azure AI Services** - For providing the AI infrastructure (this project is not affiliated with Microsoft)
- **OpenAI** - For the powerful AI models available through Azure
- **Black Forest Labs** - For the FLUX models
- **Next.js team** - For the amazing framework
- **Radix UI** - For accessible components
- **The open-source community** - For inspiration and contributions

---

<div align="center">

**⭐ If you find this project helpful, please give it a star! It helps us grow and improve.**

[![Star this repo](https://img.shields.io/github/stars/DrHazemAli/image-studio?style=for-the-badge&label=Star%20this%20repo)](https://github.com/DrHazemAli/image-studio)

Made with ❤️ by [Hazem Ali](https://github.com/DrHazemAli) and the community

</div>
