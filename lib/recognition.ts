import { PronunciationEvaluation } from '@/types';

// 检查浏览器是否支持语音识别
export function isSpeechRecognitionSupported(): boolean {
  return typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
}

// 获取 SpeechRecognition 构造函数
function getSpeechRecognition(): any {
  if (typeof window === 'undefined') return null;
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
}

// 语音识别（用于发音评价）
export function recognizeSpeech(
  audioBlob: Blob,
  expectedText: string,
  accent: 'GB' | 'US' = 'GB'
): Promise<PronunciationEvaluation> {
  return new Promise((resolve, reject) => {
    if (!isSpeechRecognitionSupported()) {
      reject(new Error('Speech recognition is not supported'));
      return;
    }

    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      reject(new Error('Speech recognition is not available'));
      return;
    }

    const recognition = new SpeechRecognition();

    // 配置识别器
    recognition.lang = accent === 'GB' ? 'en-GB' : 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    // 由于 Web Speech API 不支持直接从 Blob 识别，
    // 我们需要播放音频并同时进行识别
    const audio = new Audio(URL.createObjectURL(audioBlob));

    recognition.onstart = () => {
      // 开始识别时播放录音
      audio.play().catch(err => {
        console.error('Audio playback error:', err);
      });
    };

    recognition.onresult = (event: any) => {
      const result = event.results[0][0];
      const recognizedText = result.transcript.toLowerCase().trim();
      const confidence = result.confidence;

      // 评估发音准确度
      const evaluation = evaluatePronunciation(
        expectedText.toLowerCase().trim(),
        recognizedText,
        confidence
      );

      resolve(evaluation);

      // 清理
      URL.revokeObjectURL(audio.src);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);

      // 即使出错也返回一个结果
      resolve({
        recognizedText: '',
        originalText: expectedText,
        accuracy: 0,
        matchedWords: [],
        missedWords: expectedText.toLowerCase().split(/\s+/),
        confidence: 0,
      });

      URL.revokeObjectURL(audio.src);
    };

    recognition.onend = () => {
      audio.pause();
    };

    // 开始识别
    recognition.start();

    // 超时处理
    setTimeout(() => {
      try {
        recognition.stop();
      } catch (e) {
        // ignore
      }
    }, 10000); // 10秒超时
  });
}

// 评估发音准确度
function evaluatePronunciation(
  originalText: string,
  recognizedText: string,
  confidence: number
): PronunciationEvaluation {
  // 分词
  const originalWords = originalText
    .split(/\s+/)
    .filter(w => w.length > 0);

  const recognizedWords = recognizedText
    .split(/\s+/)
    .filter(w => w.length > 0);

  // 计算匹配的单词
  const matchedWords: string[] = [];
  const missedWords: string[] = [];

  originalWords.forEach((word) => {
    if (recognizedWords.includes(word)) {
      matchedWords.push(word);
    } else {
      // 检查是否有相似的单词
      const similar = recognizedWords.find(w =>
        calculateSimilarity(word, w) > 0.7
      );
      if (similar) {
        matchedWords.push(word);
      } else {
        missedWords.push(word);
      }
    }
  });

  // 计算准确度
  let accuracy = 0;
  if (originalWords.length > 0) {
    accuracy = Math.round((matchedWords.length / originalWords.length) * 100);
  }

  // 综合置信度调整准确度
  accuracy = Math.round(accuracy * (0.5 + confidence * 0.5));

  return {
    recognizedText,
    originalText,
    accuracy: Math.min(100, Math.max(0, accuracy)),
    matchedWords,
    missedWords,
    confidence,
  };
}

// 计算两个字符串的相似度（使用 Levenshtein 距离）
function calculateSimilarity(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;

  if (len1 === 0) return len2 === 0 ? 1 : 0;
  if (len2 === 0) return 0;

  const matrix: number[][] = [];

  // 初始化矩阵
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // 填充矩阵
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // 删除
        matrix[i][j - 1] + 1, // 插入
        matrix[i - 1][j - 1] + cost // 替换
      );
    }
  }

  const distance = matrix[len1][len2];
  const maxLen = Math.max(len1, len2);

  return 1 - distance / maxLen;
}

// 获取发音评价的文字描述
export function getEvaluationDescription(accuracy: number): {
  text: string;
  color: string;
  emoji: string;
} {
  if (accuracy >= 90) {
    return {
      text: '优秀',
      color: 'text-green-500',
      emoji: '🎉',
    };
  } else if (accuracy >= 75) {
    return {
      text: '良好',
      color: 'text-blue-500',
      emoji: '👍',
    };
  } else if (accuracy >= 60) {
    return {
      text: '一般',
      color: 'text-yellow-500',
      emoji: '💪',
    };
  } else {
    return {
      text: '需要练习',
      color: 'text-red-500',
      emoji: '📖',
    };
  }
}
