import { useEffect, useState } from 'react';

interface GitHubStats {
  totalStars: number;
  totalRepos: number;
  loading: boolean;
  error: string | null;
}

// GitHub API レスポンスの型定義
interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  description: string | null;
  html_url: string;
  private: boolean;
}

const CACHE_TTL = 10 * 60 * 1000; // 10分

function getCached(
  key: string
): { totalStars: number; totalRepos: number } | null {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) {
      sessionStorage.removeItem(key);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function setCache(
  key: string,
  data: { totalStars: number; totalRepos: number }
) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
  } catch {
    // sessionStorage full or unavailable
  }
}

// GitHub URL からユーザー名を抽出するヘルパー関数
export function extractGitHubUsername(urlOrUsername: string): string {
  if (!urlOrUsername) return '';

  // URL の場合はパースしてユーザー名を抽出
  try {
    const url = new URL(urlOrUsername);
    if (url.hostname === 'github.com') {
      const pathParts = url.pathname.split('/').filter(Boolean);
      return pathParts[0] || '';
    }
  } catch {
    // URL でない場合はそのままユーザー名として扱う
  }

  return urlOrUsername;
}

export function useGitHubStats(username: string): GitHubStats {
  const [stats, setStats] = useState<GitHubStats>({
    totalStars: 0,
    totalRepos: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const extractedUsername = extractGitHubUsername(username);

    if (!extractedUsername) {
      setStats((prev) => ({ ...prev, loading: false }));
      return;
    }

    const cacheKey = `gh_stats_${extractedUsername}`;
    const cached = getCached(cacheKey);
    if (cached) {
      setStats({ ...cached, loading: false, error: null });
      return;
    }

    async function fetchGitHubStats() {
      try {
        const response = await fetch(
          `https://api.github.com/users/${extractedUsername}/repos?per_page=100`
        );

        // レート制限のチェック
        if (response.status === 403) {
          const rateLimitRemaining = response.headers.get(
            'X-RateLimit-Remaining'
          );
          if (rateLimitRemaining === '0') {
            throw new Error(
              'GitHub API rate limit exceeded. Please try again later.'
            );
          }
        }

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error(`GitHub user "${extractedUsername}" not found`);
          }
          throw new Error(`Failed to fetch GitHub data: ${response.status}`);
        }

        const repos: GitHubRepository[] = await response.json();

        // スター数の合計を計算
        const totalStars = repos.reduce(
          (sum, repo) => sum + repo.stargazers_count,
          0
        );

        const data = { totalStars, totalRepos: repos.length };
        setCache(cacheKey, data);

        setStats({
          ...data,
          loading: false,
          error: null,
        });
      } catch (error) {
        setStats((prev) => ({
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
