#!/usr/bin/env node

import { Command } from 'commander';
import { SparcFramework } from '@/lib/sparc';
import { DevelopmentMode, CommitFrequency, ResearchDepth } from '../constants';
import { Logger } from '../utils/logger';
import * as fs from 'fs/promises';
import * as path from 'path';
import chalk from 'chalk';
import ora from 'ora';

export function createSparcCLI() {
  const program = new Command();

  program
    .name('sparc')
    .description('SPARC Programmatic Execution Framework')
    .version('1.0.0');

  program
    .command('execute')
    .description('Execute SPARC methodology for a project')
    .requiredOption('-p, --project <name>', 'Project name')
    .requiredOption('-r, --readme <path>', 'Path to README/requirements file')
    .option('-c, --config <path>', 'Path to SPARC config file', '.claude/sparc-config.json')
    .option('-m, --mode <mode>', 'Development mode', DevelopmentMode.FULL)
    .option('--ai-provider <provider>', 'AI provider to use', 'claude')
    .option('--parallel', 'Enable parallel execution', true)
    .option('--test-coverage <number>', 'Test coverage target', '90')
    .option('--commit-freq <frequency>', 'Commit frequency', CommitFrequency.PHASE)
    .option('--skip-research', 'Skip research phase', false)
    .option('--skip-tests', 'Skip test development', false)
    .option('--research-depth <depth>', 'Research depth', ResearchDepth.STANDARD)
    .option('--verbose', 'Enable verbose output', false)
    .option('--dry-run', 'Show what would be done without executing', false)
    .option('--redis-host <host>', 'Redis host', 'localhost')
    .option('--redis-port <port>', 'Redis port', '6379')
    .action(async (options) => {
      await executeCommand(options);
    });

  program
    .command('validate')
    .description('Validate SPARC configuration')
    .requiredOption('-c, --config <path>', 'Path to SPARC config file')
    .action(async (options) => {
      await validateCommand(options);
    });

  program
    .command('status')
    .description('Show current execution status')
    .option('-c, --config <path>', 'Path to SPARC config file', '.claude/sparc-config.json')
    .option('--redis-host <host>', 'Redis host', 'localhost')
    .option('--redis-port <port>', 'Redis port', '6379')
    .action(async (options) => {
      await statusCommand(options);
    });

  program
    .command('clean')
    .description('Clean up execution artifacts and queues')
    .option('--redis-host <host>', 'Redis host', 'localhost')
    .option('--redis-port <port>', 'Redis port', '6379')
    .option('--force', 'Force cleanup without confirmation', false)
    .action(async (options) => {
      await cleanCommand(options);
    });

  return program;
}

async function executeCommand(options: any) {
  const spinner = ora('Initializing SPARC Framework...').start();
  const logger = new Logger('SPARC-CLI', { verbose: options.verbose });

  try {
    // Validate README exists
    await fs.access(options.readme);

    // Initialize framework
    const framework = new SparcFramework({
      configPath: options.config,
      aiProvider: options.aiProvider,
      redis: {
        host: options.redisHost,
        port: parseInt(options.redisPort)
      },
      logger
    });

    await framework.initialize();
    spinner.succeed('SPARC Framework initialized');

    // Setup event listeners
    framework.on('phase:start', (data) => {
      spinner.start(`Executing ${data.phase} phase...`);
    });

    framework.on('phase:complete', (data) => {
      spinner.succeed(`${data.phase} phase completed`);
    });

    framework.on('agent:decision', (data) => {
      if (options.verbose) {
        console.log(chalk.blue(`[${data.agent}] Decision: ${data.decision.description}`));
      }
    });

    framework.on('progress:update', (data) => {
      spinner.text = `${data.message} (${data.progress.toFixed(0)}%)`;
    });

    // Execute SPARC
    if (options.dryRun) {
      spinner.info('Dry run mode - showing execution plan:');
      console.log(chalk.cyan('\nExecution Plan:'));
      console.log(`  Project: ${options.project}`);
      console.log(`  README: ${options.readme}`);
      console.log(`  Mode: ${options.mode}`);
      console.log(`  Test Coverage: ${options.testCoverage}%`);
      console.log(`  Parallel: ${options.parallel}`);
      console.log(`  Skip Research: ${options.skipResearch}`);
      console.log(`  Skip Tests: ${options.skipTests}`);
      return;
    }

    const result = await framework.execute({
      projectName: options.project,
      readmePath: options.readme,
      mode: options.mode,
      options: {
        parallel: options.parallel,
        testCoverage: parseInt(options.testCoverage),
        commitFrequency: options.commitFreq,
        skipResearch: options.skipResearch,
        skipTests: options.skipTests,
        verbose: options.verbose,
        dryRun: options.dryRun
      }
    });

    spinner.stop();

    // Display results
    console.log(chalk.green('\n✨ SPARC Execution Complete!\n'));
    console.log(chalk.cyan('Summary:'));
    console.log(`  Success: ${result.success ? chalk.green('Yes') : chalk.red('No')}`);
    console.log(`  Duration: ${(result.metrics.totalDuration / 1000).toFixed(2)}s`);
    console.log(`  Phases Completed: ${result.phases.filter(p => p.status === 'completed').length}/${result.phases.length}`);

    if (result.errors && result.errors.length > 0) {
      console.log(chalk.red('\nErrors:'));
      result.errors.forEach(error => {
        console.log(`  - ${error.message}`);
      });
    }

    // Save results
    const outputPath = path.join(process.cwd(), 'sparc-results.json');
    await fs.writeFile(outputPath, JSON.stringify(result, null, 2));
    console.log(chalk.gray(`\nResults saved to: ${outputPath}`));

    await framework.shutdown();

  } catch (error) {
    spinner.fail('SPARC execution failed');
    console.error(chalk.red(error instanceof Error ? error.message : String(error)));
    process.exit(1);
  }
}

async function validateCommand(options: any) {
  const spinner = ora('Validating configuration...').start();

  try {
    const configContent = await fs.readFile(options.config, 'utf-8');
    const config = JSON.parse(configContent);

    // Basic validation
    const requiredFields = ['project', 'sparc'];
    const missingFields = requiredFields.filter(field => !config[field]);

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    spinner.succeed('Configuration is valid');
    
    console.log(chalk.cyan('\nConfiguration Summary:'));
    console.log(`  Project: ${config.project.name}`);
    console.log(`  Version: ${config.project.version}`);
    console.log(`  SPARC Mode: ${config.sparc.mode}`);
    console.log(`  Phases: ${Object.keys(config.sparc.phases).join(', ')}`);
    
    if (config.agents?.coordination?.enabled) {
      const roles = Object.keys(config.agents.coordination.roles);
      console.log(`  Agents: ${roles.join(', ')}`);
    }

  } catch (error) {
    spinner.fail('Configuration validation failed');
    console.error(chalk.red(error instanceof Error ? error.message : String(error)));
    process.exit(1);
  }
}

async function statusCommand(options: any) {
  const spinner = ora('Checking execution status...').start();

  try {
    // This would connect to Redis and check current status
    // For now, we'll show a placeholder
    spinner.info('Status command not yet implemented');
    
    // Future implementation would show:
    // - Current phase
    // - Active agents
    // - Task queue status
    // - Metrics
    // - Recent decisions

  } catch (error) {
    spinner.fail('Failed to get status');
    console.error(chalk.red(error instanceof Error ? error.message : String(error)));
    process.exit(1);
  }
}

async function cleanCommand(options: any) {
  if (!options.force) {
    console.log(chalk.yellow('This will clear all execution data from Redis.'));
    console.log('Use --force to skip this confirmation.');
    return;
  }

  const spinner = ora('Cleaning up...').start();

  try {
    // This would connect to Redis and clear all SPARC-related keys
    spinner.info('Clean command not yet implemented');
    
    // Future implementation would:
    // - Clear task queues
    // - Remove artifacts
    // - Reset metrics
    // - Clean up locks

  } catch (error) {
    spinner.fail('Cleanup failed');
    console.error(chalk.red(error instanceof Error ? error.message : String(error)));
    process.exit(1);
  }
}

// Run CLI if called directly
if (require.main === module) {
  const program = createSparcCLI();
  program.parse(process.argv);
}