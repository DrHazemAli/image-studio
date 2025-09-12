import { NextRequest, NextResponse } from "next/server";
import { getEnvVar } from "@/lib/env";
import { replaceEnvTags } from "@/lib/env";

export async function POST(request: NextRequest) {
  try {
    const {
      apiKey,
      endpoint,
      apiVersion,
      endpointId,
      endpointName,
      deployments,
    } = await request.json();

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is required" },
        { status: 400 },
      );
    }

    // If no endpoint provided, use the default Azure OpenAI endpoint
    const baseUrl =
      endpoint || getEnvVar("AZURE_API_BASE_URL", "https://api.openai.com");

    // Process environment tags in the base URL
    const processedBaseUrl = replaceEnvTags(baseUrl);

    // For Azure services, we need to construct the proper endpoint URL
    // Azure AI Foundry and Azure OpenAI use different endpoint structures
    let testUrl: string;

    // Use provided API version or default
    const version = apiVersion || "2024-02-15-preview";

    if (processedBaseUrl.includes("openai.azure.com")) {
      // Azure OpenAI endpoint - use the models endpoint
      testUrl = `${processedBaseUrl}/openai/models?api-version=${version}`;
    } else if (processedBaseUrl.includes("services.ai.azure.com")) {
      // Azure AI Foundry endpoint - use the same structure as Azure OpenAI
      testUrl = `${processedBaseUrl}/openai/models?api-version=${version}`;
    } else {
      // Fallback to OpenAI format
      testUrl = `${processedBaseUrl}/v1/models`;
    }

    const response = await fetch(testUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();

      // Handle different response formats
      let models: unknown[] = [];
      if (data.data && Array.isArray(data.data)) {
        models = data.data;
      } else if (data.value && Array.isArray(data.value)) {
        models = data.value;
      } else if (Array.isArray(data)) {
        models = data;
      }

      return NextResponse.json({
        valid: true,
        message: "Azure API key is valid",
        models: models.length,
        endpoint: processedBaseUrl,
        endpointId: endpointId,
        endpointName: endpointName,
        apiVersion: version,
        deployments: deployments?.length || 0,
        testUrl,
      });
    } else {
      const errorText = await response.text();

      // For Azure AI Foundry, try alternative validation if models endpoint fails
      if (
        processedBaseUrl.includes("services.ai.azure.com") &&
        response.status === 404
      ) {
        // Try a simple health check or base endpoint validation
        try {
          const healthUrl = `${processedBaseUrl}/health`;
          const healthResponse = await fetch(healthUrl, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
          });

          if (healthResponse.ok) {
            return NextResponse.json({
              valid: true,
              message: "Azure AI Foundry endpoint is accessible",
              models: 0, // We can't get model count from health check
              endpoint: processedBaseUrl,
              endpointId: endpointId,
              endpointName: endpointName,
              apiVersion: version,
              deployments: deployments?.length || 0,
              testUrl: healthUrl,
              validationMethod: "health_check",
            });
          }
        } catch {
          // Health check failed, continue with original error
        }
      }

      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }

      return NextResponse.json(
        {
          valid: false,
          message:
            errorData.error?.message ||
            errorData.message ||
            `Azure API validation failed (${response.status})`,
          status: response.status,
          endpoint: processedBaseUrl,
          endpointId: endpointId,
          endpointName: endpointName,
          apiVersion: version,
          deployments: deployments?.length || 0,
          testUrl,
          errorDetails: errorData,
        },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Azure API validation error:", error);
    return NextResponse.json(
      {
        valid: false,
        message: "Failed to validate Azure API key",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
