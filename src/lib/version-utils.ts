/**
 * Version utilities for checking updates and managing version information
 */

export interface VersionInfo {
  current: string;
  latest: string;
  isUpdateAvailable: boolean;
  updateType: 'major' | 'minor' | 'patch' | 'none';
  publishedAt?: string;
  releaseNotesUrl?: string;
  downloadUrl?: string;
  repository?: {
    owner: string;
    name: string;
    url: string;
  };
  lastChecked?: string;
  error?: string;
}

export interface UpdateCheckResult {
  versionInfo: VersionInfo;
  isLoading: boolean;
  error: string | null;
  lastChecked: Date | null;
}

/**
 * Compare two semantic version strings
 * Returns: 1 if v1 > v2, -1 if v1 < v2, 0 if equal
 */
export function compareVersions(v1: string, v2: string): number {
  const parseVersion = (version: string) => {
    return version.replace(/^v/, '').split('.').map(Number);
  };

  const v1Parts = parseVersion(v1);
  const v2Parts = parseVersion(v2);

  for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
    const v1Part = v1Parts[i] || 0;
    const v2Part = v2Parts[i] || 0;

    if (v1Part > v2Part) return 1;
    if (v1Part < v2Part) return -1;
  }

  return 0;
}

/**
 * Determine the type of update based on version comparison
 */
export function getUpdateType(current: string, latest: string): 'major' | 'minor' | 'patch' | 'none' {
  if (current === latest) return 'none';

  const currentParts = current.replace(/^v/, '').split('.').map(Number);
  const latestParts = latest.replace(/^v/, '').split('.').map(Number);

  if (latestParts[0] > currentParts[0]) return 'major';
  if (latestParts[1] > currentParts[1]) return 'minor';
  if (latestParts[2] > currentParts[2]) return 'patch';

  return 'none';
}

/**
 * Get update type color for UI
 */
export function getUpdateTypeColor(updateType: VersionInfo['updateType']): string {
  switch (updateType) {
    case 'major':
      return 'text-red-600 dark:text-red-400';
    case 'minor':
      return 'text-orange-600 dark:text-orange-400';
    case 'patch':
      return 'text-blue-600 dark:text-blue-400';
    case 'none':
      return 'text-green-600 dark:text-green-400';
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
}

/**
 * Get update type label for UI
 */
export function getUpdateTypeLabel(updateType: VersionInfo['updateType']): string {
  switch (updateType) {
    case 'major':
      return 'Major Update';
    case 'minor':
      return 'Minor Update';
    case 'patch':
      return 'Patch Update';
    case 'none':
      return 'Up to Date';
    default:
      return 'Unknown';
  }
}

/**
 * Get update type icon for UI
 */
export function getUpdateTypeIcon(updateType: VersionInfo['updateType']): string {
  switch (updateType) {
    case 'major':
      return '🚨';
    case 'minor':
      return '🔄';
    case 'patch':
      return '🔧';
    case 'none':
      return '✅';
    default:
      return '❓';
  }
}

/**
 * Format version string for display
 */
export function formatVersion(version: string): string {
  return version.startsWith('v') ? version : `v${version}`;
}

/**
 * Check if version is a pre-release
 */
export function isPreRelease(version: string): boolean {
  return version.includes('-') || version.includes('alpha') || version.includes('beta') || version.includes('rc');
}

/**
 * Get release notes URL (if available)
 */
export function getReleaseNotesUrl(version: string, versionInfo?: VersionInfo): string {
  // Use URL from API response if available
  if (versionInfo?.releaseNotesUrl) {
    return versionInfo.releaseNotesUrl;
  }
  
  // Fallback to default format
  const cleanVersion = version.replace(/^v/, '');
  return `https://github.com/hazem-ahmed/azure-genai-image/releases/tag/v${cleanVersion}`;
}

/**
 * Get download URL for update
 */
export function getDownloadUrl(version: string, versionInfo?: VersionInfo): string {
  // Use URL from API response if available
  if (versionInfo?.downloadUrl) {
    return versionInfo.downloadUrl;
  }
  
  // Fallback to default format
  const cleanVersion = version.replace(/^v/, '');
  return `https://github.com/hazem-ahmed/azure-genai-image/releases/download/v${cleanVersion}/azure-genai-image-v${cleanVersion}.zip`;
}

/**
 * Check for updates by calling the version API
 */
export async function checkForUpdates(force: boolean = false): Promise<VersionInfo> {
  try {
    const url = `/api/version${force ? '?force=true' : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const versionInfo: VersionInfo = await response.json();
    return versionInfo;
  } catch (error) {
    console.error('Error checking for updates:', error);
    throw new Error('Failed to check for updates');
  }
}

/**
 * Get current app version from package.json or environment
 */
export function getCurrentVersion(): string {
  // In a real app, you might want to read this from package.json
  // For now, we'll use a hardcoded version or read from environment
  return process.env.NEXT_PUBLIC_APP_VERSION || '1.0.1';
}

/**
 * Format relative time for "last checked" display
 */
export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const checkDate = typeof date === 'string' ? new Date(date) : date;
  const diffInSeconds = Math.floor((now.getTime() - checkDate.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
}
