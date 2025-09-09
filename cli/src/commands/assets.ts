import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { table } from 'table';
import { AssetInfo } from '../types';

export function createAssetsCommand(): Command {
  const assetsCommand = new Command('assets');
  const assetsDir = path.join(process.cwd(), 'assets');

  assetsCommand.description('Manage generated images and assets').addHelpText(
    'after',
    `
Examples:
  $ azure-image-studio assets list
  $ azure-image-studio assets export --format png
  $ azure-image-studio assets clean --older-than 7d
  $ azure-image-studio assets organize --by-date
    `
  );

  // List assets
  assetsCommand
    .command('list')
    .alias('ls')
    .description('List all assets')
    .option('--format <format>', 'Output format (table, json)', 'table')
    .option('--type <type>', 'Filter by type (generation, upload, edit)')
    .option('--limit <number>', 'Limit number of results', '50')
    .option('--sort <field>', 'Sort by field (name, date, size)', 'date')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .action(async (options: any) => {
      try {
        await fs.ensureDir(assetsDir);
        const files = await fs.readdir(assetsDir);

        if (files.length === 0) {
          console.log(
            chalk.yellow('No assets found. Generate some images first!')
          );
          return;
        }

        const assets: AssetInfo[] = [];

        for (const file of files) {
          const filepath = path.join(assetsDir, file);
          const stats = await fs.stat(filepath);

          if (stats.isFile() && /\.(png|jpeg|jpg)$/i.test(file)) {
            const asset: AssetInfo = {
              id: path.basename(file, path.extname(file)),
              name: file,
              url: filepath,
              type: 'generation', // Default type
              timestamp: stats.mtime,
            };

            // Try to read metadata from companion file
            const metadataFile = path.join(assetsDir, `${asset.id}.json`);
            if (await fs.pathExists(metadataFile)) {
              try {
                const metadata = await fs.readJson(metadataFile);
                asset.prompt = metadata.prompt;
                asset.model = metadata.model;
                asset.size = metadata.size;
                asset.quality = metadata.quality;
                asset.type = metadata.type || 'generation';
              } catch (error) {
                // Ignore metadata errors
              }
            }

            assets.push(asset);
          }
        }

        // Filter by type
        if (options.type) {
          const filteredAssets = assets.filter(
            (asset) => asset.type === options.type
          );
          if (filteredAssets.length === 0) {
            console.log(
              chalk.yellow(`No assets found of type: ${options.type}`)
            );
            return;
          }
          assets.splice(0, assets.length, ...filteredAssets);
        }

        // Sort assets
        const sortField = options.sort || 'date';
        assets.sort((a, b) => {
          switch (sortField) {
            case 'name':
              return a.name.localeCompare(b.name);
            case 'date':
              return b.timestamp.getTime() - a.timestamp.getTime();
            case 'size':
              return 0; // Would need file size for this
            default:
              return 0;
          }
        });

        // Limit results
        const limit = parseInt(options.limit);
        const limitedAssets = assets.slice(0, limit);

        if (options.format === 'json') {
          console.log(JSON.stringify(limitedAssets, null, 2));
          return;
        }

        // Create table
        const tableData = [['Name', 'Type', 'Model', 'Size', 'Date', 'Prompt']];

        limitedAssets.forEach((asset) => {
          tableData.push([
            asset.name,
            asset.type || '-',
            asset.model || '-',
            asset.size || '-',
            asset.timestamp.toLocaleDateString(),
            asset.prompt
              ? asset.prompt.length > 30
                ? asset.prompt.substring(0, 30) + '...'
                : asset.prompt
              : '-',
          ]);
        });

        console.log(
          table(tableData, {
            header: {
              alignment: 'center',
              content: `Assets (${limitedAssets.length}/${assets.length})`,
            },
          })
        );

        if (assets.length > limit) {
          console.log(
            chalk.gray(
              `\nShowing ${limit} of ${assets.length} assets. Use --limit to see more.`
            )
          );
        }
      } catch (error) {
        console.error(chalk.red('❌ Failed to list assets:'), error);
        process.exit(1);
      }
    });

  // Export assets
  assetsCommand
    .command('export')
    .description('Export assets to a different format or location')
    .option('-f, --format <format>', 'Export format (png, jpeg, webp)', 'png')
    .option('-o, --output <path>', 'Output directory', './exports')
    .option('--quality <quality>', 'Export quality (1-100)', '90')
    .option('--resize <size>', 'Resize images (e.g., 512x512)')
    .option('--filter <type>', 'Filter by type (generation, upload, edit)')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .action(async (options: any) => {
      try {
        await fs.ensureDir(assetsDir);
        const files = await fs.readdir(assetsDir);

        if (files.length === 0) {
          console.log(chalk.yellow('No assets found to export.'));
          return;
        }

        const outputDir = options.output;
        await fs.ensureDir(outputDir);

        const sharp = await import('sharp');
        let processedCount = 0;

        console.log(chalk.blue(`📤 Exporting assets to ${outputDir}...`));

        for (const file of files) {
          if (!/\.(png|jpeg|jpg)$/i.test(file)) continue;

          const inputPath = path.join(assetsDir, file);
          const outputName = path.basename(file, path.extname(file));
          const outputPath = path.join(
            outputDir,
            `${outputName}.${options.format}`
          );

          try {
            let image = sharp.default(inputPath);

            // Resize if specified
            if (options.resize) {
              const [width, height] = options.resize.split('x').map(Number);
              image = image.resize(width, height);
            }

            // Set quality
            const quality = parseInt(options.quality);

            switch (options.format) {
              case 'jpeg':
              case 'jpg':
                image = image.jpeg({ quality });
                break;
              case 'webp':
                image = image.webp({ quality });
                break;
              case 'png':
                image = image.png({ quality });
                break;
            }

            await image.toFile(outputPath);
            processedCount++;

            console.log(
              chalk.green(`✅ Exported: ${file} → ${path.basename(outputPath)}`)
            );
          } catch (error) {
            console.log(chalk.red(`❌ Failed to export ${file}: ${error}`));
          }
        }

        console.log(
          chalk.blue(`\n📊 Export complete: ${processedCount} files processed`)
        );
      } catch (error) {
        console.error(chalk.red('❌ Failed to export assets:'), error);
        process.exit(1);
      }
    });

  // Clean assets
  assetsCommand
    .command('clean')
    .description('Clean up old or unused assets')
    .option(
      '--older-than <time>',
      'Remove files older than specified time (e.g., 7d, 30d, 1y)',
      '30d'
    )
    .option('--dry-run', 'Show what would be deleted without actually deleting')
    .option('--confirm', 'Skip confirmation prompt')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .action(async (options: any) => {
      try {
        await fs.ensureDir(assetsDir);
        const files = await fs.readdir(assetsDir);

        if (files.length === 0) {
          console.log(chalk.yellow('No assets found to clean.'));
          return;
        }

        // Parse time period
        const timeMatch = options.olderThan.match(/^(\d+)([dmy])$/);
        if (!timeMatch) {
          console.log(
            chalk.red('❌ Invalid time format. Use format like 7d, 30d, 1y')
          );
          return;
        }

        const [, amount, unit] = timeMatch;
        const amountNum = parseInt(amount);
        const now = new Date();
        const cutoffDate = new Date();

        switch (unit) {
          case 'd':
            cutoffDate.setDate(now.getDate() - amountNum);
            break;
          case 'm':
            cutoffDate.setMonth(now.getMonth() - amountNum);
            break;
          case 'y':
            cutoffDate.setFullYear(now.getFullYear() - amountNum);
            break;
        }

        const filesToDelete: string[] = [];

        for (const file of files) {
          const filepath = path.join(assetsDir, file);
          const stats = await fs.stat(filepath);

          if (stats.isFile() && stats.mtime < cutoffDate) {
            filesToDelete.push(file);
          }
        }

        if (filesToDelete.length === 0) {
          console.log(chalk.green('✅ No old files found to clean.'));
          return;
        }

        console.log(
          chalk.yellow(
            `Found ${filesToDelete.length} files older than ${options.olderThan}:`
          )
        );
        filesToDelete.forEach((file) => {
          console.log(chalk.gray(`  • ${file}`));
        });

        if (options.dryRun) {
          console.log(
            chalk.blue('\n🔍 Dry run complete. No files were deleted.')
          );
          return;
        }

        if (!options.confirm) {
          const answers = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'confirm',
              message: 'Are you sure you want to delete these files?',
              default: false,
            },
          ]);

          if (!answers.confirm) {
            console.log(chalk.yellow('Operation cancelled.'));
            return;
          }
        }

        let deletedCount = 0;
        for (const file of filesToDelete) {
          try {
            const filepath = path.join(assetsDir, file);
            await fs.remove(filepath);

            // Also remove metadata file if it exists
            const metadataFile = path.join(
              assetsDir,
              `${path.basename(file, path.extname(file))}.json`
            );
            if (await fs.pathExists(metadataFile)) {
              await fs.remove(metadataFile);
            }

            deletedCount++;
            console.log(chalk.green(`✅ Deleted: ${file}`));
          } catch (error) {
            console.log(chalk.red(`❌ Failed to delete ${file}: ${error}`));
          }
        }

        console.log(
          chalk.blue(`\n📊 Cleanup complete: ${deletedCount} files deleted`)
        );
      } catch (error) {
        console.error(chalk.red('❌ Failed to clean assets:'), error);
        process.exit(1);
      }
    });

  // Organize assets
  assetsCommand
    .command('organize')
    .description('Organize assets into folders')
    .option('--by-date', 'Organize by creation date')
    .option('--by-model', 'Organize by AI model')
    .option('--by-type', 'Organize by asset type')
    .option(
      '--dry-run',
      'Show what would be organized without actually moving files'
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .action(async (options: any) => {
      try {
        await fs.ensureDir(assetsDir);
        const files = await fs.readdir(assetsDir);

        if (files.length === 0) {
          console.log(chalk.yellow('No assets found to organize.'));
          return;
        }

        const imageFiles = files.filter((file) =>
          /\.(png|jpeg|jpg)$/i.test(file)
        );

        if (imageFiles.length === 0) {
          console.log(chalk.yellow('No image files found to organize.'));
          return;
        }

        const organizationPlan: { [key: string]: string[] } = {};

        for (const file of imageFiles) {
          const filepath = path.join(assetsDir, file);
          const stats = await fs.stat(filepath);

          let folderName = 'other';

          if (options.byDate) {
            const date = stats.mtime.toISOString().split('T')[0]; // YYYY-MM-DD
            folderName = date;
          } else if (options.byModel) {
            // Try to read metadata
            const metadataFile = path.join(
              assetsDir,
              `${path.basename(file, path.extname(file))}.json`
            );
            if (await fs.pathExists(metadataFile)) {
              try {
                const metadata = await fs.readJson(metadataFile);
                folderName = metadata.model || 'unknown';
              } catch (error) {
                folderName = 'unknown';
              }
            } else {
              folderName = 'unknown';
            }
          } else if (options.byType) {
            // Try to read metadata
            const metadataFile = path.join(
              assetsDir,
              `${path.basename(file, path.extname(file))}.json`
            );
            if (await fs.pathExists(metadataFile)) {
              try {
                const metadata = await fs.readJson(metadataFile);
                folderName = metadata.type || 'generation';
              } catch (error) {
                folderName = 'generation';
              }
            } else {
              folderName = 'generation';
            }
          }

          if (!organizationPlan[folderName]) {
            organizationPlan[folderName] = [];
          }
          organizationPlan[folderName].push(file);
        }

        console.log(chalk.blue('📁 Organization plan:'));
        Object.entries(organizationPlan).forEach(([folder, files]) => {
          console.log(chalk.blue(`\n${folder}/ (${files.length} files):`));
          files.forEach((file) => {
            console.log(chalk.gray(`  • ${file}`));
          });
        });

        if (options.dryRun) {
          console.log(
            chalk.blue('\n🔍 Dry run complete. No files were moved.')
          );
          return;
        }

        const answers = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirm',
            message: 'Are you sure you want to organize these files?',
            default: false,
          },
        ]);

        if (!answers.confirm) {
          console.log(chalk.yellow('Operation cancelled.'));
          return;
        }

        let movedCount = 0;
        for (const [folder, files] of Object.entries(organizationPlan)) {
          const folderPath = path.join(assetsDir, folder);
          await fs.ensureDir(folderPath);

          for (const file of files) {
            try {
              const sourcePath = path.join(assetsDir, file);
              const destPath = path.join(folderPath, file);

              await fs.move(sourcePath, destPath);

              // Also move metadata file if it exists
              const metadataFile = path.join(
                assetsDir,
                `${path.basename(file, path.extname(file))}.json`
              );
              if (await fs.pathExists(metadataFile)) {
                const destMetadataPath = path.join(
                  folderPath,
                  `${path.basename(file, path.extname(file))}.json`
                );
                await fs.move(metadataFile, destMetadataPath);
              }

              movedCount++;
              console.log(chalk.green(`✅ Moved: ${file} → ${folder}/`));
            } catch (error) {
              console.log(chalk.red(`❌ Failed to move ${file}: ${error}`));
            }
          }
        }

        console.log(
          chalk.blue(`\n📊 Organization complete: ${movedCount} files moved`)
        );
      } catch (error) {
        console.error(chalk.red('❌ Failed to organize assets:'), error);
        process.exit(1);
      }
    });

  return assetsCommand;
}
