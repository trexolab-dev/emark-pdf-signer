import { createContext, useContext, type ReactNode } from 'react';

/**
 * Static app metadata - no GitHub API calls
 * Update these values manually when releasing new versions
 */
const STATIC_APP_DATA = {
  version: 'v1.0.0',
  releaseDate: '2025',
} as const;

interface GitHubStatsContextType {
  version: string | null;
  releaseDate: string | null;
  loading: boolean;
}

const GitHubStatsContext = createContext<GitHubStatsContextType | undefined>(undefined);

export function GitHubStatsProvider({ children }: { children: ReactNode }) {
  // Use static values instead of fetching from GitHub API
  const stats: GitHubStatsContextType = {
    version: STATIC_APP_DATA.version,
    releaseDate: STATIC_APP_DATA.releaseDate,
    loading: false,
  };

  return (
    <GitHubStatsContext.Provider value={stats}>
      {children}
    </GitHubStatsContext.Provider>
  );
}

export function useGitHubStats() {
  const context = useContext(GitHubStatsContext);
  if (context === undefined) {
    throw new Error('useGitHubStats must be used within a GitHubStatsProvider');
  }
  return context;
}
