import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../context/SocketContext.jsx';
import { useUI }     from '../../context/UIContext.jsx';
import { EVENTS }    from '../../utils/events.js';

export default function Whiteboard({ roomId }) {
  const { socket }       = useSocket();
  const { whiteboardOpen, setWhiteboardOpen } = useUI();

  const [isDrawing, setIsDrawing] = useState(false);
  const [color,     setColor]     = useState('#facc15');
  const [lineWidth, setLineWidth] = useState(3);
  const [tool,      setTool]      = useState('pen'); // 'pen' | 'eraser'

  const canvasRef  = useRef(null);
  const ctxRef     = useRef(null);
  const lastPos    = useRef(null);

  // Init canvas
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas  = canvasRef.current;
    canvas.width  = canvas.offsetWidth  || 740;
    canvas.height = canvas.offsetHeight || 500;
    const ctx     = canvas.getContext('2d');
    ctx.lineCap   = 'round';
    ctx.lineJoin  = 'round';
    ctxRef.current = ctx;
  }, [whiteboardOpen]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    socket.on(EVENTS.WHITEBOARD_DRAW, ({ x0, y0, x1, y1, color, lineWidth }) => {
      const ctx = ctxRef.current;
      if (!ctx) return;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.strokeStyle = color;
      ctx.lineWidth   = lineWidth;
      ctx.stroke();
    });

    socket.on(EVENTS.WHITEBOARD_CLEAR, () => {
      const canvas = canvasRef.current;
      ctxRef.current?.clearRect(0, 0, canvas.width, canvas.height);
    });

    return () => {
      socket.off(EVENTS.WHITEBOARD_DRAW);
      socket.off(EVENTS.WHITEBOARD_CLEAR);
    };
  }, [socket]);

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const src  = e.touches ? e.touches[0] : e;
    return { x: src.clientX - rect.left, y: src.clientY - rect.top };
  };

  const drawLine = (x0, y0, x1, y1, emit = true) => {
    const ctx = ctxRef.current;
    const c   = tool === 'eraser' ? '#1f2937' : color;
    const lw  = tool === 'eraser' ? 20 : lineWidth;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.strokeStyle = c;
    ctx.lineWidth   = lw;
    ctx.stroke();
    if (emit) {
      socket?.emit(EVENTS.WHITEBOARD_DRAW, {
        roomId, data: { x0, y0, x1, y1, color: c, lineWidth: lw }
      });
    }
  };

  const onStart = (e) => { lastPos.current = getPos(e); setIsDrawing(true); };
  const onEnd   = ()  => { lastPos.current = null;      setIsDrawing(false); };
  const onMove  = (e) => {
    if (!isDrawing || !lastPos.current) return;
    const pos = getPos(e);
    drawLine(lastPos.current.x, lastPos.current.y, pos.x, pos.y);
    lastPos.current = pos;
  };

  const clear = () => {
    const canvas = canvasRef.current;
    ctxRef.current?.clearRect(0, 0, canvas.width, canvas.height);
    socket?.emit(EVENTS.WHITEBOARD_CLEAR, { roomId });
  };

  if (!whiteboardOpen) return null;

  const COLORS = ['#facc15','#f87171','#34d399','#60a5fa','#c084fc','#fb923c','#ffffff','#000000'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl flex flex-col w-[95vw] max-w-3xl h-[85vh]">
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-700 flex-wrap">
          <span className="text-white font-semibold text-sm">🎨 Tableau blanc</span>

          {/* Tool */}
          <div className="flex gap-1">
            <TBtn active={tool==='pen'}    onClick={()=>setTool('pen')}>✏️</TBtn>
            <TBtn active={tool==='eraser'} onClick={()=>setTool('eraser')}>🧹</TBtn>
          </div>

          {/* Colors */}
          <div className="flex gap-1">
            {COLORS.map(c => (
              <button key={c} onClick={()=>{setColor(c);setTool('pen');}}
                className={`w-6 h-6 rounded-full border-2 transition-transform ${color===c && tool==='pen' ? 'border-white scale-125' : 'border-transparent'}`}
                style={{background: c}}
              />
            ))}
          </div>

          {/* Stroke width */}
          <input type="range" min={1} max={12} value={lineWidth}
            onChange={e=>setLineWidth(+e.target.value)}
            className="w-24 accent-blue-500"
          />

          <div className="ml-auto flex gap-2">
            <button onClick={clear}
              className="px-3 py-1 bg-red-700 hover:bg-red-600 text-white text-xs rounded-lg">
              🗑 Effacer
            </button>
            <button onClick={()=>setWhiteboardOpen(false)}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded-lg">
              ✕ Fermer
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-hidden rounded-b-2xl bg-gray-800">
          <canvas
            ref={canvasRef}
            className="w-full h-full cursor-crosshair"
            onMouseDown={onStart}  onMouseUp={onEnd}  onMouseMove={onMove}  onMouseLeave={onEnd}
            onTouchStart={onStart} onTouchEnd={onEnd} onTouchMove={onMove}
          />
        </div>
      </div>
    </div>
  );
}

function TBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick}
      className={`w-8 h-8 rounded-lg text-sm flex items-center justify-center transition-colors
        ${active ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
      {children}
    </button>
  );
}
