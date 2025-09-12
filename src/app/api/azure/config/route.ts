import { NextRequest, NextResponse } from "next/server";
import { AzureConfig, AzureEndpoint } from "@/types/azure";
import { requireAuth } from "@/lib/auth-middleware";
import { AZURE_CONFIG_OBJECT_KEY } from "@/lib/constants";
import logger from "@/lib/logger";
export async function GET(request: NextRequest) {
  try {
    const { authorized, error } = requireAuth(request);
    if (!authorized) {
      return NextResponse.json(
        { error: error || "Unauthorized" },
        { status: 401 },
      );
    }

    // Get the cookie value from the request
    const cookieValue = request.cookies.get(AZURE_CONFIG_OBJECT_KEY)?.value;

    if (!cookieValue) {
      return NextResponse.json({
        config: null,
        message: "No Azure configuration found in cookies",
      });
    }

    try {
      // Decode and parse the cookie value
      const decodedValue = decodeURIComponent(cookieValue);
      const parsedCookie = JSON.parse(decodedValue);

      // Extract the actual config value
      const configValue = parsedCookie.value;

      if (!configValue) {
        return NextResponse.json({
          config: null,
          message: "Azure configuration cookie exists but is empty",
        });
      }

      const config: AzureConfig = JSON.parse(configValue);

      // Ensure primary and all endpoints have validation status and validated_at fields
      const configWithValidation = {
        ...config,
        primary: {
          status: config.primary?.status || "idle",
          validated_at: config.primary?.validated_at || null,
        },
        endpoints: config.endpoints.map((endpoint: AzureEndpoint) => ({
          ...endpoint,
          // Ensure validation fields exist, use existing values or set defaults
          status: endpoint.status || "idle",
          validated_at: endpoint.validated_at || null,
        })),
      };

      return NextResponse.json({
        config: configWithValidation,
        message: "Azure configuration loaded successfully",
      });
    } catch (parseError) {
      console.error("Failed to parse Azure config cookie:", parseError);
      return NextResponse.json(
        { error: "Failed to parse Azure configuration from cookies" },
        { status: 400 },
      );
    }
  } catch (error) {
    logger.error("Azure config GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if authentication is provided, but don't require it for basic config saving
    const { authorized } = requireAuth(request);

    const { config } = await request.json();

    logger.info("Received config in POST:", JSON.stringify(config, null, 2));

    // Check if endpoints have validation status
    if (config.endpoints && Array.isArray(config.endpoints)) {
      config.endpoints.forEach((endpoint: AzureEndpoint, index: number) => {
        logger.info(`Endpoint ${index} (${endpoint.id}):`, {
          status: endpoint.status,
          validated_at: endpoint.validated_at,
        });
      });
    }

    if (!config) {
      return NextResponse.json(
        { error: "Configuration data is required" },
        { status: 400 },
      );
    }

    // Validate the config structure
    if (!config.endpoints || !Array.isArray(config.endpoints)) {
      return NextResponse.json(
        { error: "Invalid configuration: endpoints array is required" },
        { status: 400 },
      );
    }

    // Ensure primary and all endpoints have validation status and validated_at fields
    const configWithValidation = {
      ...config,
      primary: {
        status: config.primary?.status || "idle",
        validated_at: config.primary?.validated_at || null,
      },
      endpoints: config.endpoints.map((endpoint: AzureEndpoint) => ({
        ...endpoint,
        // Ensure validation fields exist, use existing values or set defaults
        status: endpoint.status || "idle",
        validated_at: endpoint.validated_at || null,
      })),
    };

    // Create the cookie value with proper structure
    const cookieData = {
      value: JSON.stringify(configWithValidation),
      timestamp: Date.now(),
      encrypted: false,
    };

    const cookieValue = encodeURIComponent(JSON.stringify(cookieData));

    // Create the response with the cookie
    const response = NextResponse.json({
      success: true,
      message: "Azure configuration saved successfully",
      config: configWithValidation,
      authenticated: authorized, // Indicate if request was authenticated
    });

    // Set the cookie with proper options
    response.cookies.set(AZURE_CONFIG_OBJECT_KEY, cookieValue, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: false, // Allow client-side access
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    logger.error("Azure config POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { authorized, error } = requireAuth(request);
    if (!authorized) {
      return NextResponse.json(
        { error: error || "Unauthorized" },
        { status: 401 },
      );
    }

    // Create the response
    const response = NextResponse.json({
      success: true,
      message: "Azure configuration cleared successfully",
    });

    // Clear the cookie
    response.cookies.set(AZURE_CONFIG_OBJECT_KEY, "", {
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });

    return response;
  } catch (error) {
    logger.error("Azure config DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
