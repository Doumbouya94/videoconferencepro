import { EVENTS } from '../../constants/events.js';
import * as roomService from '../../rooms/roomService.js';
import { logger } from '../../utils/logger.js';

export function registerRoomHandlers(io, socket) {

  socket.on(EVENTS.JOIN_ROOM, ({ roomId, userId, userName }) => {
    logger.socket(EVENTS.JOIN_ROOM, { roomId, userName });

    const result = roomService.joinRoom(roomId, { socketId: socket.id, userId, userName });

    if (result.error === 'ROOM_LOCKED') {
      socket.emit(EVENTS.ROOM_LOCKED, { message: 'Room is locked by the host.' });
      return;
    }

    socket.join(roomId);
    socket.data.roomId   = roomId;
    socket.data.userId   = userId;
    socket.data.userName = userName;

    const participants = roomService.getParticipants(roomId);
    const room = result.room;

    // Send full participant list to the newcomer
    socket.emit(EVENTS.ROOM_PARTICIPANTS, {
      participants,
      hostId: room.hostId,
      locked: room.locked,
    });

    // Notify everyone else about the new joiner
    // BUG FIX: include both `name` AND `userName` so client code works
    // regardless of which field it reads
    socket.to(roomId).emit(EVENTS.USER_JOINED, {
      id:       userId,
      socketId: socket.id,
      name:     userName,      // ← used by ParticipantsPanel, VideoGrid
      userName: userName,      // ← used by some client listeners
      hostId:   room.hostId,
      audioEnabled: true,
      videoEnabled: true,
      handRaised:   false,
    });

    logger.success(`${userName} joined room ${roomId} (${participants.length} total)`);
  });

  socket.on('disconnect', () => {
    const result = roomService.leaveRoom(socket.id);
    if (!result) return;

    const { participant, roomId, room } = result;
    logger.info(`${participant?.name} left room ${roomId}`);

    // Reassign host if needed
    if (room && room.participants.size > 0 && room.hostId === socket.id) {
      const newHost = room.participants.values().next().value;
      if (newHost) {
        room.hostId = newHost.socketId;
        io.to(roomId).emit(EVENTS.HOST_CHANGED, { newHostId: newHost.socketId });
      }
    }

    socket.to(roomId).emit(EVENTS.USER_LEFT, {
      id:       participant?.id,
      socketId: socket.id,
      name:     participant?.name,
    });
  });
}
