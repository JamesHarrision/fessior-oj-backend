export type LeaderboardPeriod = "all" | "monthly" | "weekly" | "daily";

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  name: string;
  avatar?: string;
  points: number;
  solved: number;
  // extra display info
  tier?: string; // "Grandmaster", "Master", "Diamond", etc.
  tierColor?: string;
}

export interface LeaderboardResponse {
  items: LeaderboardEntry[];
  total: number;
  page: number;
  limit: number;
}

export interface LeaderboardFilters {
  page: number;
  limit: number;
  period: LeaderboardPeriod;
}
