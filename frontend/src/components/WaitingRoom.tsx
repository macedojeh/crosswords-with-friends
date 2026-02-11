import type { GameState } from '../types/game.types';

interface Props {
  game: GameState;
  playerId: string;
  onToggleReady: () => void;
  onStartGame: () => void;
}

export default function WaitingRoom({ game, playerId, onToggleReady, onStartGame }: Props) {
  const isCreator = game.creatorId === playerId;
  const currentPlayer = game.players.find((p) => p.id === playerId);

  // Todos os jogadores (exceto o criador) devem estar prontos
  const nonCreatorPlayers = game.players.filter((p) => p.id !== game.creatorId);
  const allNonCreatorsReady = nonCreatorPlayers.every((p) => p.isReady);

  // Criador pode iniciar se: há pelo menos 1 jogador E todos os não-criadores estão prontos
  const canStart =
    game.players.length >= 1 && (nonCreatorPlayers.length === 0 || allNonCreatorsReady);

  return (
    <div className="waiting-room">
      <div className="waiting-room-content">
        <h1>🎮 Sala: {game.id}</h1>
        <p className="subtitle">Aguardando jogadores ({game.players.length}/6)</p>

        <div className="players-waiting">
          {game.players.map((player) => (
            <div
              key={player.id}
              className={`player-card ${player.id === playerId ? 'me' : ''} ${
                player.isReady ? 'ready' : ''
              }`}
            >
              <div className="player-info">
                <span className="player-name">
                  {player.name}
                  {player.id === game.creatorId && ' 👑'}
                  {player.id === playerId && ' (você)'}
                </span>
                <span className={`status ${player.isReady ? 'ready' : 'not-ready'}`}>
                  {player.id === game.creatorId
                    ? '👑 Criador'
                    : player.isReady
                      ? '✅ Pronto'
                      : '⏳ Aguardando'}
                </span>
              </div>
            </div>
          ))}

          {/* Slots vazios */}
          {Array.from({ length: 6 - game.players.length }).map((_, i) => (
            <div key={`empty-${i}`} className="player-card empty">
              <span>Aguardando jogador...</span>
            </div>
          ))}
        </div>

        <div className="waiting-actions">
          {!isCreator && (
            <button
              onClick={onToggleReady}
              className={`btn-ready ${currentPlayer?.isReady ? 'ready' : ''}`}
            >
              {currentPlayer?.isReady ? '❌ Cancelar' : '✅ Estou Pronto!'}
            </button>
          )}

          {isCreator && (
            <>
              <button onClick={onStartGame} className="btn-start" disabled={!canStart}>
                🚀 Iniciar Jogo
              </button>
              {!canStart && nonCreatorPlayers.length > 0 && (
                <p className="warning">⏳ Aguardando todos os jogadores clicarem em "Pronto"</p>
              )}
              {canStart && nonCreatorPlayers.length > 0 && (
                <p className="warning" style={{ color: '#4caf50' }}>
                  ✅ Todos prontos! Pode iniciar o jogo
                </p>
              )}
            </>
          )}
        </div>

        <div className="share-code">
          <p>Compartilhe o código com seus amigos:</p>
          <div className="code-box">
            <code>{game.id}</code>
            <button onClick={() => navigator.clipboard.writeText(game.id)} className="btn-copy">
              📋 Copiar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
