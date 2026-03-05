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
  private ollama?: OpenAI; // Local LLM via Ollama OpenAI-compatible API
  private logger: Logger;
  private model: string;

  constructor(config: OrchestratorConfig) {
    this.logger = config.logger;
    this.model = config.model;

    // Initialize AI providers — only with real keys (not placeholders)
    if (this.isValidKey(process.env.ANTHROPIC_API_KEY)) {
      this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
    }
    if (this.isValidKey(process.env.OPENAI_API_KEY)) {
      this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
    }
    if (this.isValidKey(process.env.GOOGLE_API_KEY)) {
      this.google = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
    }

    // Ollama local inference server
    if (process.env.OLLAMA_BASE_URL) {
      this.ollama = new OpenAI({
        apiKey: 'ollama',
        baseURL: `${process.env.OLLAMA_BASE_URL}/v1`,
      });
    }
  }

  /** Rejects placeholder values like 'your-openai-api-key-here' */
  private isValidKey(key: string | undefined): boolean {
    return !!key && key.length > 8 && !key.includes('your-');
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

IMPORTANT: Respond with ONLY valid JSON, no explanations, no markdown, no code fences. Just the raw JSON object.

JSON format:
{
  "functionality": "...",
  "features": ["...", "..."],
  "technical_requirements": ["...", "..."],
  "scale": "small|medium|large|enterprise",
  "domain_hints": ["...", "..."]
}`;

    const response = await this.callLLM(prompt);
    const intent = this.extractJSON(response);

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

Design the optimal architecture.

IMPORTANT: Respond with ONLY valid JSON (no markdown, no fences) in EXACTLY this format:
{
  "framework": "${context.framework}",
  "files": [
    { "path": "src/main.py", "purpose": "Application entry point" },
    { "path": "src/module.py", "purpose": "Core business logic" }
  ],
  "dependencies": { "package-name": "version" },
  "configuration": {}
}

The "files" array MUST contain the actual file paths that need to be created (relative paths).
Include all necessary files for a production-ready project.`;

    const response = await this.callLLM(prompt);
    const architecture = this.extractJSON(response);

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

    // Normalize files array - handle different LLM response shapes
    let fileList: Array<{ path: string; purpose: string }> = [];
    if (Array.isArray(architecture.files)) {
      fileList = architecture.files.map((f: any) => ({
        path: f.path || f.name || f.filename || String(f),
        purpose: f.purpose || f.description || f.content || 'Implementation',
      })).filter((f) => f.path && f.path.length > 0);
    }

    if (fileList.length === 0) {
      this.logger.error('No files in architecture - using fallback structure');
      // Fallback: generate a sensible default structure
      fileList = [
        { path: 'main.py', purpose: 'Main application entry point' },
        { path: 'requirements.txt', purpose: 'Python dependencies' },
        { path: 'README.md', purpose: 'Project documentation' },
      ];
    }

    // Generate each file using AI
    for (const file of fileList) {
      this.logger.info(`  Generating ${file.path}...`);

      const prompt = `You are an expert developer writing production-quality code.

File: ${file.path}
Purpose: ${file.purpose}
Framework: ${architecture.framework || 'general'}

Architecture Context:
${JSON.stringify(architecture, null, 2)}

Write complete, production-ready code for this file.
Include:
- Proper imports
- Error handling
- Type safety
- Comments for complex logic
- Best practices

Respond with ONLY the raw code. No markdown fences, no explanations.`;

      const code = await this.callLLM(prompt);
      files[file.path] = code;
    }

    this.logger.success('✅ Code generated');
    this.logger.success(`📂 ${Object.keys(files).length} file(s) generated: ${Object.keys(files).join(', ')}`);


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

    const plan = this.extractJSON(await this.callLLM(prompt));

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
  async extractBusinessLogic(_context: any): Promise<any> {
    this.logger.info('🧠 Business Logic Extraction Agent activated');

    const prompt = `Extract the framework-agnostic business logic from this codebase.

Focus on:
- Core business rules
- Data models
- Business workflows
- Domain logic

Ignore framework-specific code.

Respond in structured JSON format.`;

    const logic = this.extractJSON(await this.callLLM(prompt));

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

    const architecture = this.extractJSON(await this.callLLM(prompt));

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
    } else if (this.ollama) {
      // Fallback to local Ollama model
      return this.callOllama(prompt);
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

  private async callOllama(prompt: string): Promise<string> {
    const ollamaModel = process.env.OLLAMA_MODEL || 'qwen2.5-coder:7b';
    const completion = await this.ollama!.chat.completions.create({
      model: ollamaModel,
      messages: [{ role: 'user', content: prompt }],
    });
    return completion.choices[0]?.message?.content || '';
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

  /**
   * Extract JSON from LLM response that might have markdown fences or comments
   */
  private extractJSON(response: string): any {
    // Log the raw response for debugging
    if (!response || response.trim().length === 0) {
      this.logger.error('Empty response from LLM');
      throw new Error('Empty response from AI model');
    }

    // Remove markdown code fences
    let cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '');

    // Try to find JSON object or array
    const jsonMatch = cleaned.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) {
      cleaned = jsonMatch[0];
    }

    // Remove single-line comments
    cleaned = cleaned.replace(/\/\/.*$/gm, '');

    // Remove multi-line comments
    cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '');

    // Remove bad control characters (tab, newline, carriage return inside strings are OK,
    // but raw 0x00-0x1F other than \t \n \r cause JSON.parse to fail)
    cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    // Trim whitespace
    cleaned = cleaned.trim();

    try {
      return JSON.parse(cleaned);
    } catch (error) {
      // Last resort: try to sanitize string values by escaping unescaped control chars
      try {
        const sanitized = cleaned.replace(
          /"((?:[^"\\]|\\.)*)"/g,
          (_match, inner) => `"${inner.replace(/[\x00-\x1F\x7F]/g, (c: string) => {
            const escapes: Record<string, string> = { '\n': '\\n', '\r': '\\r', '\t': '\\t' };
            return escapes[c] ?? '';
          })}"`
        );
        return JSON.parse(sanitized);
      } catch {
        this.logger.error(`Failed to parse JSON from response: ${cleaned.substring(0, 200)}...`);
        this.logger.error(`Original response: ${response.substring(0, 200)}...`);
        throw new Error(`Invalid JSON response from AI: ${error}`);
      }
    }
  }
}
