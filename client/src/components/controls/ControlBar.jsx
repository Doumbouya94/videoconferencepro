import { useMedia }       from '../../context/MediaContext.jsx';
import { useSocket }      from '../../context/SocketContext.jsx';
import { useRoom }        from '../../context/RoomContext.jsx';
import { useUI }          from '../../context/UIContext.jsx';
import { useScreenShare } from '../../hooks/useScreenShare.js';
import { useRecording }   from '../../hooks/useRecording.js';
import { EVENTS }         from '../../utils/events.js';

function ZoomBtn({ onClick, active, danger, title, icon, label, highlight }) {
  return (
    <button onClick={onClick} title={title}
      className={`
        flex flex-col items-center justify-center gap-1
        w-16 h-16 rounded-2xl text-xs font-semibold
        transition-all duration-150 select-none
        ${danger     ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/40'
        : highlight  ? 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/40'
        : active     ? 'bg-gray-600 text-white ring-2 ring-white/20'
        :              'bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white'}
      `}>
      <span className="text-2xl leading-none">{icon}</span>
      <span className="text-[10px] leading-tight tracking-wide">{label}</span>
    </button>
  );
}

function PanelBtn({ onClick, active, title, icon, label }) {
  return (
    <button onClick={onClick} title={title}
      className={`flex flex-col items-center justify-center gap-1
        w-14 h-14 rounded-xl text-xs font-medium transition-all
        ${active
          ? 'bg-blue-600 text-white'
          : 'bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white'}`}>
      <span className="text-xl">{icon}</span>
      {label && <span className="text-[10px]">{label}</span>}
    </button>
  );
}

export default function ControlBar({ roomId, onLeave }) {
  const { audioEnabled, videoEnabled, toggleAudio, toggleVideo } = useMedia();
  const { socket }         = useSocket();
  const { hostId, locked } = useRoom();
  const {
    chatOpen, setChatOpen,
    participantsOpen, setParticipantsOpen,
    whiteboardOpen, setWhiteboardOpen,
    layout, toggleLayout,
  } = useUI();
  const { isSharing, toggle: toggleScreen }      = useScreenShare();
  const { isRecording, toggle: toggleRecording } = useRecording();

  const raiseHand = () => socket?.emit(EVENTS.RAISE_HAND, { roomId });

  return (
    <div className="bg-gray-900 border-t border-gray-800 px-4 py-2
      flex items-center justify-between gap-2">

      {/* Gauche */}
      <div className="hidden md:flex items-center gap-2 w-36 shrink-0">
        {locked && <span className="text-yellow-400 text-xs">🔒 Verrouillée</span>}
        {/* Stop share bien visible à gauche si actif — comme Zoom */}
        {isSharing && (
          <button onClick={toggleScreen}
            className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-500
              text-white text-xs font-semibold rounded-xl animate-pulse">
            ⏹ Stop Share
          </button>
        )}
      </div>

      {/* Centre — boutons Zoom style */}
      <div className="flex items-center gap-2 mx-auto">
        <ZoomBtn
          onClick={toggleAudio}
          active={!audioEnabled}
          icon={audioEnabled ? '🎤' : '🔇'}
          label={audioEnabled ? 'Audio' : 'Muet'}
          title="Couper/activer le micro"
        />
        <ZoomBtn
          onClick={toggleVideo}
          active={!videoEnabled}
          icon={videoEnabled ? '📹' : '📷'}
          label={videoEnabled ? 'Vidéo' : 'Arrêtée'}
          title="Couper/activer la caméra"
        />
        <ZoomBtn
          onClick={toggleScreen}
          active={isSharing}
          highlight={isSharing}
          icon="🖥️"
          label={isSharing ? 'Arrêter' : 'Partager'}
          title="Partager l'écran"
        />
        <ZoomBtn
          onClick={toggleRecording}
          active={isRecording}
          icon={isRecording ? '⏹️' : '⏺️'}
          label={isRecording ? 'Stop' : 'Rec'}
          title="Enregistrer"
        />
        <ZoomBtn
          onClick={raiseHand}
          icon="✋"
          label="Main"
          title="Lever la main"
        />
        <ZoomBtn
          onClick={toggleLayout}
          icon={layout === 'grid' ? '🔲' : '📌'}
          label={layout === 'grid' ? 'Grille' : 'Focus'}
          title="Changer la disposition"
        />
        <div className="w-px h-10 bg-gray-700 mx-1" />
        <ZoomBtn
          onClick={onLeave}
          danger
          icon="📞"
          label="Quitter"
          title="Quitter la réunion"
        />
      </div>

      {/* Droite — panneaux */}
      <div className="flex items-center gap-1.5 w-36 justify-end shrink-0">
        <PanelBtn onClick={() => setParticipantsOpen(o=>!o)}
          active={participantsOpen} icon="👥" label="Participants" />
        <PanelBtn onClick={() => setChatOpen(o=>!o)}
          active={chatOpen} icon="💬" label="Chat" />
        <PanelBtn onClick={() => setWhiteboardOpen(o=>!o)}
          active={whiteboardOpen} icon="🎨" label="Tableau" />
      </div>
    </div>
  );
}
