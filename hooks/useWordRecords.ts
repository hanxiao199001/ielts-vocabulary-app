import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { LearnStatus } from '@/types';

export interface WordRecordData {
  id: string;
  word_id: number;
  status: LearnStatus;
  last_review_date: string;
  next_review_date: string | null;
  review_count: number;
}

export interface WordRecordStats {
  total: number;
  new: number;
  learning: number;
  familiar: number;
  mastered: number;
}

export function useWordRecords() {
  const { data: session, status } = useSession();
  const [records, setRecords] = useState<Record<number, WordRecordData>>({});
  const [stats, setStats] = useState<WordRecordStats>({
    total: 0,
    new: 0,
    learning: 0,
    familiar: 0,
    mastered: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all word records
  const fetchRecords = useCallback(async () => {
    if (status !== 'authenticated') {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/word-records');

      if (!response.ok) {
        throw new Error('Failed to fetch records');
      }

      const data = await response.json();

      // Convert array to map for easier lookup
      const recordsMap: Record<number, WordRecordData> = {};
      data.records.forEach((record: WordRecordData) => {
        recordsMap[record.word_id] = record;
      });

      setRecords(recordsMap);
      setStats(data.stats);
      setError(null);
    } catch (err) {
      console.error('Error fetching word records:', err);
      setError('加载学习记录失败');
    } finally {
      setLoading(false);
    }
  }, [status]);

  // Update word record
  const updateRecord = useCallback(
    async (wordId: number, status: LearnStatus, nextReviewDate?: string) => {
      if (!session) return;

      try {
        const response = await fetch('/api/word-records', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            wordId,
            status,
            nextReviewDate,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update record');
        }

        const data = await response.json();

        // Update local state
        setRecords((prev) => ({
          ...prev,
          [wordId]: data.record,
        }));

        // Refetch to update stats
        await fetchRecords();
      } catch (err) {
        console.error('Error updating word record:', err);
        throw err;
      }
    },
    [session, fetchRecords]
  );

  // Get record for specific word
  const getRecord = useCallback(
    (wordId: number): WordRecordData | null => {
      return records[wordId] || null;
    },
    [records]
  );

  // Load records on mount
  useEffect(() => {
    if (status === 'authenticated') {
      fetchRecords();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status, fetchRecords]);

  return {
    records,
    stats,
    loading,
    error,
    updateRecord,
    getRecord,
    refetch: fetchRecords,
  };
}
