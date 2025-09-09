import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { table } from 'table';
import { ConfigManager } from '../lib/config-manager';
import { AssetInfo } from '../types';

export function createProjectCommand(): Command {
  const projectCommand = new Command('project');
  const configManager = new ConfigManager();
  const assetsDir = path.join(process.cwd(), 'assets');
  const projectsDir = path.join(process.cwd(), 'projects');

  projectCommand.description('Manage Azure Image Studio projects').addHelpText(
    'after',
    `
Examples:
  $ azure-image-studio project create --name "My Project"
  $ azure-image-studio project export --name "My Project" --output ./exports
  $ azure-image-studio project import --file project.zip
  $ azure-image-studio project list
  $ azure-image-studio project delete --name "My Project"
    `
  );

  // Create new project
  projectCommand
    .command('create')
    .description('Create a new project')
    .option('-n, --name <name>', 'Project name')
    .option('-d, --description <description>', 'Project description')
    .option(
      '--template <template>',
      'Project template (blank, social-media, product, art)'
    )
    .action(async (options) => {
      try {
        let projectName = options.name;
        let description = options.description;
        let template = options.template;

        if (!projectName) {
          const answers = await inquirer.prompt([
            {
              type: 'input',
              name: 'name',
              message: 'Enter project name:',
              validate: (input: string) => {
                if (!input.trim()) {
                  return 'Project name is required';
                }
                if (!/^[a-zA-Z0-9\s\-_]+$/.test(input)) {
                  return 'Project name can only contain letters, numbers, spaces, hyphens, and underscores';
                }
                return true;
              },
            },
          ]);
          projectName = answers.name;
        }

        if (!description) {
          const answers = await inquirer.prompt([
            {
              type: 'input',
              name: 'description',
              message: 'Enter project description (optional):',
              default: '',
            },
          ]);
          description = answers.description;
        }

        if (!template) {
          const answers = await inquirer.prompt([
            {
              type: 'list',
              name: 'template',
              message: 'Select project template:',
              choices: [
                { name: 'Blank Project', value: 'blank' },
                { name: 'Social Media Campaign', value: 'social-media' },
                { name: 'Product Photography', value: 'product' },
                { name: 'Art Collection', value: 'art' },
              ],
              default: 'blank',
            },
          ]);
          template = answers.template;
        }

        const projectId = projectName.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const projectDir = path.join(projectsDir, projectId);

        // Check if project already exists
        if (await fs.pathExists(projectDir)) {
          console.log(chalk.red(`❌ Project "${projectName}" already exists`));
          process.exit(1);
        }

        await fs.ensureDir(projectDir);
        await fs.ensureDir(path.join(projectDir, 'assets'));
        await fs.ensureDir(path.join(projectDir, 'exports'));
        await fs.ensureDir(path.join(projectDir, 'templates'));

        // Create project metadata
        const projectMetadata = {
          id: projectId,
          name: projectName,
          description: description || '',
          template: template,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: '1.0.0',
          assets: [],
          settings: {
            defaultModel: 'dalle-3',
            defaultSize: '1024x1024',
            defaultQuality: 'standard',
            defaultFormat: 'png',
          },
        };

        await fs.writeJson(
          path.join(projectDir, 'project.json'),
          projectMetadata,
          { spaces: 2 }
        );

        // Create template-specific files
        await createProjectTemplate(projectDir, template);

        console.log(
          chalk.green(`✅ Project "${projectName}" created successfully!`)
        );
        console.log(chalk.blue(`📁 Project directory: ${projectDir}`));
        console.log(chalk.gray(`🆔 Project ID: ${projectId}`));
      } catch (error) {
        console.error(chalk.red('❌ Failed to create project:'), error);
        process.exit(1);
      }
    });

  // List projects
  projectCommand
    .command('list')
    .alias('ls')
    .description('List all projects')
    .option('--format <format>', 'Output format (table, json)', 'table')
    .action(async (options) => {
      try {
        await fs.ensureDir(projectsDir);
        const projectDirs = await fs.readdir(projectsDir);

        if (projectDirs.length === 0) {
          console.log(
            chalk.yellow(
              'No projects found. Create a project with: azure-image-studio project create'
            )
          );
          return;
        }

        const projects = [];

        for (const projectDir of projectDirs) {
          const projectPath = path.join(projectsDir, projectDir);
          const projectJsonPath = path.join(projectPath, 'project.json');

          if (await fs.pathExists(projectJsonPath)) {
            try {
              const projectData = await fs.readJson(projectJsonPath);
              const stats = await fs.stat(projectPath);

              projects.push({
                ...projectData,
                assetCount: projectData.assets?.length || 0,
                size: await getDirectorySize(projectPath),
                lastModified: stats.mtime,
              });
            } catch (error) {
              console.log(
                chalk.yellow(`⚠️  Skipping invalid project: ${projectDir}`)
              );
            }
          }
        }

        if (projects.length === 0) {
          console.log(chalk.yellow('No valid projects found.'));
          return;
        }

        if (options.format === 'json') {
          console.log(JSON.stringify(projects, null, 2));
          return;
        }

        // Create table
        const tableData = [
          ['Name', 'Template', 'Assets', 'Size', 'Created', 'Modified'],
        ];

        projects.forEach((project) => {
          tableData.push([
            project.name,
            project.template,
            project.assetCount.toString(),
            formatBytes(project.size),
            new Date(project.createdAt).toLocaleDateString(),
            new Date(project.lastModified).toLocaleDateString(),
          ]);
        });

        console.log(
          table(tableData, {
            header: {
              alignment: 'center',
              content: 'Azure Image Studio Projects',
            },
          })
        );
      } catch (error) {
        console.error(chalk.red('❌ Failed to list projects:'), error);
        process.exit(1);
      }
    });

  // Export project
  projectCommand
    .command('export')
    .description('Export a project to a portable format')
    .option('-n, --name <name>', 'Project name to export')
    .option('-o, --output <path>', 'Output file path', './exports')
    .option('--format <format>', 'Export format (zip, tar)', 'zip')
    .option('--include-assets', 'Include generated assets', true)
    .option('--include-config', 'Include configuration files', true)
    .action(async (options) => {
      try {
        let projectName = options.name;

        if (!projectName) {
          const projects = await getProjectsList();
          if (projects.length === 0) {
            console.log(
              chalk.yellow('No projects found. Create a project first.')
            );
            return;
          }

          const answers = await inquirer.prompt([
            {
              type: 'list',
              name: 'project',
              message: 'Select project to export:',
              choices: projects.map((p) => ({
                name: `${p.name} (${p.template})`,
                value: p.id,
              })),
            },
          ]);
          projectName = answers.project;
        }

        const projectId = projectName.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const projectDir = path.join(projectsDir, projectId);

        if (!(await fs.pathExists(projectDir))) {
          console.log(chalk.red(`❌ Project "${projectName}" not found`));
          process.exit(1);
        }

        const projectData = await fs.readJson(
          path.join(projectDir, 'project.json')
        );
        const outputDir = options.output;
        await fs.ensureDir(outputDir);

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const exportName = `${projectId}-${timestamp}`;
        const exportPath = path.join(
          outputDir,
          `${exportName}.${options.format}`
        );

        console.log(chalk.blue(`📦 Exporting project "${projectName}"...`));

        // Create export package
        if (options.format === 'zip') {
          await createZipExport(projectDir, exportPath, options);
        } else if (options.format === 'tar') {
          await createTarExport(projectDir, exportPath, options);
        }

        console.log(chalk.green(`✅ Project exported successfully!`));
        console.log(chalk.blue(`📁 Export file: ${exportPath}`));
      } catch (error) {
        console.error(chalk.red('❌ Failed to export project:'), error);
        process.exit(1);
      }
    });

  // Import project
  projectCommand
    .command('import')
    .description('Import a project from a portable format')
    .option('-f, --file <file>', 'Project file to import')
    .option('--overwrite', 'Overwrite existing project if it exists')
    .action(async (options) => {
      try {
        let importFile = options.file;

        if (!importFile) {
          const answers = await inquirer.prompt([
            {
              type: 'input',
              name: 'file',
              message: 'Enter path to project file:',
              validate: (input: string) => {
                if (!input.trim()) {
                  return 'File path is required';
                }
                return true;
              },
            },
          ]);
          importFile = answers.file;
        }

        if (!(await fs.pathExists(importFile))) {
          console.log(chalk.red(`❌ File "${importFile}" not found`));
          process.exit(1);
        }

        console.log(chalk.blue(`📥 Importing project from "${importFile}"...`));

        const extractDir = path.join(process.cwd(), 'temp-import');
        await fs.ensureDir(extractDir);

        try {
          // Extract the archive
          if (importFile.endsWith('.zip')) {
            await extractZip(importFile, extractDir);
          } else if (
            importFile.endsWith('.tar') ||
            importFile.endsWith('.tar.gz')
          ) {
            await extractTar(importFile, extractDir);
          } else {
            throw new Error('Unsupported file format. Use .zip or .tar files.');
          }

          // Read project metadata
          const projectJsonPath = path.join(extractDir, 'project.json');
          if (!(await fs.pathExists(projectJsonPath))) {
            throw new Error('Invalid project file: project.json not found');
          }

          const projectData = await fs.readJson(projectJsonPath);
          const projectId = projectData.id;
          const projectDir = path.join(projectsDir, projectId);

          // Check if project already exists
          if ((await fs.pathExists(projectDir)) && !options.overwrite) {
            console.log(
              chalk.red(
                `❌ Project "${projectData.name}" already exists. Use --overwrite to replace it.`
              )
            );
            return;
          }

          // Import the project
          if (await fs.pathExists(projectDir)) {
            await fs.remove(projectDir);
          }

          await fs.move(extractDir, projectDir);

          console.log(
            chalk.green(
              `✅ Project "${projectData.name}" imported successfully!`
            )
          );
          console.log(chalk.blue(`📁 Project directory: ${projectDir}`));
        } finally {
          // Clean up temp directory
          if (await fs.pathExists(extractDir)) {
            await fs.remove(extractDir);
          }
        }
      } catch (error) {
        console.error(chalk.red('❌ Failed to import project:'), error);
        process.exit(1);
      }
    });

  // Delete project
  projectCommand
    .command('delete')
    .description('Delete a project')
    .option('-n, --name <name>', 'Project name to delete')
    .option('--confirm', 'Skip confirmation prompt')
    .action(async (options) => {
      try {
        let projectName = options.name;

        if (!projectName) {
          const projects = await getProjectsList();
          if (projects.length === 0) {
            console.log(chalk.yellow('No projects found.'));
            return;
          }

          const answers = await inquirer.prompt([
            {
              type: 'list',
              name: 'project',
              message: 'Select project to delete:',
              choices: projects.map((p) => ({
                name: `${p.name} (${p.template})`,
                value: p.id,
              })),
            },
          ]);
          projectName = answers.project;
        }

        const projectId = projectName.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const projectDir = path.join(projectsDir, projectId);

        if (!(await fs.pathExists(projectDir))) {
          console.log(chalk.red(`❌ Project "${projectName}" not found`));
          process.exit(1);
        }

        const projectData = await fs.readJson(
          path.join(projectDir, 'project.json')
        );

        if (!options.confirm) {
          const answers = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'confirm',
              message: `Are you sure you want to delete project "${projectData.name}"? This action cannot be undone.`,
              default: false,
            },
          ]);

          if (!answers.confirm) {
            console.log(chalk.yellow('Operation cancelled.'));
            return;
          }
        }

        await fs.remove(projectDir);
        console.log(
          chalk.green(`✅ Project "${projectData.name}" deleted successfully!`)
        );
      } catch (error) {
        console.error(chalk.red('❌ Failed to delete project:'), error);
        process.exit(1);
      }
    });

  return projectCommand;
}

// Helper functions
async function createProjectTemplate(projectDir: string, template: string) {
  const templatesDir = path.join(projectDir, 'templates');

  switch (template) {
    case 'social-media':
      await createSocialMediaTemplate(templatesDir);
      break;
    case 'product':
      await createProductTemplate(templatesDir);
      break;
    case 'art':
      await createArtTemplate(templatesDir);
      break;
    default:
      await createBlankTemplate(templatesDir);
  }
}

async function createBlankTemplate(templatesDir: string) {
  const templateData = {
    name: 'Blank Project',
    description: 'A blank project template',
    prompts: [],
    settings: {
      defaultModel: 'dalle-3',
      defaultSize: '1024x1024',
      defaultQuality: 'standard',
    },
  };

  await fs.writeJson(path.join(templatesDir, 'template.json'), templateData, {
    spaces: 2,
  });
}

async function createSocialMediaTemplate(templatesDir: string) {
  const templateData = {
    name: 'Social Media Campaign',
    description: 'Template for social media content creation',
    prompts: [
      'A vibrant social media post design',
      'Instagram story background',
      'Facebook cover photo',
      'Twitter header image',
      'LinkedIn post illustration',
    ],
    settings: {
      defaultModel: 'dalle-3',
      defaultSize: '1024x1024',
      defaultQuality: 'hd',
    },
    presets: {
      instagram: { size: '1080x1080', quality: 'hd' },
      facebook: { size: '1200x630', quality: 'hd' },
      twitter: { size: '1200x675', quality: 'hd' },
    },
  };

  await fs.writeJson(path.join(templatesDir, 'template.json'), templateData, {
    spaces: 2,
  });
}

async function createProductTemplate(templatesDir: string) {
  const templateData = {
    name: 'Product Photography',
    description: 'Template for product photography and marketing',
    prompts: [
      'Professional product photography setup',
      'Product mockup on white background',
      'Lifestyle product shot',
      'Product detail close-up',
      'Product in use scenario',
    ],
    settings: {
      defaultModel: 'flux-1-1-pro',
      defaultSize: '1024x1024',
      defaultQuality: 'hd',
    },
    presets: {
      hero: { size: '1920x1080', quality: 'hd' },
      thumbnail: { size: '400x400', quality: 'standard' },
      detail: { size: '1024x1024', quality: 'hd' },
    },
  };

  await fs.writeJson(path.join(templatesDir, 'template.json'), templateData, {
    spaces: 2,
  });
}

async function createArtTemplate(templatesDir: string) {
  const templateData = {
    name: 'Art Collection',
    description: 'Template for artistic and creative projects',
    prompts: [
      'Abstract digital art',
      'Surreal landscape painting',
      'Modern art composition',
      'Digital illustration',
      'Conceptual artwork',
    ],
    settings: {
      defaultModel: 'dalle-3',
      defaultSize: '1024x1024',
      defaultQuality: 'hd',
    },
    presets: {
      canvas: { size: '1024x1024', quality: 'hd' },
      print: { size: '2048x2048', quality: 'hd' },
      web: { size: '800x800', quality: 'standard' },
    },
  };

  await fs.writeJson(path.join(templatesDir, 'template.json'), templateData, {
    spaces: 2,
  });
}

async function getProjectsList() {
  const projectsDir = path.join(process.cwd(), 'projects');
  await fs.ensureDir(projectsDir);

  const projectDirs = await fs.readdir(projectsDir);
  const projects = [];

  for (const projectDir of projectDirs) {
    const projectPath = path.join(projectsDir, projectDir);
    const projectJsonPath = path.join(projectPath, 'project.json');

    if (await fs.pathExists(projectJsonPath)) {
      try {
        const projectData = await fs.readJson(projectJsonPath);
        projects.push(projectData);
      } catch (error) {
        // Skip invalid projects
      }
    }
  }

  return projects;
}

async function getDirectorySize(dirPath: string): Promise<number> {
  let size = 0;

  const files = await fs.readdir(dirPath);
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stats = await fs.stat(filePath);

    if (stats.isDirectory()) {
      size += await getDirectorySize(filePath);
    } else {
      size += stats.size;
    }
  }

  return size;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function createZipExport(
  projectDir: string,
  exportPath: string,
  options: any
) {
  const archiver = await import('archiver');
  const output = fs.createWriteStream(exportPath);
  const archive = archiver.default('zip', { zlib: { level: 9 } });

  return new Promise((resolve, reject) => {
    output.on('close', resolve);
    archive.on('error', reject);

    archive.pipe(output);

    // Add project files
    archive.directory(projectDir, false);

    archive.finalize();
  });
}

async function createTarExport(
  projectDir: string,
  exportPath: string,
  options: any
) {
  const tar = await import('tar');
  await tar.create(
    {
      gzip: exportPath.endsWith('.gz'),
      file: exportPath,
      cwd: path.dirname(projectDir),
    },
    [path.basename(projectDir)]
  );
}

async function extractZip(filePath: string, extractDir: string) {
  const extract = await import('extract-zip');
  await extract.default(filePath, { dir: extractDir });
}

async function extractTar(filePath: string, extractDir: string) {
  const tar = await import('tar');
  await tar.extract({
    file: filePath,
    cwd: extractDir,
  });
}
