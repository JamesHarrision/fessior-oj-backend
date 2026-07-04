import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@ocj/api';
import { problemRepository } from '../../../app/api/client';
import type { IProblem, ITag } from '@ocj/types';

/** Unwraps ApiResponse<T> shape: { status, message, data } → data | [] */
function unwrapProblems(raw: unknown): IProblem[] {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object' && 'data' in raw) {
    const d = (raw as Record<string, unknown>).data;
    return Array.isArray(d) ? (d as IProblem[]) : [];
  }
  return [];
}

function unwrapTags(raw: unknown): ITag[] {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object' && 'data' in raw) {
    const d = (raw as Record<string, unknown>).data;
    return Array.isArray(d) ? (d as ITag[]) : [];
  }
  return [];
}

export function useProblems() {
  const problemsQuery = useQuery({
    queryKey: queryKeys.problems.all,
    queryFn: () => problemRepository.getProblems(),
    staleTime: 30_000,
    select: unwrapProblems,
  });

  const tagsQuery = useQuery({
    queryKey: queryKeys.problems.tags,
    queryFn: () => problemRepository.getTags(),
    staleTime: 60_000,
    select: unwrapTags,
  });

  return {
    problems: problemsQuery.data ?? [],
    tags: tagsQuery.data ?? [],
    isLoading: problemsQuery.isLoading || tagsQuery.isLoading,
    isError: problemsQuery.isError || tagsQuery.isError,
    error: problemsQuery.error ?? tagsQuery.error,
    refetch: () => {
      problemsQuery.refetch();
      tagsQuery.refetch();
    },
  };
}
