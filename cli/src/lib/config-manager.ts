import fs from "fs-extra";
import path from "path";
import { AzureConfig, CliConfig } from "../types";

export class ConfigManager {
  private configPath: string;
  private cliConfigPath: string;

  constructor(projectRoot?: string) {
    const root = projectRoot || process.cwd();
    this.configPath = path.join(root, "src/app/config/azure-config.json");
    this.cliConfigPath = path.join(root, ".azure-image-studio-cli.json");
  }

  async loadAzureConfig(): Promise<AzureConfig | null> {
    try {
      if (await fs.pathExists(this.configPath)) {
        const configData = await fs.readJson(this.configPath);
        return configData as AzureConfig;
      }
      return null;
    } catch (error) {
      throw new Error(
        `Failed to load Azure config: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async saveAzureConfig(config: AzureConfig): Promise<void> {
    try {
      await fs.ensureDir(path.dirname(this.configPath));
      await fs.writeJson(this.configPath, config, { spaces: 2 });
    } catch (error) {
      throw new Error(
        `Failed to save Azure config: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async loadCliConfig(): Promise<CliConfig> {
    try {
      if (await fs.pathExists(this.cliConfigPath)) {
        const configData = await fs.readJson(this.cliConfigPath);
        return configData as CliConfig;
      }
      return {};
    } catch (error) {
      throw new Error(
        `Failed to load CLI config: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async saveCliConfig(config: CliConfig): Promise<void> {
    try {
      await fs.writeJson(this.cliConfigPath, config, { spaces: 2 });
    } catch (error) {
      throw new Error(
        `Failed to save CLI config: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async getApiKey(): Promise<string | null> {
    // Try environment variable first
    if (process.env.AZURE_API_KEY) {
      return process.env.AZURE_API_KEY;
    }

    // Try .env.local file
    const envPath = path.join(process.cwd(), ".env.local");
    if (await fs.pathExists(envPath)) {
      try {
        const envContent = await fs.readFile(envPath, "utf-8");
        const match = envContent.match(/AZURE_API_KEY=(.+)/);
        if (match) {
          return match[1].trim();
        }
      } catch (error) {
        // Ignore errors reading .env.local
      }
    }

    // Try CLI config
    const cliConfig = await this.loadCliConfig();
    return cliConfig.apiKey || null;
  }

  async setApiKey(apiKey: string): Promise<void> {
    const cliConfig = await this.loadCliConfig();
    cliConfig.apiKey = apiKey;
    await this.saveCliConfig(cliConfig);
  }

  async validateConfig(): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Check if config file exists
    if (!(await fs.pathExists(this.configPath))) {
      errors.push(
        'Azure config file not found. Run "azure-image-studio config init" to create one.',
      );
      return { isValid: false, errors };
    }

    // Check if API key exists
    const apiKey = await this.getApiKey();
    if (!apiKey) {
      errors.push(
        'Azure API key not found. Set AZURE_API_KEY environment variable or run "azure-image-studio config set-api-key"',
      );
    }

    // Validate config structure
    try {
      const config = await this.loadAzureConfig();
      if (!config) {
        errors.push("Failed to load Azure configuration");
        return { isValid: false, errors };
      }

      if (!config.endpoints || config.endpoints.length === 0) {
        errors.push("No Azure endpoints configured");
      }

      config.endpoints.forEach((endpoint, index) => {
        if (!endpoint.baseUrl) {
          errors.push(`Endpoint ${index + 1}: Base URL is missing`);
        }
        if (!endpoint.apiVersion) {
          errors.push(`Endpoint ${index + 1}: API version is missing`);
        }
        if (!endpoint.deployments || endpoint.deployments.length === 0) {
          errors.push(`Endpoint ${index + 1}: No deployments configured`);
        }
      });
    } catch (error) {
      errors.push(
        `Config validation error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  async createDefaultConfig(): Promise<void> {
    const defaultConfig: AzureConfig = {
      endpoints: [
        {
          id: "primary",
          name: "Primary Endpoint",
          baseUrl: "https://your-openai-endpoint.openai.azure.com",
          apiVersion: "2025-04-01-preview",
          deployments: [
            {
              id: "dalle-3",
              name: "DALL-E 3",
              deploymentName: "your-dalle-3-deployment",
              maxSize: "1024x1024",
              supportedFormats: ["png", "jpeg"],
              description: "High-quality image generation with DALL-E 3",
            },
          ],
        },
      ],
      defaultSettings: {
        outputFormat: "png",
        size: "1024x1024",
        n: 1,
      },
      ui: {
        theme: "light",
        showConsole: true,
        animationsEnabled: true,
      },
    };

    await this.saveAzureConfig(defaultConfig);
  }
}
