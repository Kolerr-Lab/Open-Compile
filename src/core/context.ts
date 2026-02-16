/**
 * Context Manager
 * 
 * Manages project context, file operations, and state
 */

import { readdir, readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { existsSync } from 'fs';
import fg from 'fast-glob';

export class ContextManager {
  /**
   * Scan project files
   */
  async scanProject(projectPath: string): Promise<string[]> {
    const patterns = [
      '**/*.ts',
      '**/*.js',
      '**/*.py',
      '**/*.java',
      '**/*.go',
      '**/*.rs',
      '**/*.php',
      '**/*.rb',
      'package.json',
      'requirements.txt',
      'pom.xml',
      'go.mod',
      'Cargo.toml',
    ];

    const files = await fg(patterns, {
      cwd: projectPath,
      ignore: ['node_modules', 'dist', 'build', '__pycache__', 'venv', '.git'],
      absolute: true,
    });

    return files;
  }

  /**
   * Load project context
   */
  async loadProject(projectPath: string): Promise<any> {
    const files = await this.scanProject(projectPath);

    const context: any = {
      path: projectPath,
      files: {},
      structure: [],
    };

    for (const file of files.slice(0, 50)) { // Limit to avoid overwhelming
      try {
        const content = await readFile(file, 'utf-8');
        const relativePath = file.replace(projectPath, '').replace(/^[/\\]/, '');
        context.files[relativePath] = content;
        context.structure.push(relativePath);
      } catch (error) {
        // Skip files that can't be read
      }
    }

    return context;
  }

  /**
   * Write generated project to disk
   */
  async writeProject(outputPath: string, code: any): Promise<void> {
    // Ensure output directory exists
    if (!existsSync(outputPath)) {
      await mkdir(outputPath, { recursive: true });
    }

    // Write each file
    for (const [filePath, content] of Object.entries<string>(code.files)) {
      const fullPath = join(outputPath, filePath);
      const dir = dirname(fullPath);

      // Ensure directory exists
      if (!existsSync(dir)) {
        await mkdir(dir, { recursive: true });
      }

      // Write file
      await writeFile(fullPath, content, 'utf-8');
    }

    // Write package.json or equivalent
    if (code.dependencies && Object.keys(code.dependencies).length > 0) {
      const packageJson = {
        name: 'generated-project',
        version: '1.0.0',
        dependencies: code.dependencies,
      };

      await writeFile(
        join(outputPath, 'package.json'),
        JSON.stringify(packageJson, null, 2),
        'utf-8'
      );
    }

    // Write configuration files
    if (code.configuration) {
      for (const [name, content] of Object.entries(code.configuration)) {
        await writeFile(
          join(outputPath, name),
          typeof content === 'string' ? content : JSON.stringify(content, null, 2),
          'utf-8'
        );
      }
    }
  }

  /**
   * Merge extension code into existing project
   */
  async mergeCode(projectPath: string, extensionCode: any): Promise<void> {
    for (const [filePath, content] of Object.entries<string>(extensionCode.files)) {
      const fullPath = join(projectPath, filePath);
      const dir = dirname(fullPath);

      if (!existsSync(dir)) {
        await mkdir(dir, { recursive: true });
      }

      // Write or append file
      await writeFile(fullPath, content, 'utf-8');
    }
  }
}
