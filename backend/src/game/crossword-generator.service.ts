import { forwardRef, Inject, Injectable, type OnModuleInit } from '@nestjs/common';
import { ClueGeneratorService } from './clue-generator.service';
import type { CrosswordWord, GridCell } from './game.types';
import { WordsService } from './words.service';

@Injectable()
export class CrosswordGeneratorService implements OnModuleInit {
  private words: string[] = [];

  constructor(
    @Inject(forwardRef(() => WordsService))
    private readonly _wordsService: WordsService,

    @Inject(forwardRef(() => ClueGeneratorService))
    private readonly _clueGenerator: ClueGeneratorService,
  ) { }

  onModuleInit() {
    this.words = this._wordsService.getAllWords();
  }

  async generate(targetWordCount: number = 30): Promise<{
    words: CrosswordWord[];
    grid: GridCell[][];
  }> {
    console.log(`🎯 Iniciando geração de ${targetWordCount} palavras...`);

    let bestAttempt: { words: CrosswordWord[]; grid: GridCell[][] } | null = null;
    let maxWordsPlaced = 0;

    for (let attempt = 0; attempt < 10; attempt++) {
      console.log(`🔄 Tentativa ${attempt + 1}/10...`);

      try {
        const result = await this.generateAttempt(targetWordCount);

        if (result.words.length >= targetWordCount) {
          console.log(`✅ Conseguiu ${result.words.length} palavras!`);
          return result;
        }

        if (result.words.length > maxWordsPlaced) {
          maxWordsPlaced = result.words.length;
          bestAttempt = result;
        }
      } catch (error: any) {
        console.error(`❌ Erro na tentativa ${attempt + 1}:`, error.message);
      }
    }

    console.log(`⚠️ Melhor resultado: ${maxWordsPlaced}`);

    if (bestAttempt && bestAttempt.words.length > 0) {
      return bestAttempt;
    }

    return this.generateAttempt(15);
  }

  private buildNumberedGrid(
    grid: (string | null)[][],
    words: CrosswordWord[],
  ): GridCell[][] {
    const size = grid.length;

    const newGrid: GridCell[][] = Array(size)
      .fill(null)
      .map((_, r) =>
        Array(size)
          .fill(null)
          .map((_, c) => ({
            letter: grid[r][c] === '#' ? null : grid[r][c],
            isBlocked: grid[r][c] === '#',
            number: undefined,
          })),
      );

    for (const word of words) {
      newGrid[word.startRow][word.startCol].number = word.id;
    }

    return newGrid;
  }

  private addDesignBlocks(grid: (string | null)[][], size: number) {
    // Blocos decorativos em posições estratégicas (cantos e centro)
    const spots = [
      // Cantos superiores
      [2, 2],
      [2, size - 3],
      // Cantos inferiores
      [size - 3, 2],
      [size - 3, size - 3],
      // Centro
      [Math.floor(size / 2), Math.floor(size / 2)],
      // Alguns pontos extras para simetria
      [4, 4],
      [4, size - 5],
      [size - 5, 4],
      [size - 5, size - 5],
      [Math.floor(size / 2) - 2, Math.floor(size / 2)],
      [Math.floor(size / 2) + 2, Math.floor(size / 2)],
      [Math.floor(size / 2), Math.floor(size / 2) - 2],
      [Math.floor(size / 2), Math.floor(size / 2) + 2],
    ];

    for (const [r, c] of spots) {
      // Só adiciona se a célula estiver vazia e dentro dos limites
      if (r >= 0 && r < size && c >= 0 && c < size && grid[r][c] === null) {
        grid[r][c] = '#';
      }
    }
  }

  private fillEmptyCellsWithBlocks(grid: (string | null)[][], size: number) {
    // Preencher todas as células vazias (null) com blocos (#)
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (grid[r][c] === null) {
          grid[r][c] = '#';
        }
      }
    }
  }

  private async generateAttempt(targetWordCount: number): Promise<{
    words: CrosswordWord[];
    grid: GridCell[][];
  }> {
    const gridSize = 15;

    const grid: (string | null)[][] = Array(gridSize)
      .fill(null)
      .map(() => Array(gridSize).fill(null));

    const placedWords: Array<{
      word: string;
      direction: 'horizontal' | 'vertical';
      startRow: number;
      startCol: number;
    }> = [];

    const availableWords = [...this.words].sort(() => Math.random() - 0.5);

    // primeira palavra no centro
    const firstWord = availableWords.shift()!;
    const startRow = Math.floor(gridSize / 2);
    const startCol = Math.floor((gridSize - firstWord.length) / 2);

    this.placeWord(grid, firstWord, startRow, startCol, 'horizontal');
    placedWords.push({
      word: firstWord,
      direction: 'horizontal',
      startRow,
      startCol,
    });

    // ⭐ NOVO → tentar encaixar várias palavras
    for (const newWord of availableWords) {
      if (placedWords.length >= targetWordCount) break;

      let placed = false;

      for (const existing of placedWords) {
        for (let i = 0; i < existing.word.length; i++) {
          for (let j = 0; j < newWord.length; j++) {
            if (existing.word[i] !== newWord[j]) continue;

            const crossRow =
              existing.direction === 'horizontal'
                ? existing.startRow
                : existing.startRow + i;

            const crossCol =
              existing.direction === 'horizontal'
                ? existing.startCol + i
                : existing.startCol;

            const direction =
              existing.direction === 'horizontal' ? 'vertical' : 'horizontal';

            const startRow =
              direction === 'horizontal' ? crossRow : crossRow - j;

            const startCol =
              direction === 'horizontal' ? crossCol - j : crossCol;

            if (
              this.canPlaceWord(
                grid,
                newWord,
                startRow,
                startCol,
                direction,
                gridSize,
              )
            ) {
              this.placeWord(grid, newWord, startRow, startCol, direction);
              placedWords.push({ word: newWord, direction, startRow, startCol });
              placed = true;
              break;
            }
          }
          if (placed) break;
        }
        if (placed) break;
      }
    }

    // Adicionar blocos decorativos ANTES de preencher células vazias
    this.addDesignBlocks(grid, gridSize);

    // 🆕 PREENCHER TODAS AS CÉLULAS VAZIAS COM BLOCOS PRETOS
    this.fillEmptyCellsWithBlocks(grid, gridSize);

    const clues = await this._clueGenerator.generateCluesInBatches(
      placedWords.map((p) => p.word),
    );

    const wordsWithClues: CrosswordWord[] = placedWords.map((p, i) => ({
      id: i + 1,
      word: p.word,
      clue: clues[i],
      direction: p.direction,
      startRow: p.startRow,
      startCol: p.startCol,
      length: p.word.length,
    }));

    return {
      words: wordsWithClues,
      grid: this.buildNumberedGrid(grid, wordsWithClues),
    };
  }

  private canPlaceWord(
    grid: (string | null)[][],
    word: string,
    startRow: number,
    startCol: number,
    direction: 'horizontal' | 'vertical',
    size: number,
  ): boolean {
    for (let i = 0; i < word.length; i++) {
      const r = direction === 'horizontal' ? startRow : startRow + i;
      const c = direction === 'horizontal' ? startCol + i : startCol;

      if (r < 0 || c < 0 || r >= size || c >= size) return false;

      const cell = grid[r][c];
      if (cell !== null && cell !== word[i]) return false;
    }
    return true;
  }

  private placeWord(
    grid: (string | null)[][],
    word: string,
    startRow: number,
    startCol: number,
    direction: 'horizontal' | 'vertical',
  ) {
    for (let i = 0; i < word.length; i++) {
      const r = direction === 'horizontal' ? startRow : startRow + i;
      const c = direction === 'horizontal' ? startCol + i : startCol;
      grid[r][c] = word[i];
    }
  }
}
