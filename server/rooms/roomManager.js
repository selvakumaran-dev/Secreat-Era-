import { v4 as uuidv4 } from 'uuid';

/**
 * RoomManager handles in-memory room management for P2P connections
 * Each room can have max 2 users (sender and receiver)
 */
class RoomManager {
  constructor() {
    // Map of roomId -> { users: Set<socketId>, createdAt: timestamp, lastActivity: timestamp }
    this.rooms = new Map();

    // Map of socketId -> roomId for quick lookup
    this.userRooms = new Map();

    // Configuration
    this.ROOM_TIMEOUT_MS = parseInt(process.env.ROOM_TIMEOUT_MS) || 7200000; // 2 hours
    this.MAX_USERS_PER_ROOM = parseInt(process.env.MAX_USERS_PER_ROOM) || 2;

    // Start cleanup interval (every 5 minutes)
    this.startCleanupInterval();
  }

  /**
   * Generate a unique 6-character room ID
   */
  generateRoomId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let roomId;

    do {
      roomId = '';
      for (let i = 0; i < 6; i++) {
        roomId += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    } while (this.rooms.has(roomId)); // Ensure uniqueness

    return roomId;
  }

  /**
   * Create a new room
   */
  createRoom() {
    const roomId = this.generateRoomId();
    const now = Date.now();

    this.rooms.set(roomId, {
      users: new Set(),
      createdAt: now,
      lastActivity: now
    });

    console.log(`[RoomManager] Created room: ${roomId}`);
    return roomId;
  }

  /**
   * Add a user to a room
   */
  joinRoom(roomId, socketId) {
    // Check if room exists
    if (!this.rooms.has(roomId)) {
      return { success: false, error: 'Room does not exist' };
    }

    const room = this.rooms.get(roomId);

    // Check if room is full
    if (room.users.size >= this.MAX_USERS_PER_ROOM) {
      return { success: false, error: 'Room is full' };
    }

    // Check if user is already in another room
    if (this.userRooms.has(socketId)) {
      const oldRoomId = this.userRooms.get(socketId);
      this.leaveRoom(oldRoomId, socketId);
    }

    // Add user to room
    room.users.add(socketId);
    room.lastActivity = Date.now();
    this.userRooms.set(socketId, roomId);

    console.log(`[RoomManager] User ${socketId} joined room ${roomId} (${room.users.size}/${this.MAX_USERS_PER_ROOM})`);

    return {
      success: true,
      roomId,
      userCount: room.users.size,
      isFull: room.users.size >= this.MAX_USERS_PER_ROOM
    };
  }

  /**
   * Remove a user from a room
   */
  leaveRoom(roomId, socketId) {
    if (!this.rooms.has(roomId)) {
      return;
    }

    const room = this.rooms.get(roomId);
    room.users.delete(socketId);
    this.userRooms.delete(socketId);

    console.log(`[RoomManager] User ${socketId} left room ${roomId}`);

    // Delete room if empty
    if (room.users.size === 0) {
      this.rooms.delete(roomId);
      console.log(`[RoomManager] Deleted empty room ${roomId}`);
    }
  }

  /**
   * Handle user disconnection
   */
  handleDisconnect(socketId) {
    const roomId = this.userRooms.get(socketId);
    if (roomId) {
      this.leaveRoom(roomId, socketId);
    }
  }

  /**
   * Get all users in a room (excluding the sender)
   */
  getRoomUsers(roomId, excludeSocketId = null) {
    if (!this.rooms.has(roomId)) {
      return [];
    }

    const room = this.rooms.get(roomId);
    const users = Array.from(room.users);

    if (excludeSocketId) {
      return users.filter(id => id !== excludeSocketId);
    }

    return users;
  }

  /**
   * Update room activity timestamp
   */
  updateActivity(roomId) {
    if (this.rooms.has(roomId)) {
      this.rooms.get(roomId).lastActivity = Date.now();
    }
  }

  /**
   * Clean up expired rooms
   */
  cleanupExpiredRooms() {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [roomId, room] of this.rooms.entries()) {
      if (now - room.lastActivity > this.ROOM_TIMEOUT_MS) {
        // Remove all users from the room
        for (const socketId of room.users) {
          this.userRooms.delete(socketId);
        }

        this.rooms.delete(roomId);
        cleanedCount++;
        console.log(`[RoomManager] Cleaned up expired room ${roomId}`);
      }
    }

    if (cleanedCount > 0) {
      console.log(`[RoomManager] Cleaned up ${cleanedCount} expired room(s)`);
    }
  }

  /**
   * Start periodic cleanup
   */
  startCleanupInterval() {
    setInterval(() => {
      this.cleanupExpiredRooms();
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  /**
   * Get room statistics
   */
  getStats() {
    return {
      totalRooms: this.rooms.size,
      totalUsers: this.userRooms.size,
      rooms: Array.from(this.rooms.entries()).map(([roomId, room]) => ({
        roomId,
        userCount: room.users.size,
        age: Date.now() - room.createdAt,
        lastActivity: Date.now() - room.lastActivity
      }))
    };
  }
}

export default RoomManager;
