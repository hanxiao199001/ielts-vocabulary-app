'use client';

import { useState, useEffect } from 'react';
import { Moon, Sun, Volume2, Target, Trash2, AlertCircle } from 'lucide-react';
import { getUserSettings, saveUserSettings, clearLearnData, clearAllData } from '@/lib/storage';

export default function SettingsPage() {
  const [settings, setSettings] = useState(getUserSettings());
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);

  useEffect(() => {
    // 应用暗色模式
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  const handleDarkModeToggle = () => {
    const newSettings = { ...settings, darkMode: !settings.darkMode };
    setSettings(newSettings);
    saveUserSettings(newSettings);
  };

  const handleVoiceAccentChange = (accent: 'GB' | 'US') => {
    const newSettings = { ...settings, voiceAccent: accent };
    setSettings(newSettings);
    saveUserSettings(newSettings);
  };

  const handleDailyLimitChange = (limit: number) => {
    const newSettings = { ...settings, dailyWordLimit: limit };
    setSettings(newSettings);
    saveUserSettings(newSettings);
  };

  const handleClearLearnData = () => {
    clearLearnData();
    setShowClearConfirm(false);
    alert('学习数据已清除！设置已保留。');
    window.location.reload();
  };

  const handleClearAllData = () => {
    clearAllData();
    setShowClearAllConfirm(false);
    alert('所有数据已清除！');
    window.location.reload();
  };

  return (
    <div className="min-h-screen max-w-4xl mx-auto p-4 space-y-6">
      {/* 头部 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          设置
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          自定义您的学习体验
        </p>
      </div>

      {/* 外观设置 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Moon className="w-5 h-5" />
          外观设置
        </h2>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              暗色模式
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              切换浅色/暗色主题
            </p>
          </div>

          <button
            onClick={handleDarkModeToggle}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
              settings.darkMode ? 'bg-blue-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                settings.darkMode ? 'translate-x-7' : 'translate-x-1'
              }`}
            >
              {settings.darkMode ? (
                <Moon className="w-4 h-4 text-blue-500 m-1" />
              ) : (
                <Sun className="w-4 h-4 text-yellow-500 m-1" />
              )}
            </span>
          </button>
        </div>
      </div>

      {/* 语音设置 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Volume2 className="w-5 h-5" />
          语音设置
        </h2>

        <div>
          <h3 className="font-medium text-gray-900 dark:text-white mb-3">
            发音口音
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleVoiceAccentChange('GB')}
              className={`p-4 rounded-lg border-2 transition-all ${
                settings.voiceAccent === 'GB'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">🇬🇧</div>
                <div className="font-medium text-gray-900 dark:text-white">
                  英式英语
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  British English
                </div>
              </div>
            </button>

            <button
              onClick={() => handleVoiceAccentChange('US')}
              className={`p-4 rounded-lg border-2 transition-all ${
                settings.voiceAccent === 'US'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">🇺🇸</div>
                <div className="font-medium text-gray-900 dark:text-white">
                  美式英语
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  American English
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* 学习设置 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Target className="w-5 h-5" />
          学习设置
        </h2>

        <div>
          <h3 className="font-medium text-gray-900 dark:text-white mb-3">
            每日学习单词数
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {[25, 50, 100].map((limit) => (
              <button
                key={limit}
                onClick={() => handleDailyLimitChange(limit)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  settings.dailyWordLimit === limit
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {limit}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  个/天
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 数据管理 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Trash2 className="w-5 h-5" />
          数据管理
        </h2>

        <div className="space-y-4">
          {/* 清除学习数据 */}
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
              清除学习数据
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              清除所有学习记录和录音，保留设置
            </p>

            {!showClearConfirm ? (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors"
              >
                清除学习数据
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">确定要清除吗？</span>
                </div>
                <button
                  onClick={handleClearLearnData}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm"
                >
                  确定
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-900 dark:text-white rounded-lg transition-colors text-sm"
                >
                  取消
                </button>
              </div>
            )}
          </div>

          {/* 清除所有数据 */}
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
              清除所有数据
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              清除所有数据，包括学习记录、录音和设置
            </p>

            {!showClearAllConfirm ? (
              <button
                onClick={() => setShowClearAllConfirm(true)}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                清除所有数据
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">此操作不可恢复！</span>
                </div>
                <button
                  onClick={handleClearAllData}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm"
                >
                  确定
                </button>
                <button
                  onClick={() => setShowClearAllConfirm(false)}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-900 dark:text-white rounded-lg transition-colors text-sm"
                >
                  取消
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 关于 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          关于
        </h2>
        <div className="space-y-2 text-gray-600 dark:text-gray-300">
          <p>雅思单词学习 - IELTS Vocabulary</p>
          <p className="text-sm">版本: 1.0.0</p>
          <p className="text-sm">
            帮助你掌握雅思2200核心词汇
          </p>
        </div>
      </div>
    </div>
  );
}
