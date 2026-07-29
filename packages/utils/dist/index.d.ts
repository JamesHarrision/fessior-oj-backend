export interface EloChangeResult {
    newWinnerElo: number;
    newLoserElo: number;
    winnerChange: number;
    loserChange: number;
}
export declare function calculateEloPvP(winnerElo: number, loserElo: number, options?: {
    floor?: number;
    winBonus?: number;
    lossPenalty?: number;
}): EloChangeResult;
export declare function formatMemoryKb(kb: number): string;
export declare function formatMemoryMb(mb: number): string;
export declare function formatExecutionTime(ms: number | string): string;
export declare function parseErrorMessage(error: any): string;
export declare function renderMarkdownToHtml(markdown: string): string;
