"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameService = void 0;
const common_1 = require("@nestjs/common");
const crossword_generator_service_1 = require("./crossword-generator.service");
let GameService = class GameService {
    constructor(_crosswordGenerator) {
        this._crosswordGenerator = _crosswordGenerator;
        this.games = new Map();
    }
    async createGame(playerName, wordCount = 30) {
        const gameId = this.generateId();
        const playerId = this.generateId();
        const game = {
            id: gameId,
            players: [{ id: playerId, name: playerName, score: 0, isReady: false }],
            words: [],
            grid: Array(15)
                .fill(null)
                .map(() => Array(15)
                .fill(null)
                .map(() => ({ letter: null, isBlocked: false }))),
            currentTurnIndex: 0,
            status: 'waiting',
            creatorId: playerId,
            wordCount,
        };
        this.games.set(gameId, game);
        console.log(`🎮 Jogo criado: ${gameId} por ${playerName} (${wordCount} palavras)`);
        return { gameId, playerId, game };
    }
    joinGame(gameId, playerName) {
        const game = this.games.get(gameId);
        if (!game) {
            throw new common_1.BadRequestException('Jogo não encontrado');
        }
        if (game.status !== 'waiting') {
            throw new common_1.BadRequestException('Jogo já começou');
        }
        if (game.players.length >= 6) {
            throw new common_1.BadRequestException('Sala cheia (máximo 6 jogadores)');
        }
        const playerId = this.generateId();
        game.players.push({ id: playerId, name: playerName, score: 0, isReady: false });
        console.log(`👋 ${playerName} entrou no jogo ${gameId}`);
        return { playerId, game };
    }
    toggleReady(gameId, playerId) {
        const game = this.games.get(gameId);
        if (!game) {
            throw new common_1.BadRequestException('Jogo não encontrado');
        }
        if (game.status !== 'waiting') {
            throw new common_1.BadRequestException('Jogo já começou');
        }
        const player = game.players.find((p) => p.id === playerId);
        if (!player) {
            throw new common_1.BadRequestException('Jogador não encontrado');
        }
        player.isReady = !player.isReady;
        console.log(`${player.isReady ? '✅' : '❌'} ${player.name} mudou status`);
        return game;
    }
    async startGame(gameId, playerId) {
        const game = this.games.get(gameId);
        if (!game) {
            throw new common_1.BadRequestException('Jogo não encontrado');
        }
        if (game.creatorId !== playerId) {
            throw new common_1.BadRequestException('Apenas o criador pode iniciar o jogo');
        }
        if (game.status !== 'waiting') {
            throw new common_1.BadRequestException('Jogo já começou');
        }
        console.log(`🧠 Gerando ${game.wordCount} palavras cruzadas para o jogo...`);
        const { words, grid } = await this._crosswordGenerator.generate(game.wordCount || 30);
        game.words = words;
        game.grid = grid;
        game.status = 'playing';
        this.numberGrid(game);
        console.log(`▶️ Jogo ${gameId} iniciado com ${words.length} palavras!`);
        return game;
    }
    attemptWord(gameId, playerId, wordId, attempt) {
        const game = this.games.get(gameId);
        if (!game) {
            throw new common_1.BadRequestException('Jogo não encontrado');
        }
        const currentPlayer = game.players[game.currentTurnIndex];
        if (currentPlayer.id !== playerId) {
            throw new common_1.BadRequestException('Não é sua vez');
        }
        const word = game.words.find((w) => w.id === wordId);
        if (!word) {
            throw new common_1.BadRequestException('Palavra não encontrada');
        }
        if (word.foundBy) {
            throw new common_1.BadRequestException('Palavra já descoberta');
        }
        const isCorrect = attempt.toUpperCase() === word.word.toUpperCase();
        if (isCorrect) {
            word.foundBy = playerId;
            currentPlayer.score += 10;
            console.log(`✅ ${currentPlayer.name} acertou: ${word.word}`);
            for (let i = 0; i < word.length; i++) {
                const row = word.direction === 'horizontal' ? word.startRow : word.startRow + i;
                const col = word.direction === 'horizontal' ? word.startCol + i : word.startCol;
                game.grid[row][col].letter = word.word[i];
            }
            if (game.words.every((w) => w.foundBy)) {
                game.status = 'finished';
                const sorted = [...game.players].sort((a, b) => b.score - a.score);
                game.winner = sorted[0];
                console.log(`🏁 Jogo ${gameId} finalizado! Vencedor: ${game.winner.name}`);
            }
        }
        else {
            console.log(`❌ ${currentPlayer.name} errou: ${attempt} (correto: ${word.word})`);
            game.currentTurnIndex = (game.currentTurnIndex + 1) % game.players.length;
        }
        return game;
    }
    passTurn(gameId, playerId) {
        const game = this.games.get(gameId);
        if (!game) {
            throw new common_1.BadRequestException('Jogo não encontrado');
        }
        const currentPlayer = game.players[game.currentTurnIndex];
        if (currentPlayer.id !== playerId) {
            throw new common_1.BadRequestException('Não é sua vez');
        }
        game.currentTurnIndex = (game.currentTurnIndex + 1) % game.players.length;
        console.log(`⏭️ ${currentPlayer.name} passou a vez`);
        return game;
    }
    getGame(gameId) {
        const game = this.games.get(gameId);
        if (!game) {
            throw new common_1.BadRequestException('Jogo não encontrado');
        }
        return game;
    }
    numberGrid(game) {
        let currentNumber = 1;
        for (let r = 0; r < game.grid.length; r++) {
            for (let c = 0; c < game.grid[r].length; c++) {
                const cell = game.grid[r][c];
                if (cell.isBlocked)
                    continue;
                const hasWordStartingHere = game.words.some((word) => word.startRow === r && word.startCol === c);
                if (hasWordStartingHere) {
                    cell.number = currentNumber;
                    currentNumber++;
                }
            }
        }
    }
    generateId() {
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
};
exports.GameService = GameService;
exports.GameService = GameService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)((0, common_1.forwardRef)(() => crossword_generator_service_1.CrosswordGeneratorService)))
], GameService);
//# sourceMappingURL=game.service.js.map