export declare class WordsService {
    private readonly words;
    private readonly clues;
    constructor();
    getAllWords(): string[];
    getClue(word: string): string;
    getRandomWords(count: number): string[];
    getTotalCount(): number;
}
