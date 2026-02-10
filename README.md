# Risk Gate

<div align="center">

**🚦 操作风险检测 MCP Server**

实时检测 SQL、Shell 命令、API 调用等操作风险

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![MCP](https://img.shields.io/badge/MCP-Model%20Context%20Protocol-blue)](https://modelcontextprotocol.io)

</div>

---

## ✨ 特性

- 🔍 **智能检测** - 支持 SQL、Shell、API 调用等多种输入类型
- 🧠 **上下文感知** - 区分"查看删除的用户"（安全）vs "删除所有用户"（危险）
- 🎯 **智能调整** - 根据环境（test/dev/prod）和范围自动调整风险等级
- 🔌 **即插即用** - 集成到 Claude Desktop、Cursor、VS Code
- 📦 **开源免费** - MIT 协议，可自由使用和修改

---

## 🚀 快速开始

### 安装

```bash
# 克隆仓库
git clone https://github.com/yourusername/risk-gate.git
cd risk-gate

# 安装依赖
npm install

# 编译
npm run build
```

### 配置 Claude Desktop

编辑 `~/Library/Application Support/Claude/claude_desktop_config.json`：

```json
{
  "mcpServers": {
    "risk-gate": {
      "command": "node",
      "args": ["/path/to/risk-gate/build/index.js"]
    }
  }
}
```

### 使用

重启 Claude Desktop，然后：

```
你：帮我检查这个 SQL：DELETE FROM users WHERE id = 1

Claude：✅ 未检测到高风险
此操作只影响单条记录，相对安全。
```

---

## 📋 支持的风险类型

| 等级 | 图标 | 说明 | 示例 |
|-----|------|------|------|
| **极高** | 🔴 | 数据永久丢失，无法恢复 | DROP TABLE, rm -rf |
| **高** | 🟠 | 影响系统或大量数据 | 部署生产环境, 批量更新 |
| **中** | 🟡 | 可控制的影响 | 群发消息, 修改配置 |

---

## 💡 使用示例

### 上下文感知检测

```sql
-- 危险：删除所有数据
DELETE FROM users;
-- 结果：🔴 极高风险 - 影响所有数据

-- 安全：有条件删除
DELETE FROM users WHERE id = 1;
-- 结果：✅ 安全 - 只影响单条记录
```

### Shell 命令检测

```bash
# 危险：强制删除
rm -rf /var/log
# 结果：🔴 极高风险 - 强制递归删除文件，无法恢复

# 相对安全：删除测试目录
rm -rf /tmp/test-data
# 结果：🟡 中风险 - 测试环境，影响较小
```

---

## 📁 项目结构

```
risk-gate/
├── src/                    # 源代码
│   ├── index.ts           # MCP Server 入口
│   ├── types.ts           # 类型定义
│   └── lib/
│       ├── riskRules.ts          # 风险规则
│       └── contextAnalyzer.ts    # 上下文分析器
├── lib/                    # 共享核心逻辑
├── .project/              # 内部管理文件
├── .github/               # GitHub 模板
├── README.md
├── CONTRIBUTING.md        # 贡献指南
├── CHANGELOG.md           # 更新日志
└── LICENSE                # MIT 协议
```

---

## 🔧 开发

```bash
# 开发模式（自动重新编译）
npm run watch

# 运行 MCP Inspector（可视化测试）
npm run inspector

# 运行测试
npm test
```

---

## 🤝 贡献

欢迎贡献！请查看 [贡献指南](CONTRIBUTING.md)。

---

## 📄 License

[MIT](LICENSE) © 一健

---

## 🔗 相关链接

- [MCP 协议](https://modelcontextprotocol.io)
- [Claude Code](https://claude.ai/code)
- [贡献指南](CONTRIBUTING.md)
- [更新日志](CHANGELOG.md)

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给个 Star！**

Made with ❤️ by 一健
</div>
