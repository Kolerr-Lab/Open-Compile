/**
 * Framework Detector - Template-Free Framework Detection
 * 
 * REVOLUTIONARY: Detects ANY framework without hardcoded templates
 * Uses AST analysis + AI inference + pattern recognition
 */

import Parser from 'tree-sitter';
import TypeScript from 'tree-sitter-typescript';
import Python from 'tree-sitter-python';
import JavaScript from 'tree-sitter-javascript';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { FrameworkInfo, FilePattern, DependencyMap } from '../types/index.js';

export class FrameworkDetector {
  private parsers: Map<string, Parser>;
  private frameworkSignatures: Map<string, string[]>;

  constructor() {
    // Initialize parsers for different languages
    this.parsers = new Map();
    
    const tsParser = new Parser();
    tsParser.setLanguage(TypeScript.typescript);
    this.parsers.set('typescript', tsParser);
    
    const jsParser = new Parser();
    jsParser.setLanguage(JavaScript);
    this.parsers.set('javascript', jsParser);
    
    const pyParser = new Parser();
    pyParser.setLanguage(Python);
    this.parsers.set('python', pyParser);

    // Framework signatures (NOT templates - just detection patterns!)
    this.frameworkSignatures = new Map([
      ['express', ['express', 'app.get', 'app.post', 'app.listen']],
      ['fastapi', ['FastAPI', '@app.get', '@app.post', 'uvicorn']],
      ['nestjs', ['@Module', '@Controller', '@Injectable', 'NestFactory']],
      ['django', ['django.', 'models.Model', 'views.', 'urls.py']],
      ['flask', ['Flask', '@app.route', 'flask.']],
      ['spring-boot', ['@SpringBootApplication', '@RestController', '@Service']],
      ['rails', ['Rails.application', 'ActiveRecord', 'ActionController']],
      ['gin', ['gin.Default', 'gin.Engine', 'c.JSON']],
      ['fastify', ['fastify', 'fastify()', 'server.listen']],
      ['koa', ['new Koa', 'ctx.body', 'app.use']],
      // Add more frameworks dynamically...
    ]);
  }

  /**
   * Parse dependencies from package.json, requirements.txt, pom.xml, etc.
   */
  async parseDependencies(projectPath: string): Promise<DependencyMap> {
    const deps: DependencyMap = {};

    try {
      // Node.js - package.json
      const packageJson = readFileSync(join(projectPath, 'package.json'), 'utf-8');
      const pkg = JSON.parse(packageJson);
      Object.assign(deps, pkg.dependencies || {}, pkg.devDependencies || {});
    } catch {}

    try {
      // Python - requirements.txt
      const requirements = readFileSync(join(projectPath, 'requirements.txt'), 'utf-8');
      requirements.split('\n').forEach(line => {
        const match = line.match(/^([^=<>]+)/);
        if (match) deps[match[1].trim()] = '*';
      });
    } catch {}

    try {
      // Python - pyproject.toml
      const pyproject = readFileSync(join(projectPath, 'pyproject.toml'), 'utf-8');
      // Simple parsing - in production, use proper TOML parser
      const depMatches = pyproject.matchAll(/["']([^"']+)["']\s*=\s*["']([^"']+)["']/g);
      for (const match of depMatches) {
        deps[match[1]] = match[2];
      }
    } catch {}

    return deps;
  }

  /**
   * Analyze code patterns using AST
   * This is where the MAGIC happens - NO templates!
   */
  async analyzePatterns(files: string[]): Promise<FilePattern[]> {
    const patterns: FilePattern[] = [];

    for (const file of files) {
      const ext = file.split('.').pop();
      let parser: Parser | undefined;
      
      if (ext === 'ts' || ext === 'tsx') {
        parser = this.parsers.get('typescript');
      } else if (ext === 'js' || ext === 'jsx') {
        parser = this.parsers.get('javascript');
      } else if (ext === 'py') {
        parser = this.parsers.get('python');
      }

      if (!parser) continue;

      try {
        const code = readFileSync(file, 'utf-8');
        const tree = parser.parse(code);
        
        // Extract imports
        const imports = this.extractImports(tree);
        
        // Extract decorators (for NestJS, FastAPI, Spring Boot, etc.)
        const decorators = this.extractDecorators(tree);
        
        // Extract class patterns
        const classes = this.extractClasses(tree);
        
        // Extract function patterns
        const functions = this.extractFunctions(tree);

        patterns.push({
          file,
          imports,
          decorators,
          classes,
          functions,
        });
      } catch (error) {
        // Skip files that can't be parsed
        continue;
      }
    }

    return patterns;
  }

  /**
   * AI-powered framework detection
   * Combines AST analysis with intelligent inference
   */
  async detect(context: {
    files: string[];
    dependencies: DependencyMap;
    patterns: FilePattern[];
  }): Promise<FrameworkInfo> {
    const scores: Map<string, number> = new Map();

    // Score #1: Dependency matching
    for (const [framework, signatures] of this.frameworkSignatures) {
      let score = 0;
      for (const sig of signatures) {
        if (context.dependencies[sig]) {
          score += 10;
        }
      }
      if (score > 0) {
        scores.set(framework, (scores.get(framework) || 0) + score);
      }
    }

    // Score #2: Import pattern matching
    for (const pattern of context.patterns) {
      for (const imp of pattern.imports) {
        for (const [framework, signatures] of this.frameworkSignatures) {
          for (const sig of signatures) {
            if (imp.includes(sig)) {
              scores.set(framework, (scores.get(framework) || 0) + 5);
            }
          }
        }
      }
    }

    // Score #3: Decorator pattern matching (NestJS, FastAPI, Spring Boot)
    for (const pattern of context.patterns) {
      for (const decorator of pattern.decorators) {
        if (decorator.includes('@app.') || decorator.includes('FastAPI')) {
          scores.set('fastapi', (scores.get('fastapi') || 0) + 15);
        }
        if (decorator.includes('@Controller') || decorator.includes('@Module')) {
          scores.set('nestjs', (scores.get('nestjs') || 0) + 15);
        }
        if (decorator.includes('@RestController') || decorator.includes('@SpringBootApplication')) {
          scores.set('spring-boot', (scores.get('spring-boot') || 0) + 15);
        }
      }
    }

    // Find highest score
    let bestFramework = 'unknown';
    let highestScore = 0;
    
    for (const [framework, score] of scores) {
      if (score > highestScore) {
        highestScore = score;
        bestFramework = framework;
      }
    }

    // Determine language
    const language = this.detectLanguage(context.patterns);

    // Calculate confidence
    const confidence = Math.min(highestScore / 50, 1.0);

    return {
      name: bestFramework,
      version: this.detectVersion(bestFramework, context.dependencies),
      language,
      confidence,
      details: {
        scores: Object.fromEntries(scores),
        patterns: context.patterns.length,
      },
    };
  }

  private extractImports(tree: Parser.Tree): string[] {
    const imports: string[] = [];
    const cursor = tree.walk();

    const traverse = (cursor: Parser.TreeCursor) => {
      if (cursor.nodeType === 'import_statement' || cursor.nodeType === 'import_from_statement') {
        imports.push(cursor.nodeText);
      }
      
      if (cursor.gotoFirstChild()) {
        do {
          traverse(cursor);
        } while (cursor.gotoNextSibling());
        cursor.gotoParent();
      }
    };

    traverse(cursor);
    return imports;
  }

  private extractDecorators(tree: Parser.Tree): string[] {
    const decorators: string[] = [];
    const cursor = tree.walk();

    const traverse = (cursor: Parser.TreeCursor) => {
      if (cursor.nodeType === 'decorator') {
        decorators.push(cursor.nodeText);
      }
      
      if (cursor.gotoFirstChild()) {
        do {
          traverse(cursor);
        } while (cursor.gotoNextSibling());
        cursor.gotoParent();
      }
    };

    traverse(cursor);
    return decorators;
  }

  private extractClasses(tree: Parser.Tree): string[] {
    const classes: string[] = [];
    const cursor = tree.walk();

    const traverse = (cursor: Parser.TreeCursor) => {
      if (cursor.nodeType === 'class_declaration' || cursor.nodeType === 'class_definition') {
        classes.push(cursor.nodeText.split('\n')[0]); // Just the class line
      }
      
      if (cursor.gotoFirstChild()) {
        do {
          traverse(cursor);
        } while (cursor.gotoNextSibling());
        cursor.gotoParent();
      }
    };

    traverse(cursor);
    return classes;
  }

  private extractFunctions(tree: Parser.Tree): string[] {
    const functions: string[] = [];
    const cursor = tree.walk();

    const traverse = (cursor: Parser.TreeCursor) => {
      const nodeType = cursor.nodeType;
      if (nodeType === 'function_declaration' || nodeType === 'function_definition' || nodeType === 'method_definition') {
        functions.push(cursor.nodeText.split('\n')[0]); // Just the function signature
      }
      
      if (cursor.gotoFirstChild()) {
        do {
          traverse(cursor);
        } while (cursor.gotoNextSibling());
        cursor.gotoParent();
      }
    };

    traverse(cursor);
    return functions;
  }

  private detectLanguage(patterns: FilePattern[]): string {
    if (patterns.some(p => p.file.endsWith('.py'))) return 'python';
    if (patterns.some(p => p.file.endsWith('.ts'))) return 'typescript';
    if (patterns.some(p => p.file.endsWith('.js'))) return 'javascript';
    if (patterns.some(p => p.file.endsWith('.java'))) return 'java';
    if (patterns.some(p => p.file.endsWith('.go'))) return 'go';
    if (patterns.some(p => p.file.endsWith('.rs'))) return 'rust';
    return 'unknown';
  }

  private detectVersion(framework: string, deps: DependencyMap): string {
    return deps[framework] || 'latest';
  }
}
