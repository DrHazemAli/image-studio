/**
 * Cookie utilities for asset store API key management
 */

import { NextRequest } from 'next/server';
import { assetManager } from './asset-manager';
import { AssetStoreConfig } from '@/types/asset-store';

/**
 * Extract API keys from cookies and update asset manager configuration
 */
export function updateAssetManagerWithCookies(request: NextRequest): void {
  try {
    // Get API keys from cookies
    const unsplashKey = request.cookies.get('unsplash_api_key')?.value;
    const pexelsKey = request.cookies.get('pexels_api_key')?.value;
    
    if (unsplashKey || pexelsKey) {
      // Get current config
      const currentConfig = assetManager.getConfig();
      
      // Update config with API keys from cookies
      const updatedConfig: Partial<AssetStoreConfig> = {
        providers: {
          ...currentConfig.providers,
          unsplash: {
            ...currentConfig.providers.unsplash,
            apiKey: unsplashKey || currentConfig.providers.unsplash.apiKey,
            enabled: !!(unsplashKey || currentConfig.providers.unsplash.apiKey),
          },
          pexels: {
            ...currentConfig.providers.pexels,
            apiKey: pexelsKey || currentConfig.providers.pexels.apiKey,
            enabled: !!(pexelsKey || currentConfig.providers.pexels.apiKey),
          },
        },
      };
      
      // Update the asset manager configuration
      assetManager.updateConfig(updatedConfig);
    }
  } catch (error) {
    console.error('Failed to update asset manager with cookie API keys:', error);
  }
}
