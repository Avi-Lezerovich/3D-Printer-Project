import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../core/api/client';

interface Project { id: string; name: string; status: string }
interface ProjectsResp { projects: Project[] }

export function useProjects(){
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => apiClient.get<ProjectsResp>('/api/v1/projects'),
  });
}

export function useCreateProject(){
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string }) => apiClient.post<{ project: Project }, { name: string }>('/api/v1/projects', input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['projects'] }); }
  });
}
