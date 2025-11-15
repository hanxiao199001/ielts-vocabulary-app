import { LearnRecord, ReviewSchedule, REVIEW_INTERVALS } from '@/types';

// 计算下次复习日期
export function calculateNextReviewDate(
  lastReviewTime: string,
  learnCount: number
): Date {
  const lastReview = new Date(lastReviewTime);

  // 根据学习次数选择复习间隔
  const intervalIndex = Math.min(learnCount - 1, REVIEW_INTERVALS.length - 1);
  const interval = REVIEW_INTERVALS[intervalIndex];

  const nextReview = new Date(lastReview);
  nextReview.setDate(nextReview.getDate() + interval);

  return nextReview;
}

// 检查单词是否需要复习
export function needsReview(record: LearnRecord): boolean {
  // 如果状态是 'unknown'，总是需要复习
  if (record.status === 'unknown') return true;

  // 如果状态是 'review'，检查是否到了复习时间
  if (record.status === 'review') {
    const nextReviewDate = calculateNextReviewDate(
      record.lastReviewTime,
      record.learnCount
    );
    return new Date() >= nextReviewDate;
  }

  // 如果状态是 'known'，也按复习间隔检查
  if (record.status === 'known' && record.learnCount > 0) {
    const nextReviewDate = calculateNextReviewDate(
      record.lastReviewTime,
      record.learnCount
    );
    return new Date() >= nextReviewDate;
  }

  return false;
}

// 获取需要复习的单词列表
export function getWordsNeedingReview(
  learnRecords: Record<number, LearnRecord>
): number[] {
  return Object.values(learnRecords)
    .filter(needsReview)
    .map((record) => record.wordId);
}

// 生成复习计划
export function generateReviewSchedule(
  learnRecords: Record<number, LearnRecord>
): ReviewSchedule[] {
  return Object.values(learnRecords)
    .filter((record) => record.status !== 'unknown')
    .map((record) => {
      const nextReviewDate = calculateNextReviewDate(
        record.lastReviewTime,
        record.learnCount
      );

      const intervalIndex = Math.min(
        record.learnCount - 1,
        REVIEW_INTERVALS.length - 1
      );
      const interval = REVIEW_INTERVALS[intervalIndex];

      return {
        wordId: record.wordId,
        nextReviewDate: nextReviewDate.toISOString(),
        interval,
      };
    })
    .sort((a, b) =>
      new Date(a.nextReviewDate).getTime() - new Date(b.nextReviewDate).getTime()
    );
}

// 按优先级排序需要复习的单词
export function sortReviewWordsByPriority(
  wordIds: number[],
  learnRecords: Record<number, LearnRecord>
): number[] {
  return wordIds.sort((a, b) => {
    const recordA = learnRecords[a];
    const recordB = learnRecords[b];

    if (!recordA || !recordB) return 0;

    // 1. 'unknown' 状态优先级最高
    if (recordA.status === 'unknown' && recordB.status !== 'unknown') return -1;
    if (recordA.status !== 'unknown' && recordB.status === 'unknown') return 1;

    // 2. 学习次数少的优先
    if (recordA.learnCount !== recordB.learnCount) {
      return recordA.learnCount - recordB.learnCount;
    }

    // 3. 最后复习时间早的优先
    return new Date(recordA.lastReviewTime).getTime() -
           new Date(recordB.lastReviewTime).getTime();
  });
}

// 获取今日应复习的单词数量
export function getTodayReviewCount(
  learnRecords: Record<number, LearnRecord>
): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return Object.values(learnRecords).filter((record) => {
    if (record.status === 'unknown') return true;

    const nextReviewDate = calculateNextReviewDate(
      record.lastReviewTime,
      record.learnCount
    );

    return nextReviewDate >= today && nextReviewDate < tomorrow;
  }).length;
}

// 获取即将到期的复习单词（未来N天内）
export function getUpcomingReviews(
  learnRecords: Record<number, LearnRecord>,
  days: number = 7
): ReviewSchedule[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const futureDate = new Date(today);
  futureDate.setDate(futureDate.getDate() + days);

  return generateReviewSchedule(learnRecords).filter((schedule) => {
    const reviewDate = new Date(schedule.nextReviewDate);
    return reviewDate >= today && reviewDate < futureDate;
  });
}

// 计算复习完成率
export function calculateReviewCompletionRate(
  learnRecords: Record<number, LearnRecord>
): number {
  const totalReviews = Object.values(learnRecords).length;
  if (totalReviews === 0) return 100;

  const overdueReviews = getWordsNeedingReview(learnRecords).length;
  const completedReviews = totalReviews - overdueReviews;

  return Math.round((completedReviews / totalReviews) * 100);
}

// 随机打乱数组
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// 获取推荐的每日复习数量
export function getRecommendedDailyReviewCount(
  learnRecords: Record<number, LearnRecord>
): number {
  const needReview = getWordsNeedingReview(learnRecords).length;

  // 建议每天复习20-30个单词
  if (needReview === 0) return 0;
  if (needReview <= 30) return needReview;

  return 30;
}
