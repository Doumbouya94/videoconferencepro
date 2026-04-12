import { EVENTS } from '../../constants/events.js';
import { logger } from '../../utils/logger.js';

export function registerMediaHandlers(io, socket) {

  // Forward offer to target
  socket.on(EVENTS.OFFER, ({ offer, targetUserId, roomId }) => {
    logger.socket(EVENTS.OFFER, { from: socket.id, to: targetUserId });
    socket.to(roomId).emit(EVENTS.OFFER, {
      offer,
      fromUserId: socket.id,
      targetUserId,
    });
  });

  // Forward answer to target
  socket.on(EVENTS.ANSWER, ({ answer, targetUserId, roomId }) => {
    logger.socket(EVENTS.ANSWER, { from: socket.id, to: targetUserId });
    socket.to(roomId).emit(EVENTS.ANSWER, {
      answer,
      fromUserId: socket.id,
      targetUserId,
    });
  });

  // Forward ICE candidate
  socket.on(EVENTS.ICE, ({ candidate, targetUserId, roomId }) => {
    socket.to(roomId).emit(EVENTS.ICE, {
      candidate,
      fromUserId: socket.id,
      targetUserId,
    });
  });

  // Screen share
  socket.on(EVENTS.SCREEN_START, ({ roomId }) => {
    logger.socket(EVENTS.SCREEN_START, socket.id);
    socket.to(roomId).emit(EVENTS.SCREEN_START, { userId: socket.id });
  });

  socket.on(EVENTS.SCREEN_STOP, ({ roomId }) => {
    socket.to(roomId).emit(EVENTS.SCREEN_STOP, { userId: socket.id });
  });

  // Toggle video / audio
  socket.on(EVENTS.TOGGLE_VIDEO, ({ roomId, userId, enabled }) => {
    socket.to(roomId).emit(EVENTS.VIDEO_TOGGLED, { userId, enabled });
  });

  socket.on(EVENTS.TOGGLE_AUDIO, ({ roomId, userId, enabled }) => {
    socket.to(roomId).emit(EVENTS.AUDIO_TOGGLED, { userId, enabled });
  });

  // Active speaker: client emits audio level, server rebroadcasts
  socket.on(EVENTS.AUDIO_LEVEL, ({ roomId, level }) => {
    socket.to(roomId).emit(EVENTS.AUDIO_LEVEL, {
      userId: socket.id,
      level,
    });
  });
}
