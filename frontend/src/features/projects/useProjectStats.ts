import { useMemo } from 'react';
import { useProjects } from './useProjects';

export interface ProjectStatusStat { status: string; count: number; pct: number }

export function useProjectStats(){
  const { data, isLoading, error } = useProjects();
  const stats = useMemo(()=>{
    const list = data?.projects || [];
    const total = list.length || 0;
    const byStatus: Record<string, number> = {};
    list.forEach(p => { byStatus[p.status] = (byStatus[p.status]||0)+1; });
    const rows: ProjectStatusStat[] = Object.entries(byStatus).map(([status,count])=> ({ status, count, pct: total? +(count*100/total).toFixed(1): 0 }));
    rows.sort((a,b)=> b.count - a.count);
    return { total, rows };
  }, [data]);
  return { stats, isLoading, error };
}
