import { NextRequest, NextResponse } from 'next/server';
import { AzureImageProvider } from '@/lib/azure-provider';
import { AzureConfig } from '@/types/azure';
import azureConfigData from '@/app/config/azure-config.json';
import { replaceEnvTags } from '@/lib/env';
import { AZURE_CONFIG_OBJECT_KEY } from '@/lib/constants';
export async function POST(request: NextRequest) {
  try {

    // Check API Key in cookies
    const cookieConfig = request.cookies.get(AZURE_CONFIG_OBJECT_KEY)?.value;

    if (!cookieConfig) {
      return NextResponse.json(
        { error: 'Azure is not configured, Please configure Azure first from settings' },
        { status: 500 }
      );
    }

    // Decode URL-encoded JSON and parse it
    const decodedConfig = decodeURIComponent(cookieConfig);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userConfig = JSON.parse(decodedConfig as any);
    
    // Extract the actual config value from the cookie structure
    //const userConfig = userConfig.value;
    console.log(userConfig);
    const apiKey = userConfig.primaryApiKey || process.env.AZURE_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Azure API key not configured' },
        { status: 500 }
      );
    }

    const {
      deploymentId,
      prompt,
      size,
      outputFormat,
      count,
      mode,
      image,
      mask,
    } = await request.json();

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
    // Add primary API key to config
    config.primaryApiKey = apiKey;
    
    // Process endpoints and replace the baseurl with the env tag
    const appEndpoints = config.endpoints.map((endpoint) => ({
      ...endpoint,
      baseUrl: replaceEnvTags(endpoint.baseUrl)
    }));

    if (!userConfig.endpoints || userConfig.endpoints.length === 0) {
      if (appEndpoints.length > 0) {
        return NextResponse.json(
          { error: 'Azure is not configured, Please configure Azure first from settings' },
          { status: 500 }
        );
     }
    }

    const endpoints = userConfig.endpoints || appEndpoints;
    
    const provider = new AzureImageProvider(config);
    provider.setEndpoints(endpoints);


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
      result = await provider.editImage(deploymentId, {
        prompt,
        image,
        mask,
        output_format: outputFormat || 'png',
        n: count || 1,
        size: size || '1024x1024',
      });
    } else {
      // Use regular text-to-image generation
      result = await provider.generateImage(deploymentId, {
        prompt,
        output_format: outputFormat || 'png',
        n: count || 1,
        size: size || '1024x1024',
      });
    }

    return NextResponse.json({
      success: true,
      data: result.response,
      requestLog: result.requestLog,
      responseLog: result.responseLog,
    });
  } catch (error) {
    console.error('Image generation error:', error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
        success: false,
      },
      { status: 500 }
    );
  }
}
