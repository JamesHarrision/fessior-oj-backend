import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@ocj/api';
import { problemRepository } from '../../app/api/client';
import type { IProblem, ITag } from '@ocj/types';

export function useProblems() {
  const problemsQuery = useQuery({
    queryKey: queryKeys.problems.all,
    queryFn: () => problemRepository.getProblems(),
    staleTime: 30_000,
  });

  const tagsQuery = useQuery({
    queryKey: queryKeys.problems.tags,
    queryFn: () => problemRepository.getTags(),
    staleTime: 60_000,
  });

  return {
    problems: (problemsQuery.data ?? []) as IProblem[],
    tags: (tagsQuery.data ?? []) as ITag[],
    isLoading: problemsQuery.isLoading || tagsQuery.isLoading,
    isError: problemsQuery.isError || tagsQuery.isError,
    error: problemsQuery.error ?? tagsQuery.error,
    refetch: () => {
      problemsQuery.refetch();
      tagsQuery.refetch();
    },
  };
}
