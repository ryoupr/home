import { useState, useEffect } from 'react';

interface GitHubStats {
  totalStars: number;
  totalRepos: number;
  loading: boolean;
  error: string | null;
}

export function useGitHubStats(username: string): GitHubStats {
  const [stats, setStats] = useState<GitHubStats>({
    totalStars: 0,
    totalRepos: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!username) {
      setStats(prev => ({ ...prev, loading: false }));
      return;
    }

    async function fetchGitHubStats() {
      try {
        // ユーザーのリポジトリ一覧を取得
        const response = await fetch(
          `https://api.github.com/users/${username}/repos?per_page=100`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch GitHub data');
        }

        const repos = await response.json();

        // スター数の合計を計算
        const totalStars = repos.reduce(
          (sum: number, repo: { stargazers_count: number }) => sum + repo.stargazers_count,
          0
        );

        setStats({
          totalStars,
          totalRepos: repos.length,
          loading: false,
          error: null,
        });
      } catch (error) {
        setStats(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }));
      }
    }

    fetchGitHubStats();
  }, [username]);

  return stats;
}
