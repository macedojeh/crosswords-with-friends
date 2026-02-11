export interface Player {
  id: string;
  name: string;
  score: number;
  isReady: boolean;
}

export interface CrosswordWord {
  id: number;
  word: string;
  clue: string;
  direction: 'horizontal' | 'vertical';
  startRow: number;
  startCol: number;
  length: number;
  foundBy?: string;
}

export interface GridCell {
  letter: string | null;
  isBlocked: boolean;
  number?: number;
}

export interface GameState {
  id: string;
  players: Player[];
  words: CrosswordWord[];
  grid: GridCell[][];
  currentTurnIndex: number;
  status: 'waiting' | 'playing' | 'finished';
  winner?: Player;
  creatorId: string;
}
