# API Documentation

**Last Updated**: September 8, 2025  

This document provides comprehensive API documentation for Azure GenAI Image Studio.

## Table of Contents

1. [API Overview](#api-overview)
2. [Authentication](#authentication)
3. [Endpoints](#endpoints)
4. [Error Handling](#error-handling)
5. [Examples](#examples)

## API Overview

The Azure GenAI Image Studio API provides programmatic access to AI-powered image generation and editing capabilities through RESTful endpoints.

### Key Features

- **Image Generation**: Create images from text prompts using various AI models
- **Image Editing**: Modify and enhance existing images
- **Model Management**: Access information about available AI models
- **Configuration**: Manage application settings and preferences

## Authentication

### API Key Authentication

All API requests require authentication using Azure API keys.

#### Headers

```http
Authorization: Bearer YOUR_AZURE_API_KEY
Content-Type: application/json
```

#### Environment Variables

```bash
AZURE_API_KEY=your_azure_api_key_here
AZURE_API_BASE_URL=https://your-resource.openai.azure.com
```

## Endpoints

### Base URL

```
Production: https://your-app.vercel.app/api
Development: http://localhost:3000/api
```

### Image Generation

#### POST /api/generate

Creates a new image from a text prompt.

**Request Body:**

```json
{
  "prompt": "A beautiful sunset over mountains",
  "model": "dall-e-3",
  "size": "1024x1024",
  "quality": "standard"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "images": [
      {
        "url": "https://example.com/generated-image.png",
        "metadata": {
          "model": "dall-e-3",
          "size": "1024x1024",
          "generated_at": "2025-09-08T10:30:00Z"
        }
      }
    ]
  }
}
```

### Configuration

#### GET /api/config

Retrieves current application configuration.

**Response:**

```json
{
  "success": true,
  "data": {
    "azure": {
      "apiKey": "***",
      "baseUrl": "https://your-resource.openai.azure.com"
    },
    "app": {
      "version": "1.0.2",
      "features": ["image_generation", "image_editing"]
    }
  }
}
```

### Models

#### GET /api/models

Retrieves information about available AI models.

**Response:**

```json
{
  "success": true,
  "data": {
    "models": [
      {
        "id": "dall-e-3",
        "name": "DALL-E 3",
        "capabilities": ["generate", "edit"],
        "supportedSizes": ["1024x1024", "1792x1024", "1024x1792"]
      }
    ]
  }
}
```

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

### Common Error Codes

- `INVALID_PROMPT` - Prompt is empty or inappropriate
- `INVALID_MODEL` - Specified model not available
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `AUTHENTICATION_FAILED` - Invalid API key

## Examples

### Basic Image Generation

```javascript
const response = await fetch("/api/generate", {
  method: "POST",
  headers: {
    Authorization: "Bearer YOUR_API_KEY",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    prompt: "A futuristic city at night",
    model: "dall-e-3",
    size: "1024x1024",
  }),
});

const result = await response.json();
if (result.success) {
  console.log("Generated image:", result.data.images[0].url);
}
```

### cURL Example

```bash
curl -X POST https://your-app.vercel.app/api/generate \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A beautiful landscape",
    "model": "dall-e-3",
    "size": "1024x1024"
  }'
```

---

[← Back: Architecture Guide](architecture.md) | [Next: Database Guide →](database-guide.md)
