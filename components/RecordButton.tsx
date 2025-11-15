'use client';

import { Mic, Square, Play, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useRecorder, useAudioPlayer } from '@/hooks/useRecorder';
import { useState } from 'react';
import { PronunciationEvaluation } from '@/types';
import { VoiceAccent } from '@/lib/speech';
import { recognizeSpeech, getEvaluationDescription, isSpeechRecognitionSupported } from '@/lib/recognition';

interface RecordButtonProps {
  onRecordingComplete: (audioData: string) => void;
  latestRecording?: string;
  expectedText?: string; // 期望的文本（用于评价）
  accent?: VoiceAccent; // 口音设置
}

export default function RecordButton({
  onRecordingComplete,
  latestRecording,
  expectedText,
  accent = 'GB'
}: RecordButtonProps) {
  const { isRecording, isSupported, startRecording, stopRecording } = useRecorder();
  const { isPlaying, play, stop } = useAudioPlayer();
  const [isProcessing, setIsProcessing] = useState(false);
  const [evaluation, setEvaluation] = useState<PronunciationEvaluation | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const handleRecord = async () => {
    if (isRecording) {
      // 停止录音
      setIsProcessing(true);
      const audioData = await stopRecording();
      setIsProcessing(false);

      if (audioData) {
        onRecordingComplete(audioData);

        // 如果提供了期望文本，进行发音评价
        if (expectedText && isSpeechRecognitionSupported()) {
          setIsEvaluating(true);
          try {
            // 将 base64 转换为 Blob
            const base64Data = audioData.split(',')[1];
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'audio/webm' });

            const result = await recognizeSpeech(blob, expectedText, accent);
            setEvaluation(result);
          } catch (error) {
            console.error('Evaluation error:', error);
          } finally {
            setIsEvaluating(false);
          }
        }
      }
    } else {
      // 开始录音时清除之前的评价
      setEvaluation(null);

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

  const evaluationDesc = evaluation ? getEvaluationDescription(evaluation.accuracy) : null;

  return (
    <div className="space-y-4">
      {/* 录音控制 */}
      <div className="flex items-center justify-center gap-4">
        {/* 录音按钮 */}
        <button
          onClick={handleRecord}
          disabled={isProcessing || isEvaluating}
          className={`p-4 rounded-full transition-all shadow-lg ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600 animate-pulse'
              : 'bg-blue-500 hover:bg-blue-600'
          } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
          aria-label={isRecording ? 'Stop recording' : 'Start recording'}
        >
          {isProcessing || isEvaluating ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : isRecording ? (
            <Square className="w-6 h-6" />
          ) : (
            <Mic className="w-6 h-6" />
          )}
        </button>

        <span className="text-sm text-gray-600 dark:text-gray-300">
          {isEvaluating
            ? '评价中...'
            : isRecording
            ? '录音中...'
            : '点击录音'}
        </span>

        {/* 播放录音按钮 */}
        {latestRecording && (
          <>
            <div className="w-px h-8 bg-gray-300 dark:bg-gray-600" />
            <button
              onClick={handlePlay}
              disabled={isEvaluating}
              className={`p-4 rounded-full transition-all shadow-lg ${
                isPlaying
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-purple-500 hover:bg-purple-600'
              } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
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

      {/* 发音评价结果 */}
      {evaluation && evaluationDesc && (
        <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4 animate-slide-up">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900 dark:text-white">
              发音评价
            </h4>
            <div className={`flex items-center gap-2 ${evaluationDesc.color} font-bold`}>
              {evaluation.accuracy >= 60 ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <XCircle className="w-5 h-5" />
              )}
              <span>{evaluationDesc.emoji} {evaluationDesc.text}</span>
            </div>
          </div>

          {/* 准确度分数 */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-300">准确度</span>
              <span className={`font-bold ${evaluationDesc.color}`}>
                {evaluation.accuracy}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  evaluation.accuracy >= 90
                    ? 'bg-green-500'
                    : evaluation.accuracy >= 75
                    ? 'bg-blue-500'
                    : evaluation.accuracy >= 60
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${evaluation.accuracy}%` }}
              />
            </div>
          </div>

          {/* 识别结果 */}
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">您的发音：</span>
              <p className="text-gray-900 dark:text-white font-medium mt-1">
                {evaluation.recognizedText || '(未识别到内容)'}
              </p>
            </div>

            {evaluation.missedWords.length > 0 && (
              <div>
                <span className="text-orange-500">需要改进的词：</span>
                <p className="text-gray-900 dark:text-white mt-1">
                  {evaluation.missedWords.join(', ')}
                </p>
              </div>
            )}

            {!isSpeechRecognitionSupported() && (
              <p className="text-gray-500 dark:text-gray-400 text-xs">
                您的浏览器不支持语音识别功能
              </p>
            )}
          </div>
        </div>
      )}

      {/* 提示 */}
      {!isSpeechRecognitionSupported() && expectedText && (
        <p className="text-xs text-center text-gray-500 dark:text-gray-400">
          语音评价功能需要 Chrome 或 Edge 浏览器支持
        </p>
      )}
    </div>
  );
}
