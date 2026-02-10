# 贡献指南

感谢你考虑为 Risk Gate 做贡献！

---

## 🤝 如何贡献

### 报告 Bug

如果你发现了 Bug，请：

1. 检查 [Issues](https://github.com/yourusername/risk-gate/issues) 中是否已有相同问题
2. 如果没有，创建新的 Issue，包含：
   - 清晰的标题
   - 详细的问题描述
   - 复现步骤
   - 预期行为
   - 实际行为
   - 环境信息（操作系统、Node 版本等）

### 提出新功能

如果你有好的功能建议，请：

1. 先在 Issues 中讨论，确保方向一致
2. 说明功能的价值和使用场景
3. 如果可能，提供设计思路

### 提交代码

1. **Fork 项目**
   ```bash
   # 在 GitHub 上 Fork 本仓库
   ```

2. **克隆到本地**
   ```bash
   git clone https://github.com/yourusername/risk-gate.git
   cd risk-gate
   ```

3. **安装依赖**
   ```bash
   npm install
   ```

4. **创建分支**
   ```bash
   git checkout -b feature/your-feature-name
   ```

5. **编写代码**
   - 遵循现有代码风格
   - 添加必要的注释
   - 更新相关文档

6. **测试**
   ```bash
   npm run build
   npm run inspector
   ```

7. **提交更改**
   ```bash
   git add .
   git commit -m "feat: add your feature"
   ```

8. **推送到 GitHub**
   ```bash
   git push origin feature/your-feature-name
   ```

9. **创建 Pull Request**
   - 在 GitHub 上创建 PR
   - 填写 PR 模板
   - 等待 review

---

## 📝 代码规范

### TypeScript

- 使用 TypeScript 编写代码
- 遵循现有的类型定义
- 添加适当的类型注解

### 命名规范

- 文件名：`camelCase.ts` 或 `kebab-case.ts`
- 变量名：`camelCase`
- 常量名：`UPPER_SNAKE_CASE`
- 类型名：`PascalCase`

### 注释

- 关键函数必须添加 JSDoc 注释
- 复杂逻辑需要说明
- 风险规则需要清晰的描述

---

## 🎯 开发指南

### 添加新风险规则

编辑 `src/lib/riskRules.ts` 或 `lib/riskRules.ts`：

```typescript
{
  id: 'custom-rule',
  name: '规则名称',
  description: '规则描述',
  level: 'high',        // critical | high | medium
  category: '数据安全',
  keywords: ['关键词1', '关键词2'],
  patterns: [/正则表达式/]
}
```

### 添加新上下文分析器

编辑 `src/lib/contextAnalyzer.ts` 或 `lib/contextAnalyzer.ts`：

```typescript
export function analyzeCustomContext(input: string): ContextAnalysis {
  // 你的分析逻辑
}
```

---

## 📧 联系方式

- **作者**：一健
- **项目地址**：https://github.com/yourusername/risk-gate

---

**再次感谢你的贡献！** 🎉
