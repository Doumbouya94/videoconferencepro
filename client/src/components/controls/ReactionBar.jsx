import { useEffect, useState } from 'react';
import { useSocket } from '../../context/SocketContext.jsx';
import { useUI }     from '../../context/UIContext.jsx';
import { EVENTS }    from '../../utils/events.js';

const EMOJIS = ['👏', '😂', '❤️', '🔥', '👍', '🎉', '😮', '🙏'];

export default function ReactionBar({ roomId, userName }) {
  const { socket }   = useSocket();
  const { addReaction } = useUI();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!socket) return;
    const handler = (reaction) => addReaction(reaction);
    socket.on(EVENTS.REACTION_BROADCAST, handler);
    return () => socket.off(EVENTS.REACTION_BROADCAST, handler);
  }, [socket, addReaction]);

  const send = (emoji) => {
    socket?.emit(EVENTS.REACTION, { roomId, emoji, userName });
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl text-xs font-medium bg-gray-800 hover:bg-gray-700 text-gray-300"
      >
        <span className="text-xl">😀</span>
        <span>Réaction</span>
      </button>

      {open && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 border border-gray-700 rounded-2xl p-2 flex gap-1 shadow-2xl z-50">
          {EMOJIS.map(e => (
            <button
              key={e}
              onClick={() => send(e)}
              className="text-2xl hover:scale-125 transition-transform p-1"
            >
              {e}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
