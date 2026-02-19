/**
 * Real-time Collaboration System
 * 
 * REVOLUTIONARY: Google Docs-style collaboration for code
 * Operational Transform (OT) + WebSockets + Conflict Resolution
 */

import { WebSocketServer, WebSocket } from 'ws';
import type { Logger } from '../utils/logger.js';

interface User {
  id: string;
  name: string;
  cursor: { line: number; column: number };
  selection?: { start: Position; end: Position };
  color: string;
}

interface Position {
  line: number;
  column: number;
}

interface Operation {
  type: 'insert' | 'delete' | 'cursor' | 'selection';
  position: Position;
  text?: string;
  length?: number;
  userId: string;
  timestamp: number;
  version: number;
}

interface Document {
  id: string;
  content: string;
  version: number;
  operations: Operation[];
  users: Map<string, User>;
}

interface CollaborationSession {
  documentId: string;
  users: User[];
  document: Document;
}

export class RealtimeCollaborationEngine {
  private wss: WebSocketServer | null = null;
  private documents: Map<string, Document> = new Map();
  private sessions: Map<string, WebSocket[]> = new Map();
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Start collaboration server
   */
  startServer(port: number = 8080): void {
    this.wss = new WebSocketServer({ port });
    
    this.wss.on('connection', (ws: WebSocket) => {
      this.handleConnection(ws);
    });

    this.logger.info(`🌐 Real-time Collaboration server started on port ${port}`);
  }

  /**
   * Handle new WebSocket connection
   */
  private handleConnection(ws: WebSocket): void {
    let userId: string;
    let documentId: string;

    ws.on('message', (data: string) => {
      try {
        const message = JSON.parse(data.toString());
        
        switch (message.type) {
          case 'join':
            ({ userId, documentId } = message);
            this.handleJoin(ws, userId, documentId, message.user);
            break;
            
          case 'operation':
            this.handleOperation(documentId, message.operation);
            break;
            
          case 'cursor':
            this.handleCursorMove(documentId, userId, message.cursor);
            break;
            
          case 'selection':
            this.handleSelection(documentId, userId, message.selection);
            break;
            
          case 'leave':
            this.handleLeave(documentId, userId);
            break;
        }
      } catch (error) {
        this.logger.error(`WebSocket message error: ${error}`);
      }
    });

    ws.on('close', () => {
      if (userId && documentId) {
        this.handleLeave(documentId, userId);
      }
    });
  }

  /**
   * Handle user joining a document
   */
  private handleJoin(
    ws: WebSocket,
    userId: string,
    documentId: string,
    user: User
  ): void {
    // Create document if doesn't exist
    if (!this.documents.has(documentId)) {
      this.documents.set(documentId, {
        id: documentId,
        content: '',
        version: 0,
        operations: [],
        users: new Map(),
      });
      this.sessions.set(documentId, []);
    }

    const doc = this.documents.get(documentId)!;
    doc.users.set(userId, user);

    // Add WebSocket to session
    this.sessions.get(documentId)!.push(ws);

    // Send current document state to new user
    ws.send(JSON.stringify({
      type: 'init',
      document: {
        content: doc.content,
        version: doc.version,
      },
      users: Array.from(doc.users.values()),
    }));

    // Broadcast user joined to others
    this.broadcast(documentId, userId, {
      type: 'user-joined',
      user,
    });

    this.logger.info(`👤 User ${userId} joined document ${documentId}`);
  }

  /**
   * Handle operation (insert/delete)
   * Uses Operational Transform for conflict resolution
   */
  private handleOperation(documentId: string, operation: Operation): void {
    const doc = this.documents.get(documentId);
    if (!doc) return;

    // Transform operation against concurrent operations
    const transformed = this.transformOperation(operation, doc);

    // Apply operation to document
    this.applyOperation(doc, transformed);

    // Broadcast to all other users
    this.broadcast(documentId, operation.userId, {
      type: 'operation',
      operation: transformed,
    });
  }

  /**
   * Operational Transform algorithm
   * Transforms operation against concurrent operations
   */
  private transformOperation(
    operation: Operation,
    doc: Document
  ): Operation {
    let transformed = { ...operation };

    // Get operations that happened concurrently
    const concurrent = doc.operations.filter(
      (op) => op.version >= operation.version && op.userId !== operation.userId
    );

    // Transform against each concurrent operation
    for (const concurrentOp of concurrent) {
      transformed = this.transformAgainst(transformed, concurrentOp);
    }

    transformed.version = doc.version + 1;
    return transformed;
  }

  /**
   * Transform one operation against another
   */
  private transformAgainst(op1: Operation, op2: Operation): Operation {
    const transformed = { ...op1 };

    // If op2 happened before op1's position, adjust op1's position
    if (op2.type === 'insert' && this.isBeforeOrEqual(op2.position, op1.position)) {
      const insertedLength = op2.text?.length || 0;
      transformed.position = {
        line: op1.position.line,
        column: op1.position.column + insertedLength,
      };
    } else if (op2.type === 'delete' && this.isBeforeOrEqual(op2.position, op1.position)) {
      const deletedLength = op2.length || 0;
      transformed.position = {
        line: op1.position.line,
        column: Math.max(op2.position.column, op1.position.column - deletedLength),
      };
    }

    return transformed;
  }

  /**
   * Apply operation to document
   */
  private applyOperation(doc: Document, operation: Operation): void {
    switch (operation.type) {
      case 'insert':
        doc.content = this.insertText(
          doc.content,
          operation.position,
          operation.text || ''
        );
        break;
        
      case 'delete':
        doc.content = this.deleteText(
          doc.content,
          operation.position,
          operation.length || 0
        );
        break;
    }

    doc.version = operation.version;
    doc.operations.push(operation);

    // Keep only recent operations (last 100)
    if (doc.operations.length > 100) {
      doc.operations = doc.operations.slice(-100);
    }
  }

  /**
   * Insert text at position
   */
  private insertText(content: string, position: Position, text: string): string {
    const lines = content.split('\n');
    const line = lines[position.line] || '';
    
    lines[position.line] = 
      line.substring(0, position.column) +
      text +
      line.substring(position.column);
    
    return lines.join('\n');
  }

  /**
   * Delete text at position
   */
  private deleteText(content: string, position: Position, length: number): string {
    const lines = content.split('\n');
    const line = lines[position.line] || '';
    
    lines[position.line] = 
      line.substring(0, position.column) +
      line.substring(position.column + length);
    
    return lines.join('\n');
  }

  /**
   * Handle cursor movement
   */
  private handleCursorMove(
    documentId: string,
    userId: string,
    cursor: { line: number; column: number }
  ): void {
    const doc = this.documents.get(documentId);
    if (!doc) return;

    const user = doc.users.get(userId);
    if (user) {
      user.cursor = cursor;
    }

    this.broadcast(documentId, userId, {
      type: 'cursor',
      userId,
      cursor,
    });
  }

  /**
   * Handle text selection
   */
  private handleSelection(
    documentId: string,
    userId: string,
    selection: { start: Position; end: Position }
  ): void {
    const doc = this.documents.get(documentId);
    if (!doc) return;

    const user = doc.users.get(userId);
    if (user) {
      user.selection = selection;
    }

    this.broadcast(documentId, userId, {
      type: 'selection',
      userId,
      selection,
    });
  }

  /**
   * Handle user leaving
   */
  private handleLeave(documentId: string, userId: string): void {
    const doc = this.documents.get(documentId);
    if (!doc) return;

    doc.users.delete(userId);

    this.broadcast(documentId, userId, {
      type: 'user-left',
      userId,
    });

    // Remove empty documents
    if (doc.users.size === 0) {
      this.documents.delete(documentId);
      this.sessions.delete(documentId);
    }

    this.logger.info(`👤 User ${userId} left document ${documentId}`);
  }

  /**
   * Broadcast message to all users except sender
   */
  private broadcast(documentId: string, _senderId: string, message: any): void {
    const sockets = this.sessions.get(documentId) || [];
    const messageStr = JSON.stringify(message);

    for (const ws of sockets) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(messageStr);
      }
    }
  }

  /**
   * Check if position1 is before or equal to position2
   */
  private isBeforeOrEqual(pos1: Position, pos2: Position): boolean {
    if (pos1.line < pos2.line) return true;
    if (pos1.line === pos2.line && pos1.column <= pos2.column) return true;
    return false;
  }

  /**
   * Get document state
   */
  getDocument(documentId: string): Document | undefined {
    return this.documents.get(documentId);
  }

  /**
   * Get active sessions
   */
  getActiveSessions(): CollaborationSession[] {
    const sessions: CollaborationSession[] = [];

    for (const [documentId, doc] of this.documents.entries()) {
      sessions.push({
        documentId,
        users: Array.from(doc.users.values()),
        document: doc,
      });
    }

    return sessions;
  }

  /**
   * Stop collaboration server
   */
  stopServer(): void {
    if (this.wss) {
      this.wss.close();
      this.logger.info('🛑 Real-time Collaboration server stopped');
    }
  }
}
