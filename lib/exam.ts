import { Word, ExamQuestion, ExamQuestionType } from '@/types';

// 生成考试题目
export function generateExamQuestions(
  words: Word[],
  allWords: Word[],
  questionsPerType: number = 5
): ExamQuestion[] {
  const questions: ExamQuestion[] = [];
  let questionId = 1;

  // 随机打乱单词顺序
  const shuffledWords = shuffleArray([...words]);

  // 1. 英译中题目
  const enToZhWords = shuffledWords.slice(0, Math.min(questionsPerType, shuffledWords.length));
  enToZhWords.forEach(word => {
    const options = generateOptions(word, allWords, 'translation');
    questions.push({
      id: questionId++,
      wordId: word.id,
      type: 'en-to-zh',
      question: word.word,
      options: shuffleArray(options),
      correctAnswer: word.translation,
    });
  });

  // 2. 中译英题目
  const zhToEnWords = shuffledWords.slice(0, Math.min(questionsPerType, shuffledWords.length));
  zhToEnWords.forEach(word => {
    const options = generateOptions(word, allWords, 'word');
    questions.push({
      id: questionId++,
      wordId: word.id,
      type: 'zh-to-en',
      question: word.translation,
      options: shuffleArray(options),
      correctAnswer: word.word,
    });
  });

  // 3. 拼写题目（填空）
  const spellingWords = shuffledWords.slice(0, Math.min(questionsPerType, shuffledWords.length));
  spellingWords.forEach(word => {
    questions.push({
      id: questionId++,
      wordId: word.id,
      type: 'spelling',
      question: `${word.translation}（请拼写单词）`,
      options: [], // 拼写题没有选项
      correctAnswer: word.word.toLowerCase(),
    });
  });

  // 随机打乱所有题目
  return shuffleArray(questions);
}

// 生成选项（包含正确答案和3个干扰项）
function generateOptions(
  correctWord: Word,
  allWords: Word[],
  field: 'word' | 'translation'
): string[] {
  const options: string[] = [correctWord[field]];

  // 过滤掉正确答案
  const otherWords = allWords.filter(w => w.id !== correctWord.id);

  // 随机选择3个干扰项
  const shuffled = shuffleArray(otherWords);
  for (let i = 0; i < 3 && i < shuffled.length; i++) {
    options.push(shuffled[i][field]);
  }

  return options;
}

// 随机打乱数组
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// 检查答案是否正确
export function checkAnswer(question: ExamQuestion, userAnswer: string): boolean {
  if (question.type === 'spelling') {
    // 拼写题忽略大小写
    return userAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
  }

  return userAnswer === question.correctAnswer;
}

// 计算考试分数
export function calculateScore(questions: ExamQuestion[]): {
  score: number;
  correctCount: number;
  totalQuestions: number;
} {
  const totalQuestions = questions.length;
  const correctCount = questions.filter(q => q.isCorrect).length;
  const score = totalQuestions > 0
    ? Math.round((correctCount / totalQuestions) * 100)
    : 0;

  return {
    score,
    correctCount,
    totalQuestions,
  };
}

// 获取题目类型的中文名称
export function getQuestionTypeName(type: ExamQuestionType): string {
  const names: Record<ExamQuestionType, string> = {
    'en-to-zh': '英译中',
    'zh-to-en': '中译英',
    'spelling': '拼写',
    'listening': '听力',
  };
  return names[type] || type;
}

// 获取分数评级
export function getScoreGrade(score: number): {
  grade: string;
  color: string;
  emoji: string;
} {
  if (score >= 90) {
    return { grade: '优秀', color: 'text-green-500', emoji: '🎉' };
  } else if (score >= 80) {
    return { grade: '良好', color: 'text-blue-500', emoji: '👍' };
  } else if (score >= 70) {
    return { grade: '及格', color: 'text-yellow-500', emoji: '✓' };
  } else if (score >= 60) {
    return { grade: '一般', color: 'text-orange-500', emoji: '💪' };
  } else {
    return { grade: '需努力', color: 'text-red-500', emoji: '📖' };
  }
}
