export type RoadmapSkillLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export type RoadmapDifficulty = "EASY" | "MEDIUM" | "HARD";

export interface RoadmapRequest {
  skillLevel: RoadmapSkillLevel;
  focusArea?: string;
  goals?: string;
}

export interface RoadmapNode {
  id: string;
  title: string;
  description: string;
  estimatedWeeks: number;
  difficulty: RoadmapDifficulty;
  recommendedProblems: string[];
}

export interface GeneratedRoadmap {
  title: string;
  description: string;
  nodes: RoadmapNode[];
}

export interface RoadmapResponse {
  status: string;
  data: GeneratedRoadmap;
}

export interface SavedRoadmap extends GeneratedRoadmap {
  id: string;
  createdAt: number;
  skillLevel: RoadmapSkillLevel;
  focusArea: string;
  goals: string;
  completedProblemIds: string[];
}
