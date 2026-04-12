import { EVENTS } from '../../constants/events.js';
import * as roomService from '../../rooms/roomService.js';

export function registerReactionHandlers(io, socket) {

  // Emoji reaction (fire, clap, heart, etc.)
  socket.on(EVENTS.REACTION, ({ roomId, emoji, userName }) => {
    io.to(roomId).emit(EVENTS.REACTION_BROADCAST, {
      userId: socket.id,
      userName,
      emoji,
      timestamp: Date.now(),
    });
  });

  // Raise hand
  socket.on(EVENTS.RAISE_HAND, ({ roomId }) => {
    roomService.updateParticipantStatus(socket.id, { handRaised: true });
    io.to(roomId).emit(EVENTS.HAND_RAISED, { userId: socket.id });
  });

  // Lower hand
  socket.on(EVENTS.LOWER_HAND, ({ roomId }) => {
    roomService.updateParticipantStatus(socket.id, { handRaised: false });
    io.to(roomId).emit(EVENTS.HAND_LOWERED, { userId: socket.id });
  });
}
