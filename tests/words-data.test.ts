import { describe, it, expect } from 'vitest';
import words from '@/data/words.json';
import type { Word } from '@/types';

const list = words as Word[];

describe('词库数据质量', () => {
  it('包含 1200 个词条，id 连续且唯一', () => {
    expect(list).toHaveLength(1200);
    const ids = list.map((w) => w.id);
    expect(new Set(ids).size).toBe(1200);
    expect(ids).toEqual([...ids].sort((a, b) => a - b));
  });

  it('单词不重复', () => {
    const words = list.map((w) => w.word.toLowerCase());
    expect(new Set(words).size).toBe(list.length);
  });

  it('每个词条字段完整（词、释义、音标、英中例句）', () => {
    for (const w of list) {
      expect(w.word).toBeTruthy();
      expect(w.translation).toBeTruthy();
      expect(w.phonetic).toMatch(/^\/.+\/$/);
      expect(w.example.en).toBeTruthy();
      expect(w.example.zh).toBeTruthy();
      expect(w.day).toBeGreaterThan(0);
    }
  });

  it('例句包含目标单词（允许词形变化）', () => {
    for (const w of list) {
      const stem = w.word.toLowerCase().split('-')[0].slice(0, 4);
      expect(
        w.example.en.toLowerCase(),
        `id=${w.id} word=${w.word}`
      ).toContain(stem);
    }
  });

  it('不含模板生成的垃圾例句', () => {
    const junkPatterns = [
      /is an important part of university life/,
      /discussed .* in today's lecture/,
      /need to understand .* in their studies/,
    ];
    for (const w of list) {
      for (const p of junkPatterns) {
        expect(p.test(w.example.en), `id=${w.id} word=${w.word}`).toBe(false);
      }
    }
  });
});
