import { describe, it, expect } from 'vitest';
import {
  generateExamQuestions,
  checkAnswer,
  calculateScore,
  getScoreGrade,
} from '@/lib/exam';
import type { Word, ExamQuestion } from '@/types';

const makeWord = (id: number): Word => ({
  id,
  word: `word${id}`,
  translation: `释义${id}`,
  phonetic: `/wɜːd${id}/`,
  example: { en: `Example ${id}.`, zh: `例句${id}。` },
  day: 1,
});

const allWords = Array.from({ length: 30 }, (_, i) => makeWord(i + 1));

describe('generateExamQuestions', () => {
  it('每种题型生成 questionsPerType 道题，共三种题型', () => {
    const qs = generateExamQuestions(allWords.slice(0, 10), allWords, 5);
    expect(qs).toHaveLength(15);
    expect(qs.filter((q) => q.type === 'en-to-zh')).toHaveLength(5);
    expect(qs.filter((q) => q.type === 'zh-to-en')).toHaveLength(5);
    expect(qs.filter((q) => q.type === 'spelling')).toHaveLength(5);
  });

  it('选择题包含 4 个选项且含正确答案，拼写题无选项', () => {
    const qs = generateExamQuestions(allWords.slice(0, 10), allWords, 5);
    for (const q of qs) {
      if (q.type === 'spelling') {
        expect(q.options).toHaveLength(0);
      } else {
        expect(q.options).toHaveLength(4);
        expect(q.options).toContain(q.correctAnswer);
      }
    }
  });
});

describe('checkAnswer', () => {
  const base: ExamQuestion = {
    id: 1,
    wordId: 1,
    type: 'spelling',
    question: '释义1（请拼写单词）',
    options: [],
    correctAnswer: 'word1',
  };

  it('拼写题忽略大小写和首尾空格', () => {
    expect(checkAnswer(base, '  WoRd1 ')).toBe(true);
    expect(checkAnswer(base, 'word2')).toBe(false);
  });
});

describe('calculateScore / getScoreGrade', () => {
  it('按答对比例计算得分', () => {
    const qs: ExamQuestion[] = [
      { id: 1, wordId: 1, type: 'spelling', question: '', options: [], correctAnswer: 'a', userAnswer: 'a', isCorrect: true },
      { id: 2, wordId: 2, type: 'spelling', question: '', options: [], correctAnswer: 'b', userAnswer: 'x', isCorrect: false },
    ];
    const { score, correctCount, totalQuestions } = calculateScore(qs);
    expect(correctCount).toBe(1);
    expect(totalQuestions).toBe(2);
    expect(score).toBe(50);
  });

  it('满分给最高评级', () => {
    expect(getScoreGrade(100).grade).toBeTruthy();
    expect(getScoreGrade(0).grade).toBeTruthy();
  });
});
