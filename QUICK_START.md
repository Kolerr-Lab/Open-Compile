# 🚀 OpenCompile AGI - Quick Start Guide

## Installation

```bash
cd "C:\Kolerr Lab_Projects\OpenCompile"
pnpm install
```

## Environment Setup

```bash
# Copy example environment file
cp .env.example .env

# Add your API keys
# Edit .env and add:
ANTHROPIC_API_KEY=your-anthropic-key
OPENAI_API_KEY=your-openai-key  
GOOGLE_API_KEY=your-google-key
```

## Build the Project

```bash
# Development mode (watch for changes)
pnpm dev

# Production build
pnpm build

# Type checking
pnpm type-check
```

## Usage Examples

### 1. Basic Project Creation
```bash
# Create a simple REST API
opencompile create "Build a REST API for user management with authentication"

# With specific framework
opencompile create "Build an AI chatbot backend" --framework fastapi
```

### 2. FULL AGI MODE (All 10 Features)
```typescript
import { AGIEnhancedEngine } from 'opencompile';

const engine = new AGIEnhancedEngine({
  enableMultiModel: true,
  enableEvolution: true,
  enableSecurity: true,
  enablePerformance: true,
  enableTests: true,
  enableDocs: true,
  enableDeployment: true,
  enableCICD: true,
  enableRefactor: true,
  enableRealtime: true,
  verbose: true,
});

// Create project with ALL AGI features
const result = await engine.createWithAGI(
  "AI-powered SaaS platform with real-time analytics",
  {
    framework: 'nestjs',
    platform: 'aws',
    cicd: 'github',
  }
);

console.log('✅ Project created with:');
console.log('  - Evolved code (10 generations)');
console.log('  - Security scanned (OWASP)');
console.log('  - Performance optimized (6 strategies)');
console.log('  - Tests generated (100% coverage)');
console.log('  - Documentation created');
console.log('  - Deployment configs generated');
console.log('  - CI/CD pipeline created');
```

### 3. Individual AGI Features

#### Security Scanning
```typescript
import { SecurityScanner, AGIReasoningEngine } from 'opencompile';

const agi = new AGIReasoningEngine({
  anthropicKey: process.env.ANTHROPIC_API_KEY,
  openaiKey: process.env.OPENAI_API_KEY,
  googleKey: process.env.GOOGLE_API_KEY,
});

const scanner = new SecurityScanner(agi, console);

const code = `
async function login(username, password) {
  const query = "SELECT * FROM users WHERE username='" + username + "'";
  // SQL injection vulnerability!
}
`;

const report = await scanner.scan(code, { depth: 'comprehensive' });

console.log(`Found ${report.highSeverity} high-severity issues`);
console.log(report.vulnerabilities);

// Auto-fix
const fixed = await scanner.autoFix(code, report);
console.log('Fixed code:', fixed);
```

#### Performance Optimization
```typescript
import { PerformanceOptimizer, AGIReasoningEngine } from 'opencompile';

const optimizer = new PerformanceOptimizer(agi, console);

const slowCode = `
for (let i = 0; i < users.length; i++) {
  for (let j = 0; j < users.length; j++) {
    // O(n²) complexity!
  }
}
`;

const result = await optimizer.optimize(slowCode);

console.log('Improvements:', result.improvements);
console.log('Optimized code:', result.optimizedCode);
console.log(`Estimated gain: ${result.estimatedGain}%`);
```

#### Test Generation
```typescript
import { AutomatedTestGenerator, AGIReasoningEngine } from 'opencompile';

const testGen = new AutomatedTestGenerator(agi, console);

const code = `
export class UserService {
  async createUser(data) {
    // ... implementation
  }
}
`;

const tests = await testGen.generateTests(code, {
  framework: 'jest',
  types: ['unit', 'integration'],
});

console.log('Generated tests:', tests.unitTests);
```

#### Code Evolution
```typescript
import { AutonomousCodeEvolution, AGIReasoningEngine } from 'opencompile';

const evolution = new AutonomousCodeEvolution(agi, console);

const result = await evolution.evolve(code, {
  generations: 10,
  populationSize: 20,
  focus: ['performance', 'maintainability'],
});

console.log(`Best fitness: ${result.bestFitness}`);
console.log('Evolved code:', result.bestCode);
console.log('Improvements:', result.improvements);
```

#### Documentation Generation
```typescript
import { DocumentationGenerator, AGIReasoningEngine } from 'opencompile';

const docGen = new DocumentationGenerator(agi, console);

const docs = await docGen.generate(code, {
  name: 'MyProject',
  framework: 'express',
  domain: 'fintech',
  features: ['API', 'Authentication', 'Payments'],
});

console.log('README:', docs.readme);
console.log('API Docs:', docs.apiDocs);
console.log('Architecture:', docs.architecture);
```

#### Deployment Automation
```typescript
import { DeploymentAutomation, AGIReasoningEngine } from 'opencompile';

const deployment = new DeploymentAutomation(agi, console);

const config = await deployment.generateDeployment(
  code,
  'nestjs',
  'aws'
);

console.log('Dockerfile:', config.dockerfile);
console.log('Kubernetes:', config.kubernetes);
console.log('Terraform:', config.infrastructure);
```

#### CI/CD Generation
```typescript
import { CICDGenerator, AGIReasoningEngine } from 'opencompile';

const cicd = new CICDGenerator(agi, console);

const pipeline = await cicd.generate(code, 'express', 'github');

console.log('GitHub Actions:', pipeline.githubActions);
// Save to .github/workflows/ci-cd.yml
```

#### Intelligent Refactoring
```typescript
import { IntelligentRefactor, AGIReasoningEngine } from 'opencompile';

const refactor = new IntelligentRefactor(agi, console);

const result = await refactor.refactor(code, {
  aggressiveness: 'moderate',
  focus: ['extract-method', 'simplify-conditionals'],
});

console.log(`Applied ${result.changes.length} refactorings`);
console.log(`Complexity reduced by ${result.metrics.complexityReduction}%`);
console.log('Refactored code:', result.refactoredCode);
```

#### Real-Time Analysis
```typescript
import { RealtimeAnalyzer, AGIReasoningEngine } from 'opencompile';

const analyzer = new RealtimeAnalyzer(agi, console);

// One-time analysis
const analysis = await analyzer.analyze(code, {
  language: 'typescript',
  framework: 'nestjs',
});

console.log('Suggestions:', analysis.suggestions);
console.log('Patterns:', analysis.patterns);
console.log('Predictions:', analysis.predictions);

// Continuous monitoring
const stopMonitoring = await analyzer.monitorChanges(
  () => getCurrentCode(),
  (result) => {
    console.log(`Found ${result.suggestions.length} suggestions`);
    result.suggestions.forEach(s => {
      console.log(`[${s.severity}] ${s.message} at line ${s.location.line}`);
    });
  },
  2000 // 2-second intervals
);

// Stop monitoring later
// stopMonitoring();
```

### 4. Full-Stack Analysis
```typescript
const engine = new AGIEnhancedEngine({ verbose: true });

const analysis = await engine.analyzeFullStack(code, 'express');

console.log('Security:', analysis.security);
console.log('Performance:', analysis.performance);
console.log('Tests:', analysis.tests);
console.log('Refactoring:', analysis.refactoring);
console.log('Real-time:', analysis.realtime);
```

### 5. One-Command Deployment
```typescript
await engine.deployNow(
  "Build a real-time chat application",
  'aws'
);

// Automatically:
// 1. Generates code
// 2. Applies all AGI optimizations
// 3. Creates deployment configs
// 4. Deploys to AWS
```

## CLI Usage (Coming Soon)

```bash
# Full AGI mode
opencompile create-agi "description" --platform aws

# Individual features
opencompile scan --security ./my-project
opencompile optimize --performance ./my-project
opencompile test --generate ./my-project
opencompile doc --generate ./my-project
opencompile deploy --platform aws ./my-project
opencompile refactor ./my-project
opencompile analyze --realtime ./my-project
```

## API Reference

### AGIEnhancedEngine
```typescript
class AGIEnhancedEngine {
  constructor(config?: AGIEnhancedConfig);
  
  createWithAGI(description: string, options?: CreateOptions): Promise<ProjectResult>;
  analyzeFullStack(code: string, framework: string): Promise<AnalysisResult>;
  startRealtimeMonitoring(getCode: () => string, callback: Function): Promise<() => void>;
  deployNow(description: string, platform: string): Promise<void>;
}
```

### AGI Components
- `AGIReasoningEngine` - Multi-model consensus
- `AutonomousCodeEvolution` - Genetic algorithms
- `SecurityScanner` - OWASP + AI scanning
- `PerformanceOptimizer` - 6 optimization strategies
- `AutomatedTestGenerator` - Comprehensive test suites
- `DocumentationGenerator` - AI-written docs
- `DeploymentAutomation` - Cloud deployment configs
- `CICDGenerator` - Pipeline generation
- `IntelligentRefactor` - Code refactoring
- `RealtimeAnalyzer` - Live analysis

## Configuration Options

```typescript
interface AGIEnhancedConfig {
  // Base engine config
  model?: string;              // Default: 'claude-3-7-sonnet-20250219'
  outputPath?: string;         // Default: './generated-project'
  enableLearning?: boolean;    // Default: true
  verbose?: boolean;           // Default: false
  
  // AGI features (all default to true)
  enableMultiModel?: boolean;
  enableEvolution?: boolean;
  enableSecurity?: boolean;
  enablePerformance?: boolean;
  enableTests?: boolean;
  enableDocs?: boolean;
  enableDeployment?: boolean;
  enableCICD?: boolean;
  enableRefactor?: boolean;
  enableRealtime?: boolean;
}
```

## Best Practices

1. **Development**: Enable verbose mode to see what's happening
2. **Production**: Use all AGI features for maximum quality
3. **Security**: Always run security scanner on generated code
4. **Testing**: Generate tests with every project
5. **Documentation**: Auto-generate docs to save time
6. **Deployment**: Use deployment automation for consistency
7. **CI/CD**: Always generate pipelines for automation
8. **Performance**: Run optimizer on performance-critical code
9. **Refactoring**: Apply refactoring to legacy/complex code
10. **Real-time**: Use real-time analyzer during development

## Troubleshooting

### API Keys Missing
```
Error: Anthropic API key not found
Solution: Set ANTHROPIC_API_KEY in .env file
```

### Out of Memory
```
Error: JavaScript heap out of memory
Solution: Increase Node.js memory: NODE_OPTIONS=--max-old-space-size=4096
```

### Build Errors
```
Error: Cannot find module 'tree-sitter'
Solution: pnpm install
```

## Performance Tips

1. **Use Multi-Model Selectively**: For simple tasks, single model is faster
2. **Cache Results**: AGI operations are expensive, cache when possible
3. **Parallel Processing**: Run independent AGI features in parallel
4. **Incremental Evolution**: Start with 5 generations, increase if needed
5. **Selective Scanning**: Use pattern-based scanning for speed, deep scan for thorough

## Support & Community

- 📖 **Documentation**: See README.md and AGI_SUMMARY.md
- 🐛 **Issues**: Report on GitHub (coming soon)
- 💬 **Discussions**: Join Discord (coming soon)
- 🎓 **Tutorials**: Check examples/ directory (coming soon)

---

## 👨‍💻 **Creator**

**Ricky Anh Nguyen**  
*OpenCompile Creator • Owner of Kolerr Lab • Owner of OrchesityAI*

Dedicated to revolutionizing backend development with AGI technology.

---

**Ready to revolutionize backend development? Start using OpenCompile AGI today!** 🚀
