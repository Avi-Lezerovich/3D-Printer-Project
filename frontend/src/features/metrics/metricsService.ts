import { apiClient } from '../../core/api/client';

export interface RuntimeMetrics {
  reqTotal: number;
  reqActive: number;
  memoryRss: number;
  cache?: any;
  cleanup?: any;
  fetchedAt: number;
}

export async function fetchRuntimeMetrics(): Promise<RuntimeMetrics> {
  const data = await apiClient.get<Omit<RuntimeMetrics, 'fetchedAt'>>('/api/metrics');
  return { ...data, fetchedAt: Date.now() };
}
