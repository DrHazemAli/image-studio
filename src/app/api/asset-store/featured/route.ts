/**
 * Asset Store Featured API Route
 * Handles requests for featured/popular assets
 */

import { NextRequest, NextResponse } from 'next/server';
import { assetManager } from '@/lib/asset-providers/asset-manager';
import { AssetSearchParams, AssetType } from '@/types/asset-store';
import { updateAssetManagerWithCookies } from '@/lib/asset-providers/cookie-utils';

export async function POST(request: NextRequest) {
  try {
    // Update asset manager with API keys from cookies
    updateAssetManagerWithCookies(request);
    
    const body = await request.json();
    const { 
      category, 
      color, 
      orientation, 
      page = 1, 
      perPage = 20,
      assetType = 'photo'
    } = body;

    // Validate parameters
    if (typeof page !== 'number' || page < 1) {
      return NextResponse.json(
        { error: 'Invalid page number' },
        { status: 400 }
      );
    }

    if (typeof perPage !== 'number' || perPage < 1 || perPage > 100) {
      return NextResponse.json(
        { error: 'Invalid perPage value (must be 1-100)' },
        { status: 400 }
      );
    }

    const searchParams: Omit<AssetSearchParams, 'query'> = {
      category: typeof category === 'string' ? category : undefined,
      color: typeof color === 'string' ? color : undefined,
      orientation: orientation === 'landscape' || orientation === 'portrait' || orientation === 'square' 
        ? orientation 
        : undefined,
      page,
      perPage,
    };

    const assetTypeEnum = assetType as AssetType;
    const results = await assetManager.getFeaturedAssets(searchParams, assetTypeEnum);

    return NextResponse.json(results);
  } catch (error) {
    console.error('Asset store featured error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        data: [],
        total: 0,
        page: 1,
        perPage: 20,
        hasMore: false
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Update asset manager with API keys from cookies
    updateAssetManagerWithCookies(request);
    
    const { searchParams } = new URL(request.url);
    
    const category = searchParams.get('category') || undefined;
    const color = searchParams.get('color') || undefined;
    const orientation = searchParams.get('orientation') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('perPage') || '20');
    const assetType = searchParams.get('assetType') || 'photo';

    // Validate parameters
    if (isNaN(page) || page < 1) {
      return NextResponse.json(
        { error: 'Invalid page number' },
        { status: 400 }
      );
    }

    if (isNaN(perPage) || perPage < 1 || perPage > 100) {
      return NextResponse.json(
        { error: 'Invalid perPage value (must be 1-100)' },
        { status: 400 }
      );
    }

    const searchParamsObj: Omit<AssetSearchParams, 'query'> = {
      category,
      color,
      orientation: orientation === 'landscape' || orientation === 'portrait' || orientation === 'square' 
        ? orientation as 'landscape' | 'portrait' | 'square'
        : undefined,
      page,
      perPage,
    };

    const assetTypeEnum = assetType as AssetType;
    const results = await assetManager.getFeaturedAssets(searchParamsObj, assetTypeEnum);

    return NextResponse.json(results);
  } catch (error) {
    console.error('Asset store featured error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        data: [],
        total: 0,
        page: 1,
        hasMore: false
      },
      { status: 500 }
    );
  }
}
