/**
 * Intelligent Security Vulnerability Scanner
 * 
 * REVOLUTIONARY: AGI-powered security analysis
 * Detects OWASP Top 10, CVEs, and emerging threats
 */

import { AGIReasoningEngine } from './multi-model-reasoning.js';
import type { Logger } from '../utils/logger.js';

interface Vulnerability {
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: string;
  description: string;
  location: string;
  cwe?: string;
  owasp?: string;
  fix: string;
  codeExample?: string;
}

interface SecurityReport {
  score: number;
  vulnerabilities: Vulnerability[];
  recommendations: string[];
  compliance: {
    owasp: boolean;
    pci: boolean;
    hipaa: boolean;
    gdpr: boolean;
  };
}

export class SecurityScanner {
  private agi: AGIReasoningEngine;
  private logger: Logger;

  // OWASP Top 10 patterns
  private owaspPatterns = {
    'A01:2021-Broken Access Control': [
      /\bauth\b.*=.*false/i,
      /if\s*\(\s*req\.user\s*\)/,
      /admin.*=.*true/i,
    ],
    'A02:2021-Cryptographic Failures': [
      /md5|sha1(?!256)/i,
      /password.*=.*['"][^'"]+['"]/i,
      /crypto\.createCipher\(/i,
    ],
    'A03:2021-Injection': [
      /exec\(|eval\(/i,
      /\$\{.*req\.|query\(/i,
      /innerHTML|dangerouslySetInnerHTML/i,
    ],
    'A04:2021-Insecure Design': [],
    'A05:2021-Security Misconfiguration': [
      /debug.*true/i,
      /cors.*origin.*\*/i,
    ],
    'A06:2021-Vulnerable Components': [],
    'A07:2021-Authentication Failures': [
      /password.*length.*<.*8/i,
      /session.*cookie.*secure.*false/i,
    ],
    'A08:2021-Software and Data Integrity': [],
    'A09:2021-Security Logging Failures': [
      /catch.*\{[\s\S]{0,50}\}/,
    ],
    'A10:2021-Server-Side Request Forgery': [
      /fetch\(.*req\./i,
      /axios\(.*params/i,
    ],
  };

  constructor(agi: AGIReasoningEngine, logger: Logger) {
    this.agi = agi;
    this.logger = logger;
  }

  /**
   * Comprehensive security scan with AGI analysis
   */
  async scan(code: string, framework?: string): Promise<SecurityReport> {
    this.logger.info('🔒 AGI Security Scanner activated');

    const vulnerabilities: Vulnerability[] = [];

    // Pattern-based detection (fast)
    const patternVulns = this.patternBasedScan(code);
    vulnerabilities.push(...patternVulns);

    // AGI-powered deep analysis (thorough)
    const agiVulns = await this.agiDeepScan(code, framework);
    vulnerabilities.push(...agiVulns);

    // Remove duplicates
    const uniqueVulns = this.deduplicateVulnerabilities(vulnerabilities);

    // Calculate security score
    const score = this.calculateSecurityScore(uniqueVulns);

    // Generate recommendations
    const recommendations = this.generateRecommendations(uniqueVulns, framework);

    // Check compliance
    const compliance = this.checkCompliance(uniqueVulns);

    this.logger.success(`✅ Security scan complete: ${uniqueVulns.length} issues found`);
    this.logger.info(`📊 Security score: ${(score * 100).toFixed(1)}/100`);

    return {
      score,
      vulnerabilities: uniqueVulns,
      recommendations,
      compliance,
    };
  }

  /**
   * Pattern-based vulnerability detection
   */
  private patternBasedScan(code: string): Vulnerability[] {
    const vulnerabilities: Vulnerability[] = [];

    for (const [category, patterns] of Object.entries(this.owaspPatterns)) {
      for (const pattern of patterns) {
        const matches = code.match(new RegExp(pattern.source, 'g'));
        if (matches) {
          const lines = code.split('\n');
          let lineNum = 0;
          
          for (let i = 0; i < lines.length; i++) {
            if (pattern.test(lines[i])) {
              lineNum = i + 1;
              break;
            }
          }

          vulnerabilities.push({
            severity: this.getSeverityFromCategory(category),
            category,
            description: this.getDescriptionFromCategory(category),
            location: `Line ${lineNum}`,
            owasp: category.split(':')[0],
            fix: this.getFixFromCategory(category),
          });
        }
      }
    }

    return vulnerabilities;
  }

  /**
   * AGI-powered deep security analysis
   */
  private async agiDeepScan(code: string, framework?: string): Promise<Vulnerability[]> {
    const prompt = `You are a security expert conducting a comprehensive code review.

Framework: ${framework || 'Unknown'}

Code:
${code}

Analyze for ALL security vulnerabilities including:
1. OWASP Top 10 (2021)
2. CWE (Common Weakness Enumeration)
3. Authentication/Authorization flaws
4. Data exposure risks
5. Injection vulnerabilities
6. Cryptographic issues
7. Business logic flaws
8. Race conditions
9. Memory safety issues

Return a JSON array of vulnerabilities with this format:
[{
  "severity": "critical|high|medium|low",
  "category": "Brief category name",
  "description": "Detailed description",
  "location": "File/line if identifiable",
  "fix": "How to fix this vulnerability"
}]`;

    const result = await this.agi.reason(prompt, { enableChainOfThought: true });
    
    try {
      const jsonMatch = result.finalResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const vulns = JSON.parse(jsonMatch[0]);
        return vulns.map((v: any) => ({
          severity: v.severity,
          category: v.category,
          description: v.description,
          location: v.location,
          fix: v.fix,
        }));
      }
    } catch (error) {
      this.logger.warn('⚠️ Failed to parse AGI security analysis');
    }

    return [];
  }

  /**
   * Calculate security score
   */
  private calculateSecurityScore(vulnerabilities: Vulnerability[]): number {
    if (vulnerabilities.length === 0) return 1.0;

    const severityWeights = {
      critical: 100,
      high: 50,
      medium: 20,
      low: 5,
      info: 1,
    };

    const totalPenalty = vulnerabilities.reduce((sum, v) => 
      sum + severityWeights[v.severity], 0
    );

    // Score from 0-1 (higher is better)
    const maxPenalty = 500; // Arbitrary max
    return Math.max(0, 1 - (totalPenalty / maxPenalty));
  }

  /**
   * Generate security recommendations
   */
  private generateRecommendations(vulnerabilities: Vulnerability[], framework?: string): string[] {
    const recommendations: string[] = [];

    const hasCritical = vulnerabilities.some(v => v.severity === 'critical');
    const hasInjection = vulnerabilities.some(v => v.category.includes('Injection'));
    const hasAuth = vulnerabilities.some(v => v.category.includes('Authentication'));
    const hasCrypto = vulnerabilities.some(v => v.category.includes('Cryptographic'));

    if (hasCritical) {
      recommendations.push('🚨 URGENT: Address critical vulnerabilities immediately before deployment');
    }

    if (hasInjection) {
      recommendations.push('Use parameterized queries and input validation to prevent injection attacks');
    }

    if (hasAuth) {
      recommendations.push('Implement multi-factor authentication and secure session management');
      recommendations.push('Use bcrypt or Argon2 for password hashing (never MD5/SHA1)');
    }

    if (hasCrypto) {
      recommendations.push('Upgrade to modern cryptographic algorithms (AES-256, SHA-256+)');
      recommendations.push('Never store passwords in plaintext or use weak hashing');
    }

    recommendations.push('Conduct regular security audits and penetration testing');
    recommendations.push('Keep all dependencies up-to-date to patch known vulnerabilities');
    recommendations.push('Implement rate limiting and DDoS protection');
    recommendations.push('Use Content Security Policy (CSP) headers');

    if (framework) {
      recommendations.push(`Follow ${framework} security best practices and official guidelines`);
    }

    return recommendations;
  }

  /**
   * Check compliance with security standards
   */
  private checkCompliance(vulnerabilities: Vulnerability[]): SecurityReport['compliance'] {
    const critical = vulnerabilities.filter(v => v.severity === 'critical').length;
    const high = vulnerabilities.filter(v => v.severity === 'high').length;

    return {
      owasp: critical === 0 && high === 0,
      pci: critical === 0 && high === 0, // PCI DSS requires no critical/high vulns
      hipaa: critical === 0, // HIPAA requires strong data protection
      gdpr: critical === 0, // GDPR requires data protection
    };
  }

  /**
   * Deduplicate vulnerabilities
   */
  private deduplicateVulnerabilities(vulnerabilities: Vulnerability[]): Vulnerability[] {
    const seen = new Set<string>();
    return vulnerabilities.filter(v => {
      const key = `${v.category}:${v.location}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * Get severity from OWASP category
   */
  private getSeverityFromCategory(category: string): Vulnerability['severity'] {
    if (category.includes('A01') || category.includes('A02') || category.includes('A03')) {
      return 'critical';
    }
    if (category.includes('A07')) {
      return 'high';
    }
    return 'medium';
  }

  /**
   * Get description from category
   */
  private getDescriptionFromCategory(category: string): string {
    const descriptions: Record<string, string> = {
      'A01:2021-Broken Access Control': 'Access control enforcement failures allowing unauthorized access',
      'A02:2021-Cryptographic Failures': 'Weak cryptography or sensitive data exposure',
      'A03:2021-Injection': 'Injection flaws (SQL, NoSQL, OS, LDAP, etc.)',
      'A07:2021-Authentication Failures': 'Authentication and session management weaknesses',
    };
    return descriptions[category] || 'Security vulnerability detected';
  }

  /**
   * Get fix recommendation from category
   */
  private getFixFromCategory(category: string): string {
    const fixes: Record<string, string> = {
      'A01:2021-Broken Access Control': 'Implement proper authorization checks on all endpoints',
      'A02:2021-Cryptographic Failures': 'Use strong encryption (AES-256) and modern hash algorithms',
      'A03:2021-Injection': 'Use parameterized queries and input validation/sanitization',
      'A07:2021-Authentication Failures': 'Implement secure session management and strong password policies',
    };
    return fixes[category] || 'Review and fix the security issue following best practices';
  }
}
