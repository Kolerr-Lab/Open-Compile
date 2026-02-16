/**
 * Domain Classifier
 * 
 * Intelligently classifies projects into industry domains
 * CRUD, AI/ML, Robotics, FinTech, HealthTech, IoT, Gaming, etc.
 */

import type { Domain } from '../types/index.js';

export class DomainClassifier {
  private domainKeywords: Map<string, string[]>;

  constructor() {
    // Domain detection keywords (NOT templates - just classification hints)
    this.domainKeywords = new Map([
      ['crud', ['create', 'read', 'update', 'delete', 'admin', 'management', 'dashboard', 'cms']],
      ['ai-ml', ['machine learning', 'neural network', 'training', 'model', 'prediction', 'inference', 'ai', 'ml', 'deep learning']],
      ['robotics', ['robot', 'ros', 'sensor', 'actuator', 'control system', 'plc', 'automation']],
      ['fintech', ['payment', 'banking', 'trading', 'blockchain', 'crypto', 'transaction', 'finance']],
      ['healthtech', ['medical', 'patient', 'hospital', 'health', 'hipaa', 'clinical', 'diagnosis']],
      ['iot', ['iot', 'sensor', 'device', 'mqtt', 'telemetry', 'monitoring', 'scada']],
      ['gaming', ['game', 'player', 'multiplayer', 'realtime', 'matchmaking', 'leaderboard']],
      ['ecommerce', ['shop', 'cart', 'product', 'order', 'checkout', 'payment', 'inventory']],
      ['social', ['social', 'user', 'post', 'comment', 'follow', 'feed', 'chat', 'message']],
      ['analytics', ['analytics', 'metrics', 'dashboard', 'visualization', 'reporting', 'data']],
    ]);
  }

  /**
   * Classify domain from user intent
   */
  async classify(intent: any): Promise<Domain> {
    const description = `${intent.functionality} ${intent.features?.join(' ')} ${intent.domain_hints?.join(' ')}`.toLowerCase();

    const scores: Map<string, number> = new Map();

    // Score each domain based on keyword matches
    for (const [domain, keywords] of this.domainKeywords) {
      let score = 0;
      for (const keyword of keywords) {
        if (description.includes(keyword)) {
          score += 1;
        }
      }
      if (score > 0) {
        scores.set(domain, score);
      }
    }

    // Find highest scoring domain
    let bestDomain = 'general';
    let highestScore = 0;

    for (const [domain, score] of scores) {
      if (score > highestScore) {
        highestScore = score;
        bestDomain = domain;
      }
    }

    const confidence = Math.min(highestScore / 5, 1.0);

    return {
      name: bestDomain,
      confidence,
      characteristics: this.domainKeywords.get(bestDomain) || [],
    };
  }

  /**
   * Classify domain from existing code
   */
  async classifyFromCode(files: string[]): Promise<Domain> {
    // Analyze file names and paths for domain hints
    const fileContent = files.join(' ').toLowerCase();

    const scores: Map<string, number> = new Map();

    for (const [domain, keywords] of this.domainKeywords) {
      let score = 0;
      for (const keyword of keywords) {
        if (fileContent.includes(keyword)) {
          score += 1;
        }
      }
      if (score > 0) {
        scores.set(domain, score);
      }
    }

    let bestDomain = 'general';
    let highestScore = 0;

    for (const [domain, score] of scores) {
      if (score > highestScore) {
        highestScore = score;
        bestDomain = domain;
      }
    }

    const confidence = Math.min(highestScore / 5, 1.0);

    return {
      name: bestDomain,
      confidence,
      characteristics: this.domainKeywords.get(bestDomain) || [],
    };
  }
}
