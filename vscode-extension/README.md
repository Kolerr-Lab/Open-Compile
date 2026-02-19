# OpenCompile VS Code Extension

AI-powered backend development directly in your editor.

## Features

- 🚀 **Create projects from natural language**
- 🔍 **Automatic framework detection**
- 🔬 **Real-time code analysis**
- 🔄 **Framework translation**
- ⚡ **Performance optimization**
- 🧪 **Auto-generate tests**
- 💬 **AI chat assistant**

## Installation

1. Build the extension:
   ```bash
   cd vscode-extension
   pnpm install
   pnpm run build
   ```

2. Package the extension:
   ```bash
   pnpm run package
   ```

3. Install in VS Code:
   - Open Extensions view (Ctrl+Shift+X)
   - Click "..." menu → Install from VSIX
   - Select the generated `.vsix` file

## Configuration

Set your API keys in VS Code settings:

```json
{
  "opencompile.apiKey.openai": "your-openai-key",
  "opencompile.model": "gpt-4o"
}
```

## Commands

- **Create Project**: `Ctrl+Shift+O C`
- **Analyze Code**: `Ctrl+Shift+O A`
- **AI Chat**: `Ctrl+Shift+O H`

## Requirements

- VS Code ^1.85.0
- Node.js 18+
- OpenCompile npm package

## License

MIT
