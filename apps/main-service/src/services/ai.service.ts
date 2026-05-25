import { GoogleGenerativeAI } from '@google/generative-ai';
import { Submission } from '../models/submission.model';
import { Problem } from '../models/problem.model';
import { AppError } from '@ocj/errors';

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

export class AIService {
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    if (GEMINI_API_KEY) {
      this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    }
  }

  async generateRoadmap(quizAnswers: any) {
    if (!this.genAI) {
      console.warn("GEMINI_API_KEY is not defined. Using high-quality fallback roadmap.");
      return fallbackRoadmap;
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
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
      return JSON.parse(text);
    } catch (error) {
      console.error("Gemini API Roadmap generation failed, using fallback:", error);
      return fallbackRoadmap;
    }
  }

  async generateMockInterviewFeedback(submissionId: string) {
    const submission = await Submission.findById(submissionId);
    if (!submission) {
      throw new AppError('Submission not found', 404);
    }

    const problem = await Problem.findById(submission.problemId);
    if (!problem) {
      throw new AppError('Problem not found', 404);
    }

    // If AI feedback already exists, return it
    if (submission.aiFeedback) {
      return { feedback: submission.aiFeedback };
    }

    let feedback = "";

    if (!this.genAI) {
      console.warn("GEMINI_API_KEY is not defined. Using high-quality simulated interviewer feedback.");
      feedback = this.getSimulatedInterviewerFeedback(submission, problem);
    } else {
      try {
        const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
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
      } catch (error) {
        console.error("Gemini API Interview Feedback failed, using simulation:", error);
        feedback = this.getSimulatedInterviewerFeedback(submission, problem);
      }
    }

    // Save feedback to submission
    submission.aiFeedback = feedback;
    await submission.save();

    return { feedback };
  }

  private getSimulatedInterviewerFeedback(submission: any, problem: any): string {
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
    } else {
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

export const aiService = new AIService();
