import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../context/SocketContext.jsx';
import { useUI }     from '../../context/UIContext.jsx';
import { EVENTS }    from '../../utils/events.js';

export default function ChatSidebar({ roomId, userName, userId }) {
  const { socket }        = useSocket();
  const { chatOpen, setChatOpen } = useUI();
  const [messages, setMessages]   = useState([]);
  const [input,    setInput]       = useState('');
  const [unread,   setUnread]      = useState(0);
  const endRef = useRef(null);

  useEffect(() => {
    if (!socket) return;
    const handler = (msg) => {
      setMessages(prev => [...prev, msg]);
      if (!chatOpen) setUnread(n => n + 1);
    };
    socket.on(EVENTS.CHAT, handler);
    return () => socket.off(EVENTS.CHAT, handler);
  }, [socket, chatOpen]);

  useEffect(() => {
    if (chatOpen) setUnread(0);
  }, [chatOpen]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    socket.emit(EVENTS.CHAT, { roomId, message: input, userId, userName });
    setInput('');
  };

  return (
    <>
      {/* Unread badge on closed state */}
      {!chatOpen && unread > 0 && (
        <div className="absolute top-1 right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
          {unread > 9 ? '9+' : unread}
        </div>
      )}

      {/* Sidebar */}
      <div className={`flex flex-col h-full bg-gray-900 border-l border-gray-700 transition-all duration-200 ${chatOpen ? 'w-72' : 'w-0 overflow-hidden'}`}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
          <h3 className="text-white font-semibold text-sm">💬 Discussion</h3>
          <button onClick={() => setChatOpen(false)} className="text-gray-400 hover:text-white text-lg leading-none">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2 text-sm">
          {messages.map(msg => (
            <div key={msg.id} className={`flex flex-col ${msg.socketId === socket?.id ? 'items-end' : 'items-start'}`}>
              <span className="text-gray-400 text-xs mb-0.5">{msg.userName}</span>
              <div className={`px-3 py-1.5 rounded-2xl max-w-[85%] break-words ${
                msg.socketId === socket?.id
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : 'bg-gray-700 text-gray-100 rounded-bl-sm'
              }`}>
                {msg.message}
              </div>
              <span className="text-gray-500 text-[10px] mt-0.5">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        <div className="p-3 border-t border-gray-700 flex gap-2">
          <input
            className="flex-1 bg-gray-800 text-white text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
          />
          <button
            onClick={send}
            className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg text-sm"
          >➤</button>
        </div>
      </div>
    </>
  );
}
