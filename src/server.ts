/**
 * OpenCompile Web Server
 * 
 * Serves the Web UI and provides REST API
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { AGIEnhancedEngine } from './core/agi-engine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, '../webui')));

// Initialize AGI engine
const engine = new AGIEnhancedEngine({
  verbose: true,
  enableMultiModel: true,
  enableEvolution: true,
  enableSecurity: true,
  enablePerformance: true,
  enableTests: true,
  enableDocs: true,
  enableDeployment: true,
  enableCICD: true,
  enableRefactor: true,
  enableRealtime: false, // Disable for server mode
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// API: Create project
app.post('/api/create', async (req, res) => {
  try {
    const { description, framework, platform } = req.body;

    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }

    console.log(`🚀 Creating project: ${description}`);

    const result = await engine.createWithAGI(description, {
      framework,
      platform: platform || 'aws',
      cicd: 'github',
    });

    res.json({
      success: true,
      path: result.projectPath,
      message: 'Project created successfully with full AGI power!',
    });
  } catch (error: any) {
    console.error('Error creating project:', error);
    res.status(500).json({
      error: error.message || 'Failed to create project',
    });
  }
});

// API: Detect framework
app.post('/api/detect', async (req, res) => {
  try {
    const { projectPath } = req.body;

    if (!projectPath) {
      return res.status(400).json({ error: 'Project path is required' });
    }

    // TODO: Implement detection
    res.json({
      framework: 'express',
      language: 'typescript',
      domain: 'web-api',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API: Analyze code
app.post('/api/analyze', async (req, res) => {
  try {
    const { code, framework } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    const analysis = await engine.analyzeFullStack(code, framework || 'express');

    res.json({
      success: true,
      analysis,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Serve Web UI on root
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, '../webui/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🔥 OpenCompile Web Server running on http://localhost:${PORT}`);
  console.log(`📊 Web UI: http://localhost:${PORT}`);
  console.log(`🚀 API: http://localhost:${PORT}/api`);
  console.log(`\n💡 Ready to revolutionize backend development!`);
});
