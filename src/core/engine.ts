/**
 * OpenCompile Main Engine
 * 
 * Orchestrates all intelligence components and multi-agent system
 */

import { FrameworkDetector } from './detector.js';
import { DomainClassifier } from './domain.js';
import { AgentOrchestrator } from '../agents/orchestrator.js';
import { ContextManager } from './context.js';
import { SelfLearningEngine } from './self-learning.js';
import { Logger } from '../utils/logger.js';
import { resolve } from 'path';
import type { EngineConfig, DetectionResult, ProjectMetadata } from '../types/index.js';

export class OpenCompileEngine {
  private detector: FrameworkDetector;
  private domainClassifier: DomainClassifier;
  private orchestrator: AgentOrchestrator;
  private contextManager: ContextManager;
  private learningEngine: SelfLearningEngine;
  private logger: Logger;
  private config: EngineConfig;

  constructor(config: Partial<EngineConfig> = {}) {
    this.config = {
      model: config.model || 'gpt-4o',
      outputPath: config.outputPath || './generated-project',
      enableLearning: config.enableLearning ?? true,
      verbose: config.verbose ?? false,
    };

    this.logger = new Logger(this.config.verbose);
    this.detector = new FrameworkDetector();
    this.domainClassifier = new DomainClassifier();
    this.contextManager = new ContextManager();
    this.learningEngine = new SelfLearningEngine();
    this.orchestrator = new AgentOrchestrator({
      model: this.config.model,
      logger: this.logger,
    });

    this.logger.info('🔥 OpenCompile Engine initialized');
  }

  /**
   * Create a new project from natural language description
   * This is the REVOLUTIONARY feature - NO TEMPLATES!
   */
  async create(description: string, preferredFramework?: string): Promise<{ projectPath: string; code: any }> {
    this.logger.info(`🚀 Creating project: "${description}"`);

    // Step 1: Understand intent using multi-agent system
    this.logger.info('🧠 Analyzing requirements with AI agents...');
    const intent = await this.orchestrator.analyzeIntent(description);
    
    // Step 2: Classify domain
    this.logger.info('🎯 Classifying domain...');
    const domain = await this.domainClassifier.classify(intent);
    
    // Step 3: Select optimal framework (unless specified)
    let framework = preferredFramework;
    if (!framework) {
      this.logger.info('🔍 Selecting optimal framework...');
      framework = await this.orchestrator.selectFramework(intent, domain);
    }
    
    // Step 4: Design architecture
    this.logger.info('🏗️ Designing architecture...');
    const architecture = await this.orchestrator.designArchitecture({
      intent,
      domain,
      framework,
    });
    
    // Step 5: Generate code (template-free!)
    this.logger.info('💻 Generating code with AI synthesis...');
    const code = await this.orchestrator.generateCode(architecture);
    
    // Step 6: Learn from this generation
    if (this.config.enableLearning) {
      this.logger.info('📚 Updating knowledge base...');
      await this.learningEngine.learn({
        description,
        domain,
        framework,
        architecture,
        code,
      });
    }
    
    // Step 7: Write files to absolute path
    const absoluteOutputPath = resolve(this.config.outputPath);
    this.logger.info(`📁 Writing files to: ${absoluteOutputPath}`);
    await this.contextManager.writeProject(absoluteOutputPath, code);
    
    this.logger.success('✅ Project created successfully!');
    return { projectPath: absoluteOutputPath, code };
  }

  /**
   * Detect framework and architecture of existing project
   * Uses advanced AST analysis + AI inference
   */
  async detect(projectPath: string): Promise<DetectionResult> {
    this.logger.info(`🔍 Detecting framework in: ${projectPath}`);

    // Step 1: Scan project structure
    const files = await this.contextManager.scanProject(projectPath);
    
    // Step 2: Parse dependencies
    const dependencies = await this.detector.parseDependencies(projectPath);
    
    // Step 3: Analyze code patterns using AST
    this.logger.info('🔬 Analyzing code patterns...');
    const patterns = await this.detector.analyzePatterns(files);
    
    // Step 4: AI-powered framework detection
    this.logger.info('🧠 Running AI detection...');
    const framework = await this.detector.detect({
      files,
      dependencies,
      patterns,
    });
    
    // Step 5: Classify domain
    const domain = await this.domainClassifier.classifyFromCode(files);
    
    // Step 6: Get project metadata
    const metadata: ProjectMetadata = {
      framework: framework.name,
      version: framework.version,
      language: framework.language,
      domain: domain.name,
      confidence: framework.confidence,
    };
    
    // Step 7: Learn from analysis
    if (this.config.enableLearning) {
await this.learningEngine.learnFromProject(projectPath, metadata);
    }
    
    return {
      framework: framework.name,
      language: framework.language,
      domain: domain.name,
      details: metadata,
    };
  }

  /**
   * Extend existing project with new features
   * Intelligently integrates with existing architecture
   */
  async extend(projectPath: string, featureDescription: string): Promise<void> {
    this.logger.info(`⚡ Extending project with: "${featureDescription}"`);

    // Step 1: Detect current architecture
    const current = await this.detect(projectPath);
    
    // Step 2: Load existing context
    const context = await this.contextManager.loadProject(projectPath);
    
    // Step 3: Plan extension
    this.logger.info('🧠 Planning feature integration...');
    const plan = await this.orchestrator.planExtension({
      current,
      context,
      feature: featureDescription,
    });
    
    // Step 4: Generate extension code
    this.logger.info('💻 Generating extension code...');
    const extensionCode = await this.orchestrator.generateExtension(plan);
    
    // Step 5: Integrate with existing code
    this.logger.info('🔧 Integrating with existing architecture...');
    await this.contextManager.mergeCode(projectPath, extensionCode);
    
    // Step 6: Learn from extension
    if (this.config.enableLearning) {
      await this.learningEngine.learnExtension({
        project: current,
        feature: featureDescription,
        code: extensionCode,
      });
    }
    
    this.logger.success('✅ Project extended successfully!');
  }

  /**
   * Translate project from one framework to another
   * REVOLUTIONARY: Convert between ANY frameworks!
   */
  async translate(
    fromFramework: string,
    toFramework: string,
    sourcePath: string,
    outputPath?: string
  ): Promise<void> {
    this.logger.info(`🔄 Translating ${fromFramework} → ${toFramework}`);

    // Step 1: Load source project
    const sourceContext = await this.contextManager.loadProject(sourcePath);
    
    // Step 2: Extract business logic (framework-agnostic)
    this.logger.info('🧠 Extracting business logic...');
    const businessLogic = await this.orchestrator.extractBusinessLogic(sourceContext);
    
    // Step 3: Map architecture patterns
    this.logger.info('🗺️ Mapping architecture patterns...');
    const mappedArchitecture = await this.orchestrator.mapArchitecture({
      from: fromFramework,
      to: toFramework,
      logic: businessLogic,
    });
    
    // Step 4: Generate code in target framework
    this.logger.info('💻 Generating code in target framework...');
    const translatedCode = await this.orchestrator.generateCode(mappedArchitecture);
    
    // Step 5: Write translated project
    const output = outputPath || `${sourcePath}-${toFramework}`;
    await this.contextManager.writeProject(output, translatedCode);
    
    // Step 6: Learn translation patterns
    if (this.config.enableLearning) {
      await this.learningEngine.learnTranslation({
        from: fromFramework,
        to: toFramework,
        patterns: mappedArchitecture,
      });
    }
    
    this.logger.success('✅ Translation complete!');
  }

  /**
   * NEW: Translate framework using AI-powered translator
   */
  async translateFramework(
    fromFramework: string,
    toFramework: string,
    sourcePath: string,
    outputPath?: string
  ): Promise<void> {
    this.logger.info(`🔄 Framework Translation: ${fromFramework} → ${toFramework}`);

    const { FrameworkTranslator } = await import('../agi/framework-translator.js');
    const translator = new FrameworkTranslator(this.logger);

    // Read source code
    const sourceCode = await this.contextManager.readFile(sourcePath);

    // Translate
    const result = await translator.translate({
      sourceFramework: fromFramework,
      targetFramework: toFramework,
      sourceLanguage: 'auto',
      targetLanguage: 'auto',
      sourceCode,
      preserveStructure: true,
    });

    // Write output
    const output = outputPath || `${sourcePath}.${toFramework}`;
    await this.contextManager.writeFile(output, result.code);

    this.logger.success(`✅ Translated to ${toFramework}: ${output}`);

    if (result.warnings.length > 0) {
      this.logger.warn('⚠️ Warnings:');
      result.warnings.forEach(w => this.logger.warn(`  - ${w}`));
    }
  }
}
