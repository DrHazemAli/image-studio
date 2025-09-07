#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import figlet from 'figlet';
import gradient from 'gradient-string';
import boxen from 'boxen';
import { createConfigCommand } from './commands/config';
import { createGenerateCommand } from './commands/generate';
import { createModelsCommand } from './commands/models';
import { createAssetsCommand } from './commands/assets';
import { createDevCommand } from './commands/dev';
import { createProjectCommand } from './commands/project';

const program = new Command();

// ASCII Art Banner
function showBanner() {
  const banner = figlet.textSync('Azure Image Studio', {
    font: 'ANSI Shadow',
    horizontalLayout: 'default',
    verticalLayout: 'default'
  });

  const gradientBanner = gradient.rainbow(banner);
  
  console.log(boxen(gradientBanner, {
    title: 'CLI v1.0.0',
    titleAlignment: 'center',
    padding: 1,
    margin: 1,
    borderStyle: 'round',
    borderColor: 'blue'
  }));
}

// Main program setup
program
  .name('azure-image-studio')
  .description('Command-line interface for Azure Image Studio - AI-powered image generation and editing')
  .version('1.0.0')
  .addHelpText('before', () => {
    showBanner();
    return '';
  })
  .addHelpText('after', `
Examples:
  $ azure-image-studio config init
  $ azure-image-studio generate --prompt "a beautiful sunset"
  $ azure-image-studio models list
  $ azure-image-studio assets list
  $ azure-image-studio project create --name "My Project"
  $ azure-image-studio dev start

Documentation:
  https://github.com/DrHazemAli/azure-image-studio

Support:
  https://github.com/DrHazemAli/azure-image-studio/issues
  `);

// Add commands
program.addCommand(createConfigCommand());
program.addCommand(createGenerateCommand());
program.addCommand(createModelsCommand());
program.addCommand(createAssetsCommand());
program.addCommand(createDevCommand());
program.addCommand(createProjectCommand());

// Global options
program
  .option('-v, --verbose', 'Enable verbose output')
  .option('--no-color', 'Disable colored output')
  .option('--config <path>', 'Path to configuration file')
  .hook('preAction', (thisCommand) => {
    const options = thisCommand.opts();
    
    // Disable colors if requested
    if (options.noColor) {
      chalk.level = 0;
    }
    
    // Set verbose mode
    if (options.verbose) {
      process.env.VERBOSE = 'true';
    }
  });

// Error handling
program.exitOverride();

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error(chalk.red('❌ Uncaught Exception:'), error.message);
  if (process.env.VERBOSE) {
    console.error(error.stack);
  }
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('❌ Unhandled Rejection at:'), promise, 'reason:', reason);
  process.exit(1);
});

// Parse command line arguments
try {
  program.parse();
} catch (error) {
  if (error instanceof Error) {
    console.error(chalk.red('❌ Error:'), error.message);
  } else {
    console.error(chalk.red('❌ Unknown error occurred'));
  }
  process.exit(1);
}

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
