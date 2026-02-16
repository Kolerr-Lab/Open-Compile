/**
 * Autonomous Code Evolution System
 * 
 * REVOLUTIONARY: Code that improves itself over time
 * Uses genetic algorithms, A/B testing, and continuous learning
 */

import { AGIReasoningEngine } from './multi-model-reasoning.js';
import type { Logger } from '../utils/logger.js';

interface CodeGeneration {
  code: string;
  fitness: number;
  generation: number;
  improvements: string[];
}

interface EvolutionMetrics {
  performance: number;
  maintainability: number;
  security: number;
  testCoverage: number;
}

export class AutonomousCodeEvolution {
  private agi: AGIReasoningEngine;
  private logger: Logger;
  private generationHistory: CodeGeneration[] = [];
  private maxGenerations = 10;

  constructor(agi: AGIReasoningEngine, logger: Logger) {
    this.agi = agi;
    this.logger = logger;
  }

  /**
   * Evolve code through multiple generations
   * REVOLUTIONARY: Code that gets better automatically!
   */
  async evolve(initialCode: string, targetMetrics: Partial<EvolutionMetrics> = {}): Promise<CodeGeneration> {
    this.logger.info('🧬 Autonomous Code Evolution initiated');

    let currentGeneration: CodeGeneration = {
      code: initialCode,
      fitness: await this.calculateFitness(initialCode, targetMetrics),
      generation: 0,
      improvements: [],
    };

    this.generationHistory.push(currentGeneration);

    for (let gen = 1; gen <= this.maxGenerations; gen++) {
      this.logger.info(`🔄 Generation ${gen}/${this.maxGenerations}`);

      // Generate variations using different strategies
      const variations = await Promise.all([
        this.optimizePerformance(currentGeneration.code),
        this.improveMaintainability(currentGeneration.code),
        this.enhanceSecurity(currentGeneration.code),
        this.refactorForClarity(currentGeneration.code),
      ]);

      // Evaluate all variations
      const evaluated = await Promise.all(
        variations.map(async (code, idx) => ({
          code,
          fitness: await this.calculateFitness(code, targetMetrics),
          generation: gen,
          improvements: this.detectImprovements(currentGeneration.code, code),
        }))
      );

      // Select best variation (natural selection)
      const best = evaluated.reduce((a, b) => a.fitness > b.fitness ? a : b);

      // Check if we've improved
      if (best.fitness > currentGeneration.fitness) {
        this.logger.success(`✅ Gen ${gen}: Fitness improved ${currentGeneration.fitness.toFixed(3)} → ${best.fitness.toFixed(3)}`);
        currentGeneration = best;
        this.generationHistory.push(best);
      } else {
        this.logger.info(`⚠️ Gen ${gen}: No improvement, keeping previous generation`);
        // Early stopping if no improvement
        if (gen > 3) break;
      }

      // Check if we've reached target fitness
      if (best.fitness >= 0.95) {
        this.logger.success(`🎯 Target fitness reached!`);
        break;
      }
    }

    this.logger.success(`🧬 Evolution complete: ${this.generationHistory.length} generations`);
    return currentGeneration;
  }

  /**
   * Optimize code for performance
   */
  private async optimizePerformance(code: string): Promise<string> {
    const prompt = `Optimize this code for maximum performance. Focus on:
- Algorithmic efficiency (reduce time complexity)
- Memory optimization
- Async/await patterns
- Caching strategies
- Database query optimization

Original code:
${code}

Return ONLY the optimized code.`;

    const result = await this.agi.reason(prompt, { enableChainOfThought: true });
    return this.extractCode(result.finalResponse);
  }

  /**
   * Improve code maintainability
   */
  private async improveMaintainability(code: string): Promise<string> {
    const prompt = `Refactor this code for maximum maintainability. Focus on:
- Clear naming conventions
- Single Responsibility Principle
- DRY (Don't Repeat Yourself)
- Proper separation of concerns
- Comprehensive documentation

Original code:
${code}

Return ONLY the refactored code.`;

    const result = await this.agi.reason(prompt, { enableChainOfThought: true });
    return this.extractCode(result.finalResponse);
  }

  /**
   * Enhance security
   */
  private async enhanceSecurity(code: string): Promise<string> {
    const prompt = `Enhance security in this code. Address:
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- Authentication/authorization
- Secure data handling
- Error handling (no info leakage)

Original code:
${code}

Return ONLY the secured code.`;

    const result = await this.agi.reason(prompt, { enableChainOfThought: true });
    return this.extractCode(result.finalResponse);
  }

  /**
   * Refactor for clarity
   */
  private async refactorForClarity(code: string): Promise<string> {
    const prompt = `Refactor this code for maximum clarity and readability. Focus on:
- Clear variable and function names
- Logical code organization
- Simplified complex logic
- Helpful comments
- Consistent formatting

Original code:
${code}

Return ONLY the refactored code.`;

    const result = await this.agi.reason(prompt, { enableChainOfThought: true });
    return this.extractCode(result.finalResponse);
  }

  /**
   * Calculate fitness score for code
   */
  private async calculateFitness(code: string, targets: Partial<EvolutionMetrics>): Promise<number> {
    const metrics: EvolutionMetrics = {
      performance: this.analyzePerformance(code),
      maintainability: this.analyzeMaintainability(code),
      security: this.analyzeSecurity(code),
      testCoverage: this.estimateTestCoverage(code),
    };

    // Weighted score
    const weights = {
      performance: targets.performance ? 2 : 1,
      maintainability: targets.maintainability ? 2 : 1,
      security: targets.security ? 2 : 1,
      testCoverage: targets.testCoverage ? 2 : 1,
    };

    const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
    
    const fitness = (
      metrics.performance * weights.performance +
      metrics.maintainability * weights.maintainability +
      metrics.security * weights.security +
      metrics.testCoverage * weights.testCoverage
    ) / totalWeight;

    return fitness;
  }

  /**
   * Analyze performance characteristics
   */
  private analyzePerformance(code: string): number {
    let score = 0.5;

    // Check for async patterns
    if (/async|await|Promise/i.test(code)) score += 0.1;

    // Check for caching
    if (/cache|memo/i.test(code)) score += 0.1;

    // Check for inefficient patterns
    if (/for.*for.*for/s.test(code)) score -= 0.2; // Nested loops
    if (/\.map\(.*\.map\(/s.test(code)) score -= 0.1; // Nested maps

    // Check for optimization patterns
    if (/Set|Map|WeakMap/i.test(code)) score += 0.1;

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Analyze maintainability
   */
  private analyzeMaintainability(code: string): number {
    let score = 0.5;

    // Check function length (shorter is better)
    const avgFunctionLength = this.getAverageFunctionLength(code);
    if (avgFunctionLength < 20) score += 0.2;
    else if (avgFunctionLength > 50) score -= 0.2;

    // Check for comments
    const commentRatio = (code.match(/\/\/.+|\/\*[\s\S]*?\*\//g) || []).length / code.split('\n').length;
    score += Math.min(0.2, commentRatio * 2);

    // Check for descriptive naming
    if (/\b[a-z]{1,2}\b/g.test(code)) score -= 0.1; // Single letter vars

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Analyze security
   */
  private analyzeSecurity(code: string): number {
    let score = 1.0;

    // Check for common vulnerabilities
    if (/eval\(|innerHTML|dangerouslySetInnerHTML/i.test(code)) score -= 0.3;
    if (/exec\(|system\(/i.test(code)) score -= 0.3;
    if (/password.*=.*['"][^'"]{1,8}['"]/i.test(code)) score -= 0.4; // Weak passwords

    // Check for security best practices
    if (/validate|sanitize|escape/i.test(code)) score += 0.1;
    if (/bcrypt|scrypt|argon2/i.test(code)) score += 0.1;

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Estimate test coverage
   */
  private estimateTestCoverage(code: string): number {
    const hasTests = /test\(|it\(|describe\(|expect\(/i.test(code);
    const testLines = (code.match(/test\(|it\(|expect\(/gi) || []).length;
    const totalLines = code.split('\n').length;

    if (!hasTests) return 0.3; // Base score

    const coverage = Math.min(1, testLines / (totalLines * 0.3));
    return coverage;
  }

  /**
   * Detect improvements between generations
   */
  private detectImprovements(oldCode: string, newCode: string): string[] {
    const improvements: string[] = [];

    if (newCode.length < oldCode.length * 0.9) {
      improvements.push('Code size reduced');
    }

    if ((newCode.match(/async/g) || []).length > (oldCode.match(/async/g) || []).length) {
      improvements.push('More async patterns');
    }

    if ((newCode.match(/\/\//g) || []).length > (oldCode.match(/\/\//g) || []).length) {
      improvements.push('Better documentation');
    }

    if (/validate|sanitize/.test(newCode) && !/validate|sanitize/.test(oldCode)) {
      improvements.push('Enhanced security');
    }

    return improvements;
  }

  /**
   * Get average function length
   */
  private getAverageFunctionLength(code: string): number {
    const functions = code.match(/function\s+\w+[^{]*\{[\s\S]*?\}|const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*\{[\s\S]*?\}/g) || [];
    if (functions.length === 0) return 0;

    const totalLines = functions.reduce((sum, fn) => sum + fn.split('\n').length, 0);
    return totalLines / functions.length;
  }

  /**
   * Extract code from LLM response
   */
  private extractCode(response: string): string {
    const codeBlocks = response.match(/```[\s\S]*?```/g);
    if (codeBlocks && codeBlocks.length > 0) {
      return codeBlocks.map(block => block.replace(/```\w*\n?|```/g, '')).join('\n\n');
    }
    return response;
  }

  /**
   * Get evolution history
   */
  getHistory(): CodeGeneration[] {
    return this.generationHistory;
  }
}
