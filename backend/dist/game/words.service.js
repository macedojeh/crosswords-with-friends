"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WordsService = void 0;
const common_1 = require("@nestjs/common");
const words_hints_json_1 = __importDefault(require("./words-hints.json"));
let WordsService = class WordsService {
    constructor() {
        this.clues = words_hints_json_1.default;
        this.words = Object.keys(this.clues)
            .filter(w => w.length >= 4 && w.length <= 12)
            .sort();
        console.log(`✅ ${this.words.length} palavras carregadas do JSON`);
    }
    getAllWords() {
        return [...this.words];
    }
    getClue(word) {
        return this.clues[word] ?? 'Sem dica';
    }
    getRandomWords(count) {
        const shuffled = [...this.words].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }
    getTotalCount() {
        return this.words.length;
    }
};
exports.WordsService = WordsService;
exports.WordsService = WordsService = __decorate([
    (0, common_1.Injectable)()
], WordsService);
//# sourceMappingURL=words.service.js.map