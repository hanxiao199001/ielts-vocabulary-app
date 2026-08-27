import { describe, it, expect } from 'vitest';
import {
  calculateNextReviewDate,
  needsReview,
  getWordsNeedingReview,
} from '@/lib/spaced-repetition';
import { REVIEW_INTERVALS, LearnRecord } from '@/types';

function record(partial: Partial<LearnRecord>): LearnRecord {
  return {
    wordId: 1,
    status: 'review',
    learnCount: 1,
    lastReviewTime: new Date().toISOString(),
    ...partial,
  } as LearnRecord;
}

describe('calculateNextReviewDate', () => {
  it('第一次学习后间隔为 REVIEW_INTERVALS[0] 天', () => {
    const last = '2026-01-01T00:00:00.000Z';
    const next = calculateNextReviewDate(last, 1);
    const expected = new Date(last);
    expected.setDate(expected.getDate() + REVIEW_INTERVALS[0]);
    expect(next.getTime()).toBe(expected.getTime());
  });

  it('学习次数超过间隔表长度时使用最大间隔', () => {
    const last = '2026-01-01T00:00:00.000Z';
    const next = calculateNextReviewDate(last, 99);
    const expected = new Date(last);
    expected.setDate(
      expected.getDate() + REVIEW_INTERVALS[REVIEW_INTERVALS.length - 1]
    );
    expect(next.getTime()).toBe(expected.getTime());
  });
});

describe('needsReview', () => {
  it('unknown 状态总是需要复习', () => {
    expect(needsReview(record({ status: 'unknown' }))).toBe(true);
  });

  it('review 状态到期后需要复习', () => {
    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString();
    expect(
      needsReview(record({ status: 'review', learnCount: 1, lastReviewTime: tenDaysAgo }))
    ).toBe(true);
  });

  it('review 状态未到期不需要复习', () => {
    const justNow = new Date().toISOString();
    expect(
      needsReview(record({ status: 'review', learnCount: 1, lastReviewTime: justNow }))
    ).toBe(false);
  });

  it('known 且 learnCount 为 0 不需要复习', () => {
    expect(needsReview(record({ status: 'known', learnCount: 0 }))).toBe(false);
  });
});

describe('getWordsNeedingReview', () => {
  it('只返回需要复习的单词 id', () => {
    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString();
    const records = {
      1: record({ wordId: 1, status: 'unknown' }),
      2: record({ wordId: 2, status: 'review', lastReviewTime: tenDaysAgo }),
      3: record({ wordId: 3, status: 'review', lastReviewTime: new Date().toISOString() }),
    };
    expect(getWordsNeedingReview(records).sort()).toEqual([1, 2]);
  });
});
