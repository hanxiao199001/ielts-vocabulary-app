'use client';

import { Word } from '@/types';
import { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';

interface WordQuizProps {
  word: Word;
  allWords: Word[];
  onCorrect: () => void;
}

export default function WordQuiz({ word, allWords, onCorrect }: WordQuizProps) {
  const [options, setOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    // Generate 4 options: 1 correct + 3 wrong
    const wrongOptions = allWords
      .filter(w => w.id !== word.id && w.translation !== word.translation)
      .map(w => w.translation)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    const allOptions = [word.translation, ...wrongOptions]
      .sort(() => Math.random() - 0.5);

    setOptions(allOptions);
    setSelectedOption(null);
    setIsCorrect(null);
  }, [word, allWords]);

  const handleOptionClick = (option: string) => {
    if (selectedOption !== null) return; // Already answered

    setSelectedOption(option);
    const correct = option === word.translation;
    setIsCorrect(correct);

    if (correct) {
      // Auto proceed after 1 second
      setTimeout(() => {
        onCorrect();
      }, 1000);
    }
  };

  const getOptionClass = (option: string) => {
    if (selectedOption === null) {
      return 'bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700 border-2 border-gray-200 dark:border-gray-600';
    }

    if (option === word.translation) {
      return 'bg-green-100 dark:bg-green-900 border-2 border-green-500';
    }

    if (option === selectedOption && !isCorrect) {
      return 'bg-red-100 dark:bg-red-900 border-2 border-red-500';
    }

    return 'bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 opacity-50';
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 space-y-6">
      {/* Question */}
      <div className="text-center space-y-4">
        <h2 className="text-lg font-medium text-gray-600 dark:text-gray-400">
          请选择单词的正确翻译
        </h2>
        <div className="text-5xl font-bold text-gray-900 dark:text-white">
          {word.word}
        </div>
        <div className="text-xl text-gray-500 dark:text-gray-400">
          {word.phonetic}
        </div>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleOptionClick(option)}
            disabled={selectedOption !== null}
            className={`
              ${getOptionClass(option)}
              p-6 rounded-xl transition-all duration-200
              text-lg font-medium text-gray-900 dark:text-white
              disabled:cursor-not-allowed
              relative
            `}
          >
            <span>{option}</span>

            {/* Feedback Icons */}
            {selectedOption !== null && option === word.translation && (
              <div className="absolute top-2 right-2">
                <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            )}
            {selectedOption === option && !isCorrect && (
              <div className="absolute top-2 right-2">
                <X className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Feedback Message */}
      {selectedOption !== null && (
        <div className="text-center">
          {isCorrect ? (
            <div className="text-green-600 dark:text-green-400 font-medium text-lg">
              ✓ 回答正确！即将显示单词详情...
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-red-600 dark:text-red-400 font-medium text-lg">
                ✗ 回答错误，请重新选择
              </div>
              <button
                onClick={() => {
                  setSelectedOption(null);
                  setIsCorrect(null);
                }}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                重试
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
