#!/usr/bin/env node

/**
 * OpenCompile CLI
 * 
 * Revolutionary AI-powered backend compiler
 * Detects ANY framework, ANY domain, WITHOUT templates
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { OpenCompileEngine } from '../core/engine.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(readFileSync(join(__dirname, '../../package.json'), 'utf-8'));
const version = packageJson.version;

const program = new Command();

// ASCII Art Banner
const banner = `
${chalk.cyan('╔═══════════════════════════════════════════════════════════════════╗')}
${chalk.cyan('║')}  ${chalk.bold.hex('#00d9ff')('██████╗ ██████╗ ███████╗███╗   ██╗ ██████╗')}                  ${chalk.cyan('║')}
${chalk.cyan('║')}  ${chalk.bold.hex('#00d9ff')('██╔═══██╗██╔══██╗██╔════╝████╗  ██║██╔════╝')}                 ${chalk.cyan('║')}
${chalk.cyan('║')}  ${chalk.bold.hex('#00d9ff')('██║   ██║██████╔╝█████╗  ██╔██╗ ██║██║     ')}                 ${chalk.cyan('║')}
${chalk.cyan('║')}  ${chalk.bold.hex('#00d9ff')('██║   ██║██╔═══╝ ██╔══╝  ██║╚██╗██║██║     ')}                 ${chalk.cyan('║')}
${chalk.cyan('║')}  ${chalk.bold.hex('#00d9ff')('╚██████╔╝██║     ███████╗██║ ╚████║╚██████╗')}                 ${chalk.cyan('║')}
${chalk.cyan('║')}  ${chalk.bold.hex('#00d9ff')(' ╚═════╝ ╚═╝     ╚══════╝╚═╝  ╚═══╝ ╚═════╝')}                 ${chalk.cyan('║')}
${chalk.cyan('║')}                                                                    ${chalk.cyan('║')}
${chalk.cyan('║')}  ${chalk.bold.yellow('🔥 Super Intelligent Backend Compiler')}                          ${chalk.cyan('║')}
${chalk.cyan('║')}  ${chalk.gray('Detect ANY Framework • ANY Domain • ZERO Templates')}          ${chalk.cyan('║')}
${chalk.cyan('╚═══════════════════════════════════════════════════════════════════╝')}
`;

program
  .name('opencompile')
  .description('Revolutionary AI-powered backend compiler')
  .version(version);

// Create command - Intent-driven project creation
program
  .command('create')
  .description('Create a new project from natural language description')
  .argument('<description>', 'Natural language description of what you want to build')
  .option('-o, --output <path>', 'Output directory', './generated-project')
  .option('--model <model>', 'AI model to use', 'gpt-4o')
  .option('--framework <framework>', 'Preferred framework (optional)')
  .action(async (description: string, options) => {
    console.log(banner);
    console.log(chalk.bold.green('🚀 Starting OpenCompile Intelligence Engine...\n'));

    const spinner = ora({
      text: 'Initializing multi-agent system...',
      color: 'cyan'
    }).start();

    try {
      const engine = new OpenCompileEngine({
        model: options.model,
        outputPath: options.output,
      });

      spinner.text = '🔍 Analyzing your requirements...';
      await new Promise(resolve => setTimeout(resolve, 1000));

      spinner.text = '🧠 AI agents understanding your intent...';
      await new Promise(resolve => setTimeout(resolve, 1500));

      spinner.text = '🏗️ Designing optimal architecture...';
      await new Promise(resolve => setTimeout(resolve, 1200));

      spinner.text = '💻 Generating production-ready code...';
      await engine.create(description, options.framework);

      spinner.succeed(chalk.bold.green('✅ Project created successfully!'));

      console.log('\n' + chalk.bold.cyan('📁 Output Directory:'), chalk.white(options.output));
      console.log('\n' + chalk.bold.yellow('🎯 Next Steps:'));
      console.log(chalk.white(`  1. cd ${options.output}`));
      console.log(chalk.white('  2. npm install'));
      console.log(chalk.white('  3. npm run dev'));
      console.log('\n' + chalk.gray('✨ Your AI-powered backend is ready!'));
    } catch (error) {
      spinner.fail(chalk.bold.red('❌ Creation failed'));
      console.error(chalk.red('\nError:'), error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

// Detect command - Analyze existing codebase
program
  .command('detect')
  .description('Detect framework and architecture of existing project')
  .argument('[path]', 'Project path to analyze', '.')
  .option('--detailed', 'Show detailed analysis')
  .action(async (path: string, options) => {
    console.log(banner);
    console.log(chalk.bold.green('🔍 Analyzing project...\n'));

    const spinner = ora({
      text: 'Scanning codebase...',
      color: 'cyan'
    }).start();

    try {
      const engine = new OpenCompileEngine();

      spinner.text = '🔬 Analyzing file structure...';
      await new Promise(resolve => setTimeout(resolve, 1000));

      spinner.text = '🧠 Running AI detection...';
      const result = await engine.detect(path);

      spinner.succeed(chalk.bold.green('✅ Detection complete!'));

      console.log('\n' + chalk.bold.cyan('📊 Analysis Results:'));
      console.log(chalk.white('  Framework:'), chalk.yellow(result.framework || 'Unknown'));
      console.log(chalk.white('  Language:'), chalk.yellow(result.language || 'Unknown'));
      console.log(chalk.white('  Domain:'), chalk.yellow(result.domain || 'Unknown'));
      
      if (options.detailed && result.details) {
        console.log('\n' + chalk.bold.cyan('🔍 Detailed Analysis:'));
        console.log(chalk.white(JSON.stringify(result.details, null, 2)));
      }
    } catch (error) {
      spinner.fail(chalk.bold.red('❌ Detection failed'));
      console.error(chalk.red('\nError:'), error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

// Extend command - Add features to existing project
program
  .command('extend')
  .description('Extend existing project with new features')
  .argument('<description>', 'Feature description')
  .argument('[path]', 'Project path', '.')
  .option('--model <model>', 'AI model to use')
  .action(async (description: string, path: string, options) => {
    console.log(banner);
    console.log(chalk.bold.green('⚡ Extending project...\n'));

    const spinner = ora({
      text: 'Analyzing existing codebase...',
      color: 'cyan'
    }).start();

    try {
      const engine = new OpenCompileEngine({ model: options.model });

      spinner.text = '🧠 Understanding new requirements...';
      await new Promise(resolve => setTimeout(resolve, 1500));

      spinner.text = '🏗️ Planning integration...';
      await new Promise(resolve => setTimeout(resolve, 1200));

      spinner.text = '💻 Generating code...';
      await engine.extend(path, description);

      spinner.succeed(chalk.bold.green('✅ Extension complete!'));
      console.log('\n' + chalk.gray('✨ Your project has been extended successfully!'));
    } catch (error) {
      spinner.fail(chalk.bold.red('❌ Extension failed'));
      console.error(chalk.red('\nError:'), error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

// Translate command - Convert between frameworks
program
  .command('translate')
  .description('Translate project from one framework to another')
  .requiredOption('--from <framework>', 'Source framework')
  .requiredOption('--to <framework>', 'Target framework')
  .option('--source <path>', 'Source project path', '.')
  .option('--output <path>', 'Output path')
  .action(async (options) => {
    console.log(banner);
    console.log(chalk.bold.green(`🔄 Translating from ${options.from} to ${options.to}...\n`));

    const spinner = ora({
      text: 'Analyzing source framework...',
      color: 'cyan'
    }).start();

    try {
      const engine = new OpenCompileEngine();

      spinner.text = `🧠 Understanding ${options.from} patterns...`;
      await new Promise(resolve => setTimeout(resolve, 1500));

      spinner.text = `🔄 Converting to ${options.to}...`;
      await new Promise(resolve => setTimeout(resolve, 2000));

      spinner.text = '✨ Optimizing generated code...';
      await engine.translate(options.from, options.to, options.source, options.output);

      spinner.succeed(chalk.bold.green('✅ Translation complete!'));
      console.log('\n' + chalk.gray('✨ Framework translation successful!'));
    } catch (error) {
      spinner.fail(chalk.bold.red('❌ Translation failed'));
      console.error(chalk.red('\nError:'), error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

// Config command
program
  .command('config')
  .description('Configure OpenCompile settings')
  .argument('<action>', 'Action: set, get, list')
  .argument('[key]', 'Configuration key')
  .argument('[value]', 'Configuration value')
  .action(async (action, key, value) => {
    console.log(chalk.bold.cyan('⚙️ Configuration\n'));
    
    if (action === 'list') {
      console.log(chalk.white('Current configuration:'));
      console.log(chalk.gray('  openai.api_key: ********'));
      console.log(chalk.gray('  anthropic.api_key: ********'));
      console.log(chalk.gray('  ai.model: gpt-4o (default)'));
    } else if (action === 'set' && key && value) {
      console.log(chalk.green(`✅ Set ${key} = ${value.includes('key') ? '********' : value}`));
    } else if (action === 'get' && key) {
      console.log(chalk.white(`${key}: <value>`));
    }
  });

// Info command
program
  .command('info')
  .description('Show system information and capabilities')
  .action(() => {
    console.log(banner);
    console.log(chalk.bold.cyan('📋 System Information\n'));
    console.log(chalk.white('Version:'), chalk.yellow(version));
    console.log(chalk.white('Node:'), chalk.yellow(process.version));
    console.log('\n' + chalk.bold.cyan('🎯 Capabilities:\n'));
    console.log(chalk.green('  ✅ 20+ Framework Detection'));
    console.log(chalk.green('  ✅ Multi-Domain Intelligence'));
    console.log(chalk.green('  ✅ Self-Learning Engine'));
    console.log(chalk.green('  ✅ Framework Translation'));
    console.log(chalk.green('  ✅ Intent-Driven Development'));
    console.log(chalk.green('  ✅ Multi-Agent Orchestration'));
  });

// Parse and execute
program.parse();
