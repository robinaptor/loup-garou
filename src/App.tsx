import { useGameStore } from './store/gameStore';
import { HomePage } from './pages/HomePage';
import { LobbyPage } from './pages/LobbyPage';
import { GamePage } from './pages/GamePage';
import { ResultPage } from './pages/ResultPage';
import { ParticleBackground } from './components/ui/ParticleBackground';

function App() {
  const { roomCode, currentPlayerId, phase } = useGameStore();

  let content;

  if (!roomCode || !currentPlayerId) {
    content = <HomePage />;
  } else if (phase === 'lobby') {
    content = <LobbyPage />;
  } else if (phase === 'fin') {
    content = <ResultPage />;
  } else {
    content = <GamePage />;
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
