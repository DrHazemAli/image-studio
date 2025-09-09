import { Command } from 'commander';
import chalk from 'chalk';
import boxen from 'boxen';
import { table } from 'table';
import { ConfigManager } from '../lib/config-manager';
import { AzureImageProvider } from '../lib/azure-provider';

export function createModelsCommand(): Command {
  const modelsCommand = new Command('models');
  const configManager = new ConfigManager();

  modelsCommand.description('List and manage available AI models').addHelpText(
    'after',
    `
Examples:
  $ azure-image-studio models list
  $ azure-image-studio models info --model dalle-3
  $ azure-image-studio models test --model flux-1-1-pro
    `
  );

  // List all models
  modelsCommand
    .command('list')
    .alias('ls')
    .description('List all available models')
    .option('--format <format>', 'Output format (table, json)', 'table')
    .option('--verbose', 'Show detailed information')
    .action(async (options) => {
      try {
        const config = await configManager.loadAzureConfig();

        if (!config) {
          console.log(
            chalk.yellow(
              'No configuration found. Run "azure-image-studio config init" to create one.'
            )
          );
          return;
        }

        const provider = new AzureImageProvider(config, 'dummy-key'); // We don't need the key for listing
        const deployments = provider.getDeployments();

        if (deployments.length === 0) {
          console.log(chalk.yellow('No models configured.'));
          return;
        }

        if (options.format === 'json') {
          console.log(JSON.stringify(deployments, null, 2));
          return;
        }

        // Create table
        const tableData = [
          ['ID', 'Name', 'Provider', 'Max Size', 'Formats', 'Description'],
        ];

        deployments.forEach((deployment) => {
          const endpoint = config.endpoints.find((e) =>
            e.deployments.some((d) => d.id === deployment.id)
          );

          tableData.push([
            deployment.id,
            deployment.name,
            endpoint?.name || 'Unknown',
            deployment.maxSize,
            deployment.supportedFormats.join(', '),
            deployment.description || '-',
          ]);
        });

        console.log(
          boxen(
            table(tableData, {
              header: {
                alignment: 'center',
                content: 'Available AI Models',
              },
              border: {
                topBody: '─',
                topJoin: '┬',
                topLeft: '┌',
                topRight: '┐',
                bottomBody: '─',
                bottomJoin: '┴',
                bottomLeft: '└',
                bottomRight: '┘',
                bodyLeft: '│',
                bodyRight: '│',
                bodyJoin: '│',
                joinBody: '─',
                joinLeft: '├',
                joinRight: '┤',
                joinJoin: '┼',
              },
            }),
            {
              title: 'Azure Image Studio Models',
              titleAlignment: 'center',
              padding: 1,
              margin: 1,
              borderStyle: 'round',
              borderColor: 'blue',
            }
          )
        );

        if (options.verbose) {
          console.log(chalk.blue('\n📋 Endpoint Details:'));
          config.endpoints.forEach((endpoint, index) => {
            console.log(chalk.blue(`\n${index + 1}. ${endpoint.name}`));
            console.log(chalk.gray(`   Base URL: ${endpoint.baseUrl}`));
            console.log(chalk.gray(`   API Version: ${endpoint.apiVersion}`));
            console.log(
              chalk.gray(`   Models: ${endpoint.deployments.length}`)
            );
          });
        }
      } catch (error) {
        console.error(chalk.red('❌ Failed to list models:'), error);
        process.exit(1);
      }
    });

  // Show model information
  modelsCommand
    .command('info')
    .description('Show detailed information about a specific model')
    .option('-m, --model <model>', 'Model ID to get information for')
    .action(async (options) => {
      try {
        if (!options.model) {
          console.log(chalk.red('❌ Model ID is required. Use --model <id>'));
          process.exit(1);
        }

        const config = await configManager.loadAzureConfig();

        if (!config) {
          console.log(
            chalk.yellow(
              'No configuration found. Run "azure-image-studio config init" to create one.'
            )
          );
          return;
        }

        const provider = new AzureImageProvider(config, 'dummy-key');
        const deploymentInfo = provider.getDeploymentById(options.model);

        if (!deploymentInfo) {
          console.log(chalk.red(`❌ Model "${options.model}" not found.`));
          console.log(
            chalk.yellow(
              'Run "azure-image-studio models list" to see available models.'
            )
          );
          return;
        }

        const { endpoint, deployment } = deploymentInfo;

        const modelInfo = {
          'Model ID': deployment.id,
          Name: deployment.name,
          'Deployment Name': deployment.deploymentName,
          Provider: endpoint.name,
          Endpoint: endpoint.baseUrl,
          'API Version': endpoint.apiVersion,
          'Max Size': deployment.maxSize,
          'Supported Formats': deployment.supportedFormats.join(', '),
          Description: deployment.description || 'No description available',
        };

        console.log(
          boxen(
            Object.entries(modelInfo)
              .map(
                ([key, value]) => `${chalk.blue(key)}: ${chalk.white(value)}`
              )
              .join('\n'),
            {
              title: `Model Information: ${deployment.name}`,
              titleAlignment: 'center',
              padding: 1,
              margin: 1,
              borderStyle: 'round',
              borderColor: 'green',
            }
          )
        );
      } catch (error) {
        console.error(chalk.red('❌ Failed to get model information:'), error);
        process.exit(1);
      }
    });

  // Test model
  modelsCommand
    .command('test')
    .description('Test a model with a simple generation request')
    .option('-m, --model <model>', 'Model ID to test')
    .option('-p, --prompt <prompt>', 'Test prompt', 'A simple test image')
    .option('--no-save', "Don't save the generated image")
    .action(async (options) => {
      try {
        if (!options.model) {
          console.log(chalk.red('❌ Model ID is required. Use --model <id>'));
          process.exit(1);
        }

        const config = await configManager.loadAzureConfig();
        const apiKey = await configManager.getApiKey();

        if (!config || !apiKey) {
          console.log(
            chalk.red(
              '❌ Configuration or API key not found. Run "azure-image-studio config init" first.'
            )
          );
          return;
        }

        const provider = new AzureImageProvider(config, apiKey);
        const deploymentInfo = provider.getDeploymentById(options.model);

        if (!deploymentInfo) {
          console.log(chalk.red(`❌ Model "${options.model}" not found.`));
          return;
        }

        console.log(
          chalk.blue(`🧪 Testing model: ${deploymentInfo.deployment.name}`)
        );
        console.log(chalk.gray(`Prompt: ${options.prompt}`));

        const spinner = ora('Testing model...').start();

        try {
          const result = await provider.generateImage(
            options.model,
            {
              prompt: options.prompt,
              output_format: 'png',
              n: 1,
              size: '256x256', // Small size for testing
            },
            (progress) => {
              spinner.text = `Testing model... ${progress}%`;
            }
          );

          spinner.stop();

          if (result.success) {
            console.log(chalk.green('✅ Model test successful!'));
            console.log(
              chalk.green(
                `Generated image with ${result.data?.data.length || 0} result(s)`
              )
            );

            if (!options.noSave && result.data?.data[0]?.b64_json) {
              const fs = await import('fs-extra');
              const path = await import('path');

              const outputDir = './test-images';
              await fs.ensureDir(outputDir);

              const filename = `test-${options.model}-${Date.now()}.png`;
              const filepath = path.join(outputDir, filename);
              const buffer = Buffer.from(
                result.data.data[0].b64_json,
                'base64'
              );
              await fs.writeFile(filepath, buffer);

              console.log(chalk.blue(`📁 Test image saved: ${filepath}`));
            }
          } else {
            console.log(chalk.red('❌ Model test failed:'));
            console.log(chalk.red(result.error));
            process.exit(1);
          }
        } catch (error) {
          spinner.stop();
          throw error;
        }
      } catch (error) {
        console.error(chalk.red('❌ Failed to test model:'), error);
        process.exit(1);
      }
    });

  // Check model status
  modelsCommand
    .command('status')
    .description('Check the status of all configured models')
    .action(async () => {
      try {
        const config = await configManager.loadAzureConfig();
        const apiKey = await configManager.getApiKey();

        if (!config) {
          console.log(
            chalk.yellow(
              'No configuration found. Run "azure-image-studio config init" to create one.'
            )
          );
          return;
        }

        if (!apiKey) {
          console.log(
            chalk.red(
              '❌ API key not found. Run "azure-image-studio config set-api-key" first.'
            )
          );
          return;
        }

        const provider = new AzureImageProvider(config, apiKey);
        const deployments = provider.getDeployments();

        console.log(chalk.blue('🔍 Checking model status...\n'));

        const statusResults = [];

        for (const deployment of deployments) {
          const spinner = ora(`Checking ${deployment.name}...`).start();

          try {
            const result = await provider.generateImage(deployment.id, {
              prompt: 'test',
              output_format: 'png',
              n: 1,
              size: '256x256',
            });

            spinner.stop();

            if (result.success) {
              statusResults.push({
                model: deployment.name,
                status: '✅ Online',
                response: 'Working',
              });
            } else {
              statusResults.push({
                model: deployment.name,
                status: '❌ Error',
                response: result.error || 'Unknown error',
              });
            }
          } catch (error) {
            spinner.stop();
            statusResults.push({
              model: deployment.name,
              status: '❌ Error',
              response:
                error instanceof Error ? error.message : 'Unknown error',
            });
          }
        }

        // Display results
        const tableData = [['Model', 'Status', 'Response']];

        statusResults.forEach((result) => {
          tableData.push([
            result.model,
            result.status,
            result.response.length > 50
              ? result.response.substring(0, 50) + '...'
              : result.response,
          ]);
        });

        console.log(
          table(tableData, {
            header: {
              alignment: 'center',
              content: 'Model Status Check',
            },
          })
        );
      } catch (error) {
        console.error(chalk.red('❌ Failed to check model status:'), error);
        process.exit(1);
      }
    });

  return modelsCommand;
}
