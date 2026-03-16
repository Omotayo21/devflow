import api from './axios';

interface SearchResults {
  tasks: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    project_name: string;
  }>;
  projects: Array<{
    id: string;
    name: string;
    description: string;
    status: string;
  }>;
  total: number;
}

export const searchWorkspace = async (workspaceId: string, query: string): Promise<SearchResults> => {
  const { data } = await api.get(`/workspaces/${workspaceId}/search`, {
    params: { q: query },
  });
  return data.data;
};
