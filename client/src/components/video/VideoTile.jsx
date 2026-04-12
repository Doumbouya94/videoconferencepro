import { useEffect, useRef } from 'react';

/**
 * Une tuile vidéo.
 * 
 * RÈGLE AUDIO :
 *   - isLocal=true  → muted TOUJOURS (évite écho/larsen, on s'entend pas soi-même)
 *   - isLocal=false → jamais muted (on entend les autres)
 *   - Le prop `muted` ici = INDICATEUR VISUEL seulement (icône 🔇)
 *     Il ne contrôle PAS l'attribut HTML muted du <video>.
 */
export default function VideoTile({
  stream,
  name,
  isLocal    = false,
  isActive   = false,
  muted      = false,    // indicateur visuel micro coupé
  videoOff   = false,
  handRaised = false,
  isHost     = false,
  className  = '',
}) {
  const videoRef = useRef(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !stream) return;
    el.srcObject = stream;
    el.play().catch(() => {});
    return () => { el.srcObject = null; };
  }, [stream]);

  return (
    <div className={`
      relative bg-gray-800 rounded-xl overflow-hidden
      flex items-center justify-center
      ${isActive ? 'ring-2 ring-green-400' : ''}
      ${className}
    `}>
      {/* Élément video — toujours dans le DOM pour que la ref fonctionne */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal}          // ← SEULE source de vérité : local = muet HTML
        className={`w-full h-full object-cover ${stream && !videoOff ? 'block' : 'hidden'}`}
      />

      {/* Avatar quand pas de stream ou caméra off */}
      {(!stream || videoOff) && (
        <div className="flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600
            flex items-center justify-center text-white text-xl font-bold select-none">
            {name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <span className="text-gray-400 text-sm">{name}</span>
        </div>
      )}

      {/* Barre nom en bas — indicateurs visuels uniquement */}
      <div className="absolute bottom-0 left-0 right-0 px-2 py-1
        bg-gradient-to-t from-black/70 to-transparent
        flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-1">
          {/* 🔇 uniquement visuel — ne contrôle pas le son */}
          {muted    && <span className="text-red-400 text-xs">🔇</span>}
          {videoOff && <span className="text-red-400 text-xs">📷</span>}
          <span className="text-white text-xs font-medium truncate max-w-[100px]">
            {name}
            {isLocal && <span className="text-gray-400"> (Vous)</span>}
            {isHost  && <span className="text-yellow-400"> 👑</span>}
          </span>
        </div>
        {handRaised && (
          <span className="text-yellow-400 text-sm animate-bounce">✋</span>
        )}
      </div>
    </div>
  );
}
