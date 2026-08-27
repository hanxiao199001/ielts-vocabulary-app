#!/usr/bin/env node
/**
 * 将 scripts/patches/batch_*.json 中人工撰写的高质量例句/释义
 * 合并进 data/words.json（按 id 匹配）。
 * 用法: node scripts/apply-example-patches.js
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const wordsPath = path.join(root, 'data', 'words.json');
const patchDir = path.join(__dirname, 'patches');

const words = JSON.parse(fs.readFileSync(wordsPath, 'utf8'));
const byId = new Map(words.map((w) => [w.id, w]));

let patched = 0;
for (const file of fs.readdirSync(patchDir).filter((f) => f.endsWith('.json')).sort()) {
  const patch = JSON.parse(fs.readFileSync(path.join(patchDir, file), 'utf8'));
  for (const [idStr, p] of Object.entries(patch)) {
    const w = byId.get(Number(idStr));
    if (!w) {
      console.warn(`跳过：words.json 中不存在 id=${idStr}`);
      continue;
    }
    if (p.word) w.word = p.word;
    if (p.phonetic) w.phonetic = p.phonetic;
    if (p.translation) w.translation = p.translation;
    if (p.en && p.zh) w.example = { en: p.en, zh: p.zh };
    patched += 1;
  }
}

fs.writeFileSync(wordsPath, JSON.stringify(words, null, 2) + '\n', 'utf8');
console.log(`已合并 ${patched} 条词条修订，共 ${words.length} 个单词。`);
