# API Documentation - Azure Image Studio

This document provides comprehensive technical documentation for the Azure Image Studio API and Azure AI service integration.

> ⚠️ **Important**: This is a **community project** and is not affiliated with or endorsed by Microsoft or Azure. It's an independent project that uses Azure AI services.

## 🔗 API Overview

Azure Image Studio is a community-developed platform that integrates with multiple Azure AI services to provide image generation and editing capabilities. This independent project uses a flexible configuration system to support various AI models and endpoints.

**Note**: This is not an official Microsoft or Azure product, but rather a community project that utilizes Azure's AI services.

## 🏗️ Architecture

### API Structure

```
Frontend (Next.js) → API Routes → Azure Provider → Azure AI Services
```

### Core Components

- **API Routes**: Next.js API routes handling requests
- **Azure Provider**: Service layer for Azure AI integration
- **Configuration System**: Flexible model and endpoint management
- **Type System**: TypeScript definitions for type safety

## 📡 API Endpoints

### Image Generation

**Endpoint**: `POST /api/generate`

**Description**: Generate images using Azure AI models

**Request Body**:
```typescript
{
  deploymentId: string;        // Model deployment ID
  prompt: string;              // Image description
  size?: string;               // Image size (default: "1024x1024")
  outputFormat?: string;       // Output format (default: "png")
  count?: number;              // Number of images (default: 1)
  style?: string;              // Style option (for supported models)
  quality?: string;            // Quality level
  seed?: number;               // Random seed for reproducibility
  negativePrompt?: string;     // Negative prompt (for supported models)
  mode?: string;               // Generation mode: "generate" or "edit"
  image?: string;              // Base64 image (for edit mode)
  mask?: string;               // Base64 mask (for inpainting)
}
```

**Response**:
```typescript
{
  success: boolean;
  data: {
    created: number;
    data: Array<{
      b64_json: string;
      url?: string;
      revised_prompt?: string;
    }>;
  };
  requestLog: object;          // API request details
  responseLog: object;         // API response details
}
```

**Example Request**:
```javascript
const response = await fetch('/api/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    deploymentId: 'dalle-3',
    prompt: 'A beautiful sunset over mountains',
    size: '1024x1024',
    outputFormat: 'png',
    count: 1
  })
});
```

### Configuration

**Endpoint**: `GET /api/config`

**Description**: Get current Azure configuration and available models

**Response**:
```typescript
{
  endpoints: Array<{
    id: string;
    name: string;
    baseUrl: string;
    apiVersion: string;
    deployments: Array<{
      id: string;
      name: string;
      deploymentName: string;
      maxSize: string;
      supportedFormats: string[];
      description: string;
    }>;
  }>;
  models: object;              // Detailed model specifications
}
```

### Models

**Endpoint**: `GET /api/models`

**Description**: Get available models and their capabilities

**Response**:
```typescript
{
  models: Array<{
    id: string;
    name: string;
    description: string;
    provider: string;
    capabilities: string[];
    supportedSizes: Array<{
      size: string;
      label: string;
      aspect: string;
      description: string;
    }>;
    supportedFormats: string[];
    qualityLevels?: string[];
    styleOptions?: string[];
    maxImages: number;
    requiresApproval: boolean;
    enabled: boolean;
  }>;
  defaultModel: string;
  defaultSize: string;
}
```

## 🔧 Azure Provider

### AzureImageProvider Class

The core service class for Azure AI integration:

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

### Configuration Validation

```typescript
interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
```

### Generation Parameters

```typescript
interface GenerationParams {
  prompt: string;
  output_format: string;
  n: number;
  size: string;
  style?: string;
  quality?: string;
  seed?: number;
  negative_prompt?: string;
}
```

### Edit Parameters

```typescript
interface EditParams {
  prompt: string;
  image: string; // Base64 encoded image
  mask?: string; // Base64 encoded mask (optional)
  output_format?: string;
  n?: number;
  size?: string;
}
```

## 🤖 Supported Models

### DALL-E 3 (Azure OpenAI)

**Provider**: Azure OpenAI  
**API Version**: 2024-10-21  
**Capabilities**: Text-to-image

**Parameters**:
- `prompt`: Image description (max 4000 characters)
- `size`: "1024x1024", "1792x1024", "1024x1792"
- `style`: "natural", "vivid"
- `quality`: "standard", "hd"
- `n`: Number of images (1 only)

**Example**:
```javascript
{
  deploymentId: "dalle-3",
  prompt: "A photorealistic portrait of a cat",
  size: "1024x1024",
  style: "vivid",
  quality: "hd"
}
```

### FLUX 1.1 Pro (Azure AI Foundry)

**Provider**: Black Forest Labs via Azure AI Foundry  
**API Version**: 2024-12-01  
**Capabilities**: Text-to-image

**Parameters**:
- `prompt`: Image description (max 5000 tokens)
- `size`: "512x512", "768x768", "1024x1024", "1024x1792", "1792x1024"
- `n`: Number of images (1 only)

**Example**:
```javascript
{
  deploymentId: "flux-1-1-pro",
  prompt: "A futuristic cityscape at night",
  size: "1024x1024"
}
```

### FLUX 1 Kontext Pro (Azure AI Foundry)

**Provider**: Black Forest Labs via Azure AI Foundry  
**API Version**: 2024-12-01  
**Capabilities**: Text-to-image, Image-to-image, Context-aware editing

**Parameters**:
- `prompt`: Image description (max 5000 tokens)
- `image`: Base64 encoded image (for image-to-image)
- `size`: "512x512", "768x768", "1024x1024", "1024x1792", "1792x1024"
- `n`: Number of images (1 only)

**Example**:
```javascript
{
  deploymentId: "flux-1-kontext-pro",
  prompt: "Transform this image into a watercolor painting",
  image: "data:image/jpeg;base64,/9j/4AAQ...",
  size: "1024x1024"
}
```

### GPT-Image-1 (Azure OpenAI)

**Provider**: Azure OpenAI  
**API Version**: 2025-04-01-preview  
**Capabilities**: Text-to-image, Image editing, Inpainting, Outpainting

**Parameters**:
- `prompt`: Image description
- `image`: Base64 encoded image (for editing)
- `mask`: Base64 encoded mask (for inpainting)
- `size`: "1024x1024", "1024x1536", "1536x1024"
- `quality`: "low", "medium", "high"
- `n`: Number of images (max 10)

**Example**:
```javascript
{
  deploymentId: "gpt-image-1",
  prompt: "Add a rainbow to this landscape",
  image: "data:image/jpeg;base64,/9j/4AAQ...",
  size: "1024x1024",
  quality: "high"
}
```

## ⚙️ Configuration System

### Azure Configuration (`azure-config.json`)

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

### Model Configuration (`azure-models.json`)

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

## 🔐 Authentication

### API Key Configuration

Set the Azure API key in your environment:

```bash
# .env.local
AZURE_API_KEY=your_azure_api_key_here
```

### Required Permissions

Your Azure API key needs the following permissions:
- **Cognitive Services User** role for Azure OpenAI
- **AI Foundry User** role for FLUX models
- Access to specific model deployments

## 📊 Error Handling

### Common Error Responses

**Invalid Configuration**:
```json
{
  "error": "Invalid Azure configuration",
  "details": ["Missing deployment configuration", "Invalid endpoint URL"],
  "success": false
}
```

**Missing Parameters**:
```json
{
  "error": "Missing required parameters",
  "success": false
}
```

**API Key Not Configured**:
```json
{
  "error": "Azure API key not configured",
  "success": false
}
```

**Model Not Available**:
```json
{
  "error": "Model not available",
  "details": "Model requires approval or is not enabled",
  "success": false
}
```

### Error Codes

| Code | Description | Solution |
|------|-------------|----------|
| 400 | Bad Request | Check request parameters |
| 401 | Unauthorized | Verify API key configuration |
| 403 | Forbidden | Check model permissions |
| 404 | Not Found | Verify deployment exists |
| 429 | Rate Limited | Wait and retry |
| 500 | Server Error | Check Azure service status |

## 🚀 Usage Examples

### Basic Image Generation

```javascript
// Generate a simple image
const generateImage = async (prompt) => {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      deploymentId: 'dalle-3',
      prompt: prompt,
      size: '1024x1024'
    })
  });
  
  const result = await response.json();
  return result.data.data[0].b64_json;
};
```

### Image Editing

```javascript
// Edit an existing image
const editImage = async (imageData, prompt) => {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      deploymentId: 'flux-1-kontext-pro',
      prompt: prompt,
      image: imageData,
      size: '1024x1024',
      mode: 'edit'
    })
  });
  
  const result = await response.json();
  return result.data.data[0].b64_json;
};
```

### Batch Generation

```javascript
// Generate multiple images
const generateBatch = async (prompt, count) => {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      deploymentId: 'flux-1-1-pro',
      prompt: prompt,
      count: count,
      size: '1024x1024'
    })
  });
  
  const result = await response.json();
  return result.data.data.map(item => item.b64_json);
};
```

## 📈 Rate Limits

### Azure OpenAI
- **DALL-E 3**: 5 requests per minute
- **GPT-Image-1**: 10 requests per minute

### Azure AI Foundry
- **FLUX Models**: 20 requests per minute

### Best Practices
- Implement exponential backoff for retries
- Cache results when possible
- Monitor usage through Azure portal
- Use appropriate model for your use case

## 🔍 Monitoring and Logging

### Request Logging

All API requests are logged with:
- Request parameters
- Response data
- Processing time
- Error details

### Console Output

The studio interface provides real-time console output showing:
- API request details
- Response data
- Error messages
- Performance metrics

## 🛠️ Development

### Local Development

1. Set up environment variables
2. Configure Azure endpoints
3. Start development server: `npm run dev`
4. Test API endpoints at `http://localhost:3000/api`

### Testing

```bash
# Run API tests
npm run test:api

# Test specific endpoint
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"deploymentId":"dalle-3","prompt":"test image"}'
```

---

For more information, see:
- [Getting Started](Getting-Started.md)
- [User Guide](User-Guide.md)
- [Architecture Guide](Architecture.md)