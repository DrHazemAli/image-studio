import { NextRequest, NextResponse } from "next/server";
import { AzureModelsConfig, AzureModel } from "@/types/azure";
import { AZURE_CONFIG_OBJECT_KEY } from "@/lib/constants";
import logger from "@/lib/logger";
import { replaceEnvTags } from "@/lib/env";
import fs from "fs/promises";
import path from "path";

/**
 * GET /api/azure/models
 * Returns the default models configuration from JSON file and Azure config validation status
 */
export async function GET(request: NextRequest) {
  try {
    // Check Azure configuration status for validation purposes
    let azureConfigured = false;
    let hasValidCredentials = false;

    try {
      const azureCookieValue = request.cookies.get(
        AZURE_CONFIG_OBJECT_KEY,
      )?.value;
      if (azureCookieValue) {
        const decodedAzureValue = decodeURIComponent(azureCookieValue);
        const parsedAzureCookie = JSON.parse(decodedAzureValue);
        const azureConfig = JSON.parse(parsedAzureCookie.value);

        azureConfigured = azureConfig?.primary?.status === "valid";
        hasValidCredentials = !!(
          azureConfig?.primaryApiKey && azureConfig?.primaryEndpoint
        );
      }
    } catch (error) {
      console.warn("Failed to parse Azure config cookie:", error);
    }

    // Load default models config from JSON file
    try {
      const configPath = path.join(
        process.cwd(),
        "src/app/config/azure-models.json",
      );
      const configContent = await fs.readFile(configPath, "utf-8");
      const defaultModelsConfig: AzureModelsConfig = JSON.parse(configContent);

      logger.info("Loading default models config from file");

      return NextResponse.json({
        models: defaultModelsConfig,
        source: "default",
        message: "Default models configuration loaded from JSON file",
        azureConfigured,
        hasValidCredentials,
      });
    } catch (fileError) {
      logger.error("Failed to load default models config:", fileError);
      return NextResponse.json(
        { error: "Failed to load models configuration" },
        { status: 500 },
      );
    }
  } catch (error) {
    logger.error("Models config GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/azure/models
 * Validates models configuration structure (client handles localStorage persistence)
 */
export async function POST(request: NextRequest) {
  try {
    const { models } = await request.json();

    logger.info("Validating models config structure:", {
      providersCount: models
        ? Object.keys(models.imageModels?.generation || {}).length
        : 0,
      hasEndpoints: !!models?.endpoints,
      hasTools: !!models?.tools,
      hasPresets: !!models?.presets,
    });

    if (!models) {
      return NextResponse.json(
        { error: "Models configuration data is required" },
        { status: 400 },
      );
    }

    // Validate the models config structure
    if (
      !models.imageModels ||
      !models.endpoints ||
      !models.tools ||
      !models.presets
    ) {
      return NextResponse.json(
        { error: "Invalid models configuration: missing required properties" },
        { status: 400 },
      );
    }

    // Ensure all models have validation status and timestamp fields
    const modelsWithValidation: AzureModelsConfig = {
      ...models,
      imageModels: {
        generation: Object.keys(models.imageModels.generation).reduce(
          (acc, provider) => {
            acc[provider] = models.imageModels.generation[provider].map(
              (model: AzureModel) => ({
                ...model,
                status: model.status || "idle",
                validated_at: model.validated_at || null,
              }),
            );
            return acc;
          },
          {} as { [provider: string]: AzureModel[] },
        ),
      },
    };

    return NextResponse.json({
      success: true,
      message: "Models configuration structure validated successfully",
      models: modelsWithValidation,
    });
  } catch (error) {
    logger.error("Models config POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/azure/models
 * Validates a specific model using configured Azure credentials
 */
export async function PUT(request: NextRequest) {
  try {
    const { modelId, deploymentName, provider } = await request.json();

    if (!modelId) {
      return NextResponse.json(
        { error: "Model ID is required for validation" },
        { status: 400 },
      );
    }

    // Get Azure configuration from cookies
    let azureApiKey: string | null = null;
    let azureEndpoint: string | null = null;

    try {
      const azureCookieValue = request.cookies.get(
        AZURE_CONFIG_OBJECT_KEY,
      )?.value;
      if (azureCookieValue) {
        const decodedAzureValue = decodeURIComponent(azureCookieValue);
        const parsedAzureCookie = JSON.parse(decodedAzureValue);
        const azureConfig = JSON.parse(parsedAzureCookie.value);

        azureApiKey = azureConfig?.primaryApiKey;
        azureEndpoint = azureConfig?.primaryEndpoint;
      }
    } catch (error) {
      logger.warn("Failed to parse Azure config cookie for validation:", error);
    }

    if (!azureApiKey || !azureEndpoint) {
      return NextResponse.json({
        valid: false,
        message: "Azure API key and endpoint must be configured first",
      });
    }

    // Process environment tags in the base URL
    const processedBaseUrl = replaceEnvTags(azureEndpoint);

    // Construct test URL for model validation
    let testUrl: string;
    const version = "2024-02-15-preview";
    const modelDeployment = deploymentName || modelId;

    if (processedBaseUrl.includes("openai.azure.com")) {
      // Azure OpenAI endpoint - test specific deployment
      testUrl = `${processedBaseUrl}/openai/deployments/${modelDeployment}/completions?api-version=${version}`;
    } else if (processedBaseUrl.includes("services.ai.azure.com")) {
      // Azure AI Foundry endpoint - test model availability
      testUrl = `${processedBaseUrl}/openai/models?api-version=${version}`;
    } else {
      // Fallback to OpenAI format
      testUrl = `${processedBaseUrl}/v1/models`;
    }

    logger.info("Validating model:", {
      modelId,
      deploymentName,
      provider,
      testUrl,
    });

    // Test the model/deployment
    const response = await fetch(testUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${azureApiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();

      // For specific deployment test, any 200 response means it's accessible
      if (processedBaseUrl.includes("openai.azure.com")) {
        return NextResponse.json({
          valid: true,
          message: `Model deployment '${modelDeployment}' is accessible and ready`,
          modelId,
          deploymentName: modelDeployment,
          provider,
          endpoint: processedBaseUrl,
          validated_at: new Date().toISOString(),
        });
      } else {
        // For models list endpoint, check if our model exists
        let models: any[] = [];
        if (data.data && Array.isArray(data.data)) {
          models = data.data;
        } else if (data.value && Array.isArray(data.value)) {
          models = data.value;
        } else if (Array.isArray(data)) {
          models = data;
        }

        const modelExists = models.some(
          (model) =>
            model.id === modelId ||
            model.name === modelId ||
            model.id === modelDeployment ||
            model.name === modelDeployment,
        );

        return NextResponse.json({
          valid: modelExists,
          message: modelExists
            ? `Model '${modelId}' is available in the endpoint`
            : `Model '${modelId}' is not found in the endpoint`,
          modelId,
          deploymentName: modelDeployment,
          provider,
          endpoint: processedBaseUrl,
          availableModels: models.length,
          validated_at: new Date().toISOString(),
        });
      }
    } else {
      const errorText = await response.text();
      logger.warn("Model validation failed:", {
        status: response.status,
        error: errorText,
      });

      return NextResponse.json({
        valid: false,
        message: `Model validation failed: ${response.status} ${response.statusText}`,
        modelId,
        deploymentName: modelDeployment,
        provider,
        endpoint: processedBaseUrl,
        error: errorText,
        validated_at: new Date().toISOString(),
      });
    }
  } catch (error) {
    logger.error("Model validation error:", error);
    return NextResponse.json(
      {
        valid: false,
        message: "Failed to validate model due to server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/azure/models
 * Signals reset request (client handles localStorage clearing)
 */
export async function DELETE() {
  try {
    // Return success - client handles localStorage clearing
    return NextResponse.json({
      success: true,
      message: "Models configuration reset request acknowledged",
    });
  } catch (error) {
    logger.error("Models config DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
