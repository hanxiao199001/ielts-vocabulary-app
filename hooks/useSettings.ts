import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

export interface Settings {
  id: string;
  user_id: string;
  voice_accent: string;
  speech_rate: number;
  daily_goal: number;
  created_at: string;
  updated_at: string;
}

export function useSettings() {
  const { data: session, status } = useSession();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch settings
  const fetchSettings = useCallback(async () => {
    if (status !== 'authenticated') {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/settings');

      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }

      const data = await response.json();
      setSettings(data.settings);
      setError(null);
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError('加载设置失败');
    } finally {
      setLoading(false);
    }
  }, [status]);

  // Update settings
  const updateSettings = useCallback(
    async (updates: {
      voice_accent?: string;
      speech_rate?: number;
      daily_goal?: number;
    }) => {
      if (!session) return;

      try {
        const response = await fetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          throw new Error('Failed to update settings');
        }

        const data = await response.json();
        setSettings(data.settings);
      } catch (err) {
        console.error('Error updating settings:', err);
        throw err;
      }
    },
    [session]
  );

  // Load settings on mount
  useEffect(() => {
    if (status === 'authenticated') {
      fetchSettings();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status, fetchSettings]);

  return {
    settings,
    loading,
    error,
    updateSettings,
    refetch: fetchSettings,
  };
}
