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
exports.CrosswordGeneratorService = void 0;
const common_1 = require("@nestjs/common");
const clue_generator_service_1 = require("./clue-generator.service");
const words_service_1 = require("./words.service");
let CrosswordGeneratorService = class CrosswordGeneratorService {
    constructor(_wordsService, _clueGenerator) {
        this._wordsService = _wordsService;
        this._clueGenerator = _clueGenerator;
        this.words = [];
    }
    onModuleInit() {
        this.words = this._wordsService.getAllWords();
    }
    async generate(targetWordCount = 30) {
        console.log(`🎯 Iniciando geração de ${targetWordCount} palavras...`);
        let bestAttempt = null;
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
            }
            catch (error) {
                console.error(`❌ Erro na tentativa ${attempt + 1}:`, error.message);
            }
        }
        console.log(`⚠️ Melhor resultado: ${maxWordsPlaced}`);
        if (bestAttempt && bestAttempt.words.length > 0) {
            return bestAttempt;
        }
        return this.generateAttempt(15);
    }
    buildNumberedGrid(grid, words) {
        const size = grid.length;
        const newGrid = Array(size)
            .fill(null)
            .map((_, r) => Array(size)
            .fill(null)
            .map((_, c) => ({
            letter: grid[r][c] === '#' ? null : grid[r][c],
            isBlocked: grid[r][c] === '#',
            number: undefined,
        })));
        for (const word of words) {
            newGrid[word.startRow][word.startCol].number = word.id;
        }
        return newGrid;
    }
    addDesignBlocks(grid, size) {
        const spots = [
            [2, 2],
            [2, size - 3],
            [size - 3, 2],
            [size - 3, size - 3],
            [Math.floor(size / 2), Math.floor(size / 2)],
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
            if (r >= 0 && r < size && c >= 0 && c < size && grid[r][c] === null) {
                grid[r][c] = '#';
            }
        }
    }
    fillEmptyCellsWithBlocks(grid, size) {
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                if (grid[r][c] === null) {
                    grid[r][c] = '#';
                }
            }
        }
    }
    async generateAttempt(targetWordCount) {
        const gridSize = 15;
        const grid = Array(gridSize)
            .fill(null)
            .map(() => Array(gridSize).fill(null));
        const placedWords = [];
        const availableWords = [...this.words].sort(() => Math.random() - 0.5);
        const firstWord = availableWords.shift();
        const startRow = Math.floor(gridSize / 2);
        const startCol = Math.floor((gridSize - firstWord.length) / 2);
        this.placeWord(grid, firstWord, startRow, startCol, 'horizontal');
        placedWords.push({
            word: firstWord,
            direction: 'horizontal',
            startRow,
            startCol,
        });
        for (const newWord of availableWords) {
            if (placedWords.length >= targetWordCount)
                break;
            let placed = false;
            for (const existing of placedWords) {
                for (let i = 0; i < existing.word.length; i++) {
                    for (let j = 0; j < newWord.length; j++) {
                        if (existing.word[i] !== newWord[j])
                            continue;
                        const crossRow = existing.direction === 'horizontal'
                            ? existing.startRow
                            : existing.startRow + i;
                        const crossCol = existing.direction === 'horizontal'
                            ? existing.startCol + i
                            : existing.startCol;
                        const direction = existing.direction === 'horizontal' ? 'vertical' : 'horizontal';
                        const startRow = direction === 'horizontal' ? crossRow : crossRow - j;
                        const startCol = direction === 'horizontal' ? crossCol - j : crossCol;
                        if (this.canPlaceWord(grid, newWord, startRow, startCol, direction, gridSize)) {
                            this.placeWord(grid, newWord, startRow, startCol, direction);
                            placedWords.push({ word: newWord, direction, startRow, startCol });
                            placed = true;
                            break;
                        }
                    }
                    if (placed)
                        break;
                }
                if (placed)
                    break;
            }
        }
        this.addDesignBlocks(grid, gridSize);
        this.fillEmptyCellsWithBlocks(grid, gridSize);
        const clues = await this._clueGenerator.generateCluesInBatches(placedWords.map((p) => p.word));
        const wordsWithClues = placedWords.map((p, i) => ({
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
    canPlaceWord(grid, word, startRow, startCol, direction, size) {
        for (let i = 0; i < word.length; i++) {
            const r = direction === 'horizontal' ? startRow : startRow + i;
            const c = direction === 'horizontal' ? startCol + i : startCol;
            if (r < 0 || c < 0 || r >= size || c >= size)
                return false;
            const cell = grid[r][c];
            if (cell !== null && cell !== word[i])
                return false;
        }
        return true;
    }
    placeWord(grid, word, startRow, startCol, direction) {
        for (let i = 0; i < word.length; i++) {
            const r = direction === 'horizontal' ? startRow : startRow + i;
            const c = direction === 'horizontal' ? startCol + i : startCol;
            grid[r][c] = word[i];
        }
    }
};
exports.CrosswordGeneratorService = CrosswordGeneratorService;
exports.CrosswordGeneratorService = CrosswordGeneratorService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)((0, common_1.forwardRef)(() => words_service_1.WordsService))),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => clue_generator_service_1.ClueGeneratorService)))
], CrosswordGeneratorService);
//# sourceMappingURL=crossword-generator.service.js.map