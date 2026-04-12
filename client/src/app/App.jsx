import { useState } from 'react';
import { SocketProvider } from '../context/SocketContext.jsx';
import { RoomProvider }   from '../context/RoomContext.jsx';
import { UIProvider }     from '../context/UIContext.jsx';
import { MediaProvider }  from '../context/MediaContext.jsx';
import Home   from '../pages/Home.jsx';
import Lobby  from '../pages/Lobby.jsx';
import Room   from '../pages/Room.jsx';

/**
 * Screens:
 *   'home'  → Home page (create / join)
 *   'lobby' → Pre-join camera check
 *   'room'  → Live conference
 */
export default function App() {
  const [screen,   setScreen]   = useState('home');
  const [roomId,   setRoomId]   = useState('');
  const [userName, setUserName] = useState('');

  const handleJoin = (rid, uname) => {
    setRoomId(rid);
    setUserName(uname);
    setScreen('lobby');
  };

  const handleEnterRoom = () => setScreen('room');

  const handleLeave = () => {
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

  // 'room' — mount all providers
  return (
    <SocketProvider>
      <RoomProvider>
        <UIProvider>
          <MediaProvider>
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
