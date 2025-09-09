import { NextResponse } from 'next/server';
import { AzureImageProvider } from '@/lib/azure-provider';
import { AzureConfig } from '@/types/azure';
import azureConfigData from '../../config/azure-config.json';

export async function GET() {
  try {
    const apiKey = process.env.AZURE_API_KEY;
    const config = azureConfigData as AzureConfig;

    // Check if API key exists
    const hasApiKey = !!apiKey && apiKey !== 'your-api-key-here';

    let configErrors: string[] = [];

    if (!hasApiKey) {
      configErrors.push(
        'Azure API key not found. Please set AZURE_API_KEY environment variable in .env.local file.'
      );
    } else {
      // Add primary API key to config for validation
      config.primaryApiKey = apiKey;
      
      // Validate configuration only if API key exists
      const provider = new AzureImageProvider(config);
      const validation = provider.validateConfiguration();
      if (!validation.isValid) {
        configErrors = validation.errors;
      }
    }

    return NextResponse.json({
      config: {
        endpoints: config.endpoints,
        defaultSettings: config.defaultSettings,
        ui: config.ui,
      },
      hasApiKey,
      configErrors,
      isValid: configErrors.length === 0,
    });
  } catch (error) {
    console.error('Config validation error:', error);

    return NextResponse.json(
      {
        error: 'Failed to validate configuration',
        configErrors: ['Failed to load Azure configuration'],
        isValid: false,
        hasApiKey: false,
      },
      { status: 500 }
    );
  }
}
