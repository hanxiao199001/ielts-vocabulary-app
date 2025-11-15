// 单词数据类型
export interface Word {
  id: number;
  word: string;
  translation: string;
  phonetic?: string;
  example: {
    en: string;
    zh: string;
  };
  day: number;
}

// 学习状态类型
export type LearnStatus = 'known' | 'unknown' | 'review';

// 学习记录类型
export interface LearnRecord {
  wordId: number;
  status: LearnStatus;
  learnCount: number;
  lastReviewTime: string;
  recordings: string[]; // base64 编码的音频数据
  firstLearnTime: string;
}

// 用户设置类型
export interface UserSettings {
  dailyWordLimit: number; // 每日学习单词数量
  voiceAccent: 'GB' | 'US'; // 英式或美式发音
  darkMode: boolean;
  hasSeenOnboarding: boolean; // 是否已看过引导页面
}

// 学习统计类型
export interface StudyStats {
  totalLearnedWords: number;
  knownWords: number;
  unknownWords: number;
  reviewWords: number;
  totalStudyDays: number;
  currentStreak: number; // 连续学习天数
  todayStudyTime: number; // 今日学习时长（分钟）
  masteryRate: number; // 掌握率
}

// 学习日历数据类型
export interface CalendarData {
  date: string; // YYYY-MM-DD
  wordsLearned: number;
  studyTime: number; // 分钟
}

// 复习计划类型
export interface ReviewSchedule {
  wordId: number;
  nextReviewDate: string;
  interval: number; // 复习间隔（天数）
}

// 艾宾浩斯复习间隔（天）
export const REVIEW_INTERVALS = [1, 3, 7, 15, 30];
