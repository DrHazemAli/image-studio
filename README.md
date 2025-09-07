# Azure Image Studio

<div align="center">

![Azure Image Studio](https://img.shields.io/badge/Azure-Image%20Studio-blue?style=for-the-badge&logo=microsoft-azure)
![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![React](https://img.shields.io/badge/React-19.1.0-blue?style=for-the-badge&logo=react)

**A community-built image editing and generation platform that leverages Azure AI services**

[![Version](https://img.shields.io/badge/Version-1.0.0-green?style=for-the-badge)](https://github.com/DrHazemAli/azure-image-studio)
[![Community Project](https://img.shields.io/badge/Type-Community%20Project-orange?style=for-the-badge)](https://github.com/DrHazemAli/azure-image-studio)
[![Microsoft MVP](https://img.shields.io/badge/Author-Microsoft%20MVP-purple?style=for-the-badge)](https://github.com/DrHazemAli)
[![Code Coverage](https://img.shields.io/badge/Code%20Coverage-85%25-brightgreen?style=for-the-badge)](https://github.com/DrHazemAli/azure-image-studio)

</div>

## 🚀 Overview

Azure Image Studio is a community-developed, production-ready platform that integrates with Azure AI services to provide professional-grade image generation and editing capabilities. This independent project is built with modern web technologies and offers both a simple generation interface and a full-featured studio environment for advanced image manipulation.

**Note**: This is not an official Microsoft or Azure product, but rather a community project that utilizes Azure's AI services.

**⚠️ Development Status**: Azure Image Studio is currently in **pre-release** and **testing phase**. While we've implemented many features, some functionality may not work as expected since development is ongoing. Please see our [Development Roadmap](docs/Roadmap.md) for current status and planned features.

## ✨ Features

### 🎨 **Professional Image Studio**
- **Advanced Canvas**: Full-featured image editing workspace with multiple tools
- **Layer Management**: Professional layer-based editing system with Fabric.js
- **Asset Library**: Built-in asset management and organization with IndexedDB
- **History Panel**: Complete generation and editing history tracking
- **Real-time Console**: Detailed API request/response logging
- **Tool System**: Comprehensive set of editing and generation tools

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

### 🛠️ **Advanced Capabilities**
- **Text-to-Image**: Generate images from natural language descriptions
- **Image Editing**: Modify existing images with AI-powered tools
- **Inpainting/Outpainting**: Fill or extend image areas intelligently
- **Image-to-Image**: Transform images based on text prompts
- **Batch Generation**: Create multiple images simultaneously
- **Quality Control**: Multiple quality levels and output formats

### 🎯 **User Experience**
- **Modern UI**: Beautiful, responsive interface built with Radix UI
- **Dark/Light Theme**: Seamless theme switching
- **Smooth Animations**: Framer Motion powered interactions
- **Mobile Responsive**: Optimized for all device sizes
- **Real-time Progress**: Live generation progress tracking
- **Keyboard Shortcuts**: Professional keyboard shortcuts for all tools

## 🏗️ **Architecture**

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

1. **Clone the repository**
   ```bash
   git clone https://github.com/DrHazemAli/azure-image-studio.git
   cd azure-image-studio
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

## 🗺️ What's Coming Next

We're actively developing exciting new features:

1. **Project Sharing** - Share projects with team members, clients, and the community
2. **Cloud Storage with Azure** - Seamless cloud-based asset management and cross-device access
3. **Prompt Enhancement using GPT models** - AI-powered prompt optimization and style suggestions

For detailed information about our development timeline and planned features, see our [Development Roadmap](docs/Roadmap.md).

> 📚 **Need detailed setup instructions?** Check out our comprehensive [Getting Started Guide](docs/Getting-Started.md)

## ⚙️ Configuration

### Azure Configuration
The platform uses a flexible configuration system located in `src/app/config/`:

- **`azure-config.json`**: Main configuration for endpoints and deployments
- **`azure-models.json`**: Detailed model specifications and capabilities

### Environment Variables
```bash
# Azure API Key (used for all models)
AZURE_API_KEY=your_azure_api_key_here
```

> ⚙️ **Configuration Details**: Each model requires its own endpoint configuration. See the [API Documentation](docs/API-Documentation.md) for complete setup instructions.

## 🎨 Usage

### Simple Generation
1. Visit the home page
2. Enter your image prompt
3. Select model and parameters
4. Click "Generate"

### Professional Studio
1. Click "Launch Azure Image Studio"
2. Use the toolbar to select tools
3. Generate or import images
4. Edit using the advanced canvas
5. Save and export your work

> 📖 **Detailed Usage**: Check out our comprehensive [User Guide](docs/User-Guide.md) for detailed instructions on all features and workflows.

## 📁 Project Structure

```
azure-image-studio/
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
└── docs/                  # Comprehensive documentation
    ├── Getting-Started.md # Setup and configuration guide
    ├── User-Guide.md      # Detailed usage instructions
    ├── API-Documentation.md # Technical API reference
    └── Architecture.md    # System design overview
```

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

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Hazem Ali** - Microsoft MVP
- GitHub: [@DrHazemAli](https://github.com/DrHazemAli)
- LinkedIn: [Hazem Ali](https://linkedin.com/in/hazemali)

## 🙏 Acknowledgments

- **Microsoft Azure AI Services** - For providing the AI infrastructure (this project is not affiliated with Microsoft)
- **OpenAI** - For the powerful AI models available through Azure
- **Black Forest Labs** - For the FLUX models
- **Next.js team** - For the amazing framework
- **Radix UI** - For accessible components
- **The open-source community** - For inspiration and contributions

## 📚 Documentation

### Web Application
- 🚀 **[Getting Started](docs/Getting-Started.md)** - Complete setup and configuration guide
- 📖 **[User Guide](docs/User-Guide.md)** - Detailed usage instructions for all features
- 🔧 **[API Documentation](docs/API-Documentation.md)** - Technical reference and examples
- 🏗️ **[Architecture Guide](docs/Architecture.md)** - System design and technical details

### Command-Line Interface
- 🖥️ **[CLI Documentation](cli/README.md)** - Command-line interface guide
- 📖 **[CLI User Guide](cli/docs/CLI-User-Guide.md)** - Comprehensive CLI usage guide
- 🔧 **[CLI API Documentation](cli/docs/CLI-API-Documentation.md)** - CLI technical reference

### Development & Planning
- 🗺️ **[Development Roadmap](docs/Roadmap.md)** - Current status, planned features, and development timeline

## 👥 Contributors

<div align="center">

### Thank you to all our amazing contributors! 🎉

[![Contributors](https://contrib.rocks/image?repo=DrHazemAli/azure-image-studio)](https://github.com/DrHazemAli/azure-image-studio/graphs/contributors)

</div>

## 📊 Project Statistics

<div align="center">

[![GitHub stars](https://img.shields.io/github/stars/DrHazemAli/azure-image-studio?style=social)](https://github.com/DrHazemAli/azure-image-studio/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/DrHazemAli/azure-image-studio?style=social)](https://github.com/DrHazemAli/azure-image-studio/network/members)
[![GitHub issues](https://img.shields.io/github/issues/DrHazemAli/azure-image-studio)](https://github.com/DrHazemAli/azure-image-studio/issues)
[![GitHub pull requests](https://img.shields.io/github/issues-pr/DrHazemAli/azure-image-studio)](https://github.com/DrHazemAli/azure-image-studio/pulls)

</div>

## 🧪 Code Quality & Testing

### Code Coverage
We maintain high code quality standards with comprehensive testing:

- **Code Coverage**: 85%+ across all modules
- **Unit Tests**: Comprehensive test suite for utilities and components
- **Integration Tests**: API endpoint testing and Azure service integration
- **E2E Tests**: End-to-end testing for critical user workflows
- **Type Safety**: 100% TypeScript coverage with strict type checking

### Quality Metrics
- **ESLint**: Code quality and consistency enforcement
- **Prettier**: Code formatting and style consistency
- **TypeScript**: Static type checking and error prevention
- **Performance**: Optimized bundle size and runtime performance

### Testing Strategy
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e
```

## 📞 Support

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/DrHazemAli/azure-image-studio/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/DrHazemAli/azure-image-studio/discussions)
- 📧 **Contact**: [GitHub Profile](https://github.com/DrHazemAli)

---

<div align="center">

**⭐ If you find this project helpful, please give it a star! It helps us grow and improve.**

[![Star this repo](https://img.shields.io/github/stars/DrHazemAli/azure-image-studio?style=for-the-badge&label=Star%20this%20repo)](https://github.com/DrHazemAli/azure-image-studio)

Made with ❤️ by [Hazem Ali](https://github.com/DrHazemAli) and the community

</div>