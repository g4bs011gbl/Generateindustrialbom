export interface SavedProject {
  id: string;
  name: string;
  timestamp: number;
  dimensions: {
    comprimento: number;
    largura: number;
    altura: number;
  };
  selectedSheet: number;
  notes?: string;
}

const STORAGE_KEY = 'nesting_projects';

export function saveProject(project: Omit<SavedProject, 'id' | 'timestamp'>): SavedProject {
  const newProject: SavedProject = {
    ...project,
    id: Date.now().toString(),
    timestamp: Date.now(),
  };

  const projects = getAllProjects();
  projects.unshift(newProject);
  
  // Limitar a 50 projetos
  const limitedProjects = projects.slice(0, 50);
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedProjects));
  return newProject;
}

export function getAllProjects(): SavedProject[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Erro ao carregar projetos:', error);
    return [];
  }
}

export function getProject(id: string): SavedProject | null {
  const projects = getAllProjects();
  return projects.find((p) => p.id === id) || null;
}

export function deleteProject(id: string): void {
  const projects = getAllProjects();
  const filtered = projects.filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function updateProject(id: string, updates: Partial<SavedProject>): void {
  const projects = getAllProjects();
  const updated = projects.map((p) =>
    p.id === id ? { ...p, ...updates } : p
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function clearAllProjects(): void {
  localStorage.removeItem(STORAGE_KEY);
}
