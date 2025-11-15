'use client';

import { useState, useRef, useCallback } from 'react';

export function useRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // 开始录音
  const startRecording = useCallback(async (): Promise<boolean> => {
    try {
      // 检查浏览器支持
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setIsSupported(false);
        console.error('MediaRecorder API is not supported');
        return false;
      }

      // 请求麦克风权限
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // 创建 MediaRecorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // 监听数据可用事件
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // 开始录音
      mediaRecorder.start();
      setIsRecording(true);

      return true;
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsSupported(false);
      return false;
    }
  }, []);

  // 停止录音并返回音频数据
  const stopRecording = useCallback((): Promise<string | null> => {
    return new Promise((resolve) => {
      const mediaRecorder = mediaRecorderRef.current;

      if (!mediaRecorder || mediaRecorder.state === 'inactive') {
        resolve(null);
        return;
      }

      mediaRecorder.onstop = () => {
        // 创建音频 Blob
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

        // 转换为 base64
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          resolve(base64data);

          // 清理
          mediaRecorder.stream.getTracks().forEach((track) => track.stop());
          setIsRecording(false);
        };

        reader.readAsDataURL(audioBlob);
      };

      mediaRecorder.stop();
    });
  }, []);

  // 取消录音
  const cancelRecording = useCallback(() => {
    const mediaRecorder = mediaRecorderRef.current;

    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      audioChunksRef.current = [];
      setIsRecording(false);
    }
  }, []);

  return {
    isRecording,
    isSupported,
    startRecording,
    stopRecording,
    cancelRecording,
  };
}

// 播放录音的 hook
export function useAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = useCallback((audioData: string) => {
    // 停止当前播放
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // 创建新的 Audio 对象
    const audio = new Audio(audioData);
    audioRef.current = audio;

    audio.onplay = () => setIsPlaying(true);
    audio.onended = () => {
      setIsPlaying(false);
      audioRef.current = null;
    };
    audio.onerror = () => {
      console.error('Error playing audio');
      setIsPlaying(false);
      audioRef.current = null;
    };

    audio.play().catch((error) => {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
    });
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
    }
  }, []);

  return {
    isPlaying,
    play,
    stop,
  };
}
