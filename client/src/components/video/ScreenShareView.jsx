import { useEffect, useRef } from 'react';
import { useMedia } from '../../context/MediaContext.jsx';

export default function ScreenShareView() {
  const { screenStream } = useMedia();
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && screenStream) {
      videoRef.current.srcObject = screenStream;
    }
  }, [screenStream]);

  if (!screenStream) return null;

  return (
    <div className="absolute inset-0 z-10 bg-black flex items-center justify-center">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="max-w-full max-h-full object-contain"
      />
      <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white text-xs px-3 py-1 rounded-full animate-pulse">
        🔴 Partage d'écran actif
      </div>
    </div>
  );
}
