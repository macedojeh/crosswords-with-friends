import { type OnModuleInit } from '@nestjs/common';
import { ClueGeneratorService } from './clue-generator.service';
import type { CrosswordWord, GridCell } from './game.types';
import { WordsService } from './words.service';
export declare class CrosswordGeneratorService implements OnModuleInit {
    private readonly _wordsService;
    private readonly _clueGenerator;
    private words;
    constructor(_wordsService: WordsService, _clueGenerator: ClueGeneratorService);
    onModuleInit(): void;
    generate(targetWordCount?: number): Promise<{
        words: CrosswordWord[];
        grid: GridCell[][];
    }>;
    private buildNumberedGrid;
    private addDesignBlocks;
    private fillEmptyCellsWithBlocks;
    private generateAttempt;
    private canPlaceWord;
    private placeWord;
}
