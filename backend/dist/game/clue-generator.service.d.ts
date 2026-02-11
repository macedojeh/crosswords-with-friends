export declare class ClueGeneratorService {
    private hints;
    constructor();
    generateCluesInBatches(words: string[]): Promise<string[]>;
    generateClue(word: string): string;
    getStats(): {
        total: number;
        available: string[];
    };
}
