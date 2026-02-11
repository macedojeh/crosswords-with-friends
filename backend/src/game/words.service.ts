import { Injectable } from '@nestjs/common';
import wordsHints from './words-hints.json';

@Injectable()
export class WordsService {
  private readonly words: string[];
  private readonly clues: Record<string, string>;

  constructor() {
    this.clues = wordsHints as Record<string, string>;

    this.words = Object.keys(this.clues)
      .filter(w => w.length >= 4 && w.length <= 12)
      .sort();

    console.log(`✅ ${this.words.length} palavras carregadas do JSON`);
  }

  getAllWords(): string[] {
    return [...this.words];
  }

  getClue(word: string): string {
    return this.clues[word] ?? 'Sem dica';
  }

  getRandomWords(count: number): string[] {
    const shuffled = [...this.words].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  getTotalCount(): number {
    return this.words.length;
  }
}
