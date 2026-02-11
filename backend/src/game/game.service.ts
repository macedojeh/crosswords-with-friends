import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { CrosswordGeneratorService } from './crossword-generator.service';
import type { GameState, } from './game.types';

@Injectable()
export class GameService {
  private games = new Map<string, GameState>();

  constructor(
    @Inject(forwardRef(() => CrosswordGeneratorService))
    private readonly _crosswordGenerator: CrosswordGeneratorService,
  ) { }


  /**
   * Criar novo jogo
   */
  async createGame(
    playerName: string,
    wordCount: number = 30,
  ): Promise<{ gameId: string; playerId: string; game: GameState }> {
    const gameId = this.generateId();
    const playerId = this.generateId();

    const game: GameState = {
      id: gameId,
      players: [{ id: playerId, name: playerName, score: 0, isReady: false }],
      words: [],
      grid: Array(15)
        .fill(null)
        .map(() =>
          Array(15)
            .fill(null)
            .map(() => ({ letter: null, isBlocked: false })),
        ),
      currentTurnIndex: 0,
      status: 'waiting',
      creatorId: playerId,
      wordCount,
    };

    this.games.set(gameId, game);

    console.log(`🎮 Jogo criado: ${gameId} por ${playerName} (${wordCount} palavras)`);

    return { gameId, playerId, game };
  }

  /**
   * Entrar em jogo existente
   */
  joinGame(
    gameId: string,
    playerName: string,
  ): { playerId: string; game: GameState } {
    const game = this.games.get(gameId);

    if (!game) {
      throw new BadRequestException('Jogo não encontrado');
    }

    if (game.status !== 'waiting') {
      throw new BadRequestException('Jogo já começou');
    }

    if (game.players.length >= 6) {
      throw new BadRequestException('Sala cheia (máximo 6 jogadores)');
    }

    const playerId = this.generateId();
    game.players.push({ id: playerId, name: playerName, score: 0, isReady: false });

    console.log(`👋 ${playerName} entrou no jogo ${gameId}`);

    return { playerId, game };
  }

  /**
   * Alternar status de pronto
   */
  toggleReady(gameId: string, playerId: string): GameState {
    const game = this.games.get(gameId);

    if (!game) {
      throw new BadRequestException('Jogo não encontrado');
    }

    if (game.status !== 'waiting') {
      throw new BadRequestException('Jogo já começou');
    }

    const player = game.players.find((p) => p.id === playerId);

    if (!player) {
      throw new BadRequestException('Jogador não encontrado');
    }

    player.isReady = !player.isReady;

    console.log(`${player.isReady ? '✅' : '❌'} ${player.name} mudou status`);

    return game;
  }

  /**
   * Iniciar jogo (apenas criador)
   */
  async startGame(gameId: string, playerId: string): Promise<GameState> {
    const game = this.games.get(gameId);

    if (!game) {
      throw new BadRequestException('Jogo não encontrado');
    }

    if (game.creatorId !== playerId) {
      throw new BadRequestException('Apenas o criador pode iniciar o jogo');
    }

    if (game.status !== 'waiting') {
      throw new BadRequestException('Jogo já começou');
    }

    console.log(`🧠 Gerando ${game.wordCount} palavras cruzadas para o jogo...`);

    // Gerar palavras cruzadas com quantidade personalizada
    const { words, grid } = await this._crosswordGenerator.generate(
      game.wordCount || 30,
    );

    game.words = words;
    game.grid = grid; // Agora grid já vem como GridCell[][]
    game.status = 'playing';

    this.numberGrid(game);

    console.log(`▶️ Jogo ${gameId} iniciado com ${words.length} palavras!`);

    return game;
  }

  /**
   * Tentar palavra
   */
  attemptWord(
    gameId: string,
    playerId: string,
    wordId: number,
    attempt: string,
  ): GameState {
    const game = this.games.get(gameId);

    if (!game) {
      throw new BadRequestException('Jogo não encontrado');
    }

    const currentPlayer = game.players[game.currentTurnIndex];

    if (currentPlayer.id !== playerId) {
      throw new BadRequestException('Não é sua vez');
    }

    const word = game.words.find((w) => w.id === wordId);

    if (!word) {
      throw new BadRequestException('Palavra não encontrada');
    }

    if (word.foundBy) {
      throw new BadRequestException('Palavra já descoberta');
    }

    const isCorrect = attempt.toUpperCase() === word.word.toUpperCase();

    if (isCorrect) {
      // ✅ ACERTOU
      word.foundBy = playerId;
      currentPlayer.score += 10;

      console.log(`✅ ${currentPlayer.name} acertou: ${word.word}`);

      // Revelar letras no grid
      for (let i = 0; i < word.length; i++) {
        const row =
          word.direction === 'horizontal' ? word.startRow : word.startRow + i;
        const col =
          word.direction === 'horizontal' ? word.startCol + i : word.startCol;
        game.grid[row][col].letter = word.word[i];
      }

      // Verificar fim de jogo
      if (game.words.every((w) => w.foundBy)) {
        game.status = 'finished';

        const sorted = [...game.players].sort((a, b) => b.score - a.score);
        game.winner = sorted[0];

        console.log(`🏁 Jogo ${gameId} finalizado! Vencedor: ${game.winner.name}`);
      }
    } else {
      // ❌ ERROU
      console.log(`❌ ${currentPlayer.name} errou: ${attempt} (correto: ${word.word})`);

      // Passar vez
      game.currentTurnIndex = (game.currentTurnIndex + 1) % game.players.length;
    }

    return game;
  }

  /**
   * Passar a vez
   */
  passTurn(gameId: string, playerId: string): GameState {
    const game = this.games.get(gameId);

    if (!game) {
      throw new BadRequestException('Jogo não encontrado');
    }

    const currentPlayer = game.players[game.currentTurnIndex];

    if (currentPlayer.id !== playerId) {
      throw new BadRequestException('Não é sua vez');
    }

    game.currentTurnIndex = (game.currentTurnIndex + 1) % game.players.length;

    console.log(`⏭️ ${currentPlayer.name} passou a vez`);

    return game;
  }

  /**
   * Obter jogo
   */
  getGame(gameId: string): GameState {
    const game = this.games.get(gameId);

    if (!game) {
      throw new BadRequestException('Jogo não encontrado');
    }

    return game;
  }

  /**
   * Numerar células - APENAS células com palavras começando
   */
  private numberGrid(game: GameState): void {
    let currentNumber = 1;

    for (let r = 0; r < game.grid.length; r++) {
      for (let c = 0; c < game.grid[r].length; c++) {
        const cell = game.grid[r][c];

        if (cell.isBlocked) continue;

        // Verificar se REALMENTE há uma palavra começando aqui
        const hasWordStartingHere = game.words.some(
          (word) => word.startRow === r && word.startCol === c,
        );

        if (hasWordStartingHere) {
          cell.number = currentNumber;
          currentNumber++;
        }
      }
    }
  }

  private generateId(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';

    let code = '';
    let exists = true;

    while (exists) {
      code = '';
      for (let i = 0; i < 4; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
      }

      exists = this.games.has(code);
    }

    return code;
  }
}
