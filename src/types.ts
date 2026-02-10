/**
 * Risk Gate MCP Server 类型定义
 */

import { z } from 'zod';

/**
 * 风险检查请求参数
 */
export const CheckRiskParamsSchema = z.object({
  code: z.string().describe('要检查的代码或操作指令'),
  language: z.enum(['sql', 'shell', 'api', 'auto']).optional().default('auto').describe('代码语言类型')
});

export type CheckRiskParams = z.infer<typeof CheckRiskParamsSchema>;

/**
 * 风险项
 */
export interface RiskItem {
  id: string;
  name: string;
  description: string;
  level: 'critical' | 'high' | 'medium' | 'safe';
  adjustedLevel: 'critical' | 'high' | 'medium' | 'safe';
  category: string;
  context: string;
  confidence: number;
}

/**
 * 风险检查结果
 */
export interface RiskCheckResult {
  hasRisk: boolean;
  risks: RiskItem[];
  highestRiskLevel: 'critical' | 'high' | 'medium' | null;
  summary: string;
}
