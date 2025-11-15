'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import WordCard from '@/components/WordCard';
import StatusButtons from '@/components/StatusButtons';
import RecordButton from '@/components/RecordButton';
import { Word, LearnRecord, LearnStatus } from '@/types';
import {
  getUserSettings,
  getLearnRecords,
  saveLearnRecord,
  getWordLearnRecord,
  getCurrentDay,
  saveSessionStart,
  getSessionStart,
  updateTodayStudy,
} from '@/lib/storage';
import wordsData from '@/data/words.json';

export default function HomePage() {
  const router = useRouter();
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [settings, setSettings] = useState(getUserSettings());
  const [learnRecords, setLearnRecords] = useState(getLearnRecords());
  const [sessionStart] = useState(() => {
    const start = getSessionStart();
    saveSessionStart(Date.now());
    return start;
  });

  // 检查是否需要显示引导页
  useEffect(() => {
    if (!settings.hasSeenOnboarding) {
      router.push('/onboarding');
    }
  }, [settings.hasSeenOnboarding, router]);

  // 获取今日应学习的单词
  const todayWords = useMemo(() => {
    const currentDay = getCurrentDay();
    const dayWords = (wordsData as Word[]).filter((w) => w.day === currentDay);

    // 如果当天单词不足，返回前 dailyWordLimit 个单词
    if (dayWords.length === 0) {
      return (wordsData as Word[]).slice(0, settings.dailyWordLimit);
    }

    return dayWords.slice(0, settings.dailyWordLimit);
  }, [settings.dailyWordLimit]);

  const currentWord = todayWords[currentWordIndex];
  const currentRecord = currentWord ? getWordLearnRecord(currentWord.id) : null;

  // 更新今日学习数据
  useEffect(() => {
    const updateStudyData = () => {
      const learnedToday = Object.values(learnRecords).filter((record) => {
        const today = new Date().toISOString().split('T')[0];
        const recordDate = new Date(record.firstLearnTime).toISOString().split('T')[0];
        return recordDate === today;
      }).length;

      const studyTime = Math.floor((Date.now() - sessionStart) / 60000); // 分钟

      updateTodayStudy(learnedToday, studyTime);
    };

    const interval = setInterval(updateStudyData, 30000); // 每30秒更新一次

    return () => clearInterval(interval);
  }, [learnRecords, sessionStart]);

  const handleStatusChange = (status: LearnStatus) => {
    if (!currentWord) return;

    const now = new Date().toISOString();
    const existingRecord = getWordLearnRecord(currentWord.id);

    const newRecord: LearnRecord = existingRecord
      ? {
          ...existingRecord,
          status,
          learnCount: existingRecord.learnCount + 1,
          lastReviewTime: now,
        }
      : {
          wordId: currentWord.id,
          status,
          learnCount: 1,
          lastReviewTime: now,
          recordings: [],
          firstLearnTime: now,
        };

    saveLearnRecord(newRecord);
    setLearnRecords(getLearnRecords());

    // 自动前往下一个单词
    if (currentWordIndex < todayWords.length - 1) {
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
    if (currentWordIndex < todayWords.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
    }
  };

  if (!currentWord) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            今日单词已学完！
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            做得很好！明天继续加油吧！
          </p>
          <button
            onClick={() => router.push('/stats')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            查看统计
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
            今日学习
          </h1>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {currentWordIndex + 1} / {todayWords.length}
          </div>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${((currentWordIndex + 1) / todayWords.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* 单词卡片 */}
      <div className="flex-1 flex items-center justify-center mb-6">
        <WordCard word={currentWord} accent={settings.voiceAccent} speechRate={settings.speechRate} />
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
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            {currentRecord?.learnCount
              ? `已学习 ${currentRecord.learnCount} 次`
              : '首次学习'}
          </p>
        </div>

        <button
          onClick={handleNext}
          disabled={currentWordIndex === todayWords.length - 1}
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
          expectedText={currentWord.example.en}
          accent={settings.voiceAccent}
        />
      </div>
    </div>
  );
}
