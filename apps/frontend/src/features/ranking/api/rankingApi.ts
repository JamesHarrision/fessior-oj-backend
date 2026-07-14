import type { LeaderboardFilters, LeaderboardResponse } from "../types/ranking.types";
import { mockLeaderboard } from "../data/rankingMock";

// ─── Toggle giữa mock và API thật ────────────────────────────────────────────
const USE_MOCK = true;

const API_BASE = import.meta.env.REACT_APP_API_URL ?? "http://localhost:8080/api/v1";

// ─── API thật ─────────────────────────────────────────────────────────────────
async function fetchLeaderboardFromApi(filters: LeaderboardFilters): Promise<LeaderboardResponse> {
  const params = new URLSearchParams();
  params.set("page", String(filters.page));
  params.set("limit", String(filters.limit));
  params.set("period", filters.period);

  const res = await fetch(`${API_BASE}/leaderboard?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch leaderboard");
  const json = await res.json();
  return json.data as LeaderboardResponse;
}

// ─── Mock ─────────────────────────────────────────────────────────────────────
async function fetchLeaderboardMock(_filters: LeaderboardFilters): Promise<LeaderboardResponse> {
  return new Promise((resolve) =>
    setTimeout(() => resolve(mockLeaderboard), 400)
  );
}

// ─── Exports ──────────────────────────────────────────────────────────────────
export async function fetchLeaderboard(filters: LeaderboardFilters): Promise<LeaderboardResponse> {
  return USE_MOCK ? fetchLeaderboardMock(filters) : fetchLeaderboardFromApi(filters);
}
