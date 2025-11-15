'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  speakText,
  stopSpeaking,
  isSpeechSynthesisSupported,
  waitForVoices,
  VoiceAccent,
} from '@/lib/speech';

export function useSpeech() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkSupport = async () => {
      const supported = isSpeechSynthesisSupported();
      setIsSupported(supported);

      if (supported) {
        // 等待语音列表加载
        await waitForVoices();
        setIsReady(true);
      }
    };

    checkSupport();
  }, []);

  const speak = useCallback(
    (text: string, accent: VoiceAccent = 'GB', rate: number = 0.9) => {
      if (!isSupported || !isReady) {
        console.warn('Speech synthesis is not ready');
        return;
      }

      setIsSpeaking(true);

      speakText(
        text,
        accent,
        rate,
        1.0,
        () => {
          setIsSpeaking(false);
        },
        (error) => {
          console.error('Speech error:', error);
          setIsSpeaking(false);
        }
      );
    },
    [isSupported, isReady]
  );

  const stop = useCallback(() => {
    stopSpeaking();
    setIsSpeaking(false);
  }, []);

  return {
    isSupported,
    isReady,
    isSpeaking,
    speak,
    stop,
  };
}
