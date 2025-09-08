# Developer Guide - Azure Image Studio

This comprehensive guide provides everything developers need to understand, contribute to, and extend Azure Image Studio.

> ⚠️ **Important**: This is a **community project** and is not affiliated with or endorsed by Microsoft or Azure. It's an independent project that uses Azure AI services.

## 🚀 Quick Start for Developers

### Prerequisites
- **Node.js 18+** installed on your system
- **Git** for version control
- **Azure subscription** with access to AI services
- **Azure OpenAI Service** account (for DALL-E 3 and GPT-Image-1 models)
- **Azure AI Foundry** access (for FLUX models)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/DrHazemAli/azure-image-studio.git
   cd azure-image-studio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   # Copy the example environment file
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Azure AI      │
│   (Next.js)     │◄──►│   (API Routes)  │◄──►│   Services      │
│                 │    │                 │    │                 │
│ • React 19      │    │ • Next.js API   │    │ • OpenAI        │
│ • TypeScript    │    │ • Azure Provider│    │ • AI Foundry    │
│ • Tailwind CSS  │    │ • Configuration │    │ • FLUX Models   │
│ • Radix UI      │    │ • Error Handling│    │ • DALL-E 3      │
│ • Fabric.js     │    │ • IndexedDB     │    │ • GPT-Image-1   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack

#### Frontend
- **Next.js 15.5.2** - React framework with App Router
- **React 19.1.0** - Latest React with concurrent features
- **TypeScript 5.0** - Type-safe development
- **Tailwind CSS 4.0** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Smooth animations and transitions
- **Fabric.js** - Advanced canvas manipulation

#### Backend
- **Azure OpenAI Service** - AI model integration
- **Azure AI Foundry** - FLUX model integration
- **RESTful API** - Clean API architecture
- **Configuration Management** - Flexible model and endpoint configuration
- **Error Handling** - Comprehensive error management

#### Data Storage
- **IndexedDB** - Client-side data storage
- **Local Storage** - Configuration and preferences
- **Project Management** - Export/import functionality
- **Migration System** - Data migration from localStorage

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── config/        # Configuration endpoint
│   │   ├── generate/      # Image generation endpoint
│   │   ├── models/        # Models endpoint
│   │   └── background-removal/ # Background removal endpoint
│   ├── config/            # Configuration files
│   │   ├── azure-config.json
│   │   ├── azure-models.json
│   │   └── app-config.json
│   ├── studio/            # Studio application
│   │   ├── page.tsx       # Studio home page
│   │   └── [projectId]/   # Dynamic project pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── studio/            # Studio-specific components
│   │   ├── canvas/        # Canvas components
│   │   │   ├── main-canvas.tsx
│   │   │   ├── canvas-viewport.tsx
│   │   │   ├── canvas-info.tsx
│   │   │   ├── file-upload-area.tsx
│   │   │   ├── layers-toggle.tsx
│   │   │   ├── resize-canvas-modal.tsx
│   │   │   └── zoom-controls.tsx
│   │   ├── tools/         # Tool components
│   │   │   ├── crop-tool.tsx
│   │   │   ├── filters-tool.tsx
│   │   │   ├── image-resize-tool.tsx
│   │   │   ├── layer-manager.tsx
│   │   │   ├── shapes-tool.tsx
│   │   │   └── text-tool.tsx
│   │   ├── panels/        # Panel components
│   │   │   ├── assets-panel.tsx
│   │   │   ├── generation-panel.tsx
│   │   │   ├── history-panel.tsx
│   │   │   ├── tool-options-panel.tsx
│   │   │   └── tools-panel.tsx
│   │   ├── image-toolbar/ # Image toolbar components
│   │   │   ├── background-removal-tool.tsx
│   │   │   ├── floating-image-toolbar.tsx
│   │   │   ├── image-tool-button.tsx
│   │   │   └── tool-effect-overlay.tsx
│   │   ├── menu-bar/      # Menu bar components
│   │   │   ├── context-menu.tsx
│   │   │   ├── file-menu.tsx
│   │   │   ├── help-menu.tsx
│   │   │   ├── insert-menu.tsx
│   │   │   ├── menu-bar.tsx
│   │   │   ├── menu-context.tsx
│   │   │   ├── tools-menu.tsx
│   │   │   └── view-menu.tsx
│   │   ├── modals/        # Modal components
│   │   │   ├── error-notification.tsx
│   │   │   ├── index.ts
│   │   │   └── size-modal.tsx
│   │   ├── canvas.tsx     # Main canvas component
│   │   ├── toolbar.tsx    # Tool selection
│   │   ├── generation-panel.tsx
│   │   ├── assets-panel.tsx
│   │   ├── history-panel.tsx
│   │   ├── enhanced-prompt-box.tsx
│   │   ├── glassy-prompt.tsx
│   │   ├── loading-indicator.tsx
│   │   ├── resize-dialog.tsx
│   │   ├── size-modal.tsx
│   │   └── context-menu.tsx
│   └── ui/                # Reusable UI components
│       ├── generation-form.tsx
│       ├── model-selector.tsx
│       ├── theme-toggle.tsx
│       ├── console-sidebar.tsx
│       └── image-result.tsx
├── hooks/                 # Custom React hooks
│   └── use-theme.ts       # Theme management
├── lib/                   # Utility libraries
│   ├── azure-provider.ts  # Azure AI integration
│   ├── indexeddb.ts       # Local storage
│   ├── migration.ts       # Data migration
│   ├── project-manager.ts # Project management
│   ├── json-colorizer.tsx # JSON formatting
│   ├── constants.ts       # Application constants
│   └── env.ts             # Environment utilities
└── types/                 # TypeScript definitions
    ├── azure.ts           # Azure-related types
    └── app-config.ts      # App configuration types
```

## 🔧 Development Workflow

### Code Organization

#### Component Structure
- **Atomic Design**: Components follow atomic design principles
- **Single Responsibility**: Each component has a single, well-defined purpose
- **Reusability**: Components are designed for reuse across the application
- **Type Safety**: All components are fully typed with TypeScript

#### File Naming Conventions
- **Components**: PascalCase (e.g., `MainCanvas.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useTheme.ts`)
- **Utilities**: camelCase (e.g., `azureProvider.ts`)
- **Types**: camelCase with `.ts` extension (e.g., `azure.ts`)

### Development Commands

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript type checking

# CLI Development
npm run cli              # Run CLI in development mode
npm run cli:build        # Build CLI
npm run cli:install      # Install CLI dependencies
npm run cli:test         # Test CLI

# Testing
npm test                 # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage
```

### Code Standards

#### TypeScript
- **Strict Mode**: All TypeScript strict checks enabled
- **Type Definitions**: All functions and components must have proper types
- **Interface Definitions**: Use interfaces for object shapes
- **Type Imports**: Use type imports for type-only imports

#### ESLint Configuration
- **Next.js Rules**: Follows Next.js recommended ESLint rules
- **TypeScript Rules**: TypeScript-specific linting rules
- **Custom Rules**: Project-specific linting rules

#### Code Formatting
- **Prettier**: Automatic code formatting
- **Consistent Style**: Consistent code style across the project
- **Import Organization**: Organized imports with proper grouping

## 🗄️ Data Management

### IndexedDB Implementation

#### Database Schema
```typescript
interface Asset {
  id: string;
  project_id: string; // Foreign key to Project
  url: string;
  name: string;
  type: 'generation' | 'edit' | 'upload';
  timestamp: Date;
  prompt?: string;
  model?: string;
}

interface HistoryEntry {
  id: string;
  project_id: string; // Foreign key to Project
  type: 'generation' | 'edit' | 'upload';
  timestamp: Date;
  prompt?: string;
  model?: string;
  settings?: Record<string, unknown>;
  imageUrl?: string;
  thumbnailUrl?: string;
  status: 'completed' | 'failed' | 'in-progress';
  error?: string;
}

interface Project {
  id: string; // UUID
  user_id: string; // Owner of the project
  name: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
  settings: {
    currentModel: string;
    currentSize: string;
    isInpaintMode: boolean;
  };
  canvas: {
    currentImage: string | null;
    generatedImage: string | null;
    attachedImage: string | null;
  };
  metadata: {
    tags?: string[];
    author?: string;
  };
}
```

#### Database Operations
- **CRUD Operations**: Create, Read, Update, Delete for all entities
- **Indexing**: Proper indexing for performance
- **Migration**: Automatic database migration system
- **Backup**: Export/import functionality for data backup

### Project Management

#### Project Structure
```typescript
interface ProjectData {
  version: string;
  name: string;
  createdAt: string;
  lastModified: string;
  settings: {
    currentModel: string;
    currentSize: string;
    isInpaintMode: boolean;
  };
  canvas: {
    currentImage: string | null;
    generatedImage: string | null;
    attachedImage: string | null;
  };
  assets: Asset[];
  history: HistoryEntry[];
  metadata: {
    description?: string;
    tags?: string[];
    author?: string;
  };
}
```

#### Project Operations
- **Create**: Create new projects with templates
- **Export**: Export projects to JSON format
- **Import**: Import projects from JSON files
- **Delete**: Delete projects and associated data
- **Version Control**: Track project versions

## 🔌 API Integration

### Azure Provider

#### AzureImageProvider Class
```typescript
class AzureImageProvider {
  constructor(config: AzureConfig, apiKey: string);
  
  // Validate configuration
  validateConfiguration(): ValidationResult;
  
  // Generate images
  generateImage(
    deploymentId: string, 
    params: GenerationParams
  ): Promise<GenerationResult>;
  
  // Edit images
  editImage(
    deploymentId: string,
    params: EditParams
  ): Promise<GenerationResult>;
  
  // Get available models
  getAvailableModels(): Model[];
  
  // Get model capabilities
  getModelCapabilities(modelId: string): Capability[];
}
```

#### API Endpoints

##### Generation Endpoint
```typescript
POST /api/generate
{
  deploymentId: string;
  prompt: string;
  size?: string;
  outputFormat?: string;
  count?: number;
  mode?: string;
  image?: string;
  mask?: string;
}
```

##### Configuration Endpoint
```typescript
GET /api/config
Response: {
  endpoints: Endpoint[];
  models: ModelSpecification[];
  tools: ToolConfiguration[];
}
```

##### Models Endpoint
```typescript
GET /api/models
Response: {
  models: ModelInfo[];
  defaultModel: string;
  defaultSize: string;
}
```

### Error Handling

#### Error Types
- **Configuration Errors**: Invalid Azure configuration
- **API Errors**: Azure service errors
- **Validation Errors**: Input validation failures
- **Network Errors**: Connection issues

#### Error Response Format
```typescript
{
  error: string;
  details?: string[];
  success: false;
  timestamp: string;
}
```

## 🎨 Canvas System

### Fabric.js Integration

#### Canvas Components
- **MainCanvas**: Core canvas with Fabric.js integration
- **CanvasViewport**: Viewport management and navigation
- **CanvasInfo**: Canvas information display
- **FileUploadArea**: Drag and drop file upload
- **LayersToggle**: Layer visibility controls
- **ResizeCanvasModal**: Canvas resizing interface
- **ToolOptionsPanel**: Tool-specific options
- **ZoomControls**: Zoom functionality

#### Canvas Operations
- **Object Management**: Add, remove, modify canvas objects
- **Layer Management**: Manage object layers
- **Transform Operations**: Move, resize, rotate objects
- **Selection**: Multi-object selection and manipulation
- **History**: Undo/redo functionality

### Tool System

#### Available Tools
- **CropTool**: Image cropping functionality
- **FiltersTool**: Image filters and effects
- **ImageResizeTool**: Image resizing
- **LayerManager**: Layer management
- **ShapesTool**: Geometric shape creation
- **TextTool**: Text addition and editing
- **ToolsPanel**: Tool selection interface

#### Tool Architecture
```typescript
interface Tool {
  id: string;
  name: string;
  icon: string;
  shortcut: string;
  component: React.ComponentType;
  options?: ToolOptions;
}
```

## 🧪 Testing

### Testing Strategy

#### Unit Tests
- **Component Tests**: Test individual components
- **Utility Tests**: Test utility functions
- **Hook Tests**: Test custom React hooks
- **API Tests**: Test API endpoints

#### Integration Tests
- **Canvas Tests**: Test canvas functionality
- **Database Tests**: Test IndexedDB operations
- **API Integration Tests**: Test Azure API integration

#### End-to-End Tests
- **User Workflows**: Test complete user workflows
- **Generation Tests**: Test image generation flows
- **Project Tests**: Test project management

### Testing Tools
- **Jest**: JavaScript testing framework
- **React Testing Library**: React component testing
- **Playwright**: End-to-end testing
- **MSW**: API mocking

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- canvas.test.tsx

# Run E2E tests
npm run test:e2e
```

## 🚀 Deployment

### Build Process

#### Production Build
```bash
# Build the application
npm run build

# Start production server
npm run start
```

#### Build Optimization
- **Code Splitting**: Automatic code splitting with Next.js
- **Image Optimization**: Next.js image optimization
- **Bundle Analysis**: Bundle size analysis
- **Performance Monitoring**: Performance metrics

### Azure Deployment

#### Azure Static Web Apps
```yaml
# azure-static-web-apps.yml
name: Azure Static Web Apps CI/CD

on:
  push:
    branches:
      - main
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches:
      - main

jobs:
  build_and_deploy_job:
    if: github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.action != 'closed')
    runs-on: ubuntu-latest
    name: Build and Deploy Job
    steps:
      - uses: actions/checkout@v2
        with:
          submodules: true
      - name: Build And Deploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/"
          api_location: ""
          output_location: "out"
```

#### Environment Configuration
```bash
# Production environment variables
AZURE_API_KEY=your_production_api_key
NEXT_PUBLIC_APP_URL=https://your-app.azurestaticapps.net
```

## 🔧 CLI Development

### CLI Architecture

#### Command Structure
```typescript
interface Command {
  name: string;
  description: string;
  options: Option[];
  action: (args: any) => Promise<void>;
}
```

#### Available Commands
- **config**: Configuration management
- **generate**: Image generation
- **models**: Model management
- **assets**: Asset management
- **project**: Project management
- **dev**: Development tools

### CLI Development Setup
```bash
# Navigate to CLI directory
cd cli

# Install dependencies
npm install

# Build CLI
npm run build

# Run in development mode
npm run dev

# Test CLI
npm test
```

## 📊 Performance Optimization

### Frontend Optimization

#### Code Splitting
- **Route-based Splitting**: Split code by routes
- **Component Splitting**: Lazy load components
- **Library Splitting**: Split vendor libraries

#### Image Optimization
- **Next.js Image**: Automatic image optimization
- **Lazy Loading**: Lazy load images
- **Format Selection**: Choose optimal image formats
- **Compression**: Automatic image compression

#### Caching Strategy
- **Browser Caching**: Cache static assets
- **API Caching**: Cache API responses
- **IndexedDB Caching**: Cache application data

### Backend Optimization

#### API Optimization
- **Request Batching**: Batch multiple requests
- **Response Compression**: Compress API responses
- **Connection Pooling**: Reuse connections
- **Rate Limiting**: Implement rate limiting

#### Database Optimization
- **Indexing**: Proper database indexing
- **Query Optimization**: Optimize database queries
- **Connection Management**: Efficient connection management

## 🔒 Security

### Security Measures

#### API Security
- **API Key Management**: Secure API key storage
- **Input Validation**: Validate all inputs
- **Rate Limiting**: Prevent abuse
- **CORS Configuration**: Proper CORS setup

#### Client Security
- **XSS Prevention**: Prevent cross-site scripting
- **CSRF Protection**: Cross-site request forgery protection
- **Content Security Policy**: CSP headers
- **Secure Headers**: Security headers

### Data Protection

#### Data Encryption
- **In Transit**: HTTPS for all communications
- **At Rest**: Encrypt sensitive data
- **API Keys**: Secure API key storage

#### Privacy
- **Data Minimization**: Collect only necessary data
- **User Consent**: Obtain user consent
- **Data Retention**: Implement data retention policies

## 🤝 Contributing

### Development Guidelines

#### Code Standards
- **TypeScript**: Use TypeScript for all new code
- **ESLint**: Follow the project's ESLint configuration
- **Prettier**: Use Prettier for code formatting
- **Naming**: Use descriptive variable and function names
- **Comments**: Add comments for complex logic

#### Commit Messages
```bash
# Good examples
feat: add support for FLUX 1.1 Pro model
fix: resolve canvas zoom issue on mobile
docs: update API documentation
style: improve button hover animations
refactor: simplify Azure provider configuration

# Bad examples
fix stuff
update
changes
```

#### Pull Request Process
1. **Create a Pull Request**
   - Use a descriptive title
   - Reference any related issues
   - Provide a clear description of changes

2. **Ensure Quality**
   - All tests pass
   - Code follows project style guidelines
   - Documentation is updated if needed
   - No console errors or warnings

3. **Request Review**
   - Request review from maintainers
   - Address feedback promptly
   - Keep the PR focused and manageable

### Areas for Contribution

#### High Priority
- **Bug Fixes**: Fix reported issues
- **Performance**: Optimize image generation and rendering
- **Accessibility**: Improve accessibility features
- **Mobile**: Enhance mobile experience
- **Documentation**: Improve and expand documentation

#### Feature Development
- **New AI Models**: Add support for additional models
- **Advanced Tools**: Implement new editing tools
- **Collaboration**: Add real-time collaboration features
- **Export Options**: Add more export formats
- **Templates**: Create image templates and presets

## 📚 Additional Resources

### Documentation
- [Architecture Guide](architecture.md) - System design overview
- [API Documentation](api-documentation.md) - Technical API reference
- [Database Guide](database-guide.md) - Data storage and management
- [CLI Documentation](cli-documentation.md) - Command-line interface
- [Deployment Guide](deployment.md) - Azure deployment instructions

### External Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Azure OpenAI Documentation](https://docs.microsoft.com/en-us/azure/cognitive-services/openai/)
- [Fabric.js Documentation](http://fabricjs.com/docs)

### Community
- [GitHub Repository](https://github.com/DrHazemAli/azure-image-studio)
- [GitHub Issues](https://github.com/DrHazemAli/azure-image-studio/issues)
- [GitHub Discussions](https://github.com/DrHazemAli/azure-image-studio/discussions)

---

## 🧭 Navigation

<div align="center">

[← Back: Tools Reference](tools-reference.md) | [Next: Architecture Guide →](architecture.md)

</div>

---

This guide provides comprehensive information for developers working with Azure Image Studio. For more specific information, refer to the individual guides for each component.

Happy coding! 🚀
