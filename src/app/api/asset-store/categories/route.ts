/**
 * Asset Store Categories API Route
 * Handles requests for asset categories
 */

import { NextRequest, NextResponse } from 'next/server';
import { assetManager } from '@/lib/asset-providers/asset-manager';
import { AssetType } from '@/types/asset-store';
import { updateAssetManagerWithCookies } from '@/lib/asset-providers/cookie-utils';

export async function GET(request: NextRequest) {
  try {
    // Update asset manager with API keys from cookies
    updateAssetManagerWithCookies(request);
    
    const { searchParams } = new URL(request.url);
    const assetType = (searchParams.get('assetType') || 'photo') as AssetType;

    const categories = await assetManager.getCategories(assetType);

    return NextResponse.json({
      success: true,
      categories,
      assetType,
    });
  } catch (error) {
    console.error('Asset store categories error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        categories: [],
        assetType: 'photo'
      },
      { status: 500 }
    );
  }
}
