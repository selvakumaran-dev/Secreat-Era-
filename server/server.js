import express from 'express';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import dotenv from 'dotenv';
import RoomManager from './rooms/roomManager.js';
import WebSocketHandler from './ws/wsHandler.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:5173', 'http://localhost:5174'];

// Middleware
app.use(cors({
    origin: CORS_ORIGIN,
    credentials: true
}));
app.use(express.json());

// Health check endpoint (required for Railway)
app.get('/health', (req, res) => {
    const stats = roomManager.getStats();
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        stats
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        name: 'Secure Era Signaling Server',
        version: '1.0.0',
        description: 'WebSocket signaling server for P2P file sharing',
        endpoints: {
            health: '/health',
            websocket: 'ws://' + req.get('host')
        }
    });
});

// Start HTTP server
const server = app.listen(PORT, () => {
    console.log(`[Server] HTTP server listening on port ${PORT}`);
    console.log(`[Server] CORS origin: ${CORS_ORIGIN}`);
});

// Initialize WebSocket server
const wss = new WebSocketServer({ server });
console.log('[Server] WebSocket server initialized');

// Initialize room manager
const roomManager = new RoomManager();
console.log('[Server] Room manager initialized');

// Initialize WebSocket handler
const wsHandler = new WebSocketHandler(wss, roomManager);

// Handle WebSocket connections
wss.on('connection', (ws, req) => {
    wsHandler.handleConnection(ws, req);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('[Server] SIGTERM received, shutting down gracefully...');

    // Close WebSocket server
    wss.close(() => {
        console.log('[Server] WebSocket server closed');
    });

    // Close HTTP server
    server.close(() => {
        console.log('[Server] HTTP server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('[Server] SIGINT received, shutting down gracefully...');

    wss.close(() => {
        console.log('[Server] WebSocket server closed');
    });

    server.close(() => {
        console.log('[Server] HTTP server closed');
        process.exit(0);
    });
});

console.log('[Server] Secure Era signaling server started successfully');
