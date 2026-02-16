/**
 * Type Definitions for OpenCompile
 */

export interface EngineConfig {
  model: string;
  outputPath: string;
  enableLearning: boolean;
  verbose: boolean;
}

export interface Intent {
  functionality: string;
  features: string[];
  technical_requirements: string[];
  scale: 'small' | 'medium' | 'large' | 'enterprise';
  domain_hints: string[];
}

export interface Domain {
  name: string;
  confidence: number;
  characteristics: string[];
}

export interface FrameworkInfo {
  name: string;
  version: string;
  language: string;
  confidence: number;
  details?: Record<string, any>;
}

export interface Architecture {
  framework: string;
  files?: Array<{ path: string; purpose: string }>;
  dependencies?: Record<string, string>;
  configuration?: Record<string, any>;
}

export interface CodeOutput {
  files: Record<string, string>;
  dependencies: Record<string, string>;
  configuration: Record<string, any>;
}

export interface DetectionResult {
  framework: string;
  language: string;
  domain: string;
  details?: Record<string, any>;
}

export interface ProjectMetadata {
  framework: string;
  version: string;
  language: string;
  domain: string;
  confidence: number;
}

export interface FilePattern {
  file: string;
  imports: string[];
  decorators: string[];
  classes: string[];
  functions: string[];
}

export type DependencyMap = Record<string, string>;

export interface OrchestratorConfig {
  model: string;
  logger: any;
}
