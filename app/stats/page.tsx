'use client';

import { useState, useEffect } from 'react';
import { Download, TrendingUp, Calendar, Clock, Award, Target } from 'lucide-react';
import ProgressChart from '@/components/ProgressChart';
import {
  getLearnRecords,
  getCalendarData,
  exportAllData,
  getStorageSize,
} from '@/lib/storage';
import {
  calculateStudyStats,
  getRecentDaysData,
  formatStudyTime,
  getThisWeekWords,
  getThisMonthWords,
  calculateProgress,
} from '@/lib/statistics';
import wordsData from '@/data/words.json';

export default function StatsPage() {
  const [learnRecords, setLearnRecords] = useState(getLearnRecords());
  const [calendarData, setCalendarData] = useState(getCalendarData());
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  useEffect(() => {
    // 刷新数据
    setLearnRecords(getLearnRecords());
    setCalendarData(getCalendarData());
  }, []);

  const stats = calculateStudyStats(learnRecords, calendarData);
  const recentData = getRecentDaysData(calendarData, 30);
  const thisWeekWords = getThisWeekWords(calendarData);
  const thisMonthWords = getThisMonthWords(calendarData);
  const totalWords = (wordsData as any[]).length;
  const progress = calculateProgress(stats.totalLearnedWords, totalWords);
  const storageSize = getStorageSize();

  const handleExport = () => {
    const data = exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ielts-words-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen max-w-4xl mx-auto p-4 space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          学习统计
        </h1>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors shadow-lg"
        >
          <Download className="w-4 h-4" />
          <span>导出数据</span>
        </button>
      </div>

      {/* 总体进度 */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">总体进度</h2>
          <Award className="w-8 h-8" />
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span>已学习 {stats.totalLearnedWords} / {totalWords} 个单词</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3">
            <div
              className="bg-white h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-3xl font-bold">{stats.knownWords}</div>
            <div className="text-sm opacity-90">已掌握</div>
          </div>
          <div>
            <div className="text-3xl font-bold">{stats.reviewWords}</div>
            <div className="text-sm opacity-90">需复习</div>
          </div>
          <div>
            <div className="text-3xl font-bold">{stats.unknownWords}</div>
            <div className="text-sm opacity-90">不认识</div>
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-6 h-6 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.totalStudyDays}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            累计天数
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-6 h-6 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.currentStreak}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            连续天数
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-6 h-6 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.todayStudyTime}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            今日分钟
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-6 h-6 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.masteryRate}%
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            掌握率
          </div>
        </div>
      </div>

      {/* 本周和本月统计 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            本周学习
          </h3>
          <div className="text-3xl font-bold text-blue-500">
            {thisWeekWords}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            个单词
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            本月学习
          </h3>
          <div className="text-3xl font-bold text-purple-500">
            {thisMonthWords}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            个单词
          </div>
        </div>
      </div>

      {/* 学习趋势图表 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            学习趋势（最近30天）
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                chartType === 'line'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              折线图
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                chartType === 'bar'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              柱状图
            </button>
          </div>
        </div>

        <ProgressChart data={recentData} type={chartType} />
      </div>

      {/* 存储信息 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          存储使用情况
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-300">
            本地存储占用
          </span>
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            {storageSize} KB
          </span>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          包含学习记录、录音文件和设置数据
        </p>
      </div>
    </div>
  );
}
