import { LearnRecord, UserSettings, CalendarData } from '@/types';

// LocalStorage keys
const KEYS = {
  LEARN_RECORDS: 'ielts_learn_records',
  USER_SETTINGS: 'ielts_user_settings',
  CALENDAR_DATA: 'ielts_calendar_data',
  CURRENT_DAY: 'ielts_current_day',
  SESSION_START: 'ielts_session_start',
};

// 默认设置
const DEFAULT_SETTINGS: UserSettings = {
  dailyWordLimit: 50,
  voiceAccent: 'GB',
  speechRate: 'normal',
  darkMode: false,
  hasSeenOnboarding: false,
};

// 获取学习记录
export function getLearnRecords(): Record<number, LearnRecord> {
  if (typeof window === 'undefined') return {};
  try {
    const data = localStorage.getItem(KEYS.LEARN_RECORDS);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error reading learn records:', error);
    return {};
  }
}

// 保存学习记录
export function saveLearnRecord(record: LearnRecord): void {
  if (typeof window === 'undefined') return;
  try {
    const records = getLearnRecords();
    records[record.wordId] = record;
    localStorage.setItem(KEYS.LEARN_RECORDS, JSON.stringify(records));
  } catch (error) {
    console.error('Error saving learn record:', error);
  }
}

// 批量保存学习记录
export function saveLearnRecords(records: Record<number, LearnRecord>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEYS.LEARN_RECORDS, JSON.stringify(records));
  } catch (error) {
    console.error('Error saving learn records:', error);
  }
}

// 获取单个单词的学习记录
export function getWordLearnRecord(wordId: number): LearnRecord | null {
  const records = getLearnRecords();
  return records[wordId] || null;
}

// 获取用户设置
export function getUserSettings(): UserSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const data = localStorage.getItem(KEYS.USER_SETTINGS);
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error reading user settings:', error);
    return DEFAULT_SETTINGS;
  }
}

// 保存用户设置
export function saveUserSettings(settings: Partial<UserSettings>): void {
  if (typeof window === 'undefined') return;
  try {
    const currentSettings = getUserSettings();
    const newSettings = { ...currentSettings, ...settings };
    localStorage.setItem(KEYS.USER_SETTINGS, JSON.stringify(newSettings));
  } catch (error) {
    console.error('Error saving user settings:', error);
  }
}

// 获取日历数据
export function getCalendarData(): CalendarData[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(KEYS.CALENDAR_DATA);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading calendar data:', error);
    return [];
  }
}

// 保存日历数据
export function saveCalendarData(data: CalendarData[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEYS.CALENDAR_DATA, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving calendar data:', error);
  }
}

// 更新今日学习数据
export function updateTodayStudy(wordsLearned: number, studyTime: number): void {
  if (typeof window === 'undefined') return;
  try {
    const today = new Date().toISOString().split('T')[0];
    const calendarData = getCalendarData();
    const todayIndex = calendarData.findIndex((d) => d.date === today);

    if (todayIndex >= 0) {
      calendarData[todayIndex].wordsLearned = wordsLearned;
      calendarData[todayIndex].studyTime = studyTime;
    } else {
      calendarData.push({ date: today, wordsLearned, studyTime });
    }

    saveCalendarData(calendarData);
  } catch (error) {
    console.error('Error updating today study:', error);
  }
}

// 获取当前学习天数
export function getCurrentDay(): number {
  if (typeof window === 'undefined') return 1;
  try {
    const data = localStorage.getItem(KEYS.CURRENT_DAY);
    return data ? parseInt(data, 10) : 1;
  } catch (error) {
    console.error('Error reading current day:', error);
    return 1;
  }
}

// 保存当前学习天数
export function saveCurrentDay(day: number): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEYS.CURRENT_DAY, day.toString());
  } catch (error) {
    console.error('Error saving current day:', error);
  }
}

// 获取当前学习会话开始时间
export function getSessionStart(): number {
  if (typeof window === 'undefined') return Date.now();
  try {
    const data = localStorage.getItem(KEYS.SESSION_START);
    return data ? parseInt(data, 10) : Date.now();
  } catch (error) {
    console.error('Error reading session start:', error);
    return Date.now();
  }
}

// 保存学习会话开始时间
export function saveSessionStart(timestamp: number): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEYS.SESSION_START, timestamp.toString());
  } catch (error) {
    console.error('Error saving session start:', error);
  }
}

// 导出所有数据
export function exportAllData(): string {
  if (typeof window === 'undefined') return '{}';
  try {
    const data = {
      learnRecords: getLearnRecords(),
      userSettings: getUserSettings(),
      calendarData: getCalendarData(),
      currentDay: getCurrentDay(),
      exportDate: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  } catch (error) {
    console.error('Error exporting data:', error);
    return '{}';
  }
}

// 清除所有学习数据（保留设置）
export function clearLearnData(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(KEYS.LEARN_RECORDS);
    localStorage.removeItem(KEYS.CALENDAR_DATA);
    localStorage.removeItem(KEYS.CURRENT_DAY);
    localStorage.removeItem(KEYS.SESSION_START);
  } catch (error) {
    console.error('Error clearing learn data:', error);
  }
}

// 清除所有数据（包括设置）
export function clearAllData(): void {
  if (typeof window === 'undefined') return;
  try {
    Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
  } catch (error) {
    console.error('Error clearing all data:', error);
  }
}

// 获取 localStorage 使用情况（KB）
export function getStorageSize(): number {
  if (typeof window === 'undefined') return 0;
  try {
    let total = 0;
    Object.values(KEYS).forEach((key) => {
      const item = localStorage.getItem(key);
      if (item) {
        total += item.length + key.length;
      }
    });
    return Math.round(total / 1024); // 转换为 KB
  } catch (error) {
    console.error('Error calculating storage size:', error);
    return 0;
  }
}
