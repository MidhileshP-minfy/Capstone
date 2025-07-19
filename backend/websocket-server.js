import { WebSocketServer } from 'ws';
import * as Y from 'yjs';
import { setupWSConnection } from 'y-websocket/server';

const wss = new WebSocketServer({ port: 5003 });

console.log('WebSocket server running on ws://localhost:5003');

wss.on('connection', (ws, req) => {
  console.log('New WebSocket connection');
  setupWSConnection(ws, req);
});

wss.on('error', (error) => {
  console.error('WebSocket server error:', error);
});