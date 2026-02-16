/**
 * Logger Utility
 */

import chalk from 'chalk';

export class Logger {
  constructor(private verbose: boolean = false) {}

  info(message: string): void {
    console.log(chalk.blue('ℹ'), chalk.white(message));
  }

  success(message: string): void {
    console.log(chalk.green('✓'), chalk.white(message));
  }

  warn(message: string): void {
    console.log(chalk.yellow('⚠'), chalk.white(message));
  }

  error(message: string): void {
    console.log(chalk.red('✗'), chalk.white(message));
  }

  debug(message: string): void {
    if (this.verbose) {
      console.log(chalk.gray('🔍'), chalk.gray(message));
    }
  }
}
