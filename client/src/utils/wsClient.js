/**
 * WebSocket client for signaling server communication
 * Handles connection, reconnection, and message routing
 */
class WebSocketClient {
    constructor(url) {
        this.url = url;
        this.ws = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 2000;
        this.messageQueue = [];
        this.messageHandlers = new Map();
        this.connectionHandlers = [];
        this.disconnectionHandlers = [];
    }

    /**
     * Connect to WebSocket server
     */
    connect() {
        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(this.url);

                this.ws.onopen = () => {
                    console.log('[WebSocket] Connected to signaling server');
                    this.isConnected = true;
                    this.reconnectAttempts = 0;

                    // Send queued messages
                    this.flushMessageQueue();

                    // Notify connection handlers
                    this.connectionHandlers.forEach(handler => handler());

                    resolve();
                };

                this.ws.onmessage = (event) => {
                    try {
                        const message = JSON.parse(event.data);
                        this.handleMessage(message);
                    } catch (error) {
                        console.error('[WebSocket] Error parsing message:', error);
                    }
                };

                this.ws.onerror = (error) => {
                    console.error('[WebSocket] Error:', error);
                    reject(error);
                };

                this.ws.onclose = () => {
                    console.log('[WebSocket] Connection closed');
                    this.isConnected = false;

                    // Notify disconnection handlers
                    this.disconnectionHandlers.forEach(handler => handler());

                    // Attempt reconnection
                    this.attemptReconnect();
                };
            } catch (error) {
                console.error('[WebSocket] Connection error:', error);
                reject(error);
            }
        });
    }

    /**
     * Attempt to reconnect to the server
     */
    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`[WebSocket] Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

            setTimeout(() => {
                this.connect().catch(() => {
                    // Reconnection failed, will try again
                });
            }, this.reconnectDelay * this.reconnectAttempts);
        } else {
            console.error('[WebSocket] Max reconnection attempts reached');
        }
    }

    /**
     * Send a message to the server
     */
    send(message) {
        if (this.isConnected && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        } else {
            // Queue message for later
            this.messageQueue.push(message);
            console.log('[WebSocket] Message queued (not connected)');
        }
    }

    /**
     * Flush queued messages
     */
    flushMessageQueue() {
        while (this.messageQueue.length > 0) {
            const message = this.messageQueue.shift();
            this.send(message);
        }
    }

    /**
     * Handle incoming messages
     */
    handleMessage(message) {
        const { type } = message;

        // Call registered handlers for this message type
        const handlers = this.messageHandlers.get(type) || [];
        handlers.forEach(handler => handler(message));
    }

    /**
     * Register a message handler
     */
    on(messageType, handler) {
        if (!this.messageHandlers.has(messageType)) {
            this.messageHandlers.set(messageType, []);
        }
        this.messageHandlers.get(messageType).push(handler);

        // Return unsubscribe function
        return () => {
            const handlers = this.messageHandlers.get(messageType);
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        };
    }

    /**
     * Register connection handler
     */
    onConnect(handler) {
        this.connectionHandlers.push(handler);

        // Return unsubscribe function
        return () => {
            const index = this.connectionHandlers.indexOf(handler);
            if (index > -1) {
                this.connectionHandlers.splice(index, 1);
            }
        };
    }

    /**
     * Register disconnection handler
     */
    onDisconnect(handler) {
        this.disconnectionHandlers.push(handler);

        // Return unsubscribe function
        return () => {
            const index = this.disconnectionHandlers.indexOf(handler);
            if (index > -1) {
                this.disconnectionHandlers.splice(index, 1);
            }
        };
    }

    /**
     * Close the connection
     */
    close() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
            this.isConnected = false;
        }
    }
}

export default WebSocketClient;
