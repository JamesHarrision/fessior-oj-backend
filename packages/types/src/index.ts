// Định nghĩa các Enums dùng chung
export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export enum SubmissionStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  ACCEPTED = 'ACCEPTED',
  WA = 'WA',
  TLE = 'TLE',
  MLE = 'MLE',
  RE = 'RE',
  CE = 'CE'
}

export enum LanguageSlug {
  CPP17 = 'cpp17',
  JAVA21 = 'java21',
  PYTHON3 = 'python3'
}

export enum ProblemDifficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

export interface QueueJobPayload {
  submissionId: string;
  code: string;
  language: LanguageSlug;
  testcases: any[];
  timeLimit: number;
  memoryLimit: number;
}
