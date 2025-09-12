/**
 * Asset Store Validation API Route
 * Handles API key validation for all providers
 */

import { NextRequest, NextResponse } from "next/server";
import { assetManager } from "@/lib/asset-providers/asset-manager";
import { updateAssetManagerWithCookies } from "@/lib/asset-providers/cookie-utils";

export async function POST(request: NextRequest) {
  try {
    // Update asset manager with API keys from cookies
    updateAssetManagerWithCookies(request);

    const body = await request.json();
    const { provider, apiKey } = body;

    if (provider && typeof provider === "string") {
      // Validate specific provider with provided API key
      if (apiKey) {
        // Create a temporary config with the provided API key
        const tempConfig = {
          enabled: true,
          providers: {
            unsplash: {
              enabled: provider === "unsplash",
              apiKey: provider === "unsplash" ? apiKey : "",
              rateLimit: 50,
            },
            pexels: {
              enabled: provider === "pexels",
              apiKey: provider === "pexels" ? apiKey : "",
              rateLimit: 200,
            },
          },
          ui: {
            defaultView: "grid" as const,
            itemsPerPage: 20,
            showAttribution: true,
          },
          cache: {
            enabled: true,
            maxItems: 1000,
            ttl: 60,
          },
        };

        // Update the asset manager with the temporary config
        assetManager.updateConfig(tempConfig);
      }

      const results = await assetManager.validateApiKeys();
      const isValid = results[provider] || false;

      return NextResponse.json({
        success: true,
        provider,
        valid: isValid,
        message: isValid
          ? "API key is valid"
          : "API key is invalid or not configured",
      });
    } else {
      // Validate all providers
      const results = await assetManager.validateApiKeys();

      return NextResponse.json({
        success: true,
        results,
        message: "API key validation completed",
      });
    }
  } catch (error) {
    console.error("Asset store validation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        results: {},
        message: "Validation failed",
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Update asset manager with API keys from cookies
    updateAssetManagerWithCookies(request);

    const { searchParams } = new URL(request.url);
    const provider = searchParams.get("provider");

    if (provider) {
      // Validate specific provider
      const results = await assetManager.validateApiKeys();
      const isValid = results[provider] || false;

      return NextResponse.json({
        success: true,
        provider,
        valid: isValid,
        message: isValid
          ? "API key is valid"
          : "API key is invalid or not configured",
      });
    } else {
      // Validate all providers
      const results = await assetManager.validateApiKeys();

      return NextResponse.json({
        success: true,
        results,
        message: "API key validation completed",
      });
    }
  } catch (error) {
    console.error("Asset store validation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        results: {},
        message: "Validation failed",
      },
      { status: 500 },
    );
  }
}
