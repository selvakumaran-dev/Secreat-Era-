/**
 * WebRTC configuration with STUN servers
 */
const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
    ]
};

/**
 * WebRTC Manager for P2P connections
 */
class WebRTCManager {
    constructor(onDataChannelMessage, onConnectionStateChange) {
        this.peerConnection = null;
        this.dataChannel = null;
        this.onDataChannelMessage = onDataChannelMessage;
        this.onConnectionStateChange = onConnectionStateChange;
    }

    /**
     * Initialize peer connection
     */
    initializePeerConnection() {
        this.peerConnection = new RTCPeerConnection(ICE_SERVERS);

        // Handle ICE candidates
        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate && this.onIceCandidate) {
                this.onIceCandidate(event.candidate);
            }
        };

        // Handle connection state changes
        this.peerConnection.onconnectionstatechange = () => {
            const state = this.peerConnection.connectionState;
            console.log('[WebRTC] Connection state:', state);

            if (this.onConnectionStateChange) {
                this.onConnectionStateChange(state);
            }
        };

        // Handle data channel from remote peer
        this.peerConnection.ondatachannel = (event) => {
            this.setupDataChannel(event.channel);
        };

        return this.peerConnection;
    }

    /**
     * Create data channel (sender side)
     */
    createDataChannel(label = 'fileTransfer') {
        if (!this.peerConnection) {
            this.initializePeerConnection();
        }

        this.dataChannel = this.peerConnection.createDataChannel(label, {
            ordered: true
        });

        this.setupDataChannel(this.dataChannel);
        return this.dataChannel;
    }

    /**
     * Setup data channel event handlers
     */
    setupDataChannel(channel) {
        this.dataChannel = channel;

        this.dataChannel.onopen = () => {
            console.log('[WebRTC] Data channel opened');
            if (this.onDataChannelOpen) {
                this.onDataChannelOpen();
            }
        };

        this.dataChannel.onclose = () => {
            console.log('[WebRTC] Data channel closed');
        };

        this.dataChannel.onerror = (error) => {
            console.error('[WebRTC] Data channel error:', error);
        };

        this.dataChannel.onmessage = (event) => {
            if (this.onDataChannelMessage) {
                this.onDataChannelMessage(event.data);
            }
        };
    }

    /**
     * Set data channel open handler
     */
    setOnDataChannelOpen(handler) {
        this.onDataChannelOpen = handler;
    }

    /**
     * Create and return an offer
     */
    async createOffer() {
        if (!this.peerConnection) {
            this.initializePeerConnection();
        }

        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);
        return offer;
    }

    /**
     * Create and return an answer
     */
    async createAnswer() {
        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);
        return answer;
    }

    /**
     * Set remote description
     */
    async setRemoteDescription(description) {
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(description));
    }

    /**
     * Add ICE candidate
     */
    async addIceCandidate(candidate) {
        try {
            await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
            console.error('[WebRTC] Error adding ICE candidate:', error);
        }
    }

    /**
     * Send data through data channel
     */
    send(data) {
        if (this.dataChannel && this.dataChannel.readyState === 'open') {
            this.dataChannel.send(data);
            return true;
        }
        return false;
    }

    /**
     * Set ICE candidate handler
     */
    setOnIceCandidate(handler) {
        this.onIceCandidate = handler;
    }

    /**
     * Close connection
     */
    close() {
        if (this.dataChannel) {
            this.dataChannel.close();
            this.dataChannel = null;
        }

        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }
    }

    /**
     * Get connection state
     */
    getConnectionState() {
        return this.peerConnection ? this.peerConnection.connectionState : 'closed';
    }

    /**
     * Get data channel state
     */
    getDataChannelState() {
        return this.dataChannel ? this.dataChannel.readyState : 'closed';
    }
}

export default WebRTCManager;
