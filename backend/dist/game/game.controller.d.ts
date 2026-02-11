import { GameService } from './game.service';
export declare class GameController {
    private readonly gameService;
    constructor(gameService: GameService);
    createGame(dto: {
        playerName: string;
        wordCount?: number;
    }): Promise<{
        gameId: string;
        playerId: string;
        game: import("./game.types").GameState;
    }>;
    joinGame(dto: {
        gameId: string;
        playerName: string;
    }): {
        playerId: string;
        game: import("./game.types").GameState;
    };
    toggleReady(dto: {
        gameId: string;
        playerId: string;
    }): import("./game.types").GameState;
    startGame(dto: {
        gameId: string;
        playerId: string;
    }): Promise<import("./game.types").GameState>;
    attemptWord(dto: {
        gameId: string;
        playerId: string;
        wordId: number;
        attempt: string;
    }): import("./game.types").GameState;
    passTurn(dto: {
        gameId: string;
        playerId: string;
    }): import("./game.types").GameState;
    getGame(gameId: string): import("./game.types").GameState;
}
