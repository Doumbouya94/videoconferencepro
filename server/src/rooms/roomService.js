import * as store from './roomStore.js';
import { generateId } from '../utils/uuid.js';

export function createRoom() {
  return store.createRoom();
}

export function getRoomInfo(roomId) {
  const room = store.getRoom(roomId);
  if (!room) return null;
  return {
    id: room.id,
    hostId: room.hostId,
    locked: room.locked,
    participantCount: room.participants.size,
    participants: store.getParticipantsList(roomId),
  };
}

export function joinRoom(roomId, { socketId, userId, userName }) {
  const room = store.getRoom(roomId);
  if (!room) {
    // Auto-create if not found
    store.createRoom(); // won't use this; re-create with specific id
    // Actually: create with given id
    const rooms = store.rooms;
    rooms.set(roomId, {
      id: roomId,
      hostId: null,
      locked: false,
      createdAt: new Date().toISOString(),
      participants: new Map(),
      breakoutRooms: new Map(),
    });
  }

  const finalRoom = store.getRoom(roomId);
  if (finalRoom.locked) return { error: 'ROOM_LOCKED' };

  const participant = store.addParticipant(roomId, { id: userId, socketId, name: userName });

  // First participant becomes host
  if (finalRoom.participants.size === 1) {
    finalRoom.hostId = socketId;
  }

  return { participant, room: finalRoom };
}

export function leaveRoom(socketId) {
  return store.removeParticipant(socketId);
}

export function isHost(roomId, socketId) {
  const room = store.getRoom(roomId);
  return room?.hostId === socketId;
}

export function setHost(roomId, newHostSocketId) {
  const room = store.getRoom(roomId);
  if (!room) return false;
  room.hostId = newHostSocketId;
  return true;
}

export function lockRoom(roomId, locked) {
  const room = store.getRoom(roomId);
  if (!room) return false;
  room.locked = locked;
  return true;
}

export function getParticipants(roomId) {
  return store.getParticipantsList(roomId);
}

export function updateParticipantStatus(socketId, updates) {
  return store.updateParticipant(socketId, updates);
}

// Breakout
export function createBreakoutRooms(roomId, names) {
  return names.map(name => store.createBreakoutRoom(roomId, name));
}

export function getBreakoutRooms(roomId) {
  return store.getBreakoutRooms(roomId);
}

export function assignBreakout(roomId, socketId, breakoutId) {
  return store.assignToBreakout(roomId, socketId, breakoutId);
}

export function endBreakouts(roomId) {
  store.deleteBreakoutRooms(roomId);
}
