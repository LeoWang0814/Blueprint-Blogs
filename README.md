# 📐 Blueprint Blogs

[English](#-blueprint-blogs) | [中文](#-blueprint-blogs-zh)

**The documentation-first blog engine for technical minds.**  
**为技术极客打造的文档优先型博客引擎。**

---

## 🛠️ Features / 核心特性

- **Blueprint UI**: A unique aesthetic inspired by architectural drafts and technical schematics.  
  **蓝图视觉**：灵感源自建筑草图与技术图纸的独特美感。
- **Bilingual Core**: Seamlessly switch between English and Chinese with independent content rendering.  
  **双语内核**：支持中英双语一键切换，内容独立解析，互不干扰。
- **Zero-Code Config**: Manage your entire identity (Avatar, Bio, Socials) via a single JSON file.  
  **零代码配置**：通过 JSON 文件管理头像、简介、社交链接等所有个人信息。
- **Pro Markdown**: Syntax highlighting, footnotes, image zooming, and clean typography out of the box.  
  **专业级渲染**：内置代码高亮、脚注、图片灯箱及优雅的排版。

---

## 🚀 Quick Start / 快速开始

### 1. Structure / 目录结构
Manage your content in `public/myblog/`:  
在 `public/myblog/` 中管理你的内容：

```text
public/myblog/
├── content.json      # Personal Info & UI Text (个人信息与 UI 文本)
├── manifest.json     # Article Index & Status (文章索引与状态)
└── [Category]/       # Markdown Files (分类存放的 MD 文件)
    ├── post.md       # English Version
    └── post-zh.md    # Chinese Version
```

### 2. Configuration / 配置
Simply edit `content.json` to change the site owner, email, and social links.  
只需编辑 `content.json` 即可更改站点所有者、电子邮件和社交链接。

### 3. Deployment / 部署
For detailed deployment instructions, please visit:  
有关详细的部署说明，请访问：

👉 [**Deployment Guide / 部署指南 (https://example.com)**](https://example.com)

---

## 🛠️ Tech Stack / 技术栈

- **Core**: React 19 + TypeScript
- **Styling**: Tailwind CSS (Blueprint Grid System)
- **Engine**: Marked.js + Prism.js
- **Routing**: React Router

---

## 📜 License / 许可协议

This project is licensed under the **MIT License**.  
本项目遵循 **MIT 许可协议**。

---

<p align="center">
  <i>Documentation is the soul of engineering.</i><br>
  <i>文档是工程的灵魂。</i>
</p>