/**
 * Multi-Agent Orchestrator
 * 
 * Coordinates specialized AI agents to work together
 * Revolutionary architecture for template-free code generation
 */

import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Logger } from '../utils/logger.js';
import type {
  Intent,
  Domain,
  Architecture,
  CodeOutput,
  OrchestratorConfig,
} from '../types/index.js';

export class AgentOrchestrator {
  private anthropic?: Anthropic;
  private openai?: OpenAI;
  private google?: GoogleGenerativeAI;
  private logger: Logger;
  private model: string;

  // Agent specializations
  private agents = {
    intent: this.createIntentAgent.bind(this),
framework: this.createFrameworkAgent.bind(this),
    architecture: this.createArchitectureAgent.bind(this),
    code: this.createCodeAgent.bind(this),
    security: this.createSecurityAgent.bind(this),
    performance: this.createPerformanceAgent.bind(this),
  };

  constructor(config: OrchestratorConfig) {
    this.logger = config.logger;
    this.model = config.model;

    // Initialize AI providers
    if (process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
    }

    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }

    if (process.env.GOOGLE_API_KEY) {
      this.google = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    }
  }

  /**
   * Analyze user intent using AI
   * REVOLUTIONARY: Understands what user wants WITHOUT templates!
   */
  async analyzeIntent(description: string): Promise<Intent> {
    this.logger.info('🧠 Intent Analysis Agent activated');

    const prompt = `You are an expert software architect analyzing a project requirement.

User Request: "${description}"

Analyze this request and extract:
1. Core functionality needed
2. Key features required
3. Technical requirements
4. Scale and performance needs
5. Domain/industry context

Respond in JSON format:
{
  "functionality": "...",
  "features": ["...", "..."],
  "technical_requirements": ["...", "..."],
  "scale": "small|medium|large|enterprise",
  "domain_hints": ["...", "..."]
}`;

    const response = await this.callLLM(prompt);
    const intent = JSON.parse(response);

    this.logger.success('✅ Intent analyzed');
    return intent;
  }

  /**
   * Select optimal framework based on intent and domain
   */
  async selectFramework(intent: Intent, domain: Domain): Promise<string> {
    this.logger.info('🎯 Framework Selection Agent activated');

    const prompt = `You are an expert in selecting optimal technology stacks.

Project Intent: ${JSON.stringify(intent, null, 2)}
Domain: ${domain.name}

Based on the requirements, select the BEST framework. Consider:
- Performance requirements
- Development speed
- Ecosystem maturity
- Team expertise (assume full-stack proficiency)
- Scalability needs
- Domain best practices

Respond with ONLY the framework name (e.g., "fastapi", "nestjs", "spring-boot", "express")`;

    const framework = await this.callLLM(prompt);

    this.logger.success(`✅ Selected framework: ${framework}`);
    return framework.trim().toLowerCase();
  }

  /**
   * Design architecture using AI
   * NO TEMPLATES - Pure architectural reasoning!
   */
  async designArchitecture(context: {
    intent: Intent;
    domain: Domain;
    framework: string;
  }): Promise<Architecture> {
    this.logger.info('🏗️ Architecture Design Agent activated');

    const prompt = `You are a senior software architect designing a system.

Requirements:
${JSON.stringify(context.intent, null, 2)}

Domain: ${context.domain.name}
Framework: ${context.framework}

Design the optimal architecture. Include:
1. Project structure (files and folders)
2. Core components and their responsibilities
3. Database schema (if needed)
4. API endpoints/routes
5. Authentication & authorization approach
6. Testing strategy
7. Dependencies needed

Respond in JSON format with complete architectural design.`;

    const response = await this.callLLM(prompt);
    const architecture = JSON.parse(response);

    this.logger.success('✅ Architecture designed');
    return architecture;
  }

  /**
   * Generate code using AI synthesis
   * TEMPLATE-FREE: AI writes actual production code!
   */
  async generateCode(architecture: Architecture): Promise<CodeOutput> {
    this.logger.info('💻 Code Synthesis Agent activated');

    const files: Record<string, string> = {};

    // Generate each file using AI
    for (const file of architecture.files || []) {
      this.logger.info(`  Generating ${file.path}...`);

      const prompt = `You are an expert developer writing production-quality code.

File: ${file.path}
Purpose: ${file.purpose}
Framework: ${architecture.framework}

Architecture Context:
${JSON.stringify(architecture, null, 2)}

Write complete, production-ready code for this file.
Include:
- Proper imports
- Error handling
- Type safety
- Comments for complex logic
- Best practices for ${architecture.framework}

Respond with ONLY the code, no explanations.`;

      const code = await this.callLLM(prompt);
      files[file.path] = code;
    }

    this.logger.success('✅ Code generated');

    return {
      files,
      dependencies: architecture.dependencies || {},
      configuration: architecture.configuration || {},
    };
  }

  /**
   * Plan extension to existing project
   */
  async planExtension(context: {
    current: any;
    context: any;
    feature: string;
  }): Promise<any> {
    this.logger.info('🔧 Extension Planning Agent activated');

    const prompt = `You are planning to add a new feature to an existing project.

Current Project:
Framework: ${context.current.framework}
Domain: ${context.current.domain}

New Feature: "${context.feature}"

Plan how to integrate this feature:
1. Which files need to be modified
2. Which new files need to be created
3. Dependencies to add
4. Integration points with existing code

Respond in JSON format.`;

    const plan = JSON.parse(await this.callLLM(prompt));

    this.logger.success('✅ Extension planned');
    return plan;
  }

  /**
   * Generate extension code
   */
  async generateExtension(plan: any): Promise<CodeOutput> {
    this.logger.info('💻 Extension Code Agent activated');

    const files: Record<string, string> = {};

    for (const file of plan.files || []) {
      const code = await this.callLLM(`Generate code for ${file.path} implementing ${file.purpose}`);
      files[file.path] = code;
    }

    return {
      files,
      dependencies: plan.dependencies || {},
      configuration: {},
    };
  }

  /**
   * Extract business logic from codebase (for translation)
   */
  async extractBusinessLogic(context: any): Promise<any> {
    this.logger.info('🧠 Business Logic Extraction Agent activated');

    const prompt = `Extract the framework-agnostic business logic from this codebase.

Focus on:
- Core business rules
- Data models
- Business workflows
- Domain logic

Ignore framework-specific code.

Respond in structured JSON format.`;

    const logic = JSON.parse(await this.callLLM(prompt));

    this.logger.success('✅ Business logic extracted');
    return logic;
  }

  /**
   * Map architecture from one framework to another
   */
  async mapArchitecture(context: {
    from: string;
    to: string;
    logic: any;
  }): Promise<Architecture> {
    this.logger.info(`🗺️ Architecture Mapping Agent activated (${context.from} → ${context.to})`);

    const prompt = `You are translating a project from ${context.from} to ${context.to}.

Business Logic:
${JSON.stringify(context.logic, null, 2)}

Design the equivalent architecture in ${context.to}:
- Map ${context.from} patterns to ${context.to} patterns
- Preserve all business logic
- Follow ${context.to} best practices
- Maintain feature parity

Respond with complete ${context.to} architecture in JSON format.`;

    const architecture = JSON.parse(await this.callLLM(prompt));

    this.logger.success('✅ Architecture mapped');
    return architecture;
  }

  /**
   * Call LLM with automatic provider selection
   */
  private async callLLM(prompt: string): Promise<string> {
    if (this.model.includes('claude') && this.anthropic) {
      return this.callClaude(prompt);
    } else if (this.model.includes('gpt') && this.openai) {
      return this.callOpenAI(prompt);
    } else if (this.model.includes('gemini') && this.google) {
      return this.callGemini(prompt);
    } else {
      // Fallback to mock for development
      return this.mockLLM(prompt);
    }
  }

  private async callClaude(prompt: string): Promise<string> {
    const message = await this.anthropic!.messages.create({
      model: this.model,
      max_tokens: 8000,
      messages: [{ role: 'user', content: prompt }],
    });

    return message.content[0].type === 'text' ? message.content[0].text : '';
  }

  private async callOpenAI(prompt: string): Promise<string> {
    const completion = await this.openai!.chat.completions.create({
      model: this.model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 8000,
    });

    return completion.choices[0]?.message?.content || '';
  }

  private async callGemini(prompt: string): Promise<string> {
    const model = this.google!.getGenerativeModel({ model: this.model });
    const result = await model.generateContent(prompt);
    return result.response.text();
  }

  private async mockLLM(prompt: string): Promise<string> {
    // Mock responses for development/testing
    if (prompt.includes('analyzeIntent')) {
      return JSON.stringify({
        functionality: 'REST API development',
        features: ['CRUD operations', 'Authentication', 'Database'],
        technical_requirements: ['TypeScript', 'PostgreSQL'],
        scale: 'medium',
        domain_hints: ['backend', 'api'],
      });
    }

    if (prompt.includes('selectFramework')) {
      return 'nestjs';
    }

    if (prompt.includes('design')) {
      return JSON.stringify({
        framework: 'nestjs',
        files: [
          { path: 'src/main.ts', purpose: 'Application entry point' },
          { path: 'src/app.module.ts', purpose: 'Root module' },
        ],
        dependencies: { '@nestjs/core': '^10.0.0' },
      });
    }

    return '// Generated code placeholder';
  }

  // Agent creation methods
  private createIntentAgent() {
    return { name: 'Intent Analysis Agent', role: 'understanding user requirements' };
  }

  private createFrameworkAgent() {
    return { name: 'Framework Selection Agent', role: 'choosing optimal tech stack' };
  }

  private createArchitectureAgent() {
    return { name: 'Architecture Design Agent', role: 'designing system structure' };
  }

  private createCodeAgent() {
    return { name: 'Code Synthesis Agent', role: 'generating production code' };
  }

  private createSecurityAgent() {
    return { name: 'Security Analysis Agent', role: 'identifying vulnerabilities' };
  }

  private createPerformanceAgent() {
    return { name: 'Performance Optimization Agent', role: 'optimizing code performance' };
  }
}
