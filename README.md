# 视频创意助手 (AIGC Assistant) - 前端应用

[![awesome-vite](https://awesome.re/mentioned-badge.svg)](https://github.com/vitejs/awesome-vite)
![GitHub license](https://img.shields.io/github/license/caoxiemeihao/vite-react-electron)
[![Required Node.JS >= 14.18.0 || >=16.0.0](https://img.shields.io/static/v1?label=node&message=14.18.0%20||%20%3E=16.0.0&logo=node.js&color=3f893e)](https://nodejs.org/about/releases)

English | [简体中文](README.zh-CN.md)

## 项目简介

视频创意助手的前端应用，基于 Electron + React + Vite 构建，提供跨平台的桌面应用界面，集成即梦AI视频生成和智能对话功能。

## 主要功能

- 🎬 **AI视频生成**: 集成即梦AI，根据文本提示词自动生成视频
- 💬 **智能对话**: AI助手提供创意灵感和建议
- 📥 **视频管理**: 自动下载并管理生成的视频文件
- 🖥️ **桌面应用**: 跨平台桌面应用，支持 Windows/macOS/Linux
- 🔄 **自动更新**: 内置应用自动更新机制

## 技术栈

- **框架**: Electron 33.x + React 18.x
- **构建工具**: Vite 5.x
- **UI组件库**: Ant Design 6.x + @ant-design/x
- **状态管理**: Zustand
- **路由**: React Router DOM
- **语言**: TypeScript
- **样式**: Tailwind CSS

## 快速开始

### 环境要求

- Node.js >= 16.0.0
- pnpm >= 8.0.0

### 安装依赖

```bash
# 安装依赖
pnpm install
```

### 启动开发环境

```bash
# 启动开发服务器
pnpm run dev
```

### 构建生产版本

```bash
# 构建 Windows 版本
pnpm run build

# 打包为可执行文件
pnpm run build:exe
```

## 项目结构

```
├── electron/                    # Electron 相关代码
│   ├── main/                   # 主进程源代码
│   │   ├── index.ts           # 主进程入口
│   │   └── update.ts          # 自动更新逻辑
│   └── preload/                # 预加载脚本源代码
│       └── index.ts           # 预加载脚本
│
├── release/                     # 生产构建后生成，包含可执行文件
│   └── {version}
│       ├── {os}-{os_arch}      # 包含解压后的应用可执行文件
│       └── {app_name}_{version}.{ext}  # 应用安装程序
│
├── public/                      # 静态资源
│   ├── favicon.ico
│   └── logo.svg
│
└── src/                         # 渲染进程源代码，React 应用
    ├── apis/                   # API 接口
    │   ├── index.ts           # API 配置
    │   └── video.ts           # 视频相关接口
    ├── components/             # React 组件
    │   ├── AIChat/            # AI 聊天组件
    │   ├── Layout/            # 布局组件
    │   └── update/            # 更新组件
    ├── pages/                  # 页面组件
    │   ├── Home.tsx           # 首页
    │   └── AIChat.tsx         # AI 聊天页面
    ├── router/                 # 路由配置
    │   ├── index.tsx
    │   ├── paths.ts
    │   └── routes.tsx
    ├── store/                  # 状态管理
    │   └── useStore.ts
    ├── utils/                  # 工具函数
    │   ├── req.ts             # 请求工具
    │   └── signature.ts       # 签名工具
    ├── App.tsx                 # 应用根组件
    └── main.tsx                # 渲染进程入口
```

## 主要组件说明

### AIChat 组件

AI 聊天界面，提供：
- 文本输入框，用于输入视频描述或对话内容
- AI 对话历史记录
- 视频生成任务提交
- 视频生成结果展示

### Layout 组件

应用主布局，包含：
- 顶部导航栏
- 侧边栏（如需要）
- 主内容区域

### Update 组件

自动更新功能，包含：
- 更新检查
- 更新下载进度
- 更新安装提示

## API 接口

前端通过以下接口与后端通信：

### AI助手接口

- `POST /api/v1/assistant/chat` - AI对话
- `POST /api/v1/assistant/generate` - 内容生成
- `GET /api/v1/assistant/models` - 获取模型列表

### 即梦AI视频生成接口

- `POST /api/v1/jimeng/submit` - 提交视频生成任务
- `POST /api/v1/jimeng/result` - 查询任务结果
- `GET /api/v1/jimeng/video/:fileName` - 获取视频文件

## 配置说明

### 环境变量

在 `.env.development` 文件中配置开发环境变量：

```env
VITE_API_BASE_URL=http://localhost:3001
```

### Electron 配置

在 `electron-builder.json` 中配置打包选项：

```json
{
  "appId": "com.aigc.assistant",
  "productName": "视频创意助手",
  "directories": {
    "output": "release"
  },
  "files": [
    "dist-electron/**/*",
    "dist/**/*"
  ]
}
```

## 开发指南

### 添加新页面

1. 在 `src/pages/` 创建新页面组件
2. 在 `src/router/routes.tsx` 添加路由配置
3. 在 `src/router/paths.ts` 添加路由路径

### 添加新 API

1. 在 `src/apis/` 创建 API 接口文件
2. 使用 `req.ts` 中的请求工具发送请求

### 状态管理

使用 Zustand 进行状态管理，在 `src/store/useStore.ts` 中定义状态和操作。

## 调试

### 前端调试

在 Electron 应用中按 `F12` 打开 Chrome DevTools 进行调试。

### 主进程调试

在 VS Code 中配置 `.vscode/launch.json`：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Main Process",
      "type": "node",
      "request": "launch",
      "cwd": "${workspaceFolder}",
      "runtimeExecutable": "${workspaceFolder}/node_modules/.bin/electron",
      "windows": {
        "runtimeExecutable": "${workspaceFolder}/node_modules/.bin/electron.cmd"
      },
      "args": ["."],
      "outputCapture": "std"
    }
  ]
}
```

## 测试

```bash
# 运行测试
pnpm test
```

## 构建和发布

### 构建

```bash
# 构建
pnpm run build
```

构建完成后，可执行文件将生成在 `release/` 目录。

### 发布

1. 更新 `package.json` 中的版本号
2. 运行构建命令
3. 将生成的安装包上传到发布平台

## 常见问题

### Q: 如何配置后端 API 地址？

A: 在 `.env.development` 文件中修改 `VITE_API_BASE_URL` 环境变量。

### Q: 如何禁用自动更新？

A: 在 `electron/main/index.ts` 中注释掉自动更新相关代码。

### Q: 如何添加新的依赖？

A: 使用 `pnpm add` 安装依赖，并在 `package.json` 中配置。

## 许可证

MIT License

## 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 Issue
- 发送邮件至: 1582442748@qq.com

## 致谢

感谢以下开源项目：

- [Electron](https://www.electronjs.org/)
- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Ant Design](https://ant.design/)

---

**注意**: 本项目仅供学习和研究使用，请遵守相关法律法规和平台使用协议。
