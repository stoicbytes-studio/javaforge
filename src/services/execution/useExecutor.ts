import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { env } from '@/services/env';
import { useLearningStore } from '@/store/learningStore';
import { createRemoteExecutor, fetchExecutorHealth } from './remote';
import { simulationExecutor } from './simulation';
import type { CodeExecutor, ExecutionRequest, ExecutorHealth } from './types';

export interface ExecutorState {
  executor: CodeExecutor;
  health?: ExecutorHealth;
  checking: boolean;
  /** Why simulation is being used, if it is. */
  reason?: string;
  url?: string;
}

/**
 * Picks the executor according to settings:
 * - simulation: always simulate
 * - remote: always call the configured service (errors are shown, never hidden)
 * - auto: use the service when it reports healthy, otherwise simulate
 */
export function useExecutor(): ExecutorState {
  const mode = useLearningStore((s) => s.settings.executionMode);
  const override = useLearningStore((s) => s.settings.executorUrl);
  const url = (override || env.executorUrl).trim();

  const health = useQuery({
    queryKey: ['executor-health', url],
    queryFn: () => fetchExecutorHealth(url),
    enabled: url.length > 0 && mode !== 'simulation',
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  return useMemo<ExecutorState>(() => {
    if (mode === 'simulation') {
      return { executor: simulationExecutor, checking: false, reason: 'Simulation mode is selected in Settings.' };
    }
    if (!url) {
      return { executor: simulationExecutor, checking: false, reason: 'No execution service is configured for this build.' };
    }
    if (mode === 'remote') {
      return { executor: createRemoteExecutor(url), health: health.data, checking: health.isLoading, url };
    }
    if (health.data?.status === 'UP') {
      return { executor: createRemoteExecutor(url), health: health.data, checking: false, url };
    }
    return {
      executor: simulationExecutor,
      health: health.data,
      checking: health.isLoading,
      url,
      reason: health.isLoading ? 'Checking the execution service…' : 'The execution service is not reachable right now.',
    };
  }, [mode, url, health.data, health.isLoading]);
}

export function useRunCode(executor: CodeExecutor) {
  return useMutation({
    mutationFn: (request: ExecutionRequest) => executor.execute(request),
  });
}
