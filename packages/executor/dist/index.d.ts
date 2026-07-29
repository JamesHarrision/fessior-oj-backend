export declare const LANGUAGE_IDS: {
    cpp: number;
    java: number;
    python: number;
};
export type LanguageKey = 'cpp' | 'java' | 'python';
export declare const getLanguageId: (lang: LanguageKey) => number;
export interface ExecutionResult {
    status: 'ACCEPTED' | 'WA' | 'TLE' | 'MLE' | 'RE' | 'CE';
    time: number;
    memory: number;
    error: string | null;
    actualOutput: string;
}
export declare const executeInDocker: (containerName: string, code: string, language: LanguageKey, stdin: string, expectedOutput: string, timeLimitMs: number) => Promise<ExecutionResult>;
export declare const executeOnHost: (code: string, language: LanguageKey, stdin: string, expectedOutput: string, timeLimitMs: number) => Promise<ExecutionResult>;
export declare const executeLocally: (code: string, language: LanguageKey, stdin: string, expectedOutput: string, timeLimitMs: number) => Promise<ExecutionResult>;
export declare const executeTestCase: (code: string, languageId: number, stdin: string, expectedOutput: string, timeLimitMs: number, config: {
    judge0Url: string;
    rapidApiKey: string;
    rapidApiHost: string;
    enableLocalFallback?: boolean;
}) => Promise<ExecutionResult>;
