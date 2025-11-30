/**
 * WebSocket message handler for P2P signaling
 * Handles WebRTC offer/answer/ICE candidate exchange and room management
 */
class WebSocketHandler {
    constructor(wss, roomManager) {
        this.wss = wss;
        this.roomManager = roomManager;
    }

    /**
     * Handle new WebSocket connection
     */
    handleConnection(ws, req) {
        const socketId = this.generateSocketId();
        ws.id = socketId;

        console.log(`[WebSocket] New connection: ${socketId}`);

        // Send connection confirmation
        this.sendMessage(ws, {
            type: 'connected',
            socketId
        });

        // Handle incoming messages
        ws.on('message', (data) => {
            try {
                const message = JSON.parse(data.toString());
                this.handleMessage(ws, message);
            } catch (error) {
                console.error('[WebSocket] Error parsing message:', error);
                this.sendError(ws, 'Invalid message format');
            }
        });

        // Handle disconnection
        ws.on('close', () => {
            console.log(`[WebSocket] Connection closed: ${socketId}`);
            this.roomManager.handleDisconnect(socketId);
        });

        // Handle errors
        ws.on('error', (error) => {
            console.error(`[WebSocket] Error on ${socketId}:`, error);
        });
    }

    /**
     * Route incoming messages based on type
     */
    handleMessage(ws, message) {
        const { type, roomId } = message;

        console.log(`[WebSocket] Message from ${ws.id}: ${type}`);

        switch (type) {
            case 'create-room':
                this.handleCreateRoom(ws);
                break;

            case 'join-room':
                this.handleJoinRoom(ws, message);
                break;

            case 'offer':
            case 'answer':
            case 'ice-candidate':
                this.handleSignaling(ws, message);
                break;

            case 'file-ready':
            case 'accept-transfer':
            case 'transfer-complete':
            case 'transfer-failed':
                this.handleFileMessage(ws, message);
                break;

            default:
                console.warn(`[WebSocket] Unknown message type: ${type}`);
                this.sendError(ws, `Unknown message type: ${type}`);
        }
    }

    /**
     * Handle room creation
     */
    handleCreateRoom(ws) {
        const roomId = this.roomManager.createRoom();
        const result = this.roomManager.joinRoom(roomId, ws.id);

        if (result.success) {
            this.sendMessage(ws, {
                type: 'room-created',
                roomId,
                socketId: ws.id
            });
        } else {
            this.sendError(ws, result.error);
        }
    }

    /**
     * Handle joining a room
     */
    handleJoinRoom(ws, message) {
        const { roomId } = message;

        if (!roomId) {
            this.sendError(ws, 'Room ID is required');
            return;
        }

        const result = this.roomManager.joinRoom(roomId, ws.id);

        if (result.success) {
            // Notify the user they joined successfully
            this.sendMessage(ws, {
                type: 'room-joined',
                roomId,
                socketId: ws.id,
                userCount: result.userCount
            });

            // Notify other users in the room
            this.broadcastToRoom(roomId, ws.id, {
                type: 'user-joined',
                socketId: ws.id,
                userCount: result.userCount
            });
        } else {
            this.sendError(ws, result.error);
        }
    }

    /**
     * Handle WebRTC signaling messages (offer, answer, ICE candidates)
     */
    handleSignaling(ws, message) {
        const { roomId, type } = message;

        if (!roomId) {
            this.sendError(ws, 'Room ID is required');
            return;
        }

        // Update room activity
        this.roomManager.updateActivity(roomId);

        // Forward signaling message to other users in the room
        this.broadcastToRoom(roomId, ws.id, message);
    }

    /**
     * Handle file transfer messages
     */
    handleFileMessage(ws, message) {
        const { roomId, type } = message;

        if (!roomId) {
            this.sendError(ws, 'Room ID is required');
            return;
        }

        // Update room activity
        this.roomManager.updateActivity(roomId);

        // Forward message to other users in the room
        this.broadcastToRoom(roomId, ws.id, message);
    }

    /**
     * Broadcast a message to all users in a room (excluding sender)
     */
    broadcastToRoom(roomId, senderSocketId, message) {
        const users = this.roomManager.getRoomUsers(roomId, senderSocketId);

        users.forEach(socketId => {
            const client = this.findClientBySocketId(socketId);
            if (client && client.readyState === 1) { // WebSocket.OPEN = 1
                this.sendMessage(client, message);
            }
        });
    }

    /**
     * Send a message to a specific WebSocket client
     */
    sendMessage(ws, message) {
        if (ws.readyState === 1) { // WebSocket.OPEN = 1
            ws.send(JSON.stringify(message));
        }
    }

    /**
     * Send an error message
     */
    sendError(ws, error) {
        this.sendMessage(ws, {
            type: 'error',
            error
        });
    }

    /**
     * Find a WebSocket client by socket ID
     */
    findClientBySocketId(socketId) {
        for (const client of this.wss.clients) {
            if (client.id === socketId) {
                return client;
            }
        }
        return null;
    }

    /**
     * Generate a unique socket ID
     */
    generateSocketId() {
        return `socket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

export default WebSocketHandler;
