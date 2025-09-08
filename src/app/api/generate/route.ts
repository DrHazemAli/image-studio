import { NextRequest, NextResponse } from 'next/server';
import { AzureImageProvider } from '@/lib/azure-provider';
import { AzureConfig } from '@/types/azure';
import azureConfigData from '@/app/config/azure-config.json';
import { replaceEnvTags } from '@/lib/env';
export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.AZURE_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Azure API key not configured' },
        { status: 500 }
      );
    }

    const { deploymentId, prompt, size, outputFormat, count, mode, image, mask } = await request.json();

    if (!deploymentId || !prompt) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Validate image editing mode requirements
    if (mode === 'edit' && !image) {
      return NextResponse.json(
        { error: 'Image is required for editing mode' },
        { status: 400 }
      );
    }

    const config = azureConfigData as AzureConfig;
    // loop to endpoints and replace the baseurl with the env tag
    config.endpoints.forEach(endpoint => {
      endpoint.baseUrl = replaceEnvTags(endpoint.baseUrl);
    });
    const provider = new AzureImageProvider(config, apiKey);
    
    const validation = provider.validateConfiguration();
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Invalid Azure configuration', details: validation.errors },
        { status: 500 }
      );
    }

    let result;
    
    if (mode === 'edit') {
      // Use image editing for inpainting mode
      result = await provider.editImage(
        deploymentId,
        {
          prompt,
          image,
          mask,
          output_format: outputFormat || 'png',
          n: count || 1,
          size: size || '1024x1024'
        }
      );
    } else {
      // Use regular text-to-image generation
      result = await provider.generateImage(
        deploymentId,
        {
          prompt,
          output_format: outputFormat || 'png',
          n: count || 1,
          size: size || '1024x1024'
        }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.response,
      requestLog: result.requestLog,
      responseLog: result.responseLog
    });

  } catch (error) {
    console.error('Image generation error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
      },
      { status: 500 }
    );
  }
}