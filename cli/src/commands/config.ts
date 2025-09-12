import { Command } from "commander";
import inquirer from "inquirer";
import chalk from "chalk";
import boxen from "boxen";
import { ConfigManager } from "../lib/config-manager";
import { AzureConfig } from "../types";

export function createConfigCommand(): Command {
  const configCommand = new Command("config");
  const configManager = new ConfigManager();

  configCommand
    .description("Manage Image Studio configuration")
    .addHelpText(
      "after",
      `
Examples:
  $ image-studio config init
  $ image-studio config validate
  $ image-studio config set-api-key
  $ image-studio config show
    `,
    );

  // Initialize configuration
  configCommand
    .command("init")
    .description("Initialize Azure configuration")
    .option("-f, --force", "Overwrite existing configuration")
    .action(async (options) => {
      try {
        const configExists = await configManager.loadAzureConfig();

        if (configExists && !options.force) {
          console.log(
            chalk.yellow(
              "Configuration already exists. Use --force to overwrite.",
            ),
          );
          return;
        }

        console.log(
          chalk.blue("Initializing Image Studio configuration..."),
        );
        await configManager.createDefaultConfig();

        console.log(chalk.green("✅ Configuration initialized successfully!"));
        console.log(
          chalk.yellow(
            "📝 Please edit src/app/config/azure-config.json with your Azure endpoints",
          ),
        );
        console.log(
          chalk.yellow(
            "🔑 Set your API key with: image-studio config set-api-key",
          ),
        );
      } catch (error) {
        console.error(
          chalk.red("❌ Failed to initialize configuration:"),
          error,
        );
        process.exit(1);
      }
    });

  // Validate configuration
  configCommand
    .command("validate")
    .description("Validate current configuration")
    .action(async () => {
      try {
        console.log(chalk.blue("Validating configuration..."));

        const validation = await configManager.validateConfig();

        if (validation.isValid) {
          console.log(chalk.green("✅ Configuration is valid!"));
        } else {
          console.log(chalk.red("❌ Configuration validation failed:"));
          validation.errors.forEach((error) => {
            console.log(chalk.red(`  • ${error}`));
          });
          process.exit(1);
        }
      } catch (error) {
        console.error(chalk.red("❌ Failed to validate configuration:"), error);
        process.exit(1);
      }
    });

  // Set API key
  configCommand
    .command("set-api-key")
    .description("Set Azure API key")
    .option("-k, --key <key>", "API key to set")
    .action(async (options) => {
      try {
        let apiKey = options.key;

        if (!apiKey) {
          const answers = await inquirer.prompt([
            {
              type: "password",
              name: "apiKey",
              message: "Enter your Azure API key:",
              validate: (input: string) => {
                if (!input.trim()) {
                  return "API key is required";
                }
                return true;
              },
            },
          ]);
          apiKey = answers.apiKey;
        }

        await configManager.setApiKey(apiKey);
        console.log(chalk.green("✅ API key set successfully!"));
      } catch (error) {
        console.error(chalk.red("❌ Failed to set API key:"), error);
        process.exit(1);
      }
    });

  // Show configuration
  configCommand
    .command("show")
    .description("Show current configuration")
    .option("--hide-sensitive", "Hide sensitive information")
    .action(async (options) => {
      try {
        const config = await configManager.loadAzureConfig();
        const cliConfig = await configManager.loadCliConfig();
        const apiKey = await configManager.getApiKey();

        if (!config) {
          console.log(
            chalk.yellow(
              'No configuration found. Run "image-studio config init" to create one.',
            ),
          );
          return;
        }

        const displayConfig = {
          endpoints: config.endpoints.map((endpoint) => ({
            id: endpoint.id,
            name: endpoint.name,
            baseUrl: endpoint.baseUrl,
            apiVersion: endpoint.apiVersion,
            deployments: endpoint.deployments.map((deployment) => ({
              id: deployment.id,
              name: deployment.name,
              deploymentName: deployment.deploymentName,
              maxSize: deployment.maxSize,
              supportedFormats: deployment.supportedFormats,
            })),
          })),
          defaultSettings: config.defaultSettings,
          apiKey: options.hideSensitive
            ? "[HIDDEN]"
            : apiKey
              ? `${apiKey.substring(0, 8)}...`
              : "[NOT SET]",
          cliConfig: cliConfig,
        };

        console.log(
          boxen(JSON.stringify(displayConfig, null, 2), {
            title: "Image Studio Configuration",
            titleAlignment: "center",
            padding: 1,
            margin: 1,
            borderStyle: "round",
            borderColor: "blue",
          }),
        );
      } catch (error) {
        console.error(chalk.red("❌ Failed to show configuration:"), error);
        process.exit(1);
      }
    });

  // Test configuration
  configCommand
    .command("test")
    .description("Test configuration by making a simple API call")
    .option("-m, --model <model>", "Model to test with")
    .action(async (options) => {
      try {
        console.log(chalk.blue("Testing configuration..."));

        const validation = await configManager.validateConfig();
        if (!validation.isValid) {
          console.log(chalk.red("❌ Configuration is invalid:"));
          validation.errors.forEach((error) => {
            console.log(chalk.red(`  • ${error}`));
          });
          process.exit(1);
        }

        const config = await configManager.loadAzureConfig();
        const apiKey = await configManager.getApiKey();

        if (!config || !apiKey) {
          console.log(chalk.red("❌ Configuration or API key not found"));
          process.exit(1);
        }

        // Import here to avoid circular dependencies
        const { AzureImageProvider } = await import("../lib/azure-provider");
        const provider = new AzureImageProvider(config, apiKey);

        const modelId =
          options.model || config.endpoints[0]?.deployments[0]?.id;
        if (!modelId) {
          console.log(
            chalk.red("❌ No model specified and no default model found"),
          );
          process.exit(1);
        }

        console.log(chalk.blue(`Testing with model: ${modelId}`));

        const result = await provider.generateImage(modelId, {
          prompt: "A simple test image",
          n: 1,
          size: "256x256",
        });

        if (result.success) {
          console.log(chalk.green("✅ Configuration test successful!"));
          console.log(
            chalk.green(
              `Generated image with ${result.data?.data.length || 0} result(s)`,
            ),
          );
        } else {
          console.log(chalk.red("❌ Configuration test failed:"));
          console.log(chalk.red(result.error));
          process.exit(1);
        }
      } catch (error) {
        console.error(chalk.red("❌ Failed to test configuration:"), error);
        process.exit(1);
      }
    });

  return configCommand;
}
