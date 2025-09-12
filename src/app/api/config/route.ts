import { NextRequest, NextResponse } from "next/server";
import { AzureImageProvider } from "@/lib/azure-provider";
import { AzureConfig } from "@/types/azure";
import azureConfigData from "../../config/azure-config.json";
import { replaceEnvTags } from "@/lib/env";
import { AZURE_CONFIG_OBJECT_KEY } from "@/lib/constants";

export async function GET(request: NextRequest) {
  try {
    // Check API Key in cookies first
    const cookieConfig = request.cookies.get(AZURE_CONFIG_OBJECT_KEY)?.value;
    let userConfig = null;
    let apiKey: string | undefined = process.env.AZURE_API_KEY;

    if (cookieConfig) {
      try {
        // Decode URL-encoded JSON and parse it
        const decodedConfig = decodeURIComponent(cookieConfig);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        userConfig = JSON.parse(decodedConfig as any);

        // Prioritize user config API key over environment variable
        apiKey = userConfig.primaryApiKey || process.env.AZURE_API_KEY;
      } catch (error) {
        console.error("Failed to parse user config from cookie:", error);
      }
    }

    const config = azureConfigData as AzureConfig;

    // Check if API key exists
    const hasApiKey = !!apiKey && apiKey !== "your-api-key-here";

    let configErrors: string[] = [];

    if (!hasApiKey) {
      configErrors.push(
        "Azure API key not found. Please configure Azure settings or set AZURE_API_KEY environment variable.",
      );
    } else {
      // Add primary API key to config for validation
      if (apiKey) {
        config.primaryApiKey = apiKey;
      }

      // Process endpoints and replace the baseurl with the env tag
      const appEndpoints = config.endpoints.map((endpoint) => ({
        ...endpoint,
        baseUrl: replaceEnvTags(endpoint.baseUrl),
      }));

      // Use user endpoints if available, otherwise use app endpoints
      const endpoints = userConfig?.endpoints || appEndpoints;

      // Validate configuration only if API key exists
      const provider = new AzureImageProvider(config);
      provider.setEndpoints(endpoints);

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
    console.error("Config validation error:", error);

    return NextResponse.json(
      {
        error: "Failed to validate configuration",
        configErrors: ["Failed to load Azure configuration"],
        isValid: false,
        hasApiKey: false,
      },
      { status: 500 },
    );
  }
}
