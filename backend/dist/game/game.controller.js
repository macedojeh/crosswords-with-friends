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
exports.GameController = void 0;
const common_1 = require("@nestjs/common");
const game_service_1 = require("./game.service");
let GameController = class GameController {
    constructor(gameService) {
        this.gameService = gameService;
        console.log('🔍 GameController constructor chamado');
        console.log('🔍 gameService é:', this.gameService);
    }
    async createGame(dto) {
        console.log('🎮 Endpoint /create chamado');
        console.log('🔍 this.gameService:', this.gameService);
        if (!this.gameService) {
            throw new Error('GameService não foi injetado!');
        }
        return this.gameService.createGame(dto.playerName, dto.wordCount || 30);
    }
    joinGame(dto) {
        console.log('👋 Endpoint /join chamado');
        return this.gameService.joinGame(dto.gameId, dto.playerName);
    }
    toggleReady(dto) {
        console.log('🔄 Endpoint /toggle-ready chamado');
        return this.gameService.toggleReady(dto.gameId, dto.playerId);
    }
    async startGame(dto) {
        console.log('▶️ Endpoint /start chamado');
        return await this.gameService.startGame(dto.gameId, dto.playerId);
    }
    attemptWord(dto) {
        console.log('🎯 Endpoint /attempt chamado');
        return this.gameService.attemptWord(dto.gameId, dto.playerId, dto.wordId, dto.attempt);
    }
    passTurn(dto) {
        console.log('⏭️ Endpoint /pass chamado');
        return this.gameService.passTurn(dto.gameId, dto.playerId);
    }
    getGame(gameId) {
        console.log('🔍 Endpoint /get chamado');
        return this.gameService.getGame(gameId);
    }
};
exports.GameController = GameController;
__decorate([
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Body)())
], GameController.prototype, "createGame", null);
__decorate([
    (0, common_1.Post)('join'),
    __param(0, (0, common_1.Body)())
], GameController.prototype, "joinGame", null);
__decorate([
    (0, common_1.Post)('toggle-ready'),
    __param(0, (0, common_1.Body)())
], GameController.prototype, "toggleReady", null);
__decorate([
    (0, common_1.Post)('start'),
    __param(0, (0, common_1.Body)())
], GameController.prototype, "startGame", null);
__decorate([
    (0, common_1.Post)('attempt'),
    __param(0, (0, common_1.Body)())
], GameController.prototype, "attemptWord", null);
__decorate([
    (0, common_1.Post)('pass'),
    __param(0, (0, common_1.Body)())
], GameController.prototype, "passTurn", null);
__decorate([
    (0, common_1.Get)(':gameId'),
    __param(0, (0, common_1.Param)('gameId'))
], GameController.prototype, "getGame", null);
exports.GameController = GameController = __decorate([
    (0, common_1.Controller)('game'),
    __param(0, (0, common_1.Inject)(game_service_1.GameService))
], GameController);
//# sourceMappingURL=game.controller.js.map