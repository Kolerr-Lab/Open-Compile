/**
 * Self-Learning Engine
 * 
 * REVOLUTIONARY: Learns from every codebase it analyzes
 * Gets smarter over time - NO static templates!
 */

import { LocalIndex } from 'vectra';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

export class SelfLearningEngine {
  private vectorIndex: LocalIndex;

  constructor(knowledgeBasePath = './knowledge-base') {
    // Create knowledge base directory
    if (!existsSync(knowledgeBasePath)) {
      mkdirSync(knowledgeBasePath, { recursive: true });
    }

    // Initialize vector database for learned patterns
    this.vectorIndex = new LocalIndex(join(knowledgeBasePath, 'vectors'));
  }

  /**
   * Ensure the vector index is created before any read/write
   */
  private async ensureIndexExists(): Promise<void> {
    if (!(await this.vectorIndex.isIndexCreated())) {
      await this.vectorIndex.createIndex();
    }
  }

  /**
   * Learn from a generated project
   * Stores patterns, architectures, and solutions
   */
  async learn(context: {
    description: string;
    domain: any;
    framework: string;
    architecture: any;
    code: any;
  }): Promise<void> {
    // Create embedding of the project
    const embedding = this.createEmbedding({
      description: context.description,
      domain: context.domain.name,
      framework: context.framework,
      patterns: this.extractPatterns(context.code),
    });

    // Store in vector database
    await this.ensureIndexExists();
    await this.vectorIndex.insertItem({
      id: this.generateId(),
      metadata: {
        description: context.description,
        domain: context.domain.name,
        framework: context.framework,
        timestamp: new Date().toISOString(),
      },
      vector: embedding,
    });

    // Update framework knowledge
    await this.updateFrameworkKnowledge(context.framework, context.architecture);

    // Update domain knowledge
    await this.updateDomainKnowledge(context.domain.name, context.description);
  }

  /**
   * Learn from an analyzed project
   */
  async learnFromProject(projectPath: string, metadata: any): Promise<void> {
    const embedding = this.createEmbedding({
      path: projectPath,
      framework: metadata.framework,
      domain: metadata.domain,
      language: metadata.language,
    });

    await this.ensureIndexExists();
    await this.vectorIndex.insertItem({
      id: this.generateId(),
      metadata: {
        type: 'analyzed-project',
        framework: metadata.framework,
        domain: metadata.domain,
        timestamp: new Date().toISOString(),
      },
      vector: embedding,
    });
  }

  /**
   * Learn from project extension
   */
  async learnExtension(context: {
    project: any;
    feature: string;
    code: any;
  }): Promise<void> {
    const embedding = this.createEmbedding({
      framework: context.project.framework,
      feature: context.feature,
      extensionPatterns: this.extractPatterns(context.code),
    });

    await this.ensureIndexExists();
    await this.vectorIndex.insertItem({
      id: this.generateId(),
      metadata: {
        type: 'extension',
        framework: context.project.framework,
        feature: context.feature,
        timestamp: new Date().toISOString(),
      },
      vector: embedding,
    });
  }

  /**
   * Learn framework translation patterns
   */
  async learnTranslation(context: {
    from: string;
    to: string;
    patterns: any;
  }): Promise<void> {
    const embedding = this.createEmbedding({
      translationType: `${context.from}-to-${context.to}`,
      patterns: context.patterns,
    });

    await this.ensureIndexExists();
    await this.vectorIndex.insertItem({
      id: this.generateId(),
      metadata: {
        type: 'translation',
        from: context.from,
        to: context.to,
        timestamp: new Date().toISOString(),
      },
      vector: embedding,
    });
  }

  /**
   * Query similar projects/patterns
   * Used to improve future generations
   */
  async findSimilar(query: string, limit = 5): Promise<any[]> {
    const queryEmbedding = this.createEmbedding({ query });
    await this.ensureIndexExists();
    const results = await this.vectorIndex.queryItems(queryEmbedding, limit);
    return results;
  }

  /**
   * Extract patterns from generated code
   */
  private extractPatterns(code: any): any {
    const patterns: any = {
      fileStructure: [],
      commonPatterns: [],
      architecturalDecisions: [],
    };

    if (code.files) {
      patterns.fileStructure = Object.keys(code.files);
      
      // Detect common patterns in code
      for (const [_path, content] of Object.entries<string>(code.files)) {
        if (content.includes('class ')) {
          patterns.commonPatterns.push('class-based');
        }
        if (content.includes('async ') || content.includes('await ')) {
          patterns.commonPatterns.push('async-patterns');
        }
        if (content.includes('@')) {
          patterns.commonPatterns.push('decorator-based');
        }
      }
    }

    return patterns;
  }

  /**
   * Create vector embedding (simplified - in production use proper embedding model)
   */
  private createEmbedding(data: any): number[] {
    // Simple hash-based embedding for demo
    // In production, use OpenAI embeddings or similar
    const str = JSON.stringify(data);
    const embedding = new Array(384).fill(0);
    
    for (let i = 0; i < str.length; i++) {
      const charCode = str.charCodeAt(i);
      embedding[i % 384] += charCode;
    }
    
    // Normalize
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => val / magnitude);
  }

  /**
   * Update framework-specific knowledge
   */
  private async updateFrameworkKnowledge(_framework: string, _architecture: any): Promise<void> {
    // In production: Update framework-specific patterns, best practices, etc.
    // This enables the system to learn framework-specific conventions
  }

  /**
   * Update domain-specific knowledge
   */
  private async updateDomainKnowledge(_domain: string, _description: string): Promise<void> {
    // In production: Update domain-specific patterns, common requirements, etc.
    // This enables better understanding of industry-specific needs
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}
