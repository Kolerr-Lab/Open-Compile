# 🚀 OpenCompile - Setup & Testing Guide

## ✅ What We've Built

### 1. **Web UI Dashboard** (`webui/index.html`)
- Beautiful gradient UI with OpenCompile branding
- Project creation form with description, framework, and platform selection
- Real-time status updates
- Interactive roadmap showing completed and pending features
- REST API integration for project creation

### 2. **Web Server** (`src/server.ts`)
- Express.js REST API server
- Full AGI-Enhanced Engine integration
- Endpoints:
  - `GET /` - Web UI
  - `GET /health` - Health check
  - `POST /api/create` - Create project with AGI
  - `POST /api/detect` - Detect framework
  - `POST /api/analyze` - Analyze code

### 3. **Docker Configuration**
- **Dockerfile**: Multi-stage build with Node 22 Alpine
  - Build stage: Compiles TypeScript
  - Production stage: Runs optimized build
  - Non-root user for security
  - Health checks included
  - WebUI served from container

- **docker-compose.yml**: Complete orchestration
  - Environment variable configuration
  - Volume mounts for generated projects
  - Vector DB persistence
  - Network configuration
  - Auto-restart on failure

---

## 📋 Prerequisites

You need to install these tools first:

### 1. Install Node.js 22+
```powershell
# Download and install from: https://nodejs.org/
# Or use winget:
winget install OpenJS.NodeJS.LTS

# Verify installation
node --version  # Should show v22.x.x
npm --version   # Should show 10.x.x
```

### 2. Install pnpm
```powershell
npm install -g pnpm

# Verify
pnpm --version  # Should show 9.x.x
```

### 3. Install Docker Desktop (Optional - for Docker testing)
```powershell
# Download from: https://www.docker.com/products/docker-desktop/
# Or use winget:
winget install Docker.DockerDesktop
```

---

## 🔧 Setup Instructions

### Step 1: Install Dependencies
```powershell
cd "C:\Kolerr Lab_Projects\OpenCompile"
pnpm install
```

### Step 2: Configure Environment
```powershell
# Create .env file
Copy-Item .env.example .env

# Edit .env and add your real API keys:
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GOOGLE_API_KEY=AIza...
```

### Step 3: Build Project
```powershell
pnpm build
```

---

## 🧪 Testing

### Option 1: Test Web Server (Recommended)
```powershell
# Development mode (with hot reload)
pnpm dev:server

# Production mode
pnpm build
pnpm start:server
```

Then open your browser to: **http://localhost:3000**

You should see the beautiful OpenCompile Web UI!

### Option 2: Test CLI
```powershell
# Test project creation
pnpm opencompile create "Build a REST API for user management"

# Test framework detection
pnpm opencompile detect ./some-project

# Test with specific framework
pnpm opencompile create "AI chatbot backend" --framework fastapi
```

### Option 3: Test with Docker
```powershell
# Build Docker image
docker build -t opencompile:latest .

# Run with docker-compose
docker-compose up -d

# View logs
docker-compose logs -f

# Open browser to http://localhost:3000
```

### Option 4: Test via Code
```powershell
# Create a test file: test-agi.ts
```

```typescript
import { AGIEnhancedEngine } from './dist/core/agi-engine.js';

const engine = new AGIEnhancedEngine({
  verbose: true,
});

const result = await engine.createWithAGI(
  "Build a real-time chat application with WebSocket support",
  {
    framework: 'express',
    platform: 'aws',
    cicd: 'github',
  }
);

console.log('✅ Project created!', result);
```

```powershell
# Run it
tsx test-agi.ts
```

---

## 📊 What to Expect

### When Web Server Starts:
```
🔥 OpenCompile Web Server running on http://localhost:3000
📊 Web UI: http://localhost:3000
🚀 API: http://localhost:3000/api

💡 Ready to revolutionize backend development!
```

### When Creating a Project via Web UI:
1. Enter project description
2. Select framework (optional)
3. Select deployment platform
4. Click "Generate Project with Full AGI Power"
5. Watch AGI work its magic:
   - 🧠 Multi-model reasoning
   - 🧬 Code evolution
   - 🛡️ Security scanning
   - ⚡ Performance optimization
   - 🧪 Test generation
   - 📚 Documentation creation
   - 🚀 Deployment configs
   - ⚙️ CI/CD pipelines

---

## 🎯 Roadmap Completion Status

### ✅ Completed
1. **Core Intelligence Engine** - FrameworkDetector, DomainClassifier, ContextManager
2. **Multi-Agent Orchestration** - 6 specialized AI agents
3. **Framework Detection** - 20+ frameworks with AST analysis
4. **Domain Classification** - 10+ industry domains
5. **Self-Learning System** - Vector DB integration with Vectra
6. **Web UI Dashboard** - Beautiful gradient UI with full functionality
7. **CI/CD Integration** - GitHub Actions, GitLab CI, Jenkins generators
8. **Cloud Deployment Automation** - Docker, K8s, Terraform configs

### ⏳ In Progress / Future
1. **Framework Translation** - Convert between frameworks
2. **VS Code Extension** - Bring AGI into the IDE
3. **Real-time Collaboration** - Multi-user support

---

## 🐛 Troubleshooting

### Error: "Module not found"
```powershell
# Clean install
Remove-Item -Force -Recurse node_modules
pnpm install
pnpm build
```

### Error: "API key not found"
```powershell
# Make sure .env file exists with real keys
Get-Content .env
```

### Error: "Port 3000 already in use"
```powershell
# Find and kill process on port 3000
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force

# Or change port in server.ts
```

### Docker Error: "Cannot connect to Docker daemon"
```powershell
# Make sure Docker Desktop is running
# Or just test without Docker using Web Server
```

---

## 📸 Web UI Screenshots

The Web UI includes:
- 🎨 Beautiful gradient purple/blue design
- 🔥 OpenCompile branding with creator credits
- 📊 Dashboard cards showing AGI features
- 📝 Project creation form
- 🎯 Interactive roadmap
- ✅ Real-time status updates

---

## 🚀 Next Steps

After successful setup and testing:

1. **Test Project Creation**: Create a real backend project
2. **Explore AGI Features**: Try security scanning, performance optimization
3. **Deploy with Docker**: Package everything in a container
4. **Share Your Results**: Post on GitHub, Twitter, LinkedIn
5. **Contribute**: Help build Framework Translation and VS Code Extension

---

## 📞 Support

- **Issues**: https://github.com/Kolerr-Lab/Open-Compile/issues
- **Docs**: README.md, AGI_SUMMARY.md, QUICK_START.md
- **Creator**: Ricky Anh Nguyen - Kolerr Lab & OrchesityAI

---

**Status**: READY TO REVOLUTIONIZE BACKEND DEVELOPMENT! 🔥
