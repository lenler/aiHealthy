# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

AI Healthy — 前后端分离的轻食健康管理应用。前端 React 19 + Vite + TypeScript，后端 Express + Sequelize + MySQL 8，通过 Docker 运行数据库。

## 常用命令

### 前端（`Ai-Healthy/`）

```bash
cd Ai-Healthy
npm run dev          # 启动开发服务器（端口 55174）
npm run build        # 生产构建（tsc + vite build）
npm run preview      # 预览构建产物
npm run lint         # ESLint 检查
```

### 后端（`server/`）

```bash
cd server
npm start            # nodemon 启动（默认端口 3001，推荐设 PORT=3080）
```

### 数据库

```bash
cd server
docker-compose up -d  # 启动 MySQL 8.3（root/admin123，端口 3306）
```

Vite 开发代理将 `/api` 转发到 `http://localhost:3080`，所以后端推荐以 `PORT=3080` 启动。

## 架构概览

### 前端路由（react-router v7）

```
/login        → 登录页（无需鉴权）
/register     → 注册页（无需鉴权）
/             → Home 布局 > DashBoread 仪表盘
/user         → Home 布局 > Personal 个人中心
/chat         → Home 布局 > AI 聊天
/analysis     → Home 布局 > AI 识图分析
*             → 404
```

`/` 下所有子路由由 [Home](Ai-Healthy/src/components/Home/Sider/index.tsx) 布局包裹（底部导航栏），并通过 [routerDefence](Ai-Healthy/src/components/routerDefence/index.tsx) 路由守卫校验 JWT token。

### 前端关键分层

- **`src/api/`** — 按模块拆分的 API 调用函数（login, dashboard, analysis, chat, person），统一使用 `src/utils/http/` 下的 Axios 实例
- **`src/utils/http/http.ts`** — Axios 实例：自动注入 token、POST 请求去重（pendingRequests Map）
- **`src/store/`** — Zustand 状态管理：`authStore`（登录态 + localStorage 同步）、`infoStore`（AI 建议缓存 + persist 持久化）
- **`src/components/`** — 可复用组件，按页面模块组织（dashborad/analysis/personal）
- **`src/page/`** — 页面组件，每个页面一个目录

### 后端路由

| 前缀 | 文件 | 鉴权 | 功能 |
|---|---|---|---|
| `/api/login` | `routes/login.js` | 否 | 登录，JWT 签发 |
| `/api/sign_up` | `routes/signup.js` | 否 | 注册，密码加密存储 |
| `/api/chat` | `routes/chat.js` | JWT | AI 流式对话（DeepSeek + tool call），消息 CRUD |
| `/api/dashboard` | `routes/dashboard.js` | JWT | 饮食记录 CRUD，AI 建议（Qwen-Flash） |
| `/api/analysis` | `routes/analysis.js` | JWT | 图片上传，AI 视觉识别（Qwen-VL-Max） |
| `/api/person` | `routes/person.js` | JWT | 健康/账号信息 CRUD，头像 OSS 签名上传 |

### 后端关键中间件

- **`middleware/jwtAuth.js`** — JWT 鉴权：从 Authorization 头提取 token，校验后将 `req.userId` 注入请求上下文
- **`middleware/cache.js`** — HTTP 缓存：强缓存（Cache-Control）+ 协商缓存（ETag/If-None-Match → 304），`Vary: Authorization` 防跨用户污染

### AI 模型分工

| 场景 | 模型 | 调用方式 |
|---|---|---|
| 对话 | DeepSeek | AI SDK `streamText` + tool call |
| 菜品识别 | Qwen-VL-Max | OpenAI SDK（base64 图片 + JSON 输出） |
| 健康建议 | Qwen-Flash | OpenAI SDK（`response_format: json_object`） |

### 数据库模型关系

```
User 1:N MealItem     (单餐记录)
User 1:N ChatHistory  (聊天记录)
User 1:N HealthyInfo  (健康档案)
```

模型定义在 `server/models/*.cjs`，通过 `server/models/index.cjs` 自动加载。

## 环境变量

后端 `server/.env` 需要：

```
# 数据库（优先于 config.json 中的值）
DB_USERNAME=root
DB_PASSWORD=
DB_HOST=127.0.0.1
# 或直接使用 DATABASE_URL=mysql://user:pass@host/db

# JWT 签名密钥
SECRET=

# AI 模型
AI_GATEWAY_API_KEY=       # DeepSeek 对话
AI_VISION_API_KEY=        # 阿里云 Qwen 视觉/建议

# OSS 上传
ALIYUN_REGION=
ALIYUN_ACCESS_KEY_ID=
ALIYUN_ACCESS_KEY_SECRET=
ALIYUN_BUCKET=

PORT=3080
```

dotenv 在 `app.js` 入口统一加载，无需在路由/中间件中重复导入。

前端 `Ai-Healthy/.env` 包含 Vite 环境变量（不提交到 Git）。

## 注意事项

- `server/` 使用 ESM（`"type": "module"`），但 models 使用 `.cjs` 扩展名（Sequelize 兼容性）
- 前端 `vite.config.ts` 中代理目标为 `localhost:3080`，修改后端端口需同步更新
- POST 请求去重在前端 Axios 拦截器中实现，相同 POST 在 pending 期间会被拦截
- 头像上传使用阿里云 OSS 服务端签名直传方案，不走服务器磁盘
