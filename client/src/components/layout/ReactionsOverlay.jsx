import { useUI } from '../../context/UIContext.jsx';

export default function ReactionsOverlay() {
  const { reactions } = useUI();

  if (!reactions.length) return null;

  return (
    <div className="pointer-events-none fixed bottom-24 left-1/2 -translate-x-1/2 flex flex-col-reverse items-center gap-2 z-40">
      {reactions.map(r => (
        <div
          key={r.id}
          className="flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5 animate-bounce-in"
          style={{ animation: 'floatUp 3s ease-out forwards' }}
        >
          <span className="text-2xl">{r.emoji}</span>
          <span className="text-white text-xs font-medium">{r.userName}</span>
        </div>
      ))}
      <style>{`
        @keyframes floatUp {
          0%   { opacity: 1; transform: translateY(0)   scale(1); }
          80%  { opacity: 1; transform: translateY(-60px) scale(1.1); }
          100% { opacity: 0; transform: translateY(-80px) scale(0.9); }
        }
      `}</style>
    </div>
  );
}
