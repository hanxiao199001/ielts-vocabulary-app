// 语音合成功能

export type VoiceAccent = 'GB' | 'US';

// 检查浏览器是否支持语音合成
export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

// 获取可用的语音列表
export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (!isSpeechSynthesisSupported()) return [];
  return window.speechSynthesis.getVoices();
}

// 根据口音选择合适的语音
export function selectVoiceByAccent(accent: VoiceAccent): SpeechSynthesisVoice | null {
  if (!isSpeechSynthesisSupported()) return null;

  const voices = getAvailableVoices();

  // 尝试找到最匹配的语音
  const voiceFilters = accent === 'GB'
    ? ['en-GB', 'en_GB', 'British', 'UK']
    : ['en-US', 'en_US', 'American', 'US'];

  for (const filter of voiceFilters) {
    const voice = voices.find((v) =>
      v.lang.includes(filter) || v.name.includes(filter)
    );
    if (voice) return voice;
  }

  // 如果找不到精确匹配，返回任意英语语音
  const englishVoice = voices.find((v) => v.lang.startsWith('en'));
  return englishVoice || voices[0] || null;
}

// 朗读文本
export function speakText(
  text: string,
  accent: VoiceAccent = 'GB',
  rate: number = 1.0,
  pitch: number = 1.0,
  onEnd?: () => void,
  onError?: (error: SpeechSynthesisErrorEvent) => void
): void {
  if (!isSpeechSynthesisSupported()) {
    console.warn('Speech synthesis is not supported in this browser');
    return;
  }

  // 停止当前正在播放的语音
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  const voice = selectVoiceByAccent(accent);

  if (voice) {
    utterance.voice = voice;
  }

  utterance.rate = rate;
  utterance.pitch = pitch;
  utterance.volume = 1.0;

  if (onEnd) {
    utterance.onend = onEnd;
  }

  if (onError) {
    utterance.onerror = onError;
  }

  window.speechSynthesis.speak(utterance);
}

// 停止朗读
export function stopSpeaking(): void {
  if (!isSpeechSynthesisSupported()) return;
  window.speechSynthesis.cancel();
}

// 暂停朗读
export function pauseSpeaking(): void {
  if (!isSpeechSynthesisSupported()) return;
  window.speechSynthesis.pause();
}

// 恢复朗读
export function resumeSpeaking(): void {
  if (!isSpeechSynthesisSupported()) return;
  window.speechSynthesis.resume();
}

// 检查是否正在朗读
export function isSpeaking(): boolean {
  if (!isSpeechSynthesisSupported()) return false;
  return window.speechSynthesis.speaking;
}

// 等待语音列表加载（某些浏览器需要异步加载）
export function waitForVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (!isSpeechSynthesisSupported()) {
      resolve([]);
      return;
    }

    const voices = getAvailableVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }

    // 等待 voiceschanged 事件
    window.speechSynthesis.onvoiceschanged = () => {
      resolve(getAvailableVoices());
    };

    // 超时保护
    setTimeout(() => {
      resolve(getAvailableVoices());
    }, 1000);
  });
}
