import { useState } from 'react';

interface Props {
  onCreateGame: (playerName: string, wordCount: number) => void;
  onJoinGame: (gameId: string, playerName: string) => void;
}

export default function LobbyScreen({ onCreateGame, onJoinGame }: Props) {
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [wordCount, setWordCount] = useState(30);

  const handleCreate = () => {
    if (!playerName.trim()) {
      alert('Digite seu nome!');
      return;
    }
    onCreateGame(playerName.trim(), wordCount);
  };

  const handleJoin = () => {
    if (!playerName.trim()) {
      alert('Digite seu nome!');
      return;
    }
    if (!roomId.trim()) {
      alert('Digite o código da sala!');
      return;
    }
    onJoinGame(roomId.trim().toLowerCase(), playerName.trim());
  };

  return (
    <div className="lobby">
      <h1>
        <span>🧩</span> Palavras Cruzadas
      </h1>
      <p className="subtitle">Vamooooooos!</p>

      <div className="lobby-form">
        <input
          type="text"
          placeholder="Seu nome"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          maxLength={20}
          className="name-input"
        />

        <div className="word-count-selector">
          <label>Quantidade de palavras:</label>
          <div className="word-count-options">
            {[30, 40, 50].map((count) => (
              <button
                key={count}
                className={`word-count-btn ${wordCount === count ? 'active' : ''}`}
                onClick={() => setWordCount(count)}
              >
                {count}
              </button>
            ))}
          </div>
        </div>

        <button onClick={handleCreate} className="btn-create">
          🎮 Criar Nova Sala
        </button>

        <div className="divider">
          <span>ou</span>
        </div>

        <input
          type="text"
          placeholder="Código da sala"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className="room-input"
        />

        <button onClick={handleJoin} className="btn-join">
          🚪 Entrar na Sala
        </button>
      </div>
    </div>
  );
}
