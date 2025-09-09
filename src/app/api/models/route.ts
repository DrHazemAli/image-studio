import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  supportsInpaint: boolean;
  primary?: boolean;
  premium?: boolean;
  supportedSizes: SizeOption[];
}

export interface SizeOption {
  size: string;
  label: string;
  aspect: string;
  description: string;
}

interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  capabilities?: string[];
  primary?: boolean;
  premium?: boolean;
  supportedSizes: SizeOption[];
}

export async function GET() {
  try {
    // Read the models configuration from the JSON file
    const configPath = path.join(
      process.cwd(),
      'src/app/config/azure-models.json'
    );
    const configData = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(configData);

    // Extract all models from the configuration
    const models: ModelInfo[] = [];

    // Process OpenAI models
    if (config.imageModels?.generation?.openai) {
      config.imageModels.generation.openai.forEach((model: ModelConfig) => {
        models.push({
          id: model.id,
          name: model.name,
          provider: model.provider,
          supportsInpaint: model.capabilities?.includes('inpainting') || false,
          primary: model.primary || false,
          premium: model.premium || false,
          supportedSizes: model.supportedSizes || [],
        });
      });
    }

    // Process Black Forest Labs models
    if (config.imageModels?.generation?.blackForestLabs) {
      config.imageModels.generation.blackForestLabs.forEach(
        (model: ModelConfig) => {
          models.push({
            id: model.id,
            name: model.name,
            provider: model.provider,
            supportsInpaint:
              model.capabilities?.includes('inpainting') || false,
            primary: model.primary || false,
            premium: model.premium || false,
            supportedSizes: model.supportedSizes || [],
          });
        }
      );
    }

    // Process Microsoft models
    if (config.imageModels?.generation?.microsoft) {
      config.imageModels.generation.microsoft.forEach((model: ModelConfig) => {
        models.push({
          id: model.id,
          name: model.name,
          provider: model.provider,
          supportsInpaint: model.capabilities?.includes('inpainting') || false,
          primary: model.primary || false,
          premium: model.premium || false,
          supportedSizes: model.supportedSizes || [],
        });
      });
    }

    return NextResponse.json({
      models,
      defaultModel: 'FLUX.1-Kontext-pro',
      defaultSize: '1024x1024',
    });
  } catch (error) {
    console.error('Error reading models configuration:', error);
    return NextResponse.json(
      { error: 'Failed to load models configuration' },
      { status: 500 }
    );
  }
}
