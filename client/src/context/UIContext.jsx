import { createContext, useContext, useState } from 'react';

const UIContext = createContext(null);

export const useUI = () => {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be inside UIProvider');
  return ctx;
};

export function UIProvider({ children }) {
  const [layout,          setLayout]         = useState('grid');       // 'grid' | 'spotlight'
  const [activeSpeakerId, setActiveSpeakerId]= useState(null);
  const [chatOpen,        setChatOpen]       = useState(false);
  const [participantsOpen,setParticipantsOpen]=useState(false);
  const [whiteboardOpen,  setWhiteboardOpen] = useState(false);
  const [breakoutOpen,    setBreakoutOpen]   = useState(false);
  const [reactions,       setReactions]      = useState([]);

  const addReaction = (reaction) => {
    const id = Date.now() + Math.random();
    setReactions(prev => [...prev, { ...reaction, id }]);
    setTimeout(() => setReactions(prev => prev.filter(r => r.id !== id)), 3000);
  };

  const toggleLayout = () =>
    setLayout(l => l === 'grid' ? 'spotlight' : 'grid');

  return (
    <UIContext.Provider value={{
      layout, setLayout, toggleLayout,
      activeSpeakerId, setActiveSpeakerId,
      chatOpen, setChatOpen,
      participantsOpen, setParticipantsOpen,
      whiteboardOpen, setWhiteboardOpen,
      breakoutOpen, setBreakoutOpen,
      reactions, addReaction,
    }}>
      {children}
    </UIContext.Provider>
  );
}
