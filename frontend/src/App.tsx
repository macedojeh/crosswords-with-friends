import { useEffect, useState } from 'react';
import GameScreen from './components/GameScreen';
import LobbyScreen from './components/LobbyScreen';
import WaitingRoom from './components/WaitingRoom';
import type { GameState } from './types/game.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function App() {
  const [game, setGame] = useState<GameState | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Carregar jogo do localStorage ao iniciar
  useEffect(() => {
    const savedGameId = localStorage.getItem('gameId');
    const savedPlayerId = localStorage.getItem('playerId');

    if (savedGameId && savedPlayerId) {
      // Tentar recuperar o jogo
      fetch(`${API_URL}/game/${savedGameId}`)
        .then((res) => res.json())
        .then((data) => {
          setGame(data);
          setPlayerId(savedPlayerId);
        })
        .catch(() => {
          // Jogo não existe mais, limpar localStorage
          localStorage.removeItem('gameId');
          localStorage.removeItem('playerId');
        });
    }
  }, []);

  // Salvar no localStorage quando criar/entrar em jogo
  useEffect(() => {
    if (game && playerId) {
      localStorage.setItem('gameId', game.id);
      localStorage.setItem('playerId', playerId);
    }
  }, [game, playerId]);

  // Polling
  useEffect(() => {
    if (!game) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/game/${game.id}`);
        const data = await res.json();
        setGame(data);
      } catch (err) {
        console.error('Erro ao buscar jogo:', err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [game]);

  const handleCreateGame = async (playerName: string, wordCount: number) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/game/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName, wordCount }),
      });

      const data = await res.json();
      setGame(data.game);
      setPlayerId(data.playerId);
    } catch (err) {
      setError('Erro ao criar jogo');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGame = async (gameId: string, playerName: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/game/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId, playerName }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Erro ao entrar no jogo');
      }

      const data = await res.json();
      setGame(data.game);
      setPlayerId(data.playerId);
    } catch (err: any) {
      setError(err.message || 'Erro ao entrar no jogo');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleReady = async () => {
    if (!game || !playerId) return;

    try {
      const res = await fetch(`${API_URL}/game/toggle-ready`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId: game.id, playerId }),
      });

      const data = await res.json();
      setGame(data);
    } catch (err) {
      console.error('Erro ao mudar status:', err);
    }
  };

  const handleStartGame = async () => {
    if (!game || !playerId) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/game/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId: game.id, playerId }),
      });

      const data = await res.json();
      setGame(data);
    } catch (err) {
      console.error('Erro ao iniciar jogo:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAttempt = async (wordId: number, attempt: string) => {
    if (!game || !playerId) return;

    try {
      const res = await fetch(`${API_URL}/game/attempt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId: game.id, playerId, wordId, attempt }),
      });

      const data = await res.json();
      setGame(data);
    } catch (err) {
      console.error('Erro ao enviar resposta:', err);
    }
  };

  const handlePass = async () => {
    if (!game || !playerId) return;

    try {
      const res = await fetch(`${API_URL}/game/pass`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId: game.id, playerId }),
      });

      const data = await res.json();
      setGame(data);
    } catch (err) {
      console.error('Erro ao passar vez:', err);
    }
  };

  const handleLeaveGame = () => {
    localStorage.removeItem('gameId');
    localStorage.removeItem('playerId');
    setGame(null);
    setPlayerId(null);
    window.location.reload();
  };

  return (
    <div className="app">
      {loading && <div className="loading">Carregando...</div>}
      {error && <div className="error">{error}</div>}

      {!game ? (
        <LobbyScreen onCreateGame={handleCreateGame} onJoinGame={handleJoinGame} />
      ) : game.status === 'waiting' ? (
        <WaitingRoom
          game={game}
          playerId={playerId!}
          onToggleReady={handleToggleReady}
          onStartGame={handleStartGame}
        />
      ) : (
        <GameScreen
          game={game}
          playerId={playerId!}
          onAttempt={handleAttempt}
          onPass={handlePass}
          onLeave={handleLeaveGame}
        />
      )}
    </div>
  );
}

export default App;
