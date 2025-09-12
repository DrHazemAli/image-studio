import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const { authorized, error } = requireAuth(request);

    if (!authorized) {
      return NextResponse.json(
        { error: error || "Unauthorized" },
        { status: 401 },
      );
    }

    const apiKey = process.env.AZURE_API_KEY;
    const endpoint = process.env.AZURE_ENDPOINT;

    if (!apiKey && !endpoint) {
      return NextResponse.json({ apiKey: null, endpoint: null });
    }

    // Return a masked version of the API key for security
    const maskedKey =
      apiKey && apiKey.length > 8
        ? `${apiKey.substring(0, 4)}${"*".repeat(apiKey.length - 8)}${apiKey.substring(apiKey.length - 4)}`
        : apiKey
          ? "***"
          : null;

    return NextResponse.json({
      apiKey: apiKey || null,
      endpoint: endpoint || null,
      maskedKey: maskedKey,
      hasEnvKey: !!apiKey,
      hasEnvEndpoint: !!endpoint,
    });
  } catch (error) {
    console.error("Error getting environment credentials:", error);
    return NextResponse.json(
      { error: "Failed to retrieve credentials" },
      { status: 500 },
    );
  }
}
