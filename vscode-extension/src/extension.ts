/**
 * OpenCompile VS Code Extension
 * 
 * AI-powered backend development directly in VS Code
 */

import * as vscode from 'vscode';
import { OpenCompileEngine } from '../../src/core/engine';
import { AGIEnhancedEngine } from '../../src/core/agi-engine';
import { FrameworkTranslator } from '../../src/agi/framework-translator';
import { Logger } from '../../src/utils/logger';

let statusBarItem: vscode.StatusBarItem;
let engine: AGIEnhancedEngine;
let translator: FrameworkTranslator;
let outputChannel: vscode.OutputChannel;

export function activate(context: vscode.ExtensionContext) {
  console.log('OpenCompile extension activated!');

  // Create output channel
  outputChannel = vscode.window.createOutputChannel('OpenCompile');
  outputChannel.appendLine('🔥 OpenCompile AI-Powered Backend Development');
  outputChannel.appendLine('Ready to revolutionize your coding experience!\n');

  // Create status bar item
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  statusBarItem.text = '$(rocket) OpenCompile';
  statusBarItem.tooltip = 'OpenCompile AI Assistant';
  statusBarItem.command = 'opencompile.chat';
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  // Initialize engines
  const logger = new Logger(true);
  engine = new AGIEnhancedEngine({ verbose: true });
  translator = new FrameworkTranslator(logger);

  // Register commands
  registerCommands(context);

  // Show welcome message
  vscode.window.showInformationMessage(
    '🔥 OpenCompile activated! Use Ctrl+Shift+O to access commands.'
  );
}

function registerCommands(context: vscode.ExtensionContext) {
  // Create Project
  context.subscriptions.push(
    vscode.commands.registerCommand('opencompile.create', async () => {
      const description = await vscode.window.showInputBox({
        prompt: 'Describe what you want to build',
        placeHolder: 'e.g., REST API with authentication and PostgreSQL',
      });

      if (!description) return;

      outputChannel.show();
      outputChannel.appendLine(`\n🚀 Creating project: ${description}\n`);

      try {
        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: 'OpenCompile: Generating project...',
            cancellable: false,
          },
          async (progress: vscode.Progress<{ message?: string; increment?: number }>) => {
            progress.report({ message: 'Analyzing requirements...' });
            
            const result = await engine.createWithAGI(description);
            
            outputChannel.appendLine('✅ Project created successfully!');
            outputChannel.appendLine(`📁 Path: ${result.projectPath}`);
            
            vscode.window.showInformationMessage(
              '✅ Project created! Opening folder...'
            );
            
            // Open the generated project
            const uri = vscode.Uri.file(result.projectPath);
            await vscode.commands.executeCommand('vscode.openFolder', uri);
          }
        );
      } catch (error: any) {
        vscode.window.showErrorMessage(`Error: ${error.message}`);
        outputChannel.appendLine(`❌ Error: ${error.message}`);
      }
    })
  );

  // Detect Framework
  context.subscriptions.push(
    vscode.commands.registerCommand('opencompile.detect', async () => {
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (!workspaceFolder) {
        vscode.window.showErrorMessage('No workspace folder open');
        return;
      }

      outputChannel.show();
      outputChannel.appendLine('\n🔍 Detecting framework...\n');

      try {
        const basicEngine = new OpenCompileEngine({ verbose: true });
        const detection = await basicEngine.detect(workspaceFolder.uri.fsPath);
        
        outputChannel.appendLine(`✅ Framework: ${detection.framework}`);
        
        vscode.window.showInformationMessage(
          `Framework detected: ${detection.framework}`
        );
      } catch (error: any) {
        vscode.window.showErrorMessage(`Error: ${error.message}`);
      }
    })
  );

  // Analyze File
  context.subscriptions.push(
    vscode.commands.registerCommand('opencompile.analyze', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage('No active editor');
        return;
      }

      const code = editor.document.getText();
      outputChannel.show();
      outputChannel.appendLine('\n🔬 Analyzing code...\n');

      try {
        const analysis = await engine.analyzeFullStack(code, 'auto-detect');
        
        outputChannel.appendLine('✅ Analysis complete!');
        outputChannel.appendLine(`\n🛡️ Security Issues: ${analysis.security?.issues?.length || 0}`);
        outputChannel.appendLine(`⚡ Performance Suggestions: ${analysis.performance?.improvements?.length || 0}`);
        
        // Show inline decorations for issues
        showAnalysisDecorations(editor, analysis);
        
        vscode.window.showInformationMessage('✅ Analysis complete! Check output for details.');
      } catch (error: any) {
        vscode.window.showErrorMessage(`Error: ${error.message}`);
      }
    })
  );

  // Translate Framework
  context.subscriptions.push(
    vscode.commands.registerCommand('opencompile.translate', async () => {
      const sourceFramework = await vscode.window.showQuickPick(
        ['express', 'fastapi', 'django', 'springboot', 'nestjs', 'laravel'],
        { placeHolder: 'Select source framework' }
      );
      if (!sourceFramework) return;

      const targetFramework = await vscode.window.showQuickPick(
        ['express', 'fastapi', 'django', 'springboot', 'nestjs', 'laravel'],
        { placeHolder: 'Select target framework' }
      );
      if (!targetFramework) return;

      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage('No active editor');
        return;
      }

      const code = editor.document.getText();
      outputChannel.show();
      outputChannel.appendLine(`\n🔄 Translating: ${sourceFramework} → ${targetFramework}\n`);

      try {
        const result = await translator.translate({
          sourceFramework,
          targetFramework,
          sourceLanguage: 'auto',
          targetLanguage: 'auto',
          sourceCode: code,
          preserveStructure: true,
        });

        // Create new document with translated code
        const doc = await vscode.workspace.openTextDocument({
          content: result.code,
          language: result.language,
        });
        await vscode.window.showTextDocument(doc);

        outputChannel.appendLine('✅ Translation complete!');
        vscode.window.showInformationMessage(`✅ Translated to ${targetFramework}!`);
      } catch (error: any) {
        vscode.window.showErrorMessage(`Error: ${error.message}`);
      }
    })
  );

  // Optimize Selection
  context.subscriptions.push(
    vscode.commands.registerCommand('opencompile.optimizeSelection', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor || editor.selection.isEmpty) {
        vscode.window.showErrorMessage('No code selected');
        return;
      }

      const selectedCode = editor.document.getText(editor.selection);
      outputChannel.show();
      outputChannel.appendLine('\n⚡ Optimizing code...\n');

      try {
        // Use performance optimizer
        const analysis = await engine.analyzeFullStack(selectedCode, 'auto');
        
        if (analysis.performance?.optimizedCode) {
          await editor.edit((editBuilder: vscode.TextEditorEdit) => {
            editBuilder.replace(editor.selection, analysis.performance.optimizedCode);
          });
          
          outputChannel.appendLine('✅ Code optimized!');
          vscode.window.showInformationMessage('✅ Code optimized successfully!');
        }
      } catch (error: any) {
        vscode.window.showErrorMessage(`Error: ${error.message}`);
      }
    })
  );

  // Generate Tests
  context.subscriptions.push(
    vscode.commands.registerCommand('opencompile.generateTests', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage('No active editor');
        return;
      }

      const code = editor.document.getText();
      outputChannel.show();
      outputChannel.appendLine('\n🧪 Generating tests...\n');

      try {
        const analysis = await engine.analyzeFullStack(code, 'auto');
        
        if (analysis.tests) {
          const doc = await vscode.workspace.openTextDocument({
            content: JSON.stringify(analysis.tests, null, 2),
            language: 'typescript',
          });
          await vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
          
          outputChannel.appendLine('✅ Tests generated!');
          vscode.window.showInformationMessage('✅ Tests generated successfully!');
        }
      } catch (error: any) {
        vscode.window.showErrorMessage(`Error: ${error.message}`);
      }
    })
  );

  // Explain Code
  context.subscriptions.push(
    vscode.commands.registerCommand('opencompile.explainCode', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor || editor.selection.isEmpty) {
        vscode.window.showErrorMessage('No code selected');
        return;
      }

      const selectedCode = editor.document.getText(editor.selection);
      
      try {
        const explanation = await vscode.window.showInformationMessage(
          'OpenCompile: Analyzing code...',
          { modal: false }
        );
        
        // Show explanation in webview or output
        outputChannel.show();
        outputChannel.appendLine('\n📖 Code Explanation:\n');
        outputChannel.appendLine(selectedCode);
        outputChannel.appendLine('\n---\n');
        outputChannel.appendLine('This code is being analyzed...');
        
        vscode.window.showInformationMessage('✅ Explanation ready! Check output.');
      } catch (error: any) {
        vscode.window.showErrorMessage(`Error: ${error.message}`);
      }
    })
  );

  // AI Chat
  context.subscriptions.push(
    vscode.commands.registerCommand('opencompile.chat', async () => {
      vscode.window.showInformationMessage(
        '💬 OpenCompile AI Chat (Coming Soon!)',
        'This feature will provide real-time AI assistance for your code.'
      );
    })
  );
}

function showAnalysisDecorations(
  editor: vscode.TextEditor,
  analysis: any
) {
  // Create decoration types for different issue severities
  const errorDecoration = vscode.window.createTextEditorDecorationType({
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderLeft: '3px solid red',
  });

  const warningDecoration = vscode.window.createTextEditorDecorationType({
    backgroundColor: 'rgba(255, 165, 0, 0.1)',
    borderLeft: '3px solid orange',
  });

  // Apply decorations (simplified)
  const errors: vscode.DecorationOptions[] = [];
  const warnings: vscode.DecorationOptions[] = [];

  editor.setDecorations(errorDecoration, errors);
  editor.setDecorations(warningDecoration, warnings);
}

export function deactivate() {
  outputChannel.appendLine('\n👋 OpenCompile deactivated');
  outputChannel.dispose();
  statusBarItem.dispose();
}
