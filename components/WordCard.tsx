'use client';

import { useState } from 'react';
import { Word } from '@/types';
import { Volume2 } from 'lucide-react';
import { useSpeech } from '@/hooks/useSpeech';
import { VoiceAccent } from '@/lib/speech';

interface WordCardProps {
  word: Word;
  accent: VoiceAccent;
  onFlip?: (isFlipped: boolean) => void;
}

export default function WordCard({ word, accent, onFlip }: WordCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const { speak, isSpeaking } = useSpeech();

  const handleFlip = () => {
    const newState = !isFlipped;
    setIsFlipped(newState);
    if (onFlip) onFlip(newState);
  };

  const handleSpeak = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    speak(text, accent);
  };

  return (
    <div className="perspective-1000 w-full h-[400px] md:h-[500px]">
      <div
        className={`relative w-full h-full transition-transform duration-500 transform-style-3d cursor-pointer ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        onClick={handleFlip}
      >
        {/* 正面 - 英文单词 */}
        <div className="absolute w-full h-full backface-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 flex flex-col items-center justify-center">
          <div className="text-center space-y-6">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white">
              {word.word}
            </h2>

            {word.phonetic && (
              <p className="text-xl md:text-2xl text-gray-500 dark:text-gray-400">
                {word.phonetic}
              </p>
            )}

            <button
              onClick={(e) => handleSpeak(word.word, e)}
              disabled={isSpeaking}
              className="mt-6 p-4 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-full transition-colors shadow-lg hover:shadow-xl"
              aria-label="Play pronunciation"
            >
              <Volume2 className="w-8 h-8" />
            </button>

            <p className="text-sm text-gray-400 dark:text-gray-500 mt-8">
              点击卡片查看翻译
            </p>
          </div>
        </div>

        {/* 背面 - 中文翻译和例句 */}
        <div className="absolute w-full h-full backface-hidden bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-2xl p-8 rotate-y-180 overflow-y-auto">
          <div className="text-white space-y-6">
            <div className="text-center">
              <h3 className="text-4xl md:text-5xl font-bold mb-2">{word.translation}</h3>
              <p className="text-xl opacity-90">{word.word}</p>
            </div>

            <div className="mt-8 space-y-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-lg flex-1">{word.example.en}</p>
                  <button
                    onClick={(e) => handleSpeak(word.example.en, e)}
                    disabled={isSpeaking}
                    className="ml-2 p-2 bg-white/20 hover:bg-white/30 disabled:bg-white/10 rounded-full transition-colors flex-shrink-0"
                    aria-label="Play example"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-sm opacity-80 mt-2">{word.example.zh}</p>
              </div>
            </div>

            <p className="text-sm text-white/60 text-center mt-8">
              点击卡片返回
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}
