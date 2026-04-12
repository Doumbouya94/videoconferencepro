import { useEffect, useRef, useState } from 'react';

export default function Lobby({ roomId, userName, onJoin, onBack }) {
  const [stream,        setStream]       = useState(null);
  const [audioEnabled,  setAudioEnabled] = useState(true);
  const [videoEnabled,  setVideoEnabled] = useState(true);
  const [error,         setError]        = useState('');
  const [loading,       setLoading]      = useState(false);
  const videoRef  = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl:  true,
          },
        });
        if (!active) { s.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = s;
        setStream(s);
      } catch {
        setError("Impossible d'accéder à la caméra/micro. Vérifiez les permissions.");
      }
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const el = videoRef.current;
    if (el && stream) { el.srcObject = stream; el.play().catch(() => {}); }
  }, [stream]);

  const toggleAudio = () => {
    const track = streamRef.current?.getAudioTracks()[0];
    if (track) { track.enabled = !track.enabled; setAudioEnabled(track.enabled); }
  };

  const toggleVideo = () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (track) { track.enabled = !track.enabled; setVideoEnabled(track.enabled); }
  };

  const handleJoin = () => {
    setLoading(true);
    onJoin(streamRef.current);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl shadow-2xl p-6 w-full max-w-md border border-gray-800">
        <h2 className="text-white text-xl font-bold mb-1">Prêt à rejoindre ?</h2>
        <p className="text-gray-400 text-sm mb-4">
          Salle : <span className="font-mono text-blue-400">{roomId?.slice(0, 8)}…</span>
        </p>

        <div className="relative bg-gray-800 rounded-xl overflow-hidden aspect-video mb-4">
          {stream && videoEnabled ? (
            <video ref={videoRef} autoPlay playsInline muted
              className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600
                flex items-center justify-center text-white text-3xl font-bold">
                {userName?.[0]?.toUpperCase() ?? '?'}
              </div>
            </div>
          )}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            <PreviewBtn onClick={toggleAudio} active={!audioEnabled}>
              {audioEnabled ? '🎤' : '🔇'}
            </PreviewBtn>
            <PreviewBtn onClick={toggleVideo} active={!videoEnabled}>
              {videoEnabled ? '📹' : '📷'}
            </PreviewBtn>
          </div>
        </div>

        <p className="text-gray-300 text-sm mb-4 text-center">
          Vous rejoignez en tant que <strong>{userName}</strong>
        </p>

        {error && (
          <div className="bg-red-900/40 border border-red-700 text-red-300 text-sm rounded-lg px-4 py-2 mb-4">
            ⚠️ {error}
          </div>
        )}

        <button onClick={handleJoin} disabled={loading || !!error}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-60
            text-white font-semibold rounded-xl transition-colors mb-2">
          {loading ? '⏳ Connexion...' : '🚀 Rejoindre la réunion'}
        </button>

        <button onClick={() => { streamRef.current?.getTracks().forEach(t => t.stop()); onBack(); }}
          className="w-full py-2.5 text-gray-400 hover:text-white text-sm rounded-xl
            hover:bg-gray-800 transition-colors">
          ← Retour
        </button>
      </div>
    </div>
  );
}

function PreviewBtn({ onClick, active, children }) {
  return (
    <button onClick={onClick}
      className={`w-9 h-9 rounded-full flex items-center justify-center text-sm shadow
        ${active ? 'bg-red-600 text-white' : 'bg-black/60 text-white hover:bg-black/80'}`}>
      {children}
    </button>
  );
}
