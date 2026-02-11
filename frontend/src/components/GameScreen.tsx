import { useEffect, useRef, useState } from 'react';
import type { CrosswordWord, GameState } from '../types/game.types';

interface Props {
  game: GameState;
  playerId: string;
  onAttempt: (wordId: number, attempt: string) => void;
  onPass: () => void;
  onLeave: () => void;
}

export default function GameScreen({ game, playerId, onAttempt, onPass, onLeave }: Props) {
  const [selectedWord, setSelectedWord] = useState<CrosswordWord | null>(null);
  const [userInput, setUserInput] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);
  const selectedWordRef = useRef<HTMLDivElement>(null);

  const currentPlayer = game.players[game.currentTurnIndex];
  const isMyTurn = currentPlayer?.id === playerId;

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  useEffect(() => {
    if (selectedWord && gridRef.current) {
      gridRef.current.focus();
    }
  }, [selectedWord]);

  // Scroll automático para a dica selecionada
  useEffect(() => {
    if (selectedWord && selectedWordRef.current) {
      selectedWordRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedWord]);

  const handleCellClick = (word: CrosswordWord) => {
    if (!word.foundBy && isMyTurn) {
      setSelectedWord(word);
      setUserInput(new Array(word.length).fill(''));
      setFeedback(null);

      setTimeout(() => {
        if (gridRef.current) {
          gridRef.current.focus();
        }
      }, 0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!selectedWord || !isMyTurn) return;

    if (e.key === 'Backspace') {
      e.preventDefault();
      // Encontrar o último índice preenchido (alternativa compatível ao findLastIndex)
      let lastFilledIndex = -1;
      for (let i = userInput.length - 1; i >= 0; i--) {
        if (userInput[i] !== '') {
          lastFilledIndex = i;
          break;
        }
      }

      if (lastFilledIndex >= 0) {
        const newInput = [...userInput];
        newInput[lastFilledIndex] = '';
        setUserInput(newInput);
      }
    } else if (e.key === 'Escape') {
      setSelectedWord(null);
      setUserInput([]);
    } else if (/^[a-zA-Z]$/.test(e.key)) {
      e.preventDefault();
      const firstEmptyIndex = userInput.indexOf('');
      if (firstEmptyIndex !== -1) {
        const newInput = [...userInput];
        newInput[firstEmptyIndex] = e.key.toUpperCase();
        setUserInput(newInput);

        if (firstEmptyIndex === selectedWord.length - 1) {
          const attempt = [...newInput.slice(0, -1), e.key.toUpperCase()].join('');
          checkWord(attempt);
        }
      }
    }
  };

  const checkWord = (attempt: string) => {
    if (!selectedWord) return;

    const isCorrect = attempt.toUpperCase() === selectedWord.word.toUpperCase();

    setFeedback(isCorrect ? 'correct' : 'wrong');

    setTimeout(
      () => {
        onAttempt(selectedWord.id, attempt);
        setFeedback(null);
        setSelectedWord(null);
        setUserInput([]);
      },
      isCorrect ? 1000 : 500,
    );
  };

  const handlePassTurn = () => {
    setSelectedWord(null);
    setUserInput([]);
    onPass();
  };

  const sortedPlayers = [...game.players].sort((a, b) => b.score - a.score);

  return (
    <div className="game-screen">
      {/* 🎨 NOVO HEADER ROXO */}
      <div className="game-top-header">
        <div className="header-left">
          <h1 className="slogan">
            Que vença
            <br />o pior!
          </h1>
        </div>
        <div className="header-center">
          <div className="timer-big">⏱️ {formatTime(elapsedTime)}</div>
        </div>
        <div className="header-right">
          <button onClick={onLeave} className="btn-leave">
            🚪 Sair
          </button>
        </div>
      </div>

      <div className="game-content">
        {/* Grid */}
        <div className="grid-container">
          <div
            ref={gridRef}
            className="grid"
            style={{ gridTemplateColumns: `repeat(${game.grid[0].length}, 40px)` }}
            tabIndex={0}
            onKeyDown={handleKeyDown}
            autoFocus
          >
            {game.grid.map((row, r) =>
              row.map((cell, c) => {
                const isInSelectedWord =
                  selectedWord &&
                  ((selectedWord.direction === 'horizontal' &&
                    r === selectedWord.startRow &&
                    c >= selectedWord.startCol &&
                    c < selectedWord.startCol + selectedWord.length) ||
                    (selectedWord.direction === 'vertical' &&
                      c === selectedWord.startCol &&
                      r >= selectedWord.startRow &&
                      r < selectedWord.startRow + selectedWord.length));

                const indexInWord = isInSelectedWord
                  ? selectedWord.direction === 'horizontal'
                    ? c - selectedWord.startCol
                    : r - selectedWord.startRow
                  : -1;

                const wordsStartingHere = game.words.filter(
                  (word) => word.startRow === r && word.startCol === c && !word.foundBy,
                );

                const isClickable = cell.number && wordsStartingHere.length > 0 && isMyTurn;
                const wordToSelect = wordsStartingHere[0];

                const userLetter =
                  isInSelectedWord && indexInWord >= 0 ? userInput[indexInWord] : null;

                const foundWord = game.words.find(
                  (word) =>
                    word.foundBy &&
                    ((word.direction === 'horizontal' &&
                      r === word.startRow &&
                      c >= word.startCol &&
                      c < word.startCol + word.length) ||
                      (word.direction === 'vertical' &&
                        c === word.startCol &&
                        r >= word.startRow &&
                        r < word.startRow + word.length)),
                );

                const letterToShow = foundWord
                  ? foundWord.word[
                      foundWord.direction === 'horizontal'
                        ? c - foundWord.startCol
                        : r - foundWord.startRow
                    ]
                  : userLetter;

                return (
                  <div
                    key={`${r}-${c}`}
                    className={`cell ${cell.isBlocked ? 'blocked' : ''} ${
                      isInSelectedWord ? 'selected' : ''
                    } ${isInSelectedWord && feedback ? feedback : ''} ${
                      isClickable ? 'clickable' : ''
                    }`}
                    onClick={() => {
                      if (isClickable && wordToSelect) {
                        handleCellClick(wordToSelect);
                      }
                    }}
                  >
                    {cell.number && <span className="number">{cell.number}</span>}
                    {letterToShow && <span className="letter">{letterToShow}</span>}
                  </div>
                );
              }),
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="sidebar">
          <div className="ranking">
            <h3>🏆 Ranking</h3>
            {sortedPlayers.map((player, index) => (
              <div
                key={player.id}
                className={`player ${player.id === playerId ? 'me' : ''} ${
                  player.id === currentPlayer?.id ? 'current' : ''
                }`}
              >
                <span>
                  {index + 1}. {player.name}
                  {player.id === playerId && ' (você)'}
                </span>
                <span className="score">{player.score} pts</span>
              </div>
            ))}
          </div>

          <div className="words-list">
            <h3>📝 Palavras</h3>
            <div className="words-scroll">
              {game.words.map((word) => (
                <div
                  key={word.id}
                  ref={selectedWord?.id === word.id ? selectedWordRef : null}
                  className={`word-item ${word.foundBy ? 'found' : ''} ${
                    selectedWord?.id === word.id ? 'selected' : ''
                  }`}
                  onClick={() => !word.foundBy && isMyTurn && handleCellClick(word)}
                >
                  <div className="word-header">
                    <span className="word-direction">
                      {word.direction === 'horizontal' ? '→' : '↓'}
                    </span>
                    <span className="word-clue">{word.clue}</span>
                  </div>
                  <span className="word-length">({word.length} letras)</span>
                  {word.foundBy && <span className="found-badge">✓</span>}
                </div>
              ))}
            </div>
          </div>

          {game.status === 'playing' && (
            <div className={isMyTurn ? 'instructions' : 'waiting'}>
              {isMyTurn ? (
                <>
                  <p>💡 Clique no número e digite a palavra</p>
                  <p>⌫ Backspace para apagar</p>
                </>
              ) : (
                <p>⏳ Aguardando {currentPlayer?.name}...</p>
              )}
              <button onClick={handlePassTurn} className="btn-pass">
                ⏭ Passar Vez
              </button>
            </div>
          )}
        </div>
      </div>

      {game.status === 'finished' && (
        <div className="game-finished-overlay">
          <div className="game-finished-modal">
            <div className="fireworks">🎆🎇✨🎉🎊</div>
            <h1>🏆 TABULEIRO COMPLETO! 🏆</h1>
            <div className="final-ranking">
              <h2>Ranking Final</h2>
              {sortedPlayers.map((player, index) => (
                <div key={player.id} className={`final-player ${index === 0 ? 'winner' : ''}`}>
                  <span className="position">{index === 0 ? '👑' : `${index + 1}º`}</span>
                  <span className="name">{player.name}</span>
                  <span className="final-score">{player.score} pontos</span>
                </div>
              ))}
            </div>
            <button onClick={() => window.location.reload()} className="btn-new-game">
              🎮 Novo Jogo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
