# Azure Image Studio Documentation

Welcome to the comprehensive documentation for Azure Image Studio - a community-developed, production-ready platform for AI-powered image generation and editing using Azure AI services.


## 📚 Documentation Overview

This documentation suite provides everything you need to understand, configure, and use Azure Image Studio effectively.

### 🚀 Quick Start

- **[Getting Started](Getting-Started.md)** - Set up and configure the platform
- **[User Guide](User-Guide.md)** - Learn how to use all features
- **[Roadmap](Roadmap.md)** - Current features and development plans

### 🔧 Technical Documentation

- **[API Documentation](API-Documentation.md)** - Complete API reference
- **[Architecture Guide](Architecture.md)** - System design and technical details

## 🎯 What is Azure Image Studio?

Azure Image Studio is a community-developed, comprehensive, production-ready platform that integrates with Azure AI services to provide professional-grade image generation and editing capabilities. This independent project is built with modern web technologies and offers both a simple generation interface and a full-featured studio environment for advanced image manipulation.

**Note**: This is not an official Microsoft or Azure product, but rather a community project that utilizes Azure's AI services.

### ✨ Key Features

- **🎨 Image Generation**: Create images from text descriptions using various AI models
- **✏️ Image Editing**: Modify and enhance existing images with AI-powered tools
- **🤖 Multiple AI Models**: Support for DALL-E 3, FLUX 1.1 Pro, FLUX 1 Kontext Pro, and GPT-Image-1
- **🛠️ Professional Studio**: Full-featured editing workspace with advanced tools
- **📁 Asset Management**: Built-in asset organization and project management
- **📚 History Tracking**: Complete generation and editing history
- **🎯 Modern UI**: Beautiful, responsive interface with dark/light themes

## 🏗️ Architecture

### Technology Stack

- **Frontend**: Next.js 15.5.2, React 19.1.0, TypeScript 5.0
- **Styling**: Tailwind CSS 4.0, Radix UI components
- **Animations**: Framer Motion
- **Backend**: Next.js API routes, Azure AI integration
- **Storage**: IndexedDB for local data, Azure AI services for generation

### Supported Models

| Model | Provider | Capabilities | Status |
|-------|----------|--------------|--------|
| DALL-E 3 | Azure OpenAI | Text-to-image | ✅ Active |
| GPT-Image-1 | Azure OpenAI | Text-to-image, Editing, Inpainting | ⚠️ Requires Approval |
| FLUX 1.1 Pro | Azure AI Foundry | Text-to-image | ✅ Active |
| FLUX 1 Kontext Pro | Azure AI Foundry | Text-to-image, Image-to-image, Editing | ✅ Active |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Azure subscription with AI services access
- Azure OpenAI Service account
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

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Documentation Structure

### For Users

- **[Getting Started](Getting-Started.md)** - Complete setup guide with configuration details
- **[User Guide](User-Guide.md)** - Comprehensive guide to all features and workflows
- **[Roadmap](Roadmap.md)** - Current active features and development roadmap

### For Developers

- **[API Documentation](API-Documentation.md)** - Complete API reference with examples
- **[Architecture Guide](Architecture.md)** - System design, components, and technical details

## 🎨 Current Active Features

### Image Generation
- Text-to-image generation with multiple AI models
- Quality and style control options
- Batch generation capabilities
- Real-time progress tracking

### Image Editing
- AI-powered image modification
- Context-aware editing
- Style transfer capabilities
- Inpainting and outpainting tools

### Studio Interface
- Professional canvas workspace
- Comprehensive tool set
- Asset management system
- History tracking and replay

## 🔧 Configuration

### Environment Variables

```bash
# .env.local
AZURE_API_KEY=your_azure_api_key_here
```

### Model Configuration

Each model requires specific endpoint configuration:

- **Azure OpenAI Models**: Configure in `azure-config.json`
- **FLUX Models**: Configure in `azure-models.json`
- **Endpoints**: Each model needs its own endpoint URL
- **Deployments**: Model-specific deployment names

## 🚨 Troubleshooting

### Common Issues

- **Configuration Errors**: Check endpoint URLs and deployment names
- **API Key Issues**: Verify `AZURE_API_KEY` is set correctly
- **Model Availability**: Ensure models are enabled and accessible
- **Rate Limits**: Monitor API usage and implement backoff strategies

### Getting Help

- Check the [User Guide](User-Guide.md) for detailed usage instructions
- Review the [API Documentation](API-Documentation.md) for technical issues
- See our [GitHub repository](https://github.com/DrHazemAli/azure-image-studio) for updates and support

## 🤝 Contributing

This is a **community-driven project**! We welcome contributions from developers of all skill levels. This project is not affiliated with Microsoft or Azure, but rather is an independent community effort that integrates with Azure AI services.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

See our [Contributing Guidelines](https://github.com/DrHazemAli/azure-image-studio/blob/main/CONTRIBUTING.md) for more details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/DrHazemAli/azure-image-studio/blob/main/LICENSE) file for details.

## 👨‍💻 Author

**Hazem Ali** - Microsoft MVP
- GitHub: [@DrHazemAli](https://github.com/DrHazemAli)
- LinkedIn: [Hazem Ali](https://linkedin.com/in/hazemali)

## 🙏 Acknowledgments

- **Microsoft Azure AI Services** - For providing the AI infrastructure (this project is not affiliated with Microsoft)
- **OpenAI** - For the powerful AI models available through Azure
- **Next.js team** - For the amazing framework
- **Radix UI** - For accessible components
- **The open-source community** - For inspiration and contributions

---

**Ready to start creating?** Check out our [Getting Started Guide](Getting-Started.md) and begin generating amazing images with AI!

<div align="center">

**⭐ Star this repository if you find it helpful!**

Made with ❤️ by [Hazem Ali](https://github.com/DrHazemAli)

</div>
