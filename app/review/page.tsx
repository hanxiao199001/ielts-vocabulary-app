'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import WordCard from '@/components/WordCard';
import StatusButtons from '@/components/StatusButtons';
import RecordButton from '@/components/RecordButton';
import { Word, LearnRecord, LearnStatus } from '@/types';
import {
  getUserSettings,
  getLearnRecords,
  saveLearnRecord,
  getWordLearnRecord,
} from '@/lib/storage';
import {
  getWordsNeedingReview,
  sortReviewWordsByPriority,
  shuffleArray,
  getTodayReviewCount,
} from '@/lib/spaced-repetition';
import wordsData from '@/data/words.json';

export default function ReviewPage() {
  const router = useRouter();
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [settings, setSettings] = useState(getUserSettings());
  const [learnRecords, setLearnRecords] = useState(getLearnRecords());
  const [isShuffled, setIsShuffled] = useState(false);

  // 获取需要复习的单词
  const reviewWordIds = useMemo(() => {
    const needReview = getWordsNeedingReview(learnRecords);
    const sorted = sortReviewWordsByPriority(needReview, learnRecords);
    return isShuffled ? shuffleArray(sorted) : sorted;
  }, [learnRecords, isShuffled]);

  const reviewWords = useMemo(() => {
    return reviewWordIds
      .map((id) => (wordsData as Word[]).find((w) => w.id === id))
      .filter((w): w is Word => w !== undefined);
  }, [reviewWordIds]);

  const currentWord = reviewWords[currentWordIndex];
  const currentRecord = currentWord ? getWordLearnRecord(currentWord.id) : null;
  const todayReviewCount = getTodayReviewCount(learnRecords);

  const handleStatusChange = (status: LearnStatus) => {
    if (!currentWord) return;

    const now = new Date().toISOString();
    const existingRecord = getWordLearnRecord(currentWord.id);

    if (!existingRecord) return;

    const newRecord: LearnRecord = {
      ...existingRecord,
      status,
      learnCount: existingRecord.learnCount + 1,
      lastReviewTime: now,
    };

    saveLearnRecord(newRecord);
    setLearnRecords(getLearnRecords());

    // 自动前往下一个单词
    if (currentWordIndex < reviewWords.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
    }
  };

  const handleRecordingComplete = (audioData: string) => {
    if (!currentWord) return;

    const existingRecord = getWordLearnRecord(currentWord.id);
    if (!existingRecord) return;

    const updatedRecord: LearnRecord = {
      ...existingRecord,
      recordings: [...existingRecord.recordings, audioData],
    };

    saveLearnRecord(updatedRecord);
    setLearnRecords(getLearnRecords());
  };

  const handlePrevious = () => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex(currentWordIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentWordIndex < reviewWords.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
    }
  };

  const handleShuffle = () => {
    setIsShuffled(!isShuffled);
    setCurrentWordIndex(0);
  };

  if (reviewWords.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="mb-6">
            <div className="inline-flex p-6 rounded-full bg-green-100 dark:bg-green-900">
              <RefreshCw className="w-16 h-16 text-green-500" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            暂无需要复习的单词
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            所有单词都已经复习完成了！继续学习新单词吧！
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            返回学习
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen max-w-4xl mx-auto p-4">
      {/* 头部 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            复习模式
          </h1>
          <button
            onClick={handleShuffle}
            className="flex items-center gap-2 px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{isShuffled ? '按优先级' : '随机打乱'}</span>
          </button>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
          <span>复习进度: {currentWordIndex + 1} / {reviewWords.length}</span>
          <span>今日待复习: {todayReviewCount} 个</span>
        </div>

        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-purple-500 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${((currentWordIndex + 1) / reviewWords.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* 单词卡片 */}
      <div className="flex-1 flex items-center justify-center mb-6">
        <WordCard word={currentWord} accent={settings.voiceAccent} />
      </div>

      {/* 导航按钮 */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handlePrevious}
          disabled={currentWordIndex === 0}
          className="p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          aria-label="Previous word"
        >
          <ChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        </button>

        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            已复习 {currentRecord?.learnCount || 0} 次
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {currentRecord?.status === 'unknown'
              ? '不认识'
              : currentRecord?.status === 'known'
              ? '已掌握'
              : '需复习'}
          </p>
        </div>

        <button
          onClick={handleNext}
          disabled={currentWordIndex === reviewWords.length - 1}
          className="p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          aria-label="Next word"
        >
          <ChevronRight className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        </button>
      </div>

      {/* 状态按钮 */}
      <div className="mb-6">
        <StatusButtons
          currentStatus={currentRecord?.status}
          onStatusChange={handleStatusChange}
        />
      </div>

      {/* 录音功能 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
          跟读练习
        </h3>
        <RecordButton
          onRecordingComplete={handleRecordingComplete}
          latestRecording={
            currentRecord?.recordings[currentRecord.recordings.length - 1]
          }
        />
      </div>
    </div>
  );
}
