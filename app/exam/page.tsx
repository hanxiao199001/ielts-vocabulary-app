'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Award, RotateCcw } from 'lucide-react';
import { ExamQuestion, ExamResult } from '@/types';
import { getTodayPlan, getTodayExamResult, saveExamResult } from '@/lib/daily-plan';
import { generateExamQuestions, checkAnswer, calculateScore, getQuestionTypeName, getScoreGrade } from '@/lib/exam';
import { getLearnRecords } from '@/lib/storage';
import wordsData from '@/data/words.json';

export default function ExamPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [examResult, setExamResult] = useState<ExamResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeExam();
  }, []);

  const initializeExam = () => {
    // 检查是否已经完成今日考试
    const todayResult = getTodayExamResult();
    if (todayResult) {
      setExamResult(todayResult);
      setShowResult(true);
      setIsLoading(false);
      return;
    }

    // 获取今日学习计划
    const plan = getTodayPlan();
    if (!plan || plan.wordIds.length === 0) {
      // 没有学习计划，检查今天学习的单词
      const records = getLearnRecords();
      const today = new Date().toISOString().split('T')[0];
      const todayWords = Object.values(records).filter(r => {
        const recordDate = new Date(r.firstLearnTime).toISOString().split('T')[0];
        return recordDate === today;
      });

      if (todayWords.length === 0) {
        setIsLoading(false);
        return;
      }

      // 使用今天学习的单词生成考试
      const wordIds = todayWords.map(r => r.wordId);
      generateExam(wordIds);
    } else {
      // 使用学习计划生成考试
      generateExam(plan.wordIds);
    }
  };

  const generateExam = (wordIds: number[]) => {
    const examWords = (wordsData as any[]).filter((w: any) => wordIds.includes(w.id));
    const allWords = wordsData as any[];

    if (examWords.length === 0) {
      setIsLoading(false);
      return;
    }

    const examQuestions = generateExamQuestions(examWords, allWords, Math.min(5, examWords.length));
    setQuestions(examQuestions);
    setIsLoading(false);
  };

  const handleAnswer = () => {
    if (!userAnswer.trim()) return;

    const updatedQuestions = [...questions];
    const currentQuestion = updatedQuestions[currentIndex];

    const isCorrect = checkAnswer(currentQuestion, userAnswer);
    currentQuestion.userAnswer = userAnswer;
    currentQuestion.isCorrect = isCorrect;

    setQuestions(updatedQuestions);

    // 移动到下一题或显示结果
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserAnswer('');
    } else {
      // 考试完成
      completeExam(updatedQuestions);
    }
  };

  const completeExam = (completedQuestions: ExamQuestion[]) => {
    const { score, correctCount, totalQuestions } = calculateScore(completedQuestions);

    const result: ExamResult = {
      date: new Date().toISOString().split('T')[0],
      wordIds: completedQuestions.map(q => q.wordId),
      questions: completedQuestions,
      score,
      totalQuestions,
      correctCount,
      completedAt: new Date().toISOString(),
    };

    saveExamResult(result);
    setExamResult(result);
    setShowResult(true);
  };

  const handleRetry = () => {
    const wordIds = questions.map(q => q.wordId);
    generateExam(wordIds);
    setCurrentIndex(0);
    setUserAnswer('');
    setShowResult(false);
    setExamResult(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">加载中...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            暂无可测验内容
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            今天还没有学习单词。先去学习一些单词，然后再来测验吧！
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            开始学习
          </button>
        </div>
      </div>
    );
  }

  if (showResult && examResult) {
    const scoreGrade = getScoreGrade(examResult.score);

    return (
      <div className="min-h-screen max-w-4xl mx-auto p-4 space-y-6">
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-2xl p-8 text-white text-center">
          <div className="text-6xl mb-4">{scoreGrade.emoji}</div>
          <h1 className="text-3xl font-bold mb-2">考试完成！</h1>
          <div className="text-5xl font-bold my-6">{examResult.score} 分</div>
          <div className="text-xl mb-4">{scoreGrade.grade}</div>
          <div className="text-sm opacity-90">
            {examResult.correctCount} / {examResult.totalQuestions} 题正确
          </div>
        </div>

        {/* 题目详情 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            答题详情
          </h3>
          <div className="space-y-4">
            {examResult.questions.map((q, index) => (
              <div
                key={q.id}
                className={`p-4 rounded-lg border-2 ${
                  q.isCorrect
                    ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                    : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {index + 1}. {getQuestionTypeName(q.type)}
                      </span>
                      {q.isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                    <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      {q.question}
                    </p>
                  </div>
                </div>

                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 dark:text-gray-400">你的答案：</span>
                    <span className={q.isCorrect ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                      {q.userAnswer}
                    </span>
                  </div>
                  {!q.isCorrect && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">正确答案：</span>
                      <span className="text-green-600 font-medium">{q.correctAnswer}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-4">
          <button
            onClick={handleRetry}
            className="flex-1 flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
            <span>重新测验</span>
          </button>
          <button
            onClick={() => router.push('/stats')}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            <Award className="w-5 h-5" />
            <span>查看统计</span>
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="min-h-screen max-w-4xl mx-auto p-4">
      {/* 进度条 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            每日测验
          </h1>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {currentIndex + 1} / {questions.length}
          </div>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* 题目卡片 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 mb-6">
        <div className="mb-4">
          <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-sm font-medium rounded-full">
            {getQuestionTypeName(currentQuestion.type)}
          </span>
        </div>

        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          {currentQuestion.question}
        </h2>

        {currentQuestion.type === 'spelling' ? (
          // 拼写题 - 输入框
          <div className="space-y-4">
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAnswer()}
              placeholder="请输入单词拼写..."
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none text-lg text-gray-900 dark:text-white bg-white dark:bg-gray-700"
              autoFocus
            />
          </div>
        ) : (
          // 选择题 - 选项
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => setUserAnswer(option)}
                className={`p-4 text-left border-2 rounded-lg transition-all ${
                  userAnswer === option
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
                } text-gray-900 dark:text-white`}
              >
                <span className="text-lg">{option}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 提交按钮 */}
      <button
        onClick={handleAnswer}
        disabled={!userAnswer.trim()}
        className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition-colors text-lg shadow-lg"
      >
        {currentIndex < questions.length - 1 ? '下一题' : '完成测验'}
      </button>
    </div>
  );
}
