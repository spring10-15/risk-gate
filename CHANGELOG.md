# 更新日志

所有值得注意的项目更改都将记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

---

## [Unreleased]

### 待发布
- 准备开源发布
- 添加完整的文档和贡献指南
- 优化项目结构

---

## [1.0.0] - 2026-02-09

### 新增
- ✨ MCP Server 核心功能
- ✨ 上下文感知的风险检测
- ✨ 支持 SQL、Shell、API 调用检测
- ✨ 智能风险等级调整
- ✨ 支持 12 种风险类型

### 风险类型
- 🔴 极高风险：删除表/数据库、删除所有数据、强制删除文件
- 🟠 高风险：生产部署、批量修改、数据库迁移、支付/退款
- 🟡 中风险：群发消息、群发邮件、配置修改、权限变更

### 文档
- 📝 完整的 README
- 📝 贡献指南
- 📝 项目指南

---

## 版本说明

- **[Unreleased]** - 正在开发中，尚未发布的版本
- **[1.0.0]** - 第一个正式发布版本

---

**链接**：
- [MCP 协议](https://modelcontextprotocol.io)
- [GitHub](https://github.com/yourusername/risk-gate)
