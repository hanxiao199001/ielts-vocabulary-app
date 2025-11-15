'use client';

import { Mic, Square, Play, Loader2 } from 'lucide-react';
import { useRecorder, useAudioPlayer } from '@/hooks/useRecorder';
import { useState } from 'react';

interface RecordButtonProps {
  onRecordingComplete: (audioData: string) => void;
  latestRecording?: string;
}

export default function RecordButton({ onRecordingComplete, latestRecording }: RecordButtonProps) {
  const { isRecording, isSupported, startRecording, stopRecording } = useRecorder();
  const { isPlaying, play, stop } = useAudioPlayer();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRecord = async () => {
    if (isRecording) {
      // 停止录音
      setIsProcessing(true);
      const audioData = await stopRecording();
      setIsProcessing(false);

      if (audioData) {
        onRecordingComplete(audioData);
      }
    } else {
      // 开始录音
      const success = await startRecording();
      if (!success) {
        alert('无法访问麦克风，请检查权限设置');
      }
    }
  };

  const handlePlay = () => {
    if (latestRecording) {
      if (isPlaying) {
        stop();
      } else {
        play(latestRecording);
      }
    }
  };

  if (!isSupported) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 p-4">
        您的浏览器不支持录音功能
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-4">
      {/* 录音按钮 */}
      <button
        onClick={handleRecord}
        disabled={isProcessing}
        className={`p-4 rounded-full transition-all shadow-lg ${
          isRecording
            ? 'bg-red-500 hover:bg-red-600 animate-pulse'
            : 'bg-blue-500 hover:bg-blue-600'
        } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
      >
        {isProcessing ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : isRecording ? (
          <Square className="w-6 h-6" />
        ) : (
          <Mic className="w-6 h-6" />
        )}
      </button>

      <span className="text-sm text-gray-600 dark:text-gray-300">
        {isRecording ? '录音中...' : '点击录音'}
      </span>

      {/* 播放录音按钮 */}
      {latestRecording && (
        <>
          <div className="w-px h-8 bg-gray-300 dark:bg-gray-600" />
          <button
            onClick={handlePlay}
            className={`p-4 rounded-full transition-all shadow-lg ${
              isPlaying
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-purple-500 hover:bg-purple-600'
            } text-white`}
            aria-label={isPlaying ? 'Stop playback' : 'Play recording'}
          >
            <Play className="w-6 h-6" />
          </button>

          <span className="text-sm text-gray-600 dark:text-gray-300">
            {isPlaying ? '播放中...' : '播放录音'}
          </span>
        </>
      )}
    </div>
  );
}
