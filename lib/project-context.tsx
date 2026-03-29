"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { listProjects, type Project } from "@/lib/services";

const STORAGE_KEY = "restflow-selected-project-id";

interface ProjectContextValue {
  projects: Project[];
  selectedProject: Project | null;
  selectProject: (project: Project) => void;
  isLoading: boolean;
  refreshProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

export function ProjectProvider({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      const { content } = await listProjects(0, 100);
      setProjects(content);

      const savedId = localStorage.getItem(STORAGE_KEY);
      const saved = savedId
        ? content.find((p) => p.id === savedId)
        : undefined;

      if (saved) {
        setSelectedProject(saved);
      } else if (content.length > 0) {
        setSelectedProject(content[0]);
        localStorage.setItem(STORAGE_KEY, content[0].id);
      }
    } catch {
      // Projects may not be available yet
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const selectProject = useCallback((project: Project) => {
    setSelectedProject(project);
    localStorage.setItem(STORAGE_KEY, project.id);
  }, []);

  const value = useMemo(
    () => ({
      projects,
      selectedProject,
      selectProject,
      isLoading,
      refreshProjects: fetchProjects,
    }),
    [projects, selectedProject, selectProject, isLoading, fetchProjects],
  );

  return (
    <ProjectContext value={value}>
      {children}
    </ProjectContext>
  );
}

export function useProject(): ProjectContextValue {
  const ctx = useContext(ProjectContext);
  if (!ctx) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return ctx;
}
