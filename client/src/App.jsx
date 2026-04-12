import { useState, useRef } from 'react';
import { SocketProvider } from './context/SocketContext.jsx';
import { RoomProvider }   from './context/RoomContext.jsx';
import { UIProvider }     from './context/UIContext.jsx';
import { MediaProvider }  from './context/MediaContext.jsx';
import Home   from './pages/Home.jsx';
import Lobby  from './pages/Lobby.jsx';
import Room   from './pages/Room.jsx';

export default function App() {
  const [screen,   setScreen]   = useState('home');
  const [roomId,   setRoomId]   = useState('');
  const [userName, setUserName] = useState('');
  const existingStream = useRef(null); // stream ouvert dans Lobby

  const handleJoin = (rid, uname) => {
    setRoomId(rid);
    setUserName(uname);
    setScreen('lobby');
  };

  // Lobby appelle onJoin(stream) en passant le stream existant
  const handleEnterRoom = (stream) => {
    existingStream.current = stream || null;
    setScreen('room');
  };

  const handleLeave = () => {
    existingStream.current = null;
    setRoomId('');
    setUserName('');
    setScreen('home');
  };

  if (screen === 'home') {
    return <Home onJoin={handleJoin} />;
  }

  if (screen === 'lobby') {
    return (
      <Lobby
        roomId={roomId}
        userName={userName}
        onJoin={handleEnterRoom}
        onBack={() => setScreen('home')}
      />
    );
  }

  return (
    <SocketProvider>
      <RoomProvider>
        <UIProvider>
          <MediaProvider initialStream={existingStream.current}>
            <Room
              roomId={roomId}
              userName={userName}
              onLeave={handleLeave}
            />
          </MediaProvider>
        </UIProvider>
      </RoomProvider>
    </SocketProvider>
  );
}
