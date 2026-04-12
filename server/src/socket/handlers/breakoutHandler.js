import { EVENTS } from '../../constants/events.js';
import * as roomService from '../../rooms/roomService.js';
import { logger } from '../../utils/logger.js';

export function registerBreakoutHandlers(io, socket) {

  // Host creates breakout rooms
  socket.on(EVENTS.BREAKOUT_CREATE, ({ roomId, rooms: roomNames, assignments }) => {
    if (!roomService.isHost(roomId, socket.id)) return;

    const breakoutRooms = roomService.createBreakoutRooms(roomId, roomNames);
    logger.socket(EVENTS.BREAKOUT_CREATE, { roomId, count: breakoutRooms.length });

    // Auto-assign if provided
    if (assignments) {
      Object.entries(assignments).forEach(([breakoutId, socketIds]) => {
        socketIds.forEach(sid => {
          roomService.assignBreakout(roomId, sid, breakoutId);
        });
      });
    }

    const updatedRooms = roomService.getBreakoutRooms(roomId);
    io.to(roomId).emit(EVENTS.BREAKOUT_UPDATED, { breakoutRooms: updatedRooms });

    // Notify assigned participants
    if (assignments) {
      Object.entries(assignments).forEach(([breakoutId, socketIds]) => {
        const br = updatedRooms.find(r => r.id === breakoutId);
        socketIds.forEach(sid => {
          io.to(sid).emit(EVENTS.BREAKOUT_ASSIGNED, {
            breakoutId,
            breakoutName: br?.name,
          });
        });
      });
    }
  });

  // Participant joins their breakout room socket.io channel
  socket.on(EVENTS.BREAKOUT_JOIN, ({ roomId, breakoutId }) => {
    const channelId = `${roomId}:breakout:${breakoutId}`;
    socket.join(channelId);
    roomService.assignBreakout(roomId, socket.id, breakoutId);

    const rooms = roomService.getBreakoutRooms(roomId);
    io.to(roomId).emit(EVENTS.BREAKOUT_UPDATED, { breakoutRooms: rooms });

    logger.socket(EVENTS.BREAKOUT_JOIN, { breakoutId, socketId: socket.id });
  });

  // Return to main room
  socket.on(EVENTS.BREAKOUT_LEAVE, ({ roomId, breakoutId }) => {
    const channelId = `${roomId}:breakout:${breakoutId}`;
    socket.leave(channelId);

    const rooms = roomService.getBreakoutRooms(roomId);
    io.to(roomId).emit(EVENTS.BREAKOUT_UPDATED, { breakoutRooms: rooms });
  });

  // Host ends all breakouts
  socket.on(EVENTS.BREAKOUT_END_ALL, ({ roomId }) => {
    if (!roomService.isHost(roomId, socket.id)) return;
    roomService.endBreakouts(roomId);
    io.to(roomId).emit(EVENTS.BREAKOUT_UPDATED, { breakoutRooms: [] });
    io.to(roomId).emit(EVENTS.BREAKOUT_END_ALL, {});
    logger.socket(EVENTS.BREAKOUT_END_ALL, { roomId });
  });
}
