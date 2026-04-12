import { useEffect, useCallback } from 'react';
import { useSocket } from '../context/SocketContext.jsx';
import { useRoom }   from '../context/RoomContext.jsx';
import { useMedia }  from '../context/MediaContext.jsx';
import { useUI }     from '../context/UIContext.jsx';
import { EVENTS }    from '../utils/events.js';

export function useWebRTC(roomId, userName) {
  const { socket } = useSocket();
  const {
    setHostId, setLocked, setParticipants,
    addParticipant, removeParticipant, updateParticipant,
    setBreakoutRooms, setCurrentBreakout,
  } = useRoom();
  const { setActiveSpeakerId } = useUI();
  const { getMedia }           = useMedia();

  // ── Join room ─────────────────────────────────────────────
  const joinRoom = useCallback(async () => {
    const stream = await getMedia();
    socket.emit(EVENTS.JOIN_ROOM, { roomId, userId: socket.id, userName });
    return stream;
  }, [socket, roomId, userName, getMedia]);

  // ── Socket listeners ──────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    // Initial list — le serveur inclut tout le monde,
    // on filtre l'utilisateur local pour ne pas le compter 2x
    socket.on(EVENTS.ROOM_PARTICIPANTS, ({ participants, hostId, locked }) => {
      const others = participants.filter(p => p.socketId !== socket.id);
      setParticipants(others);
      setHostId(hostId);
      setLocked(locked);
    });

    // Quelqu'un d'autre rejoint
    socket.on(EVENTS.USER_JOINED, (user) => {
      if (user.socketId === socket.id) return; // ignorer si c'est nous
      addParticipant({ ...user, socketId: user.socketId });
      if (user.hostId) setHostId(user.hostId);
    });

    socket.on(EVENTS.HOST_CHANGED, ({ newHostId }) => setHostId(newHostId));
    socket.on(EVENTS.ROOM_LOCKED,  ({ locked })    => setLocked(locked));

    socket.on(EVENTS.VIDEO_TOGGLED, ({ userId, enabled }) =>
      updateParticipant(userId, { videoEnabled: enabled }));
    socket.on(EVENTS.AUDIO_TOGGLED, ({ userId, enabled }) =>
      updateParticipant(userId, { audioEnabled: enabled }));

    // Active speaker
    const speakerMap = new Map();
    socket.on(EVENTS.AUDIO_LEVEL, ({ userId, level }) => {
      speakerMap.set(userId, level);
      let maxId = null, maxLevel = 8;
      speakerMap.forEach((l, id) => { if (l > maxLevel) { maxLevel = l; maxId = id; } });
      setActiveSpeakerId(maxId);
    });

    socket.on(EVENTS.HAND_RAISED,  ({ userId }) => updateParticipant(userId, { handRaised: true }));
    socket.on(EVENTS.HAND_LOWERED, ({ userId }) => updateParticipant(userId, { handRaised: false }));

    socket.on(EVENTS.BREAKOUT_UPDATED,  ({ breakoutRooms }) => setBreakoutRooms(breakoutRooms));
    socket.on(EVENTS.BREAKOUT_ASSIGNED, ({ breakoutId, breakoutName }) =>
      setCurrentBreakout({ id: breakoutId, name: breakoutName }));
    socket.on(EVENTS.BREAKOUT_END_ALL, () => setCurrentBreakout(null));

    return () => {
      socket.off(EVENTS.ROOM_PARTICIPANTS);
      socket.off(EVENTS.USER_JOINED);
      socket.off(EVENTS.HOST_CHANGED);
      socket.off(EVENTS.ROOM_LOCKED);
      socket.off(EVENTS.VIDEO_TOGGLED);
      socket.off(EVENTS.AUDIO_TOGGLED);
      socket.off(EVENTS.AUDIO_LEVEL);
      socket.off(EVENTS.HAND_RAISED);
      socket.off(EVENTS.HAND_LOWERED);
      socket.off(EVENTS.BREAKOUT_UPDATED);
      socket.off(EVENTS.BREAKOUT_ASSIGNED);
      socket.off(EVENTS.BREAKOUT_END_ALL);
    };
  }, [socket, setHostId, setLocked, setParticipants, addParticipant,
      updateParticipant, setBreakoutRooms, setCurrentBreakout, setActiveSpeakerId]);

  return { joinRoom };
}
