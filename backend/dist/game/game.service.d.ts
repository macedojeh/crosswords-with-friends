import { CrosswordGeneratorService } from './crossword-generator.service';
import type { GameState } from './game.types';
export declare class GameService {
    private readonly _crosswordGenerator;
    private games;
    constructor(_crosswordGenerator: CrosswordGeneratorService);
    createGame(playerName: string, wordCount?: number): Promise<{
        gameId: string;
        playerId: string;
        game: GameState;
    }>;
    joinGame(gameId: string, playerName: string): {
        playerId: string;
        game: GameState;
    };
    toggleReady(gameId: string, playerId: string): GameState;
    startGame(gameId: string, playerId: string): Promise<GameState>;
    attemptWord(gameId: string, playerId: string, wordId: number, attempt: string): GameState;
    passTurn(gameId: string, playerId: string): GameState;
    getGame(gameId: string): GameState;
    private numberGrid;
    private generateId;
}
