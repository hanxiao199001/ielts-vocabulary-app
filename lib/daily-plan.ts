import { DailyPlan, ExamResult } from '@/types';

// LocalStorage keys
const DAILY_PLAN_KEY = 'ielts_daily_plan';
const EXAM_RESULTS_KEY = 'ielts_exam_results';
const LAST_CHECK_DATE_KEY = 'ielts_last_check_date';

// 获取今天的日期字符串 YYYY-MM-DD
export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

// 检查是否是新的一天
export function isNewDay(): boolean {
  if (typeof window === 'undefined') return false;

  const lastCheckDate = localStorage.getItem(LAST_CHECK_DATE_KEY);
  const today = getTodayDate();

  return lastCheckDate !== today;
}

// 更新最后检查日期
export function updateLastCheckDate(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LAST_CHECK_DATE_KEY, getTodayDate());
}

// 获取今日学习计划
export function getTodayPlan(): DailyPlan | null {
  if (typeof window === 'undefined') return null;

  try {
    const data = localStorage.getItem(DAILY_PLAN_KEY);
    if (!data) return null;

    const plan: DailyPlan = JSON.parse(data);
    const today = getTodayDate();

    // 如果计划不是今天的，返回 null
    if (plan.date !== today) {
      return null;
    }

    return plan;
  } catch (error) {
    console.error('Error reading daily plan:', error);
    return null;
  }
}

// 保存今日学习计划
export function saveTodayPlan(wordIds: number[]): DailyPlan {
  if (typeof window === 'undefined') {
    return {
      date: getTodayDate(),
      wordIds,
      completed: false,
      createdAt: new Date().toISOString(),
    };
  }

  const plan: DailyPlan = {
    date: getTodayDate(),
    wordIds,
    completed: false,
    createdAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(DAILY_PLAN_KEY, JSON.stringify(plan));
  } catch (error) {
    console.error('Error saving daily plan:', error);
  }

  return plan;
}

// 标记今日计划为完成
export function completeTodayPlan(): void {
  if (typeof window === 'undefined') return;

  const plan = getTodayPlan();
  if (!plan) return;

  plan.completed = true;

  try {
    localStorage.setItem(DAILY_PLAN_KEY, JSON.stringify(plan));
  } catch (error) {
    console.error('Error completing daily plan:', error);
  }
}

// 添加单词到今日计划
export function addWordToPlan(wordId: number): void {
  if (typeof window === 'undefined') return;

  let plan = getTodayPlan();

  if (!plan) {
    // 如果没有计划，创建新计划
    plan = saveTodayPlan([wordId]);
    return;
  }

  // 检查是否已存在
  if (!plan.wordIds.includes(wordId)) {
    plan.wordIds.push(wordId);
    try {
      localStorage.setItem(DAILY_PLAN_KEY, JSON.stringify(plan));
    } catch (error) {
      console.error('Error adding word to plan:', error);
    }
  }
}

// 从今日计划移除单词
export function removeWordFromPlan(wordId: number): void {
  if (typeof window === 'undefined') return;

  const plan = getTodayPlan();
  if (!plan) return;

  plan.wordIds = plan.wordIds.filter(id => id !== wordId);

  try {
    localStorage.setItem(DAILY_PLAN_KEY, JSON.stringify(plan));
  } catch (error) {
    console.error('Error removing word from plan:', error);
  }
}

// 获取考试结果历史
export function getExamResults(): ExamResult[] {
  if (typeof window === 'undefined') return [];

  try {
    const data = localStorage.getItem(EXAM_RESULTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading exam results:', error);
    return [];
  }
}

// 保存考试结果
export function saveExamResult(result: ExamResult): void {
  if (typeof window === 'undefined') return;

  try {
    const results = getExamResults();
    results.unshift(result); // 添加到开头

    // 只保留最近30次结果
    const limitedResults = results.slice(0, 30);

    localStorage.setItem(EXAM_RESULTS_KEY, JSON.stringify(limitedResults));
  } catch (error) {
    console.error('Error saving exam result:', error);
  }
}

// 获取今日考试结果
export function getTodayExamResult(): ExamResult | null {
  const results = getExamResults();
  const today = getTodayDate();

  return results.find(r => r.date === today) || null;
}

// 清除今日计划
export function clearTodayPlan(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(DAILY_PLAN_KEY);
}
