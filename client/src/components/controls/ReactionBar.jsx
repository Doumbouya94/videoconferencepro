import { useEffect, useState } from 'react';
import { useSocket }  from '../../context/SocketContext.jsx';
import { useUI }      from '../../context/UIContext.jsx';
import { EVENTS }     from '../../utils/events.js';

const EMOJIS = [
  { emoji: '👍', label: 'Super' },
  { emoji: '👏', label: 'Bravo' },
  { emoji: '😂', label: 'Haha' },
  { emoji: '❤️', label: 'Love' },
  { emoji: '🔥', label: 'Fire' },
  { emoji: '🎉', label: 'Fête' },
  { emoji: '😮', label: 'Wow' },
  { emoji: '🙏', label: 'Merci' },
];

export default function ReactionBar({ roomId, userName }) {
  const { socket }      = useSocket();
  const { addReaction } = useUI();
  const [open, setOpen] = useState(false);

  // Listen for reactions broadcast from server
  useEffect(() => {
    if (!socket) return;

    const handler = (reaction) => {
      console.log('[Reaction] received:', reaction);
      addReaction(reaction);
    };

    socket.on(EVENTS.REACTION_BROADCAST, handler);
    return () => socket.off(EVENTS.REACTION_BROADCAST, handler);
  }, [socket, addReaction]);

  // Send reaction + show it locally immediately (don't wait for echo)
  const send = (emoji) => {
    if (!socket) return;
    console.log('[Reaction] sending:', emoji, 'from', userName);
    socket.emit(EVENTS.REACTION, { roomId, emoji, userName });
    // Show immediately locally (server will also broadcast to others)
    addReaction({ userId: socket.id, userName, emoji, timestamp: Date.now() });
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
          open
            ? 'bg-yellow-600 text-white'
            : 'bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white'
        }`}
        title="Envoyer une réaction"
      >
        <span className="text-xl">😀</span>
        <span>Réaction</span>
      </button>

      {open && (
        <>
          {/* Backdrop to close */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute bottom-full mb-2 right-0 bg-gray-800 border border-gray-700 rounded-2xl p-3 shadow-2xl z-50">
            <p className="text-gray-500 text-[10px] uppercase tracking-wider mb-2 px-1">Réactions</p>
            <div className="grid grid-cols-4 gap-1">
              {EMOJIS.map(({ emoji, label }) => (
                <button
                  key={emoji}
                  onClick={() => send(emoji)}
                  className="flex flex-col items-center gap-0.5 p-2 rounded-xl hover:bg-gray-700 transition-all hover:scale-110"
                  title={label}
                >
                  <span className="text-2xl leading-none">{emoji}</span>
                  <span className="text-gray-500 text-[9px]">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
