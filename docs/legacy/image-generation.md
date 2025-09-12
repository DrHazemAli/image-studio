# Image Generation Guide - Image Studio

This comprehensive guide covers AI-powered image generation capabilities in Image Studio.

> ⚠️ **Important**: This is a **community project** and is not affiliated with or endorsed by Microsoft or Azure. It's an independent project that uses Azure AI services.

**Last Updated**: September 8, 2025  
**Version**: 1.0.3

## 🎨 Overview

Image Studio provides powerful AI-driven image generation capabilities through multiple Azure AI services. This guide covers everything from basic text-to-image generation to advanced techniques and best practices.

## 🤖 Supported AI Models

### DALL-E 3 (Azure OpenAI)

**Provider**: Azure OpenAI  
**API Version**: 2024-10-21  
**Best For**: Creative, artistic images with precise instruction following

#### Capabilities

- **Text-to-Image**: Generate images from natural language descriptions
- **Style Control**: Natural and vivid style options
- **Quality Levels**: Standard and HD quality options
- **Content Filtering**: Built-in safety and content filtering

#### Supported Sizes

- `1024x1024` - Square (1:1) - Standard size
- `1024x768` - Standard (4:3) - Default size

#### Parameters

```typescript
{
  prompt: string; // Image description (max 4000 characters)
  size: "1024x1024" | "1024x768";
  style: "natural" | "vivid";
  quality: "standard" | "hd";
  n: 1; // Number of images (1 only)
}
```

#### Example Usage

```javascript
{
  deploymentId: "dalle-3",
  prompt: "A photorealistic portrait of a golden retriever sitting in a sunny garden, soft lighting, shallow depth of field",
  size: "1024x1024",
  style: "vivid",
  quality: "hd"
}
```

### FLUX 1.1 Pro (Azure AI Foundry)

**Provider**: Black Forest Labs via Azure AI Foundry  
**API Version**: 2024-12-01  
**Best For**: High-quality photorealistic images

#### Capabilities

- **Text-to-Image**: Advanced photorealistic generation
- **High Resolution**: Support for ultra-high resolutions
- **Fast Generation**: Optimized for speed
- **Photorealistic**: Excellent for realistic photography

#### Supported Sizes

- `1024x1024` - Square (1:1) - Standard resolution
- `1024x768` - Standard (4:3) - Default size
- `768x1024` - Portrait (3:4) - Vertical format
- `1536x1024` - Landscape (3:2) - Wide format
- `1024x1536` - Tall (2:3) - Portrait format
- `1440x1440` - Large Square - High resolution
- `2752x1536` - Ultra Landscape (16:9) - Ultra HD landscape
- `2048x2048` - Ultra Square (1:1) - Ultra HD square

#### Parameters

```typescript
{
  prompt: string; // Image description (max 5000 tokens)
  size: string; // Any supported size
  n: 1; // Number of images (1 only)
}
```

#### Example Usage

```javascript
{
  deploymentId: "flux-1-1-pro",
  prompt: "A futuristic cityscape at night with neon lights reflecting on wet streets, cyberpunk aesthetic, high contrast lighting",
  size: "2048x2048"
}
```

### FLUX 1 Kontext Pro (Azure AI Foundry)

**Provider**: Black Forest Labs via Azure AI Foundry  
**API Version**: 2024-12-01  
**Best For**: Context-aware generation and image editing

#### Capabilities

- **Text-to-Image**: Context-aware generation
- **Image-to-Image**: Transform existing images
- **Context-Aware Editing**: Smart editing based on image content
- **Style Transfer**: Apply artistic styles to images

#### Supported Sizes

- Same as FLUX 1.1 Pro

#### Parameters

```typescript
{
  prompt: string;           // Image description (max 5000 tokens)
  image?: string;           // Base64 encoded image (for image-to-image)
  size: string;             // Any supported size
  n: 1;                     // Number of images (1 only)
}
```

#### Example Usage

```javascript
{
  deploymentId: "flux-1-kontext-pro",
  prompt: "Transform this image into a watercolor painting with soft, flowing brushstrokes",
  image: "data:image/jpeg;base64,/9j/4AAQ...",
  size: "1024x1024"
}
```

### GPT-Image-1 (Azure OpenAI)

**Provider**: Azure OpenAI  
**API Version**: 2025-04-01-preview  
**Best For**: Advanced features including editing and inpainting

#### Capabilities

- **Text-to-Image**: Enhanced image generation
- **Image Editing**: Modify existing images
- **Inpainting**: Fill in selected areas
- **Outpainting**: Extend images beyond borders
- **Batch Generation**: Generate multiple images (up to 10)

#### Supported Sizes

- `1024x1024` - Square (1:1) - Fastest generation
- `1024x1536` - Portrait (2:3) - Vertical orientation
- `1536x1024` - Landscape (3:2) - Horizontal orientation

#### Parameters

```typescript
{
  prompt: string;           // Image description
  image?: string;           // Base64 encoded image (for editing)
  mask?: string;            // Base64 encoded mask (for inpainting)
  size: string;             // Any supported size
  quality: "low" | "medium" | "high";
  n: number;                // Number of images (max 10)
}
```

#### Example Usage

```javascript
{
  deploymentId: "gpt-image-1",
  prompt: "Add a rainbow to this landscape",
  image: "data:image/jpeg;base64,/9j/4AAQ...",
  size: "1024x1024",
  quality: "high",
  n: 1
}
```

### Florence 2.0 (Microsoft Azure)

**Provider**: Microsoft Azure  
**API Version**: 2024-12-01  
**Best For**: Vision-language tasks and image understanding

#### Capabilities

- **Text-to-Image**: Vision-language model generation
- **Image Editing**: Context-aware editing
- **Inpainting**: Fill in image areas
- **Image Understanding**: Advanced image analysis

#### Supported Sizes

- `1024x1024` - Square (1:1) - Standard size
- `1024x768` - Standard (4:3) - Default size

#### Parameters

```typescript
{
  prompt: string;           // Image description
  image?: string;           // Base64 encoded image (for editing)
  size: string;             // Any supported size
  n: 1;                     // Number of images (1 only)
}
```

#### Example Usage

```javascript
{
  deploymentId: "florence-2",
  prompt: "Enhance the colors in this image and add dramatic lighting",
  image: "data:image/jpeg;base64,/9j/4AAQ...",
  size: "1024x1024"
}
```

## 📝 Prompt Writing Best Practices

### Effective Prompt Structure

#### Basic Structure

```
[Subject] + [Action/Description] + [Style/Quality] + [Technical Details]
```

#### Example Breakdown

```
"A photorealistic portrait of a golden retriever sitting in a sunny garden, soft lighting, shallow depth of field"
│                    │                    │                    │
│                    │                    │                    └─ Technical Details
│                    │                    └─ Style/Quality
│                    └─ Action/Description
└─ Subject
```

### Prompt Writing Techniques

#### 1. Be Specific

- **Good**: "A cat sitting on a windowsill"
- **Better**: "A fluffy orange tabby cat sitting on a wooden windowsill, looking out at a garden"

#### 2. Include Details

- **Composition**: "close-up", "wide shot", "bird's eye view"
- **Lighting**: "golden hour", "soft lighting", "dramatic shadows"
- **Style**: "photorealistic", "watercolor", "oil painting"
- **Quality**: "high resolution", "detailed", "professional"

#### 3. Use Descriptive Adjectives

- **Colors**: "vibrant", "muted", "pastel", "bold"
- **Textures**: "smooth", "rough", "glossy", "matte"
- **Mood**: "serene", "dramatic", "playful", "mysterious"

#### 4. Include Technical Terms

- **Camera**: "85mm lens", "macro photography", "wide angle"
- **Photography**: "shallow depth of field", "bokeh", "long exposure"
- **Art**: "impressionist", "surrealist", "minimalist"

### Prompt Examples by Category

#### Portraits

```
"A professional headshot of a confident businesswoman in a navy blazer, studio lighting, clean background, high resolution"
"A candid portrait of an elderly man with a weathered face, natural lighting, black and white photography, emotional depth"
"A fantasy portrait of an elven warrior with silver hair and glowing blue eyes, magical atmosphere, digital art style"
```

#### Landscapes

```
"A serene mountain lake at sunrise, mist rising from the water, golden light, peaceful atmosphere, high resolution"
"A dramatic storm over a vast desert, lightning illuminating sand dunes, dark clouds, cinematic lighting"
"A cozy cabin in a snowy forest, warm light from windows, falling snow, winter wonderland, detailed"
```

#### Architecture

```
"A modern glass skyscraper reflecting the sunset, urban skyline, golden hour lighting, architectural photography"
"A medieval castle on a hilltop, stone walls and towers, dramatic clouds, fantasy atmosphere, detailed"
"A minimalist Japanese house with clean lines, zen garden, natural materials, peaceful composition"
```

#### Abstract Art

```
"Flowing abstract shapes in vibrant colors, organic forms, dynamic composition, contemporary art style"
"Geometric patterns with metallic textures, futuristic design, clean lines, modern aesthetic"
"Explosion of colors and light, energetic movement, abstract expressionism, emotional intensity"
```

## 🎯 Model Selection Guide

### Choose the Right Model

#### For Creative/Artistic Images

- **DALL-E 3**: Best for creative, artistic images with precise instruction following
- **Style Options**: Natural and vivid styles available
- **Quality**: Excellent for detailed, high-quality artwork

#### For Photorealistic Images

- **FLUX 1.1 Pro**: Excellent for photorealistic images
- **High Resolution**: Support for ultra-high resolutions
- **Speed**: Fast generation times

#### For Image Editing

- **FLUX 1 Kontext Pro**: Ideal for image editing and modifications
- **Context-Aware**: Understands image content for better editing
- **Style Transfer**: Apply artistic styles to existing images

#### For Advanced Features

- **GPT-Image-1**: Advanced features like inpainting and outpainting
- **Batch Generation**: Generate multiple images simultaneously
- **Editing Capabilities**: Comprehensive image editing features

#### For Vision-Language Tasks

- **Florence 2.0**: Advanced image understanding and generation
- **Context-Aware**: Better understanding of image content
- **Editing**: Smart editing based on image analysis

## ⚙️ Generation Parameters

### Size Selection

#### Square Formats (1:1)

- **1024x1024**: Standard square, good for social media
- **1440x1440**: Large square, high resolution
- **2048x2048**: Ultra HD square, maximum quality

#### Portrait Formats (Vertical)

- **768x1024**: Portrait (3:4), good for mobile
- **1024x1536**: Tall (2:3), standard portrait
- **1024x1792**: Extra tall, for banners

#### Landscape Formats (Horizontal)

- **1024x768**: Standard (4:3), classic landscape
- **1536x1024**: Landscape (3:2), wide format
- **1792x1024**: Extra wide, for panoramas
- **2752x1536**: Ultra landscape (16:9), cinematic

### Quality Settings

#### DALL-E 3

- **Standard**: Good quality, faster generation
- **HD**: High quality, slower generation

#### GPT-Image-1

- **Low**: Fast generation, lower quality
- **Medium**: Balanced quality and speed
- **High**: Best quality, slower generation

### Style Options

#### DALL-E 3 Styles

- **Natural**: More realistic, subtle effects
- **Vivid**: More artistic, enhanced colors

## 🚀 Advanced Techniques

### Batch Generation

#### Multiple Variations

```javascript
// Generate multiple variations of the same prompt
const variations = [
  "A sunset over mountains, warm colors",
  "A sunset over mountains, cool colors",
  "A sunset over mountains, dramatic lighting",
  "A sunset over mountains, peaceful atmosphere",
];

for (const prompt of variations) {
  await generateImage(prompt);
}
```

#### Parameter Variations

```javascript
// Generate with different parameters
const sizes = ["1024x1024", "1024x768", "1536x1024"];
const styles = ["natural", "vivid"];

for (const size of sizes) {
  for (const style of styles) {
    await generateImage({
      prompt: "A beautiful landscape",
      size: size,
      style: style,
    });
  }
}
```

### Prompt Engineering

#### Iterative Refinement

1. **Start Simple**: Begin with a basic prompt
2. **Add Details**: Gradually add more specific details
3. **Test Variations**: Try different phrasings
4. **Refine Results**: Adjust based on output quality

#### Negative Prompts

Some models support negative prompts to avoid unwanted elements:

```javascript
{
  prompt: "A beautiful landscape",
  negativePrompt: "blurry, low quality, distorted"
}
```

### Seed Values

For reproducible results, use seed values:

```javascript
{
  prompt: "A beautiful landscape",
  seed: 12345  // Same seed will produce similar results
}
```

## 📊 Performance Optimization

### Generation Speed

#### Model Selection

- **FLUX 1.1 Pro**: Fastest generation
- **DALL-E 3**: Moderate speed
- **GPT-Image-1**: Slower but more features

#### Size Impact

- **Smaller Sizes**: Faster generation
- **Larger Sizes**: Slower but higher quality

#### Quality Impact

- **Standard Quality**: Faster generation
- **HD Quality**: Slower but better results

### Cost Optimization

#### Batch Processing

- Group similar requests together
- Use appropriate model for each use case
- Avoid unnecessary high-quality settings

#### Caching

- Save frequently used generations
- Reuse similar prompts with variations
- Store results for future reference

## 🔧 Troubleshooting

### Common Issues

#### Generation Failures

- **Check Prompt**: Ensure prompt is clear and appropriate
- **Verify Model**: Confirm model is available and configured
- **Check Limits**: Ensure you haven't exceeded rate limits
- **Try Different Model**: Switch to an alternative model

#### Quality Issues

- **Improve Prompt**: Add more specific details
- **Adjust Quality**: Try higher quality settings
- **Change Size**: Experiment with different sizes
- **Use Different Model**: Try a model better suited for your use case

#### Performance Issues

- **Reduce Size**: Use smaller image dimensions
- **Lower Quality**: Use standard quality for faster generation
- **Batch Requests**: Group similar requests together
- **Check Network**: Ensure stable internet connection

### Error Messages

#### "Model not available"

- Check if the model is enabled in configuration
- Verify the deployment exists in Azure
- Ensure you have access to the required Azure service

#### "Rate limit exceeded"

- Wait before making more requests
- Implement exponential backoff
- Consider using different models

#### "Invalid prompt"

- Check prompt length and content
- Ensure prompt follows guidelines
- Try a simpler prompt first

## 📚 Additional Resources

### Documentation

- [User Guide](user-guide.md) - Complete user manual
- [API Documentation](api-documentation.md) - Technical reference
- [Architecture Guide](architecture.md) - System design
- [Developer Guide](developer-guide.md) - Development setup

### External Resources

- [Azure OpenAI Documentation](https://docs.microsoft.com/en-us/azure/cognitive-services/openai/)
- [Azure AI Foundry Documentation](https://docs.microsoft.com/en-us/azure/ai-services/ai-foundry/)
- [Prompt Engineering Guide](https://platform.openai.com/docs/guides/prompt-engineering)

---

## 🧭 Navigation

<div align="center">

[← Back: User Guide](user-guide.md) | [Next: Tools Reference →](tools-reference.md)

</div>

---

This guide provides comprehensive information about image generation in Image Studio. For more specific information, refer to the individual guides for each component.
