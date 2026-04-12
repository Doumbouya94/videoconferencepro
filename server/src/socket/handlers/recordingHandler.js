import { EVENTS } from '../../constants/events.js';

// Recording is done client-side via MediaRecorder API.
// This handler just notifies other participants that recording started/stopped.
export function registerRecordingHandlers(io, socket) {

  socket.on(EVENTS.RECORDING_START, ({ roomId }) => {
    socket.to(roomId).emit(EVENTS.RECORDING_START, {
      userId: socket.id,
      message: 'Recording has started.',
    });
  });

  socket.on(EVENTS.RECORDING_STOP, ({ roomId }) => {
    socket.to(roomId).emit(EVENTS.RECORDING_STOP, {
      userId: socket.id,
      message: 'Recording has stopped.',
    });
  });
}
