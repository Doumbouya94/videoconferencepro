const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

/**
 * Creates a configured RTCPeerConnection.
 * @param {object}   opts
 * @param {string}   opts.targetId        - remote peer socket id
 * @param {object}   opts.socket          - socket.io instance
 * @param {string}   opts.roomId
 * @param {MediaStream|null} opts.stream  - local stream to add tracks
 * @param {function} opts.onTrack         - (stream, targetId) => void
 */
export function createPeerConnection({ targetId, socket, roomId, stream, onTrack }) {
  const pc = new RTCPeerConnection(ICE_SERVERS);

  // ── ICE candidates ───────────────────────────────────────
  pc.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit('ice-candidate', {
        candidate: event.candidate,
        targetUserId: targetId,
        roomId,
      });
    }
  };

  // ── Remote track ─────────────────────────────────────────
  pc.ontrack = (event) => {
    if (onTrack && event.streams[0]) {
      onTrack(event.streams[0], targetId);
    }
  };

  // ── Add local tracks ─────────────────────────────────────
  if (stream) {
    stream.getTracks().forEach(track => pc.addTrack(track, stream));
  }

  return pc;
}
