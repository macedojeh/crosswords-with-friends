import { Controller, Post, Get, Body, Param, Inject } from '@nestjs/common';
import { GameService } from './game.service';

@Controller('game')
export class GameController {
  constructor(@Inject(GameService) private readonly gameService: GameService) {
    console.log('🔍 GameController constructor chamado');
    console.log('🔍 gameService é:', this.gameService);
  }

  @Post('create')
  async createGame(@Body() dto: { playerName: string; wordCount?: number }) {
    console.log('🎮 Endpoint /create chamado');
    console.log('🔍 this.gameService:', this.gameService);

    if (!this.gameService) {
      throw new Error('GameService não foi injetado!');
    }

    return this.gameService.createGame(dto.playerName, dto.wordCount || 30);
  }

  @Post('join')
  joinGame(@Body() dto: { gameId: string; playerName: string }) {
    console.log('👋 Endpoint /join chamado');
    return this.gameService.joinGame(dto.gameId, dto.playerName);
  }

  @Post('toggle-ready')
  toggleReady(@Body() dto: { gameId: string; playerId: string }) {
    console.log('🔄 Endpoint /toggle-ready chamado');
    return this.gameService.toggleReady(dto.gameId, dto.playerId);
  }

  @Post('start')
  async startGame(@Body() dto: { gameId: string; playerId: string }) {
    console.log('▶️ Endpoint /start chamado');
    return await this.gameService.startGame(dto.gameId, dto.playerId);
  }

  @Post('attempt')
  attemptWord(
    @Body()
    dto: {
      gameId: string;
      playerId: string;
      wordId: number;
      attempt: string;
    },
  ) {
    console.log('🎯 Endpoint /attempt chamado');
    return this.gameService.attemptWord(
      dto.gameId,
      dto.playerId,
      dto.wordId,
      dto.attempt,
    );
  }

  @Post('pass')
  passTurn(@Body() dto: { gameId: string; playerId: string }) {
    console.log('⏭️ Endpoint /pass chamado');
    return this.gameService.passTurn(dto.gameId, dto.playerId);
  }

  @Get(':gameId')
  getGame(@Param('gameId') gameId: string) {
    console.log('🔍 Endpoint /get chamado');
    return this.gameService.getGame(gameId);
  }
}
