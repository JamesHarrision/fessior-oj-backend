export declare class AIService {
    private genAI;
    constructor();
    generateRoadmap(userId: string, quizAnswers: any): Promise<{
        title: string;
        description: string;
        nodes: {
            id: string;
            title: string;
            description: string;
            estimatedWeeks: number;
            difficulty: string;
            recommendedProblems: string[];
        }[];
    }>;
    generateMockInterviewFeedback(userId: string, submissionId: string): Promise<{
        feedback: string;
        chatHistory?: undefined;
        historyId?: undefined;
    } | {
        feedback: string;
        chatHistory: {
            role: string;
            text: string;
        }[];
        historyId: string;
    }>;
    chatMockInterview(userId: string, historyId: string, message: string): Promise<{
        chatHistory: any[];
    }>;
    explainFailure(userId: string, submissionId: string): Promise<{
        explanation: string;
    }>;
    getHistory(userId: string): Promise<{
        id: string;
        created_at: Date;
        user_id: string;
        type: string;
        input: string;
        output: string;
    }[]>;
    private getSimulatedInterviewerFeedback;
}
export declare const aiService: AIService;
