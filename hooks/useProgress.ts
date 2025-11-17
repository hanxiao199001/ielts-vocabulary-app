import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

export interface DailyProgress {
  id: string;
  user_id: string;
  date: string;
  words_learned: number;
  words_reviewed: number;
  quiz_passed: number;
  study_time: number;
  current_word_index: number;
  created_at: string;
  updated_at: string;
}

export function useProgress() {
  const { data: session, status } = useSession();
  const [progress, setProgress] = useState<DailyProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch today's progress
  const fetchProgress = useCallback(async () => {
    if (status !== 'authenticated') {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/progress');

      if (!response.ok) {
        throw new Error('Failed to fetch progress');
      }

      const data = await response.json();
      setProgress(data.progress);
      setError(null);
    } catch (err) {
      console.error('Error fetching progress:', err);
      setError('加载学习进度失败');
    } finally {
      setLoading(false);
    }
  }, [status]);

  // Update current word index
  const updateWordIndex = useCallback(
    async (index: number) => {
      if (!session) return;

      try {
        const response = await fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ currentWordIndex: index }),
        });

        if (!response.ok) {
          throw new Error('Failed to update progress');
        }

        const data = await response.json();
        setProgress(data.progress);
      } catch (err) {
        console.error('Error updating word index:', err);
      }
    },
    [session]
  );

  // Update daily stats
  const updateStats = useCallback(
    async (stats: {
      words_learned?: number;
      words_reviewed?: number;
      quiz_passed?: number;
      study_time?: number;
    }) => {
      if (!session) return;

      try {
        const response = await fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stats }),
        });

        if (!response.ok) {
          throw new Error('Failed to update stats');
        }

        const data = await response.json();
        setProgress(data.progress);
      } catch (err) {
        console.error('Error updating stats:', err);
      }
    },
    [session]
  );

  // Get current word index
  const getCurrentWordIndex = useCallback(() => {
    return progress?.current_word_index || 0;
  }, [progress]);

  // Load progress on mount
  useEffect(() => {
    if (status === 'authenticated') {
      fetchProgress();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status, fetchProgress]);

  return {
    progress,
    loading,
    error,
    updateWordIndex,
    updateStats,
    getCurrentWordIndex,
    refetch: fetchProgress,
  };
}
