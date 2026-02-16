/**
 * Intelligent Documentation Generator
 * 
 * REVOLUTIONARY: Auto-generates comprehensive documentation
 * README, API docs, architecture diagrams, tutorials - all AI-written
 */

import { AGIReasoningEngine } from './multi-model-reasoning.js';
import type { Logger } from '../utils/logger.js';

interface Documentation {
  readme: string;
  apiDocs: string;
  architecture: string;
  deployment: string;
  contributing: string;
  changelog: string;
  tutorials: string[];
}

export class DocumentationGenerator {
  private agi: AGIReasoningEngine;
  private logger: Logger;

  constructor(agi: AGIReasoningEngine, logger: Logger) {
    this.agi = agi;
    this.logger = logger;
  }

  /**
   * Generate complete project documentation
   */
  async generate(
    code: string,
    projectInfo: {
      name: string;
      framework: string;
      domain: string;
      features: string[];
    }
  ): Promise<Documentation> {
    this.logger.info('📚 Documentation Generator activated');

    // Generate all docs in parallel
    const [readme, apiDocs, architecture, deployment, contributing, changelog, tutorials] = await Promise.all([
      this.generateREADME(code, projectInfo),
      this.generateAPIDocs(code, projectInfo.framework),
      this.generateArchitectureDocs(code),
      this.generateDeploymentGuide(code, projectInfo.framework),
      this.generateContributingGuide(projectInfo),
      this.generateChangelog(projectInfo),
      this.generateTutorials(code, projectInfo),
    ]);

    this.logger.success('✅ Documentation generated successfully');

    return {
      readme,
      apiDocs,
      architecture,
      deployment,
      contributing,
      changelog,
      tutorials,
    };
  }

  /**
   * Generate README.md
   */
  private async generateREADME(code: string, projectInfo: any): Promise<string> {
    const prompt = `Generate a professional, engaging README.md for this project:

Project: ${projectInfo.name}
Framework: ${projectInfo.framework}
Domain: ${projectInfo.domain}
Features: ${projectInfo.features.join(', ')}

Code overview:
${code.substring(0, 2000)}

Include:
- Compelling project description
- Key features with emojis
- Quick start guide
- Installation instructions
- Usage examples
- API overview
- Configuration
- Contributing section
- License
- Badges (build, coverage, version)

Make it GitHub-ready and visually appealing!`;

    const result = await this.agi.reason(prompt);
    return result.finalResponse;
  }

  /**
   * Generate API documentation
   */
  private async generateAPIDocs(code: string, framework: string): Promise<string> {
    const prompt = `Generate comprehensive API documentation for this ${framework} application:

${code}

Include:
- All endpoints with HTTP methods
- Request/response formats
- Parameters and their types
- Authentication requirements
- Example requests with curl
- Response codes and error handling
- Rate limiting info

Use OpenAPI/Swagger format where applicable.`;

    const result = await this.agi.reason(prompt);
    return result.finalResponse;
  }

  /**
   * Generate architecture documentation
   */
  private async generateArchitectureDocs(code: string): Promise<string> {
    const prompt = `Generate architecture documentation for this application:

${code}

Include:
- System architecture overview
- Component diagrams (in Mermaid format)
- Data flow diagrams
- Database schema
- Design patterns used
- Technology stack
- Scalability considerations
- Security architecture

Use Mermaid diagrams where possible.`;

const result = await this.agi.reason(prompt);
    return result.finalResponse;
  }

  /**
   * Generate deployment guide
   */
  private async generateDeploymentGuide(code: string, framework: string): Promise<string> {
    const prompt = `Generate a deployment guide for this ${framework} application:

${code}

Include:
- Prerequisites
- Environment setup
- Docker deployment
- Cloud deployment (AWS, GCP, Azure)
- CI/CD setup
- Environment variables
- Database migrations
- Monitoring setup
- Troubleshooting

Provide step-by-step instructions.`;

    const result = await this.agi.reason(prompt);
    return result.finalResponse;
  }

  /**
   * Generate contributing guide
   */
  private async generateContributingGuide(projectInfo: any): Promise<string> {
    const prompt = `Generate a CONTRIBUTING.md for ${projectInfo.name}:

Include:
- Code of Conduct
- How to set up development environment
- Coding standards
- Git workflow (branching, commits)
- Pull request process
- Testing requirements
- Documentation requirements

Make it welcoming and comprehensive.`;

    const result = await this.agi.reason(prompt);
    return result.finalResponse;
  }

  /**
   * Generate changelog
   */
  private async generateChangelog(projectInfo: any): Promise<string> {
    return `# Changelog

All notable changes to ${projectInfo.name} will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial release
- ${projectInfo.features.map((f: string) => `- ${f}`).join('\n')}

### Changed
- N/A

### Deprecated
- N/A

### Removed
- N/A

### Fixed
- N/A

### Security
- N/A

## [1.0.0] - ${new Date().toISOString().split('T')[0]}

### Added
- Initial release of ${projectInfo.name}
- Core functionality implemented
- Documentation added
`;
  }

  /**
   * Generate tutorials
   */
  private async generateTutorials(code: string, projectInfo: any): Promise<string[]> {
    const tutorialTopics = [
      'Getting Started',
      'Authentication Setup',
      'Database Configuration',
      'API Usage Examples',
    ];

    const tutorials: string[] = [];

    for (const topic of tutorialTopics) {
      const prompt = `Write a tutorial on "${topic}" for ${projectInfo.name} (${projectInfo.framework}):

Code context:
${code.substring(0, 1000)}

Make it:
- Beginner-friendly
- Step-by-step
- Include code examples
- Explain concepts clearly`;

      const result = await this.agi.reason(prompt);
      tutorials.push(`# ${topic}\n\n${result.finalResponse}`);
    }

    return tutorials;
  }
}
