import { useEffect, useRef, useState } from 'react';
import WebSocketClient from '../utils/wsClient';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'ws://localhost:3000';

/**
 * Custom hook for WebSocket connection
 */
function useWebSocket() {
    const wsRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Create WebSocket client
        const ws = new WebSocketClient(BACKEND_URL);
        wsRef.current = ws;

        // Connect to server
        ws.connect()
            .then(() => {
                setIsConnected(true);
                setError(null);
            })
            .catch((err) => {
                setError(err.message);
                setIsConnected(false);
            });

        // Handle connection events
        const unsubConnect = ws.onConnect(() => {
            setIsConnected(true);
            setError(null);
        });

        const unsubDisconnect = ws.onDisconnect(() => {
            setIsConnected(false);
        });

        // Cleanup on unmount
        return () => {
            unsubConnect();
            unsubDisconnect();
            ws.close();
        };
    }, []);

    /**
     * Send a message through WebSocket
     */
    const send = (message) => {
        if (wsRef.current) {
            wsRef.current.send(message);
        }
    };

    /**
     * Subscribe to a message type
     */
    const on = (messageType, handler) => {
        if (wsRef.current) {
            return wsRef.current.on(messageType, handler);
        }
        return () => { };
    };

    return {
        isConnected,
        error,
        send,
        on,
        ws: wsRef.current
    };
}

export default useWebSocket;
