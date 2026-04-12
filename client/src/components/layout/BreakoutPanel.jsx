import { useState }   from 'react';
import { useSocket }   from '../../context/SocketContext.jsx';
import { useRoom }     from '../../context/RoomContext.jsx';
import { useUI }       from '../../context/UIContext.jsx';
import { EVENTS }      from '../../utils/events.js';

export default function BreakoutPanel({ roomId }) {
  const { socket }                   = useSocket();
  const { hostId, participants, breakoutRooms, currentBreakout } = useRoom();
  const { breakoutOpen, setBreakoutOpen } = useUI();

  const [roomCount,   setRoomCount]   = useState(2);
  const [assignments, setAssignments] = useState({});  // breakoutId → [socketId]

  if (!breakoutOpen) return null;

  const iAmHost = socket?.id === hostId;

  // ── Host creates breakout rooms ───────────────────────────
  const createRooms = () => {
    const names = Array.from({ length: roomCount }, (_, i) => `Groupe ${i + 1}`);
    socket.emit(EVENTS.BREAKOUT_CREATE, { roomId, rooms: names, assignments });
  };

  // ── Assign participant to a breakout (host UI) ────────────
  const assign = (socketId, breakoutId) => {
    setAssignments(prev => {
      const next = { ...prev };
      // Remove from previous assignment
      Object.keys(next).forEach(bid => {
        next[bid] = (next[bid] || []).filter(s => s !== socketId);
      });
      next[breakoutId] = [...(next[breakoutId] || []), socketId];
      return next;
    });
  };

  // ── Join assigned breakout ────────────────────────────────
  const joinBreakout = (breakoutId) => {
    socket.emit(EVENTS.BREAKOUT_JOIN, { roomId, breakoutId });
  };

  // ── Leave breakout → back to main ────────────────────────
  const leaveBreakout = () => {
    if (!currentBreakout) return;
    socket.emit(EVENTS.BREAKOUT_LEAVE, { roomId, breakoutId: currentBreakout.id });
  };

  // ── End all breakouts (host) ──────────────────────────────
  const endAll = () => {
    socket.emit(EVENTS.BREAKOUT_END_ALL, { roomId });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700 bg-purple-900/40">
          <h2 className="text-white font-semibold">🧩 Salles de groupes</h2>
          <button onClick={() => setBreakoutOpen(false)} className="text-gray-400 hover:text-white text-xl">✕</button>
        </div>

        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">

          {/* If already in a breakout */}
          {currentBreakout && (
            <div className="bg-purple-800/30 border border-purple-600 rounded-xl p-4 text-center">
              <p className="text-white font-medium">📍 Vous êtes dans : <strong>{currentBreakout.name}</strong></p>
              <button
                onClick={leaveBreakout}
                className="mt-3 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm rounded-lg"
              >
                ← Retour à la salle principale
              </button>
            </div>
          )}

          {/* Active breakout rooms list */}
          {breakoutRooms.length > 0 && (
            <div className="space-y-2">
              <p className="text-gray-400 text-xs uppercase tracking-wider">Salles actives</p>
              {breakoutRooms.map(br => (
                <div key={br.id} className="flex items-center justify-between bg-gray-800 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-white text-sm font-medium">{br.name}</p>
                    <p className="text-gray-400 text-xs">{br.participants.length} participant(s)</p>
                  </div>
                  {!iAmHost && (
                    <button
                      onClick={() => joinBreakout(br.id)}
                      disabled={currentBreakout?.id === br.id}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs rounded-lg"
                    >
                      Rejoindre
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Host: create rooms */}
          {iAmHost && breakoutRooms.length === 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <label className="text-gray-300 text-sm whitespace-nowrap">Nombre de salles :</label>
                <input
                  type="number"
                  min={2}
                  max={10}
                  value={roomCount}
                  onChange={e => setRoomCount(+e.target.value)}
                  className="w-16 bg-gray-800 text-white text-sm text-center rounded-lg px-2 py-1 border border-gray-600 outline-none"
                />
              </div>

              {/* Assignment grid */}
              {participants.length > 0 && (
                <div>
                  <p className="text-gray-400 text-xs mb-2">Assigner manuellement (optionnel) :</p>
                  <div className="space-y-2">
                    {participants.map(p => (
                      <div key={p.socketId} className="flex items-center gap-2">
                        <span className="text-white text-xs w-24 truncate">{p.name}</span>
                        <select
                          onChange={e => assign(p.socketId, e.target.value)}
                          className="flex-1 bg-gray-800 text-white text-xs rounded-lg px-2 py-1 border border-gray-600 outline-none"
                        >
                          <option value="">— Non assigné —</option>
                          {Array.from({ length: roomCount }, (_, i) => (
                            <option key={i} value={`room-${i}`}>Groupe {i + 1}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={createRooms}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold rounded-xl"
              >
                🚀 Créer les salles de groupes
              </button>
            </div>
          )}

          {/* Host: end all */}
          {iAmHost && breakoutRooms.length > 0 && (
            <button
              onClick={endAll}
              className="w-full py-2.5 bg-red-700 hover:bg-red-600 text-white text-sm font-semibold rounded-xl"
            >
              ⏹ Terminer toutes les salles
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
