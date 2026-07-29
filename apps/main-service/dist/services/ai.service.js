"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiService = exports.AIService = void 0;
const generative_ai_1 = require("@google/generative-ai");
const submission_model_1 = require("../models/submission.model");
const problem_model_1 = require("../models/problem.model");
const errors_1 = require("@ocj/errors");
const prisma_1 = require("../config/prisma");
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
// Fallback high-quality roadmap JSON
const fallbackRoadmap = {
    title: "Personalized DSA Roadmap",
    description: "A structured path generated based on your current knowledge profile.",
    nodes: [
        {
            id: "node-1",
            title: "Arrays & Hashing",
            description: "Understand memory layout, dynamic resizing, and O(1) hash maps.",
            estimatedWeeks: 1,
            difficulty: "EASY",
            recommendedProblems: ["two-sum", "contains-duplicate", "valid-anagram"]
        },
        {
            id: "node-2",
            title: "Two Pointers & Sliding Window",
            description: "Optimize O(N^2) subarray/substring problems to O(N) linear scan.",
            estimatedWeeks: 2,
            difficulty: "EASY",
            recommendedProblems: ["valid-palindrome", "two-sum-ii-input-array-is-sorted", "longest-substring-without-repeating-characters"]
        },
        {
            id: "node-3",
            title: "Stack & Queue",
            description: "Learn FIFO/LIFO structures and Monotonic Stack patterns.",
            estimatedWeeks: 1,
            difficulty: "MEDIUM",
            recommendedProblems: ["valid-parentheses", "min-stack", "daily-temperatures"]
        },
        {
            id: "node-4",
            title: "Trees & Binary Search Trees",
            description: "Master tree traversals (DFS/BFS) and recursion logic.",
            estimatedWeeks: 2,
            difficulty: "MEDIUM",
            recommendedProblems: ["maximum-depth-of-binary-tree", "invert-binary-tree", "validate-binary-search-tree"]
        },
        {
            id: "node-5",
            title: "Dynamic Programming (DP)",
            description: "Break complex problems down into overlapping subproblems using memoization or tabulation.",
            estimatedWeeks: 3,
            difficulty: "HARD",
            recommendedProblems: ["climbing-stairs", "coin-change", "longest-common-subsequence"]
        }
    ]
};
class AIService {
    genAI = null;
    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (apiKey) {
            this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
        }
        else {
            this.genAI = null; // [MOCK MODE] if no API key
        }
    }
    async generateRoadmap(userId, quizAnswers) {
        let roadmapData = fallbackRoadmap;
        if (!this.genAI) {
            console.warn("GEMINI_API_KEY is not defined. Using high-quality fallback roadmap.");
        }
        else {
            try {
                const model = this.genAI.getGenerativeModel({
                    model: 'gemini-2.5-flash',
                    generationConfig: { responseMimeType: 'application/json' },
                });
                const prompt = `
          You are an expert algorithms coach.
          Based on the user's questionnaire or skill answers below:
          ${JSON.stringify(quizAnswers)}

          Generate a personalized DSA learning roadmap in JSON format.
          The JSON structure MUST follow this exact schema:
          {
            "title": "Roadmap Title",
            "description": "Short description of the roadmap",
            "nodes": [
              {
                "id": "node-1",
                "title": "Topic Name",
                "description": "What to learn and why",
                "estimatedWeeks": 2,
                "difficulty": "EASY" | "MEDIUM" | "HARD",
                "recommendedProblems": ["slug-1", "slug-2"]
              }
            ]
          }
        `;
                const result = await model.generateContent(prompt);
                const text = result.response.text();
                roadmapData = JSON.parse(text);
            }
            catch (error) {
                console.error("Gemini API Roadmap generation failed, using fallback:", error);
            }
        }
        // Save to history
        await prisma_1.prisma.aiHistory.create({
            data: {
                user_id: userId,
                type: 'ROADMAP',
                input: JSON.stringify(quizAnswers),
                output: JSON.stringify(roadmapData),
            }
        });
        return roadmapData;
    }
    async generateMockInterviewFeedback(userId, submissionId) {
        const submission = await submission_model_1.Submission.findById(submissionId);
        if (!submission) {
            throw new errors_1.AppError('Submission not found', 404);
        }
        const problem = await problem_model_1.Problem.findById(submission.problemId);
        if (!problem) {
            throw new errors_1.AppError('Problem not found', 404);
        }
        // If AI feedback already exists, return it
        if (submission.aiFeedback) {
            return { feedback: submission.aiFeedback };
        }
        let feedback = "";
        if (!this.genAI) {
            console.warn("GEMINI_API_KEY is not defined. Using high-quality simulated interviewer feedback.");
            feedback = this.getSimulatedInterviewerFeedback(submission, problem);
        }
        else {
            try {
                const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
                const prompt = `
          You are a professional software engineer conducting a mock coding interview.
          The candidate is solving the problem "${problem.title}".
          Problem Description:
          ${problem.description}

          Candidate's Code (${submission.language}):
          \`\`\`${submission.language}
          ${submission.code}
          \`\`\`

          Submission Status: ${submission.status}
          Test Cases Passed: ${submission.testCasesPassed} / ${submission.testCasesTotal}

          Provide feedback on:
          1. Code Correctness and potential edge case issues.
          2. Time Complexity analysis.
          3. Space Complexity analysis.
          4. Areas of improvement and coding best practices.
          Keep the tone constructive and professional.
        `;
                const result = await model.generateContent(prompt);
                feedback = result.response.text();
            }
            catch (error) {
                console.error("Gemini API Interview Feedback failed, using simulation:", error);
                feedback = this.getSimulatedInterviewerFeedback(submission, problem);
            }
        }
        // Prepare chat history
        const chatHistory = [
            { role: 'model', text: feedback }
        ];
        const historyString = JSON.stringify(chatHistory);
        // Save feedback to submission
        submission.aiFeedback = historyString;
        await submission.save();
        // Save to history
        const historyItem = await prisma_1.prisma.aiHistory.create({
            data: {
                user_id: userId,
                type: 'INTERVIEW',
                input: `Submission ID: ${submissionId} for Problem: ${problem.title}`,
                output: historyString,
            }
        });
        return { feedback, chatHistory, historyId: historyItem.id };
    }
    async chatMockInterview(userId, historyId, message) {
        const historyItem = await prisma_1.prisma.aiHistory.findUnique({
            where: { id: historyId }
        });
        if (!historyItem || historyItem.user_id !== userId || historyItem.type !== 'INTERVIEW') {
            throw new errors_1.AppError('Interview history not found', 404);
        }
        let chatHistory = [];
        try {
            chatHistory = JSON.parse(historyItem.output);
        }
        catch {
            // Legacy string format fallback
            chatHistory = [{ role: 'model', text: historyItem.output }];
        }
        let modelResponseText = "";
        if (!this.genAI) {
            modelResponseText = "Xin lỗi, hiện tại AI Mentor đang ở chế độ offline. Không thể tiếp tục hội thoại.";
        }
        else {
            try {
                const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
                // Convert to Gemini history format
                const geminiHistory = chatHistory.map(msg => ({
                    role: msg.role === 'model' ? 'model' : 'user',
                    parts: [{ text: msg.text }]
                }));
                const chatSession = model.startChat({
                    history: geminiHistory
                });
                const result = await chatSession.sendMessage(message);
                modelResponseText = result.response.text();
            }
            catch (error) {
                console.error("Gemini API Chat failed:", error);
                modelResponseText = "Lỗi hệ thống AI. Vui lòng thử lại sau.";
            }
        }
        // Append to history
        chatHistory.push({ role: 'user', text: message });
        chatHistory.push({ role: 'model', text: modelResponseText });
        const newHistoryString = JSON.stringify(chatHistory);
        // Update history in DB
        await prisma_1.prisma.aiHistory.update({
            where: { id: historyId },
            data: { output: newHistoryString }
        });
        return { chatHistory };
    }
    async explainFailure(userId, submissionId) {
        const submission = await submission_model_1.Submission.findById(submissionId);
        if (!submission) {
            throw new errors_1.AppError('Submission not found', 404);
        }
        if (submission.status === 'ACCEPTED') {
            throw new errors_1.AppError('Submission is already ACCEPTED. No need to debug.', 400);
        }
        const problem = await problem_model_1.Problem.findById(submission.problemId);
        if (!problem) {
            throw new errors_1.AppError('Problem not found', 404);
        }
        let explanation = "";
        if (!this.genAI) {
            console.warn("GEMINI_API_KEY is not defined. Using mock explanation.");
            explanation = `### 🤖 AI Mentor Debug Assistant\n\n**1. Nhận diện lỗi:**\nCode của bạn gặp lỗi **${submission.status}**. Có vẻ như bạn chưa xử lý hết các edge case hoặc có vòng lặp vô hạn.\n\n**2. Gợi ý sửa đổi:**\nHãy kiểm tra lại điều kiện dừng của vòng lặp hoặc các trường hợp null/empty input. Đừng quên phân tích kỹ giới hạn dữ liệu nhé!`;
        }
        else {
            try {
                const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
                const prompt = `
          You are an expert programming mentor. The user submitted code for the problem "${problem.title}" but it failed.
          
          Problem Description:
          ${problem.description}
          
          User's Code (${submission.language}):
          \`\`\`${submission.language}
          ${submission.code}
          \`\`\`
          
          Execution Status: ${submission.status}
          Error Message / Output: ${submission.errorMessage || 'No specific error message.'}
          Test Cases Passed: ${submission.testCasesPassed} / ${submission.testCasesTotal}
          
          Please do the following:
          1. Briefly explain why the code failed (e.g. what the bug is).
          2. Point out the specific line or logic that is incorrect.
          3. Provide a helpful hint on how to fix it.
          4. IMPORTANT: DO NOT provide the fully corrected code. The goal is to guide the user to solve it themselves.
          Format your response in Markdown and use Vietnamese language. Keep it encouraging and concise.
        `;
                const result = await model.generateContent(prompt);
                explanation = result.response.text();
            }
            catch (error) {
                console.error("Gemini API Debug generation failed:", error);
                explanation = `Lỗi hệ thống AI khi phân tích code. Vui lòng thử lại sau. (Error: ${error})`;
            }
        }
        // Save to history
        await prisma_1.prisma.aiHistory.create({
            data: {
                user_id: userId,
                type: 'DEBUG',
                input: `Submission ID: ${submissionId} for Problem: ${problem.title}`,
                output: explanation,
            }
        });
        return { explanation };
    }
    async getHistory(userId) {
        return prisma_1.prisma.aiHistory.findMany({
            where: { user_id: userId },
            orderBy: { created_at: 'desc' },
            take: 20
        });
    }
    getSimulatedInterviewerFeedback(submission, problem) {
        const isAccepted = submission.status === 'ACCEPTED';
        if (isAccepted) {
            return `### 🎙️ AI Mock Interviewer Feedback for ${problem.title}

**1. Code Correctness & Edge Cases:**
* Your solution is **correct** and passed all test cases.
* Great job handling typical boundary conditions (empty inputs, single element, negative numbers).

**2. Complexity Analysis:**
* **Time Complexity:** O(N) where N is the input size. This is optimal because you scan the collection in a single pass.
* **Space Complexity:** O(N) or O(1) depending on language structures. 

**3. Suggestions for Improvement:**
* Code readability is clean. You can add modular comments for complex segments.
* Consider variable renaming to match descriptive naming conventions (e.g. self-explanatory names instead of single-character variables).`;
        }
        else {
            return `### 🎙️ AI Mock Interviewer Feedback for ${problem.title}

**1. Code Correctness & Edge Cases:**
* Your solution failed with status **${submission.status}**.
* Only **${submission.testCasesPassed}/${submission.testCasesTotal}** test cases passed.
* Potential issues include logical bugs, infinite recursion, or unhandled null cases.

**2. Complexity Analysis:**
* **Time/Space Complexity:** Hard to measure accurately due to errors or timeouts.

**3. Suggestions for Improvement:**
* Trace your code manually with a small test input.
* Double-check standard DSA patterns (e.g. correct bounds check in loop, base cases in recursion).`;
        }
    }
}
exports.AIService = AIService;
exports.aiService = new AIService();
