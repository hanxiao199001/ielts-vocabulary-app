import { LearnRecord, StudyStats, CalendarData } from '@/types';

// 计算学习统计数据
export function calculateStudyStats(
  learnRecords: Record<number, LearnRecord>,
  calendarData: CalendarData[]
): StudyStats {
  const records = Object.values(learnRecords);

  // 统计各状态单词数量
  const knownWords = records.filter((r) => r.status === 'known').length;
  const unknownWords = records.filter((r) => r.status === 'unknown').length;
  const reviewWords = records.filter((r) => r.status === 'review').length;
  const totalLearnedWords = records.length;

  // 计算掌握率
  const masteryRate = totalLearnedWords > 0
    ? Math.round((knownWords / totalLearnedWords) * 100)
    : 0;

  // 计算总学习天数
  const totalStudyDays = calendarData.length;

  // 计算连续学习天数
  const currentStreak = calculateCurrentStreak(calendarData);

  // 计算今日学习时长
  const todayStudyTime = getTodayStudyTime(calendarData);

  return {
    totalLearnedWords,
    knownWords,
    unknownWords,
    reviewWords,
    totalStudyDays,
    currentStreak,
    todayStudyTime,
    masteryRate,
  };
}

// 计算当前连续学习天数
function calculateCurrentStreak(calendarData: CalendarData[]): number {
  if (calendarData.length === 0) return 0;

  // 按日期排序
  const sortedData = [...calendarData].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  let currentDate = new Date(today);

  for (const data of sortedData) {
    const dataDate = new Date(data.date);
    dataDate.setHours(0, 0, 0, 0);

    const diffDays = Math.floor(
      (currentDate.getTime() - dataDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0 && data.wordsLearned > 0) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (diffDays === 1 && data.wordsLearned > 0) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

// 获取今日学习时长
function getTodayStudyTime(calendarData: CalendarData[]): number {
  const today = new Date().toISOString().split('T')[0];
  const todayData = calendarData.find((d) => d.date === today);
  return todayData?.studyTime || 0;
}

// 获取最近N天的学习数据（用于图表）
export function getRecentDaysData(
  calendarData: CalendarData[],
  days: number = 30
): CalendarData[] {
  const today = new Date();
  const result: CalendarData[] = [];

  // 生成最近N天的日期
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const existingData = calendarData.find((d) => d.date === dateStr);
    result.push(
      existingData || { date: dateStr, wordsLearned: 0, studyTime: 0 }
    );
  }

  return result;
}

// 计算每日平均学习单词数
export function getAverageDailyWords(calendarData: CalendarData[]): number {
  if (calendarData.length === 0) return 0;

  const totalWords = calendarData.reduce(
    (sum, data) => sum + data.wordsLearned,
    0
  );
  return Math.round(totalWords / calendarData.length);
}

// 计算每日平均学习时长
export function getAverageDailyTime(calendarData: CalendarData[]): number {
  if (calendarData.length === 0) return 0;

  const totalTime = calendarData.reduce((sum, data) => sum + data.studyTime, 0);
  return Math.round(totalTime / calendarData.length);
}

// 获取学习最多的一天
export function getMostProductiveDay(calendarData: CalendarData[]): CalendarData | null {
  if (calendarData.length === 0) return null;

  return calendarData.reduce((max, current) =>
    current.wordsLearned > max.wordsLearned ? current : max
  );
}

// 计算本周学习单词数
export function getThisWeekWords(calendarData: CalendarData[]): number {
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay()); // 本周周日
  weekStart.setHours(0, 0, 0, 0);

  return calendarData
    .filter((d) => new Date(d.date) >= weekStart)
    .reduce((sum, d) => sum + d.wordsLearned, 0);
}

// 计算本月学习单词数
export function getThisMonthWords(calendarData: CalendarData[]): number {
  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  return calendarData
    .filter((d) => new Date(d.date) >= monthStart)
    .reduce((sum, d) => sum + d.wordsLearned, 0);
}

// 格式化学习时长（分钟转为小时分钟）
export function formatStudyTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}分钟`;
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (mins === 0) {
    return `${hours}小时`;
  }

  return `${hours}小时${mins}分钟`;
}

// 计算学习进度百分比（基于总单词数）
export function calculateProgress(learnedWords: number, totalWords: number): number {
  if (totalWords === 0) return 0;
  return Math.round((learnedWords / totalWords) * 100);
}
