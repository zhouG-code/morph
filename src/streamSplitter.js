// src/streamSplitter.js — 消息分段引擎

/**
 * 找到最佳的拆分位置
 * @param {string} text - 要拆分的文本
 * @param {number} start - 起始索引
 * @param {number} maxLen - 最大长度
 * @param {number} minLen - 最小长度
 * @returns {number} 拆分位置的索引，-1 表示无法拆分
 */
function findSplitPoint(text, start, maxLen, minLen) {
  const end = Math.min(start + maxLen, text.length);
  const searchStart = Math.min(start + minLen, text.length);

  // 只在 [searchStart, end] 范围内找拆分点

  // 1. 优先找句子边界（从后往前找，优先靠近 end 的）
  for (let i = end; i >= searchStart; i--) {
    const ch = text[i];
    if (ch === '。' || ch === '！' || ch === '？' || ch === '.' || ch === '!' || ch === '?' || ch === '\n') {
      return i + 1; // 包含标点
    }
  }

  // 2. 没找到句子边界，找标点辅助
  for (let j = end; j >= searchStart; j--) {
    const c = text[j];
    if (c === '，' || c === '、' || c === '；' || c === '：' || c === ',' || c === ';' || c === ':') {
      return j + 1;
    }
  }

  // 3. 兜底：如果超过 maxLen * 2 字都没有拆分点，强制拆分
  if (text.length - start > maxLen * 2) {
    return start + maxLen;
  }

  return -1; // 无法拆分，返回整段
}

/**
 * 将长文本拆分成多条短消息
 * @param {string} text - 完整回复文本
 * @param {number} maxLen - 每段最大字符数（默认 120）
 * @param {number} minLen - 每段最小字符数（默认 50）
 * @returns {Array<{text: string, delay: number}>} 分段数组，每段带延迟
 */
function splitIntoMessages(text, maxLen, minLen) {
  maxLen = maxLen || 120;
  minLen = minLen || 50;

  if (!text || text.length <= maxLen) {
    return [{ text: text, delay: 0 }];
  }

  const segments = [];
  let start = 0;

  while (start < text.length) {
    const splitPoint = findSplitPoint(text, start, maxLen, minLen);

    if (splitPoint === -1 || splitPoint <= start) {
      // 无法再拆分，剩余部分作为一段
      segments.push(text.slice(start));
      break;
    }

    segments.push(text.slice(start, splitPoint));
    start = splitPoint;
  }

  // 处理最后两段合并：如果最后一段太短，合并到前一段
  if (segments.length >= 2) {
    const last = segments[segments.length - 1];
    const secondLast = segments[segments.length - 2];
    if (last.length < minLen) {
      segments[segments.length - 2] = secondLast + last;
      segments.pop();
    }
  }

  // 为每段添加延迟（最后一段延迟为 0，其他段 700ms）
  const result = [];
  for (let i = 0; i < segments.length; i++) {
    result.push({
      text: segments[i],
      delay: i < segments.length - 1 ? 700 : 0
    });
  }

  return result;
}
