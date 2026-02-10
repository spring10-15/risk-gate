#!/usr/bin/env node
/**
 * Risk Gate MCP Server
 * 实时检测操作风险的 Agent
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { detectRisksWithContext } from './lib/riskRules.js';
import type { RiskItem, RiskCheckResult } from './types.js';

// 创建 MCP Server 实例
const server = new McpServer({
  name: 'risk-gate-mcp-server',
  version: '1.0.0',
});

// 注册风险检查工具
server.registerTool(
  'check_risk',
  {
    title: '检查操作风险',
    description: '检测代码或操作指令中的潜在风险，支持 SQL、Shell 命令、API 调用等多种输入类型。能够根据上下文分析操作的影响范围和风险等级。',
    inputSchema: {
      code: z.string().describe('要检查的代码或操作指令'),
      language: z.enum(['sql', 'shell', 'api', 'auto'])
        .optional()
        .default('auto')
        .describe('代码语言类型（sql/shell/api/auto，默认自动检测）'),
    },
  },
  async ({ code, language = 'auto' }) => {
    try {
      // 使用上下文感知的风险检测
      const risks = detectRisksWithContext(code, language);
      const filteredRisks = risks.filter(r => r.adjustedLevel !== 'safe');

      // 构建返回结果
      const result: RiskCheckResult = {
        hasRisk: filteredRisks.length > 0,
        risks: filteredRisks.map(r => ({
          id: r.id,
          name: r.name,
          description: r.description,
          level: r.adjustedLevel,
          adjustedLevel: r.adjustedLevel,
          category: r.category,
          context: r.context,
          confidence: r.confidence,
        })),
        highestRiskLevel: filteredRisks.length > 0
          ? (filteredRisks[0].adjustedLevel === 'safe' ? null : filteredRisks[0].adjustedLevel)
          : null,
        summary: generateSummary(filteredRisks),
      };

      // 格式化输出
      let output = '';

      if (!result.hasRisk) {
        output = '✅ **未检测到风险**\n\n此操作看起来是安全的，但仍请仔细检查你的操作是否正确。';
      } else {
        output = `⚠️ **检测到 ${filteredRisks.length} 个风险**\n\n`;

        // 风险详情
        for (const risk of result.risks) {
          const emoji = risk.level === 'critical' ? '🔴' : risk.level === 'high' ? '🟠' : '🟡';
          output += `${emoji} **${risk.name}** (${risk.level})\n`;
          output += `   ${risk.description}\n`;

          if (risk.context) {
            output += `   上下文：${risk.context}\n`;
          }

          output += '\n';
        }

        // 总结
        output += `**总结**\n${result.summary}`;
      }

      return {
        content: [{
          type: 'text',
          text: output,
        }],
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ 风险检测失败：${error instanceof Error ? error.message : '未知错误'}`,
        }],
        isError: true,
      };
    }
  }
);

/**
 * 生成风险总结
 */
function generateSummary(risks: RiskItem[]): string {
  if (risks.length === 0) {
    return '未检测到明显风险，但请保持谨慎。';
  }

  const criticalCount = risks.filter(r => r.adjustedLevel === 'critical').length;
  const highCount = risks.filter(r => r.adjustedLevel === 'high').length;
  const mediumCount = risks.filter(r => r.adjustedLevel === 'medium').length;

  const parts: string[] = [];

  if (criticalCount > 0) {
    parts.push(`${criticalCount} 个极高风险`);
  }
  if (highCount > 0) {
    parts.push(`${highCount} 个高风险`);
  }
  if (mediumCount > 0) {
    parts.push(`${mediumCount} 个中风险`);
  }

  let summary = `检测到：${parts.join('、')}。`;

  // 根据最高风险等级给出建议
  const highestLevel = risks[0].adjustedLevel;

  if (highestLevel === 'critical') {
    summary += '\n\n⛔ **强烈建议立即停止操作！**\n- 此操作可能造成不可恢复的损失\n- 请三思而后行，确保你完全了解后果\n- 如有必要，请咨询技术专家';
  } else if (highestLevel === 'high') {
    summary += '\n\n⚠️ **请谨慎操作**\n- 此操作可能影响系统或大量数据\n- 建议先在测试环境验证\n- 确保有回滚方案';
  } else {
    summary += '\n\n✓ **操作相对安全**\n- 仍需仔细检查操作是否正确\n- 建议在非高峰时段执行';
  }

  return summary;
}

// 启动服务器
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // 调试用：输出到 stderr，避免干扰 MCP 通信
  console.error('Risk Gate MCP Server 已启动');
}

main().catch((error) => {
  console.error('启动 Risk Gate MCP Server 失败:', error);
  process.exit(1);
});
