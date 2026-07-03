// Định nghĩa các Enums dùng chung dưới dạng const object để tương thích với erasableSyntaxOnly
export const Role = {
  USER: 'USER',
  ADMIN: 'ADMIN'
} as const;
export type Role = typeof Role[keyof typeof Role];

export const SubmissionStatus = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  ACCEPTED: 'ACCEPTED',
  WA: 'WA',
  TLE: 'TLE',
  MLE: 'MLE',
  RE: 'RE',
  CE: 'CE'
} as const;
export type SubmissionStatus = typeof SubmissionStatus[keyof typeof SubmissionStatus];

export const LanguageSlug = {
  CPP17: 'cpp17',
  JAVA21: 'java21',
  PYTHON3: 'python3'
} as const;
export type LanguageSlug = typeof LanguageSlug[keyof typeof LanguageSlug];

export const ProblemDifficulty = {
  EASY: 'EASY',
  MEDIUM: 'MEDIUM',
  HARD: 'HARD'
} as const;
export type ProblemDifficulty = typeof ProblemDifficulty[keyof typeof ProblemDifficulty];

export interface QueueJobPayload {
  submissionId: string;
  code: string;
  language: LanguageSlug;
  testcases: any[];
  timeLimit: number;
  memoryLimit: number;
}

// Định nghĩa các Entity Interfaces dùng chung
export interface IUser {
  id: string;
  userId?: string;
  username: string;
  email?: string;
  role: Role | 'USER' | 'ADMIN';
  elo_rating?: number;
  eloRating?: number;
  streak_count?: number;
  streakCount?: number;
  max_streak?: number;
  maxStreak?: number;
  avatar_url?: string;
  avatarUrl?: string;
}

export interface IProblem {
  id?: string;
  _id?: string;
  mongo_problem_id?: string;
  title: string;
  slug: string;
  description: string;
  difficulty: ProblemDifficulty | 'EASY' | 'MEDIUM' | 'HARD';
  timeLimit?: number;
  memoryLimit?: number;
  tags?: any[];
  starterCodes?: {
    cpp?: string;
    java?: string;
    python?: string;
    [key: string]: string | undefined;
  };
}

export interface ISubmission {
  id?: string;
  _id?: string;
  problemId: string;
  userId: string;
  code: string;
  language: LanguageSlug | 'python' | 'cpp' | 'java';
  status: SubmissionStatus | 'PENDING' | 'PROCESSING' | 'ACCEPTED' | 'WA' | 'TLE' | 'MLE' | 'RE' | 'CE' | 'ERROR';
  errorMessage?: string;
  testCasesPassed?: number;
  testCasesTotal?: number;
  timeLimit?: number;
  memoryLimit?: number;
  aiFeedback?: string;
  createdAt?: string | Date;
}

export interface ICustomRoom {
  id: string;
  room_code: string;
  creator_id: string;
  opponent_id?: string | null;
  status: 'WAITING' | 'PLAYING' | 'FINISHED';
  difficulty?: ProblemDifficulty | 'EASY' | 'MEDIUM' | 'HARD' | null;
  time_limit?: number;
  memory_limit?: number;
  creator?: IUser;
  opponent?: IUser | null;
  match_id?: string | null;
  problem_id?: string | null;
}

export interface IMatch {
  id: string;
  player1_id: string;
  player2_id: string;
  problem_id: string;
  status: 'PENDING' | 'PLAYING' | 'FINISHED';
  winner_id?: string | null;
  started_at?: string | Date;
  ended_at?: string | Date | null;
  player1?: IUser;
  player2?: IUser;
  problem?: IProblem;
}

export interface IContest {
  id: string;
  title: string;
  description?: string | null;
  start_time: string | Date;
  end_time: string | Date;
  problems?: any[];
  registrations?: any[];
}

export interface IReport {
  id: string;
  userId: string;
  problemId?: string | null;
  type: 'BUG' | 'SUGGESTION' | 'OTHER';
  content: string;
  status: 'PENDING' | 'RESOLVED' | 'REJECTED';
  createdAt?: string | Date;
}
