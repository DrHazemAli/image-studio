import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import { table } from 'table';
import { ConfigManager } from '../lib/config-manager';
import { AzureImageProvider } from '../lib/azure-provider';
import { BatchGenerationOptions } from '../types';

export function createGenerateCommand(): Command {
  const generateCommand = new Command('generate');
  const configManager = new ConfigManager();

  generateCommand
    .description('Generate images using Azure AI models')
    .addHelpText('after', `
Examples:
  $ azure-image-studio generate --prompt "a beautiful sunset"
  $ azure-image-studio generate --prompt "a cat" --model dalle-3 --size 1024x1024
  $ azure-image-studio generate --file prompts.txt --batch
  $ azure-image-studio generate --prompt "..." --quality hd --count 4
    `);

  // Single image generation
  generateCommand
    .command('single')
    .alias('s')
    .description('Generate a single image')
    .option('-p, --prompt <prompt>', 'Text prompt for image generation')
    .option('-m, --model <model>', 'Model to use for generation')
    .option('-s, --size <size>', 'Image size (e.g., 1024x1024)')
    .option('-q, --quality <quality>', 'Image quality (standard, hd)')
    .option('-c, --count <count>', 'Number of images to generate', '1')
    .option('-o, --output <path>', 'Output directory for generated images')
    .option('-f, --format <format>', 'Output format (png, jpeg)', 'png')
    .option('--style <style>', 'Image style (natural, vivid)')
    .option('--seed <seed>', 'Seed for reproducible results')
    .option('--negative-prompt <prompt>', 'Negative prompt')
    .option('--verbose', 'Show detailed output')
    .action(async (options) => {
      try {
        if (!options.prompt) {
          const answers = await inquirer.prompt([
            {
              type: 'input',
              name: 'prompt',
              message: 'Enter your image prompt:',
              validate: (input: string) => {
                if (!input.trim()) {
                  return 'Prompt is required';
                }
                return true;
              }
            }
          ]);
          options.prompt = answers.prompt;
        }

        await generateSingleImage(options);
        
      } catch (error) {
        console.error(chalk.red('❌ Generation failed:'), error);
        process.exit(1);
      }
    });

  // Batch generation
  generateCommand
    .command('batch')
    .alias('b')
    .description('Generate multiple images from a file')
    .option('-f, --file <file>', 'File containing prompts (one per line)')
    .option('-m, --model <model>', 'Model to use for generation')
    .option('-s, --size <size>', 'Image size (e.g., 1024x1024)')
    .option('-q, --quality <quality>', 'Image quality (standard, hd)')
    .option('-o, --output <path>', 'Output directory for generated images')
    .option('--delay <ms>', 'Delay between requests in milliseconds', '1000')
    .option('--max-concurrent <count>', 'Maximum concurrent requests', '3')
    .option('--verbose', 'Show detailed output')
    .action(async (options) => {
      try {
        if (!options.file) {
          const answers = await inquirer.prompt([
            {
              type: 'input',
              name: 'file',
              message: 'Enter path to prompts file:',
              validate: (input: string) => {
                if (!input.trim()) {
                  return 'File path is required';
                }
                return true;
              }
            }
          ]);
          options.file = answers.file;
        }

        await generateBatchImages(options);
        
      } catch (error) {
        console.error(chalk.red('❌ Batch generation failed:'), error);
        process.exit(1);
      }
    });

  // Interactive generation
  generateCommand
    .command('interactive')
    .alias('i')
    .description('Interactive image generation with prompts')
    .action(async () => {
      try {
        await interactiveGeneration();
      } catch (error) {
        console.error(chalk.red('❌ Interactive generation failed:'), error);
        process.exit(1);
      }
    });

  return generateCommand;
}

async function generateSingleImage(options: any) {
  const configManager = new ConfigManager();
  const config = await configManager.loadAzureConfig();
  const apiKey = await configManager.getApiKey();

  if (!config || !apiKey) {
    throw new Error('Configuration or API key not found. Run "azure-image-studio config init" first.');
  }

  const provider = new AzureImageProvider(config, apiKey);
  
  // Get available models
  const deployments = provider.getDeployments();
  const modelId = options.model || deployments[0]?.id;
  
  if (!modelId) {
    throw new Error('No model specified and no default model found');
  }

  const spinner = ora('Generating image...').start();

  try {
    const result = await provider.generateImage(modelId, {
      prompt: options.prompt,
      output_format: options.format,
      n: parseInt(options.count),
      size: options.size,
      quality: options.quality,
      style: options.style,
      seed: options.seed ? parseInt(options.seed) : undefined,
      negativePrompt: options.negativePrompt
    }, (progress) => {
      spinner.text = `Generating image... ${progress}%`;
    });

    spinner.stop();

    if (!result.success) {
      throw new Error(result.error);
    }

    console.log(chalk.green('✅ Image generated successfully!'));

    // Save images
    const outputDir = options.output || './generated-images';
    await fs.ensureDir(outputDir);

    for (let i = 0; i < result.data!.data.length; i++) {
      const imageData = result.data!.data[i];
      const filename = `generated-${Date.now()}-${i + 1}.${options.format}`;
      const filepath = path.join(outputDir, filename);

      if (imageData.b64_json) {
        const buffer = Buffer.from(imageData.b64_json, 'base64');
        await fs.writeFile(filepath, buffer);
        console.log(chalk.blue(`📁 Saved: ${filepath}`));
      }
    }

    if (options.verbose) {
      console.log(chalk.gray('\nGeneration Details:'));
      console.log(chalk.gray(`Model: ${modelId}`));
      console.log(chalk.gray(`Prompt: ${options.prompt}`));
      console.log(chalk.gray(`Size: ${options.size || 'default'}`));
      console.log(chalk.gray(`Quality: ${options.quality || 'default'}`));
      console.log(chalk.gray(`Count: ${options.count}`));
    }

  } catch (error) {
    spinner.stop();
    throw error;
  }
}

async function generateBatchImages(options: BatchGenerationOptions) {
  const configManager = new ConfigManager();
  const config = await configManager.loadAzureConfig();
  const apiKey = await configManager.getApiKey();

  if (!config || !apiKey) {
    throw new Error('Configuration or API key not found. Run "azure-image-studio config init" first.');
  }

  // Read prompts from file
  const promptsFile = await fs.readFile(options.inputFile, 'utf-8');
  const prompts = promptsFile.split('\n').filter(line => line.trim());

  if (prompts.length === 0) {
    throw new Error('No prompts found in file');
  }

  console.log(chalk.blue(`📝 Found ${prompts.length} prompts to process`));

  const provider = new AzureImageProvider(config, apiKey);
  const deployments = provider.getDeployments();
  const modelId = options.model || deployments[0]?.id;

  if (!modelId) {
    throw new Error('No model specified and no default model found');
  }

  const outputDir = options.outputDir || './generated-images';
  await fs.ensureDir(outputDir);

  const results = [];
  const maxConcurrent = parseInt(options.maxConcurrent?.toString() || '3');
  const delay = parseInt(options.delay?.toString() || '1000');

  // Process prompts in batches
  for (let i = 0; i < prompts.length; i += maxConcurrent) {
    const batch = prompts.slice(i, i + maxConcurrent);
    const batchPromises = batch.map(async (prompt, batchIndex) => {
      const globalIndex = i + batchIndex;
      const spinner = ora(`Processing prompt ${globalIndex + 1}/${prompts.length}: ${prompt.substring(0, 50)}...`).start();

      try {
        const result = await provider.generateImage(modelId, {
          prompt: prompt.trim(),
          output_format: 'png',
          n: 1,
          size: options.size,
          quality: options.quality
        });

        spinner.stop();

        if (result.success && result.data?.data[0]?.b64_json) {
          const filename = `batch-${globalIndex + 1}-${Date.now()}.png`;
          const filepath = path.join(outputDir, filename);
          const buffer = Buffer.from(result.data.data[0].b64_json, 'base64');
          await fs.writeFile(filepath, buffer);

          console.log(chalk.green(`✅ ${globalIndex + 1}/${prompts.length}: ${filename}`));
          return { success: true, prompt, filename };
        } else {
          console.log(chalk.red(`❌ ${globalIndex + 1}/${prompts.length}: ${result.error}`));
          return { success: false, prompt, error: result.error };
        }
      } catch (error) {
        spinner.stop();
        console.log(chalk.red(`❌ ${globalIndex + 1}/${prompts.length}: ${error}`));
        return { success: false, prompt, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);

    // Delay between batches
    if (i + maxConcurrent < prompts.length) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // Summary
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(chalk.blue('\n📊 Batch Generation Summary:'));
  console.log(chalk.green(`✅ Successful: ${successful}`));
  console.log(chalk.red(`❌ Failed: ${failed}`));
  console.log(chalk.blue(`📁 Output directory: ${outputDir}`));
}

async function interactiveGeneration() {
  const configManager = new ConfigManager();
  const config = await configManager.loadAzureConfig();
  const apiKey = await configManager.getApiKey();

  if (!config || !apiKey) {
    throw new Error('Configuration or API key not found. Run "azure-image-studio config init" first.');
  }

  const provider = new AzureImageProvider(config, apiKey);
  const deployments = provider.getDeployments();

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'prompt',
      message: 'Enter your image prompt:',
      validate: (input: string) => {
        if (!input.trim()) {
          return 'Prompt is required';
        }
        return true;
      }
    },
    {
      type: 'list',
      name: 'model',
      message: 'Select a model:',
      choices: deployments.map(d => ({ name: `${d.name} (${d.id})`, value: d.id }))
    },
    {
      type: 'list',
      name: 'size',
      message: 'Select image size:',
      choices: [
        { name: '1024x1024 (Square)', value: '1024x1024' },
        { name: '1024x1792 (Portrait)', value: '1024x1792' },
        { name: '1792x1024 (Landscape)', value: '1792x1024' }
      ],
      default: '1024x1024'
    },
    {
      type: 'list',
      name: 'quality',
      message: 'Select quality:',
      choices: [
        { name: 'Standard', value: 'standard' },
        { name: 'HD', value: 'hd' }
      ],
      default: 'standard'
    },
    {
      type: 'input',
      name: 'count',
      message: 'Number of images:',
      default: '1',
      validate: (input: string) => {
        const num = parseInt(input);
        if (isNaN(num) || num < 1 || num > 4) {
          return 'Please enter a number between 1 and 4';
        }
        return true;
      }
    }
  ]);

  const spinner = ora('Generating image...').start();

  try {
    const result = await provider.generateImage(answers.model, {
      prompt: answers.prompt,
      output_format: 'png',
      n: parseInt(answers.count),
      size: answers.size,
      quality: answers.quality
    }, (progress) => {
      spinner.text = `Generating image... ${progress}%`;
    });

    spinner.stop();

    if (!result.success) {
      throw new Error(result.error);
    }

    console.log(chalk.green('✅ Image generated successfully!'));

    // Save images
    const outputDir = './generated-images';
    await fs.ensureDir(outputDir);

    for (let i = 0; i < result.data!.data.length; i++) {
      const imageData = result.data!.data[i];
      const filename = `interactive-${Date.now()}-${i + 1}.png`;
      const filepath = path.join(outputDir, filename);

      if (imageData.b64_json) {
        const buffer = Buffer.from(imageData.b64_json, 'base64');
        await fs.writeFile(filepath, buffer);
        console.log(chalk.blue(`📁 Saved: ${filepath}`));
      }
    }

  } catch (error) {
    spinner.stop();
    throw error;
  }
}
