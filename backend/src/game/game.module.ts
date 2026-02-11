import { Module } from '@nestjs/common';
import { ClueGeneratorService } from './clue-generator.service';
import { CrosswordGeneratorService } from './crossword-generator.service';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { WordsService } from './words.service';

@Module({
  controllers: [GameController],
  providers: [
    WordsService,
    ClueGeneratorService,
    CrosswordGeneratorService,
    GameService,
  ],
  exports: [GameService],
})
export class GameModule { }

