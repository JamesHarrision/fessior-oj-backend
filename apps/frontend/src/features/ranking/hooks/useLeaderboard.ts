import { useState, useEffect, useCallback } from "react";
import { LeaderboardFilters, LeaderboardPeriod, LeaderboardResponse } from "../types/ranking.types";
import { fetchLeaderboard } from "../api/rankingApi";

interface UseLeaderboardResult {
  data: LeaderboardResponse | null;
  loading: boolean;
  error: string | null;
  filters: LeaderboardFilters;
  setPeriod: (period: LeaderboardPeriod) => void;
  setPage: (page: number) => void;
}

const DEFAULT_FILTERS: LeaderboardFilters = {
  page: 1,
  limit: 10,
  period: "all",
};

export function useLeaderboard(): UseLeaderboardResult {
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<LeaderboardFilters>(DEFAULT_FILTERS);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetchLeaderboard(filters)
      .then((res) => {
        if (!cancelled) {
          setData(res);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [filters]);

  const setPeriod = useCallback((period: LeaderboardPeriod) => {
    setFilters((f) => ({ ...f, period, page: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setFilters((f) => ({ ...f, page }));
  }, []);

  return { data, loading, error, filters, setPeriod, setPage };
}
