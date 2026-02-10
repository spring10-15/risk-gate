# Risk Gate 项目指南

> **项目定位**：开源的 MCP Server - 操作风险检测工具
> **目标用户**：使用 Claude Code、Cursor、VS Code 的开发者和非技术用户
> **核心原则**：简单、专注、单点击穿

---

## 📋 项目简介

**Risk Gate** 是一个操作风险检查工具，通过 MCP 协议集成到 AI 工具中，实时检测 SQL、Shell 命令、API 调用等操作风险。

### 核心特性
- 🔍 **智能检测** - 支持 SQL、Shell、API 调用等多种输入类型
- 🧠 **上下文感知** - 区分安全操作和危险操作
- 🎯 **智能调整** - 根据环境、范围自动调整风险等级
- 🔌 **即插即用** - 集成到 Claude Desktop、Cursor、VS Code

---

## 🚀 开发指南

### 本地开发

```bash
# 安装依赖
npm install

# 开发模式（自动重新编译）
npm run watch

# 运行 MCP Inspector（可视化测试）
npm run inspector

# 编译
npm run build
```

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

### 修改上下文分析逻辑

编辑 `src/lib/contextAnalyzer.ts` 或 `lib/contextAnalyzer.ts`：

- `analyzeSQLContext()` - SQL 上下文分析
- `analyzeShellContext()` - Shell 命令分析
- `analyzeAPIContext()` - API 调用分析

---

## 📁 项目结构

```
risk-gate/
├── src/                    # 源代码
│   ├── index.ts           # MCP Server 入口
│   ├── types.ts           # 类型定义
│   └── lib/
│       ├── riskRules.ts          # 风险规则（12种）
│       └── contextAnalyzer.ts    # 上下文分析器
│
├── lib/                   # 共享核心逻辑（备用）
│   ├── riskRules.ts
│   └── contextAnalyzer.ts
│
├── .project/              # 内部管理文件
│   ├── GUIDE.md          # 本文件
│   └── MEMORY.md         # 操作记录
│
├── .github/               # GitHub 相关
│   ├── ISSUE_TEMPLATE/   # Issue 模板
│   └── PULL_REQUEST_TEMPLATE.md
│
├── build/                 # 编译输出
├── README.md              # 对外说明
├── CONTRIBUTING.md        # 贡献指南
├── CHANGELOG.md           # 更新日志
├── LICENSE                # MIT 协议
└── package.json
```

---

## 📊 当前状态

### 已完成 ✅
- [x] MCP Server 核心功能
- [x] 上下文感知检测
- [x] 支持 12 种风险类型
- [x] 完整的开源文档
- [x] GitHub 模板
- [x] MIT 协议

### 待开发 📝
- [ ] 添加更多风险规则
- [ ] 优化检测准确率
- [ ] 国际化支持

---

## 🎯 核心原则

### 产品方法论
- **简单** - 只做风险检测，不做其他
- **专注** - 专注一个功能，做到极致
- **单点击穿** - 用户一个操作就能完成目标

### 技术原则
- 优先选择最简单的技术方案
- 避免过度设计和不必要的抽象
- 代码可读性优先于技巧性

---

## 🔗 相关链接

- **MCP 协议**：https://modelcontextprotocol.io
- **Claude Code**：https://claude.ai/code
- **GitHub**：https://github.com/yourusername/risk-gate
- **项目路径**：`/Users/springwater/Desktop/Claude/项目集群/2、Risk Gate`

---

## 📝 注意事项

- 根目录的文件是面向用户的（README.md、LICENSE 等）
- `.project/` 目录是内部管理文件，不发布到 npm
- 开发时优先读取本文件和 MEMORY.md
- 所有改动都要更新 `.project/MEMORY.md`

---

**最后更新**：2026-02-09 17:45
