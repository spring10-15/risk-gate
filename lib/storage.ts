/**
 * 本地存储工具
 * 使用浏览器 localStorage 保存检查历史
 */

import type { RiskRule } from './riskRules';

export interface CheckRecord {
  id: string;
  input: string;
  risks: RiskRule[];
  timestamp: number;
  result: 'safe' | 'risk';
}

const STORAGE_KEY = 'risk-gate-history';
const MAX_RECORDS = 100; // 最多保存 100 条记录

/**
 * 保存检查记录
 */
export function saveRecord(record: CheckRecord): void {
  if (typeof window === 'undefined') return;

  try {
    const history = getHistory();
    history.unshift(record); // 添加到开头

    // 限制数量
    if (history.length > MAX_RECORDS) {
      history.splice(MAX_RECORDS);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('保存记录失败:', error);
  }
}

/**
 * 获取所有历史记录
 */
export function getHistory(): CheckRecord[] {
  if (typeof window === 'undefined') return [];

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('读取历史失败:', error);
    return [];
  }
}

/**
 * 删除单条记录
 */
export function deleteRecord(id: string): void {
  if (typeof window === 'undefined') return;

  try {
    const history = getHistory();
    const filtered = history.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('删除记录失败:', error);
  }
}

/**
 * 清空所有记录
 */
export function clearHistory(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('清空历史失败:', error);
  }
}

/**
 * 格式化时间戳
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  // 1小时内显示"刚刚/X分钟前"
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return minutes < 1 ? '刚刚' : `${minutes}分钟前`;
  }

  // 今天内显示"今天 HH:MM"
  if (date.toDateString() === now.toDateString()) {
    return `今天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }

  // 其他显示完整日期
  return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}
