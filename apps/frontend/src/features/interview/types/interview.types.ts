export type InterviewTopic =
  | "algorithms"
  | "data-structures"
  | "system-design"
  | "behavioral"
  | "frontend"
  | "backend"
  | "database";

export type InterviewDifficulty = "easy" | "medium" | "hard";

export interface InterviewMessage {
  id: string;
  role: "interviewer" | "candidate";
  content: string;
  timestamp: number;
}

export interface InterviewConfig {
  topic: InterviewTopic;
  difficulty: InterviewDifficulty;
  numQuestions: number;
  duration: number;
}

export interface QuestionEvaluation {
  questionIndex: number;
  question: string;
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

export interface InterviewReport {
  config: InterviewConfig;
  totalScore: number;
  duration: number;
  evaluations: QuestionEvaluation[];
  overallFeedback: string;
  skillBreakdown: { label: string; score: number }[];
  recommendation: "strong-hire" | "hire" | "no-hire";
}

export interface InterviewSession {
  id: string;
  config: InterviewConfig;
  problems: any[];
  messages: InterviewMessage[];
  currentQuestionIndex: number;
  isCompleted: boolean;
  startTime: number;
}