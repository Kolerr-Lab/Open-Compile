/**
 * OpenCompile Web Server
 *
 * REST API + WebSocket for real-time job streaming
 * Serves the Enterprise Web UI
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { AGIEnhancedEngine } from './core/agi-engine.js';
import { AGIReasoningEngine } from './agi/multi-model-reasoning.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json({ limit: '10mb' }));
app.use(express.static(join(__dirname, '../webui')));

// ─── WebSocket for real-time job streaming ───────────────────────────────────
const wss = new WebSocketServer({ server: httpServer });

// Map of jobId → subscriber sockets
const jobSubscribers = new Map<string, Set<WebSocket>>();

function broadcastJob(jobId: string, event: object) {
  const subs = jobSubscribers.get(jobId);
  if (!subs) return;
  const msg = JSON.stringify(event);
  for (const ws of subs) {
    if (ws.readyState === WebSocket.OPEN) ws.send(msg);
  }
}

wss.on('connection', (ws, req) => {
  const url = new URL(req.url || '/', `http://localhost`);
  const jobId = url.searchParams.get('jobId');
  if (!jobId) { ws.close(1008, 'jobId required'); return; }

  if (!jobSubscribers.has(jobId)) jobSubscribers.set(jobId, new Set());
  jobSubscribers.get(jobId)!.add(ws);

  ws.on('close', () => {
    jobSubscribers.get(jobId)?.delete(ws);
    if (jobSubscribers.get(jobId)?.size === 0) jobSubscribers.delete(jobId);
  });
});

// ─── AGI Engine ──────────────────────────────────────────────────────────────

// Detect is not yet wired on AGIEnhancedEngine — simple placeholder
function detectFromPath(projectPath: string) {
  return { framework: 'unknown', path: projectPath, message: 'Detection not yet implemented for this path' };
}

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
  enableRealtime: false,
});

// Shared reasoning engine for provider info queries
const reasoningEngine = new AGIReasoningEngine({ info: console.log, success: console.log, warn: console.warn, error: console.error } as any);

// ─── Routes ──────────────────────────────────────────────────────────────────

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// List all configured providers and their availability
app.get('/api/providers', (_req, res) => {
  const providers = reasoningEngine.getProviders();
  res.json({ providers });
});

// List locally available Ollama models (requires Ollama running)
app.get('/api/models/local', async (_req, res) => {
  const ollamaBase = process.env.OLLAMA_BASE_URL;
  if (!ollamaBase) {
    return res.json({ available: false, models: [], message: 'OLLAMA_BASE_URL not configured' });
  }
  try {
    const resp = await fetch(`${ollamaBase}/api/tags`);
    if (!resp.ok) throw new Error(`Ollama returned ${resp.status}`);
    const data = await resp.json() as { models: Array<{ name: string; size: number; modified_at: string }> };
    return res.json({ available: true, models: data.models || [] });
  } catch (err: any) {
    return res.json({ available: false, models: [], message: err.message });
  }
});

// Create project (streaming via WebSocket)
app.post('/api/create', async (req, res) => {
  try {
    const { description, framework, platform, jobId } = req.body;

    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }

    const id = jobId || `job-${Date.now()}`;
    console.log(`🚀 [${id}] Creating project: ${description}`);

    // Respond immediately with jobId so the client can connect the WebSocket
    res.json({ success: true, jobId: id, message: 'Job started — subscribe via WebSocket for live progress' });

    // Run generation asynchronously and broadcast to WS subscribers
    (async () => {
      try {
        broadcastJob(id, { type: 'status', status: 'running' });
        const result = await engine.createWithAGI(description, {
          framework,
          platform: platform || 'aws',
          cicd: 'github',
        });
        broadcastJob(id, {
          type: 'done',
          status: 'success',
          path: result.projectPath,
          message: 'Project created successfully with full AGI power!',
        });
      } catch (err: any) {
        broadcastJob(id, { type: 'done', status: 'error', message: err.message });
      }
    })();

  } catch (error: any) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: error.message || 'Failed to create project' });
  }
});

// Detect framework from project path
app.post('/api/detect', async (req, res) => {
  try {
    const { projectPath } = req.body;
    if (!projectPath) { res.status(400).json({ error: 'Project path is required' }); return; }
    res.json(detectFromPath(projectPath));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Analyze code (security + performance + tests)
app.post('/api/analyze', async (req, res) => {
  try {
    const { code, framework } = req.body;
    if (!code) return res.status(400).json({ error: 'Code is required' });

    const analysis = await engine.analyzeFullStack(code, framework || 'express');
    res.json({ success: true, analysis });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Serve Web UI for all unmatched routes (Express 5 compatible)
app.use((_req, res) => {
  res.sendFile(join(__dirname, '../webui/index.html'));
});

// ─── Start ───────────────────────────────────────────────────────────────────
httpServer.listen(PORT, () => {
  console.log(`\n🔥 OpenCompile Web Server running on http://localhost:${PORT}`);
  console.log(`📊 Web UI:      http://localhost:${PORT}`);
  console.log(`🚀 REST API:    http://localhost:${PORT}/api`);
  console.log(`⚡ WebSocket:   ws://localhost:${PORT}?jobId=<id>`);
  console.log(`🦙 Ollama:      ${process.env.OLLAMA_BASE_URL ? `✅ ${process.env.OLLAMA_BASE_URL}` : '⬜ not configured'}`);
  console.log(`\n💡 Ready to revolutionize backend development!\n`);
});
