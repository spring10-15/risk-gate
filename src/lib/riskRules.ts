/**
 * 风险规则配置
 * 定义所有高代价风险的识别规则
 */

import { analyzeContext, adjustRiskByContext, generateContextDescription } from './contextAnalyzer.js';

export interface RiskRule {
  id: string;
  name: string;
  description: string;
  level: 'critical' | 'high' | 'medium';
  category: string;
  keywords: string[];
  patterns?: RegExp[];
}

export interface EnhancedRiskRule extends RiskRule {
  adjustedLevel: 'critical' | 'high' | 'medium' | 'safe';
  context: string;
  confidence: number;
}

export const riskRules: RiskRule[] = [
  // 极高风险 - 数据删除
  {
    id: 'drop-table',
    name: '删除表/数据库',
    description: 'DROP 命令会永久删除整个表或数据库，数据无法恢复',
    level: 'critical',
    category: '数据安全',
    keywords: ['DROP TABLE', 'DROP DATABASE', 'DROP SCHEMA', 'DROP INDEX'],
    patterns: [/drop\s+table/i, /drop\s+database/i, /drop\s+schema/i]
  },
  {
    id: 'delete-all',
    name: '删除所有数据',
    description: 'DELETE 不带 WHERE 条件会删除表内所有数据',
    level: 'critical',
    category: '数据安全',
    keywords: ['DELETE FROM', 'TRUNCATE TABLE'],
    patterns: [/delete\s+from\s+\w+\s*;?$/i, /truncate\s+table/i]
  },
  {
    id: 'rm-force',
    name: '强制删除文件',
    description: 'rm -rf 会强制递归删除文件，无法恢复',
    level: 'critical',
    category: '系统安全',
    keywords: ['rm -rf', 'rm -fr', 'rm -r /'],
    patterns: [/rm\s+-rf/i, /rm\s+-fr/i]
  },

  // 高风险 - 生产环境操作
  {
    id: 'prod-deploy',
    name: '生产环境部署',
    description: '部署到生产环境会影响所有用户，操作前必须确认',
    level: 'high',
    category: '生产环境',
    keywords: ['deploy', 'production', 'prod:', 'ENV=production'],
    patterns: [/deploy/i, /production|prod/i]
  },
  {
    id: 'batch-update',
    name: '批量修改数据',
    description: 'UPDATE 命令会影响多行数据，可能造成数据错误',
    level: 'high',
    category: '数据安全',
    keywords: ['UPDATE', '批量修改', 'batch update'],
    patterns: [/update\s+\w+\s+set/i]
  },
  {
    id: 'migrate',
    name: '数据库迁移',
    description: '数据库迁移会改变表结构，可能导致服务中断',
    level: 'high',
    category: '数据安全',
    keywords: ['migrate', 'migration', 'ALTER TABLE'],
    patterns: [/migrat/i, /alter\s+table/i]
  },

  // 中风险 - 通知和配置
  {
    id: 'send-all',
    name: '群发消息',
    description: '发送消息给所有用户，错误操作会造成不良影响',
    level: 'medium',
    category: '用户通知',
    keywords: ['send all', 'broadcast', 'notify all', '群发', '推送全部'],
    patterns: [/send\s+all/i, /broadcast/i, /notify\s+all/i]
  },
  {
    id: 'email-all',
    name: '群发邮件',
    description: '发送邮件给所有用户',
    level: 'medium',
    category: '用户通知',
    keywords: ['email all', 'send email to all', '邮件群发'],
    patterns: [/email\s+all/i, /send\s+email/i]
  },
  {
    id: 'config-change',
    name: '修改系统配置',
    description: '修改配置可能影响系统运行',
    level: 'medium',
    category: '系统配置',
    keywords: ['config', '环境变量', 'ENV=', '设置'],
    patterns: [/config/i, /\.env/i]
  },
  {
    id: 'permission-change',
    name: '权限变更',
    description: '修改用户权限可能导致安全问题',
    level: 'medium',
    category: '权限管理',
    keywords: ['GRANT', 'REVOKE', '权限', 'privilege'],
    patterns: [/grant|revoke/i]
  },

  // 特殊风险
  {
    id: 'payment',
    name: '支付/退款操作',
    description: '涉及资金操作，需要仔细核对',
    level: 'high',
    category: '资金安全',
    keywords: ['payment', 'refund', '支付', '退款'],
    patterns: [/payment|refund|pay|退款|支付/i]
  }
];

/**
 * 风险等级映射
 */
export const riskLevelConfig = {
  critical: {
    label: '极高',
    emoji: '🔴',
    color: 'red'
  },
  high: {
    label: '高',
    emoji: '🟠',
    color: 'orange'
  },
  medium: {
    label: '中',
    emoji: '🟡',
    color: 'yellow'
  }
} as const;

/**
 * 检测文本中的风险
 * @param input 用户输入的文本
 * @returns 检测到的风险列表
 */
export function detectRisks(input: string): RiskRule[] {
  if (!input || input.trim().length === 0) {
    return [];
  }

  const detectedRisks: RiskRule[] = [];
  const inputUpper = input.toUpperCase();

  for (const rule of riskRules) {
    // 检查关键词
    const hasKeyword = rule.keywords.some(keyword =>
      inputUpper.includes(keyword.toUpperCase())
    );

    // 检查正则模式
    const hasPattern = rule.patterns?.some(pattern =>
      pattern.test(input)
    );

    if (hasKeyword || hasPattern) {
      detectedRisks.push(rule);
    }
  }

  // 去重（按 ID）
  const uniqueRisks = detectedRisks.filter((rule, index, self) =>
    index === self.findIndex(r => r.id === rule.id)
  );

  // 按风险等级排序
  return uniqueRisks.sort((a, b) => {
    const levelOrder = { critical: 0, high: 1, medium: 2 };
    return levelOrder[a.level] - levelOrder[b.level];
  });
}

/**
 * 获取最高风险等级
 */
export function getHighestRiskLevel(risks: RiskRule[]): 'critical' | 'high' | 'medium' | null {
  if (risks.length === 0) return null;

  if (risks.some(r => r.level === 'critical')) return 'critical';
  if (risks.some(r => r.level === 'high')) return 'high';
  return 'medium';
}

/**
 * 检测文本中的风险（带上下文分析）
 * @param input 用户输入的文本
 * @param language 代码语言（sql, shell, api, auto）
 * @returns 检测到的增强风险列表（包含上下文调整后的风险等级）
 */
export function detectRisksWithContext(
  input: string,
  language: 'auto' | 'sql' | 'shell' | 'api' = 'auto'
): EnhancedRiskRule[] {
  if (!input || input.trim().length === 0) {
    return [];
  }

  // 分析上下文
  const context = analyzeContext(input, language);

  // 基础风险检测
  const baseRisks = detectRisks(input);

  // 如果是只读操作且没有检测到风险，返回空数组
  if (baseRisks.length === 0) {
    return [];
  }

  // 根据上下文调整风险等级
  const enhancedRisks = baseRisks
    .map<RiskRule | null>(risk => {
      const adjustedLevel = adjustRiskByContext(risk.level, context);

      // 如果调整后为 safe，则过滤掉这个风险
      if (adjustedLevel === 'safe') {
        return null;
      }

      return {
        ...risk,
        level: adjustedLevel,
      };
    })
    .filter((risk): risk is RiskRule => risk !== null)
    .map(risk => ({
      ...risk,
      adjustedLevel: risk.level,
      context: generateContextDescription(context),
      confidence: context.confidence
    })) as EnhancedRiskRule[];

  return enhancedRisks.sort((a, b) => {
    const levelOrder: Record<string, number> = { critical: 0, high: 1, medium: 2 };
    return levelOrder[a.adjustedLevel] - levelOrder[b.adjustedLevel];
  });
}
