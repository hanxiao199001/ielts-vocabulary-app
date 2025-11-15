'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Volume2, Mic, BarChart3, ArrowRight } from 'lucide-react';
import { saveUserSettings } from '@/lib/storage';

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: BookOpen,
      title: '欢迎来到雅思单词学习',
      description: '通过科学的方法，帮助你掌握雅思2200核心词汇',
      color: 'text-blue-500',
    },
    {
      icon: Volume2,
      title: '语音朗读功能',
      description: '点击喇叭图标，即可听到单词和例句的标准发音',
      color: 'text-green-500',
    },
    {
      icon: Mic,
      title: '跟读录音',
      description: '录下你的发音，对比标准发音，提升口语能力',
      color: 'text-purple-500',
    },
    {
      icon: BarChart3,
      title: '学习统计',
      description: '追踪学习进度，查看掌握情况，保持学习动力',
      color: 'text-orange-500',
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // 标记已看过引导页面
      saveUserSettings({ hasSeenOnboarding: true });
      router.push('/');
    }
  };

  const handleSkip = () => {
    saveUserSettings({ hasSeenOnboarding: true });
    router.push('/');
  };

  const step = steps[currentStep];
  const Icon = step.icon;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full">
        {/* 进度指示器 */}
        <div className="flex justify-center gap-2 mb-12">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === currentStep
                  ? 'w-8 bg-blue-500'
                  : index < currentStep
                  ? 'w-2 bg-blue-300'
                  : 'w-2 bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>

        {/* 内容卡片 */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 text-center">
          <div className={`inline-flex p-6 rounded-full bg-gray-100 dark:bg-gray-700 mb-6 ${step.color}`}>
            <Icon className="w-16 h-16" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {step.title}
          </h1>

          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            {step.description}
          </p>

          {/* 按钮 */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleNext}
              className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium py-4 px-6 rounded-xl transition-colors shadow-lg hover:shadow-xl"
            >
              <span>{currentStep < steps.length - 1 ? '继续' : '开始学习'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            {currentStep < steps.length - 1 && (
              <button
                onClick={handleSkip}
                className="w-full text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium py-2 transition-colors"
              >
                跳过引导
              </button>
            )}
          </div>
        </div>

        {/* 步骤文字 */}
        <p className="text-center text-gray-500 dark:text-gray-400 mt-6">
          {currentStep + 1} / {steps.length}
        </p>
      </div>
    </div>
  );
}
