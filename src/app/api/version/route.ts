import { NextRequest, NextResponse } from 'next/server';
import appConfig from '@/app/config/app-config.json';

interface VersionInfo {
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
}

/**
 * Compare two semantic version strings
 * Returns: 1 if v1 > v2, -1 if v1 < v2, 0 if equal
 */
function compareVersions(v1: string, v2: string): number {
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
function getUpdateType(current: string, latest: string): 'major' | 'minor' | 'patch' | 'none' {
  if (current === latest) return 'none';

  const currentParts = current.replace(/^v/, '').split('.').map(Number);
  const latestParts = latest.replace(/^v/, '').split('.').map(Number);

  if (latestParts[0] > currentParts[0]) return 'major';
  if (latestParts[1] > currentParts[1]) return 'minor';
  if (latestParts[2] > currentParts[2]) return 'patch';

  return 'none';
}

/**
 * Extract repository owner and name from GitHub URL
 */
function getRepositoryInfo(githubUrl: string): { owner: string; repo: string } {
  try {
    const url = new URL(githubUrl);
    const pathParts = url.pathname.split('/').filter(part => part);
    
    if (pathParts.length >= 2) {
      return {
        owner: pathParts[0],
        repo: pathParts[1]
      };
    }
    
    throw new Error('Invalid GitHub URL format');
  } catch (error) {
    console.error('Error parsing GitHub URL:', error);
    throw new Error('Invalid repository configuration');
  }
}

/**
 * Fetch latest version from GitHub repository
 */
async function fetchLatestVersion(): Promise<{ version: string; publishedAt?: string }> {
  try {
    const { owner, repo } = getRepositoryInfo(appConfig.app.github);
    
    // Try GitHub API first (more reliable and includes metadata)
    const githubResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/package.json?ref=stable`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': `${appConfig.app.name}-updater`
        }
      }
    );

    if (githubResponse.ok) {
      const data = await githubResponse.json();
      const packageJson = JSON.parse(Buffer.from(data.content, 'base64').toString());
      
      return {
        version: packageJson.version,
        publishedAt: data.commit?.commit?.committer?.date
      };
    }

    // Fallback: try to fetch from raw GitHub content
    const rawResponse = await fetch(
      `https://raw.githubusercontent.com/${owner}/${repo}/stable/package.json`,
      {
        headers: {
          'User-Agent': `${appConfig.app.name}-updater`
        }
      }
    );

    if (rawResponse.ok) {
      const packageJson = await rawResponse.json();
      return {
        version: packageJson.version
      };
    }

    throw new Error('Failed to fetch from both GitHub API and raw content');
  } catch (error) {
    console.error('Error fetching latest version:', error);
    throw new Error('Unable to fetch latest version information');
  }
}

/**
 * Get current version from app-config.json
 */
function getCurrentVersion(): string {
  try {
    // Get version from app-config.json first, then fallback to environment variable
    return appConfig.app.version || process.env.NEXT_PUBLIC_APP_VERSION || '1.0.1';
  } catch (error) {
    console.error('Error reading current version:', error);
    return '1.0.1'; // fallback
  }
}

/**
 * Generate release notes URL using app-config.json
 */
function getReleaseNotesUrl(version: string): string {
  const { owner, repo } = getRepositoryInfo(appConfig.app.github);
  const cleanVersion = version.replace(/^v/, '');
  return `https://github.com/${owner}/${repo}/releases/tag/v${cleanVersion}`;
}

/**
 * Generate download URL using app-config.json
 */
function getDownloadUrl(version: string): string {
  const { owner, repo } = getRepositoryInfo(appConfig.app.github);
  const cleanVersion = version.replace(/^v/, '');
  return `https://github.com/${owner}/${repo}/releases/download/v${cleanVersion}/${appConfig.app.name.toLowerCase().replace(/\s+/g, '-')}-v${cleanVersion}.zip`;
}

export async function GET() {
  try {
    // Get current version
    const currentVersion = getCurrentVersion();

    // Try to fetch latest version
    let latestVersion: string;
    let publishedAt: string | undefined;

    try {
      const versionInfo = await fetchLatestVersion();
      latestVersion = versionInfo.version;
      publishedAt = versionInfo.publishedAt;
    } catch {
      // If we can't fetch the latest version, return current version info
      return NextResponse.json({
        current: currentVersion,
        latest: currentVersion,
        isUpdateAvailable: false,
        updateType: 'none' as const,
        error: 'Unable to check for updates',
        lastChecked: new Date().toISOString()
      } as VersionInfo & { error: string; lastChecked: string });
    }

    // Compare versions
    const comparison = compareVersions(latestVersion, currentVersion);
    const isUpdateAvailable = comparison > 0;
    const updateType = getUpdateType(currentVersion, latestVersion);

    // Get repository information
    const { owner, repo } = getRepositoryInfo(appConfig.app.github);

    const response: VersionInfo = {
      current: currentVersion,
      latest: latestVersion,
      isUpdateAvailable,
      updateType,
      publishedAt,
      releaseNotesUrl: getReleaseNotesUrl(latestVersion),
      downloadUrl: getDownloadUrl(latestVersion),
      repository: {
        owner,
        name: repo,
        url: appConfig.app.github
      }
    };

    // Add cache headers
    const headers = new Headers();
    headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600'); // 5 min cache, 10 min stale

    return NextResponse.json(response, { headers });
  } catch (error) {
    console.error('Version check error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to check for updates',
        current: getCurrentVersion(),
        latest: getCurrentVersion(),
        isUpdateAvailable: false,
        updateType: 'none' as const
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'check-update') {
      // Force a fresh check
      return GET();
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Version check POST error:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
