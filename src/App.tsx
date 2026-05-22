import { useGameStore } from './store/gameStore';
import { useBroadcast } from './hooks/useBroadcast';
import { HomePage } from './pages/HomePage';
import { LobbyPage } from './pages/LobbyPage';
import { GamePage } from './pages/GamePage';
import { ResultPage } from './pages/ResultPage';
import { ParticleBackground } from './components/ui/ParticleBackground';

function App() {
  const { roomCode, currentPlayerId, phase } = useGameStore();
  const { broadcastState, broadcast } = useBroadcast(roomCode || '');

  let content;

  if (!roomCode || !currentPlayerId) {
    content = <HomePage />;
  } else if (phase === 'lobby') {
    content = <LobbyPage broadcastState={broadcastState} broadcast={broadcast} />;
  } else if (phase === 'fin') {
    content = <ResultPage />;
  } else {
    content = <GamePage broadcastState={broadcastState} broadcast={broadcast} />;
  }

  return (
    <>
      <ParticleBackground />
      <div className="relative z-10 w-full min-h-screen">
        {content}
      </div>
    </>
  );
}

export default App;
