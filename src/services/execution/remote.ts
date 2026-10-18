import type { CodeExecutor, ExecutionRequest, ExecutionResponse, ExecutorHealth } from './types';

export const REQUEST_TIMEOUT_MS = 30_000;

export class ExecutorError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'ExecutorError';
  }
}

function withTimeout(signal: AbortSignal | undefined, ms: number): { signal: AbortSignal; cancel: () => void } {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  signal?.addEventListener('abort', () => controller.abort());
  return { signal: controller.signal, cancel: () => clearTimeout(timer) };
}

function trimSlash(url: string) {
  return url.replace(/\/+$/, '');
}

export async function fetchExecutorHealth(baseUrl: string): Promise<ExecutorHealth> {
  const { signal, cancel } = withTimeout(undefined, 5_000);
  try {
    const res = await fetch(`${trimSlash(baseUrl)}/api/v1/health`, { signal });
    if (!res.ok) return { status: 'DOWN' };
    return (await res.json()) as ExecutorHealth;
  } catch {
    return { status: 'DOWN' };
  } finally {
    cancel();
  }
}

export function createRemoteExecutor(baseUrl: string): CodeExecutor {
  return {
    mode: 'remote',
    async execute(request: ExecutionRequest, outer?: AbortSignal): Promise<ExecutionResponse> {
      const { signal, cancel } = withTimeout(outer, REQUEST_TIMEOUT_MS);
      try {
        const res = await fetch(`${trimSlash(baseUrl)}/api/v1/executions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request),
          signal,
        });
        if (res.status === 429) throw new ExecutorError('Too many runs in a short time. Wait a few seconds and try again.', 429);
        if (!res.ok) {
          let detail = '';
          try {
            const body = (await res.json()) as { message?: string };
            detail = body.message ?? '';
          } catch {
            // body was not JSON
          }
          throw new ExecutorError(detail || `Execution service returned HTTP ${res.status}.`, res.status);
        }
        const body = (await res.json()) as Omit<ExecutionResponse, 'mode'>;
        return { ...body, mode: 'remote' };
      } catch (e) {
        if (e instanceof ExecutorError) throw e;
        if ((e as Error).name === 'AbortError') throw new ExecutorError('The execution service did not respond in time.');
        throw new ExecutorError('Could not reach the execution service. Check your connection or switch to simulation mode.');
      } finally {
        cancel();
      }
    },
  };
}
