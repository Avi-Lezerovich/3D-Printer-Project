import { apiClient } from '../../core/api/client';

export interface RuntimeMetrics {
  reqTotal: number;
  reqActive: number;
  memoryRss: number;
  cache?: Record<string, unknown>;
  cleanup?: Record<string, unknown>;
  fetchedAt: number;
}

export async function fetchRuntimeMetrics(): Promise<RuntimeMetrics> {
  const data = await apiClient.get<Omit<RuntimeMetrics, 'fetchedAt'>>('/api/metrics');
  return { ...data, fetchedAt: Date.now() };
}
