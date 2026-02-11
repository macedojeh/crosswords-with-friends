import { Injectable } from '@nestjs/common';
import * as wordHints from './words-hints.json';

@Injectable()
export class ClueGeneratorService {
  private hints: Record<string, string>;

  constructor() {
    // Carregar dicas do arquivo JSON
    this.hints = wordHints as Record<string, string>;
    console.log(`✅ ${Object.keys(this.hints).length} dicas carregadas do arquivo JSON`);
  }

  /**
   * Gera múltiplas dicas INSTANTANEAMENTE usando o arquivo JSON
   * (Sem necessidade de lotes ou delays!)
   */
  async generateCluesInBatches(words: string[]): Promise<string[]> {
    console.log(`  🧠 Gerando ${words.length} dicas do arquivo JSON...`);

    const clues = words.map((word) => this.generateClue(word));

    console.log(`  ✅ Todas as ${words.length} dicas geradas instantaneamente!`);

    return clues;
  }

  /**
   * Retorna a dica do arquivo JSON ou uma dica genérica
   */
  generateClue(word: string): string {
    // Buscar dica no arquivo
    const hint = this.hints[word.toLowerCase()];

    if (hint) {
      return hint;
    }

    // Fallback: dica genérica se a palavra não estiver no arquivo
    console.warn(`  ⚠️ Dica não encontrada para "${word}", usando fallback`);
    return `Palavra de ${word.length} letras`;
  }

  /**
   * Retorna estatísticas sobre as dicas disponíveis
   */
  getStats(): { total: number; available: string[] } {
    return {
      total: Object.keys(this.hints).length,
      available: Object.keys(this.hints).slice(0, 10), // primeiras 10 como exemplo
    };
  }
}
