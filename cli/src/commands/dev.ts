import { Command } from "commander";
import { spawn } from "child_process";
import chalk from "chalk";
import ora from "ora";
import fs from "fs-extra";
import path from "path";
import { ConfigManager } from "../lib/config-manager";

export function createDevCommand(): Command {
  const devCommand = new Command("dev");
  const configManager = new ConfigManager();

  devCommand.description("Development and testing utilities").addHelpText(
    "after",
    `
Examples:
  $ image-studio dev start
  $ image-studio dev test --endpoint <url>
  $ image-studio dev logs --follow
  $ image-studio dev setup
    `,
  );

  // Start development server
  devCommand
    .command("start")
    .description("Start the Image Studio development server")
    .option("-p, --port <port>", "Port to run on", "3000")
    .option("--no-open", "Don't open browser automatically")
    .action(async (options) => {
      try {
        console.log(
          chalk.blue("🚀 Starting Image Studio development server..."),
        );

        // Check if we're in the right directory
        const packageJsonPath = path.join(process.cwd(), "package.json");
        if (!(await fs.pathExists(packageJsonPath))) {
          console.log(chalk.red("❌ Not in Image Studio project directory."));
          console.log(
            chalk.yellow(
              "Please run this command from the project root directory.",
            ),
          );
          process.exit(1);
        }

        // Check if dependencies are installed
        const nodeModulesPath = path.join(process.cwd(), "node_modules");
        if (!(await fs.pathExists(nodeModulesPath))) {
          console.log(chalk.yellow("📦 Installing dependencies..."));
          const installSpinner = ora("Installing dependencies").start();

          try {
            await runCommand("npm", ["install"], { stdio: "pipe" });
            installSpinner.succeed("Dependencies installed");
          } catch (error) {
            installSpinner.fail("Failed to install dependencies");
            throw error;
          }
        }

        // Validate configuration
        console.log(chalk.blue("🔍 Validating configuration..."));
        const validation = await configManager.validateConfig();
        if (!validation.isValid) {
          console.log(chalk.yellow("⚠️  Configuration issues detected:"));
          validation.errors.forEach((error) => {
            console.log(chalk.yellow(`  • ${error}`));
          });
          console.log(
            chalk.yellow(
              "\nYou can fix these issues later. Starting server anyway...",
            ),
          );
        } else {
          console.log(chalk.green("✅ Configuration is valid"));
        }

        // Start the development server
        console.log(
          chalk.blue(`🌐 Starting server on port ${options.port}...`),
        );

        const serverProcess = spawn("npm", ["run", "dev"], {
          stdio: "inherit",
          env: { ...process.env, PORT: options.port },
        });

        // Handle process events
        serverProcess.on("error", (error) => {
          console.error(chalk.red("❌ Failed to start server:"), error);
          process.exit(1);
        });

        serverProcess.on("exit", (code) => {
          if (code !== 0) {
            console.log(chalk.red(`❌ Server exited with code ${code}`));
            process.exit(code || 1);
          }
        });

        // Open browser if requested
        if (options.open !== false) {
          setTimeout(() => {
            const open = require("open");
            open(`http://localhost:${options.port}`);
          }, 3000);
        }

        // Handle graceful shutdown
        process.on("SIGINT", () => {
          console.log(chalk.yellow("\n🛑 Shutting down server..."));
          serverProcess.kill("SIGINT");
        });
      } catch (error) {
        console.error(
          chalk.red("❌ Failed to start development server:"),
          error,
        );
        process.exit(1);
      }
    });

  // Test endpoint
  devCommand
    .command("test")
    .description("Test Azure endpoint connectivity")
    .option("-e, --endpoint <url>", "Endpoint URL to test")
    .option("-k, --key <key>", "API key to use for testing")
    .action(async (options) => {
      try {
        const endpoint = options.endpoint;
        const apiKey = options.key || (await configManager.getApiKey());

        if (!endpoint) {
          console.log(
            chalk.red("❌ Endpoint URL is required. Use --endpoint <url>"),
          );
          process.exit(1);
        }

        if (!apiKey) {
          console.log(
            chalk.red(
              "❌ API key is required. Use --key <key> or set AZURE_API_KEY",
            ),
          );
          process.exit(1);
        }

        console.log(chalk.blue(`🧪 Testing endpoint: ${endpoint}`));

        const spinner = ora("Testing endpoint connectivity...").start();

        try {
          // Test basic connectivity
          const response = await fetch(
            `${endpoint}/openai/deployments?api-version=2025-04-01-preview`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
              },
            },
          );

          spinner.stop();

          if (response.ok) {
            console.log(chalk.green("✅ Endpoint is accessible"));
            console.log(
              chalk.green(`Status: ${response.status} ${response.statusText}`),
            );

            try {
              const data = await response.json();
              if (data.data && Array.isArray(data.data)) {
                console.log(
                  chalk.blue(`📋 Found ${data.data.length} deployments:`),
                );
                data.data.forEach((deployment: any) => {
                  console.log(
                    chalk.gray(`  • ${deployment.id} (${deployment.model})`),
                  );
                });
              }
            } catch (error) {
              console.log(chalk.yellow("⚠️  Could not parse response data"));
            }
          } else {
            console.log(chalk.red("❌ Endpoint test failed"));
            console.log(
              chalk.red(`Status: ${response.status} ${response.statusText}`),
            );

            try {
              const errorData = await response.text();
              console.log(chalk.red(`Error: ${errorData}`));
            } catch (error) {
              // Ignore error parsing errors
            }
          }
        } catch (error) {
          spinner.stop();
          console.log(chalk.red("❌ Endpoint test failed:"));
          console.log(
            chalk.red(error instanceof Error ? error.message : "Unknown error"),
          );
        }
      } catch (error) {
        console.error(chalk.red("❌ Failed to test endpoint:"), error);
        process.exit(1);
      }
    });

  // Setup development environment
  devCommand
    .command("setup")
    .description("Set up development environment")
    .option("--skip-deps", "Skip dependency installation")
    .option("--skip-config", "Skip configuration setup")
    .action(async (options) => {
      try {
        console.log(
          chalk.blue("🛠️  Setting up Image Studio development environment..."),
        );

        // Check if we're in the right directory
        const packageJsonPath = path.join(process.cwd(), "package.json");
        if (!(await fs.pathExists(packageJsonPath))) {
          console.log(chalk.red("❌ Not in Image Studio project directory."));
          console.log(
            chalk.yellow(
              "Please run this command from the project root directory.",
            ),
          );
          process.exit(1);
        }

        // Install dependencies
        if (!options.skipDeps) {
          console.log(chalk.blue("📦 Installing dependencies..."));
          const installSpinner = ora("Installing dependencies").start();

          try {
            await runCommand("npm", ["install"], { stdio: "pipe" });
            installSpinner.succeed("Dependencies installed");
          } catch (error) {
            installSpinner.fail("Failed to install dependencies");
            throw error;
          }
        }

        // Setup configuration
        if (!options.skipConfig) {
          console.log(chalk.blue("⚙️  Setting up configuration..."));

          const configExists = await configManager.loadAzureConfig();
          if (!configExists) {
            console.log(chalk.yellow("Creating default configuration..."));
            await configManager.createDefaultConfig();
            console.log(chalk.green("✅ Default configuration created"));
          } else {
            console.log(chalk.green("✅ Configuration already exists"));
          }

          // Check for API key
          const apiKey = await configManager.getApiKey();
          if (!apiKey) {
            console.log(
              chalk.yellow("⚠️  No API key found. You can set one with:"),
            );
            console.log(chalk.gray("  image-studio config set-api-key"));
          } else {
            console.log(chalk.green("✅ API key found"));
          }
        }

        // Create necessary directories
        console.log(chalk.blue("📁 Creating directories..."));
        const directories = [
          "assets",
          "generated-images",
          "test-images",
          "exports",
        ];

        for (const dir of directories) {
          await fs.ensureDir(path.join(process.cwd(), dir));
        }

        console.log(chalk.green("✅ Development environment setup complete!"));
        console.log(chalk.blue("\nNext steps:"));
        console.log(
          chalk.gray(
            "1. Configure your Azure endpoints in src/app/config/azure-config.json",
          ),
        );
        console.log(
          chalk.gray("2. Set your API key: image-studio config set-api-key"),
        );
        console.log(
          chalk.gray("3. Start the development server: image-studio dev start"),
        );
      } catch (error) {
        console.error(
          chalk.red("❌ Failed to setup development environment:"),
          error,
        );
        process.exit(1);
      }
    });

  // Show logs
  devCommand
    .command("logs")
    .description("Show development logs")
    .option("-f, --follow", "Follow log output")
    .option("--lines <number>", "Number of lines to show", "50")
    .action(async (options) => {
      try {
        const logFile = path.join(process.cwd(), "logs", "development.log");

        if (!(await fs.pathExists(logFile))) {
          console.log(
            chalk.yellow(
              "No log file found. Start the development server to generate logs.",
            ),
          );
          return;
        }

        if (options.follow) {
          console.log(chalk.blue("📋 Following logs (Ctrl+C to stop)..."));
          const tail = spawn("tail", ["-f", logFile], { stdio: "inherit" });

          process.on("SIGINT", () => {
            tail.kill("SIGINT");
          });
        } else {
          const lines = parseInt(options.lines);
          const logContent = await fs.readFile(logFile, "utf-8");
          const logLines = logContent.split("\n");
          const recentLines = logLines.slice(-lines).join("\n");

          console.log(chalk.blue(`📋 Recent logs (last ${lines} lines):`));
          console.log(recentLines);
        }
      } catch (error) {
        console.error(chalk.red("❌ Failed to show logs:"), error);
        process.exit(1);
      }
    });

  return devCommand;
}

// Helper function to run commands
function runCommand(
  command: string,
  args: string[],
  options: any = {},
): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: options.stdio || "inherit",
      ...options,
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });

    child.on("error", (error) => {
      reject(error);
    });
  });
}
