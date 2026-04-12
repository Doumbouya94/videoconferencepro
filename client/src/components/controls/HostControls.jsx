import { useState }   from 'react';
import { useSocket }   from '../../context/SocketContext.jsx';
import { useRoom }     from '../../context/RoomContext.jsx';
import { useUI }       from '../../context/UIContext.jsx';
import { EVENTS }      from '../../utils/events.js';

export default function HostControls({ roomId }) {
  const { socket }              = useSocket();
  const { hostId, locked, participants } = useRoom();
  const { breakoutOpen, setBreakoutOpen } = useUI();
  const [showPanel, setShowPanel] = useState(false);

  if (socket?.id !== hostId) return null;

  const muteAll = () => socket.emit(EVENTS.MUTE_ALL, { roomId });
  const toggleLock = () => socket.emit(EVENTS.LOCK_ROOM, { roomId, locked: !locked });

  return (
    <div className="relative">
      <button
        onClick={() => setShowPanel(p => !p)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-semibold rounded-lg"
      >
        👑 Hôte
      </button>

      {showPanel && (
        <div className="absolute bottom-full mb-2 right-0 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-3 w-52 space-y-2 z-50">
          <p className="text-yellow-400 text-xs font-semibold mb-2">Contrôles hôte</p>

          <button onClick={muteAll}
            className="w-full flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded-lg">
            🔇 Couper tous les micros
          </button>

          <button onClick={toggleLock}
            className={`w-full flex items-center gap-2 px-3 py-2 text-xs rounded-lg ${
              locked
                ? 'bg-green-700 hover:bg-green-600 text-white'
                : 'bg-orange-700 hover:bg-orange-600 text-white'
            }`}>
            {locked ? '🔓 Déverrouiller' : '🔒 Verrouiller'} la salle
          </button>

          <button onClick={() => { setBreakoutOpen(true); setShowPanel(false); }}
            className="w-full flex items-center gap-2 px-3 py-2 bg-purple-700 hover:bg-purple-600 text-white text-xs rounded-lg">
            🧩 Salles de groupes
          </button>

          <button onClick={() => setShowPanel(false)}
            className="w-full text-gray-400 text-xs text-center hover:text-white">
            Fermer
          </button>
        </div>
      )}
    </div>
  );
}
