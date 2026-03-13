# AI Healthy

一个前后端分离的轻食健康管理项目，提供饮食记录、AI 菜品识别、健康建议与智能聊天能力。

## 项目结构

```text
aiHealthy
├─ Ai-Healthy/    # 前端（React + Vite + TypeScript）
├─ server/        # 后端（Express + Sequelize + MySQL）
└─ README.md
```

## 核心功能

- 用户注册与登录（JWT 鉴权）
- 饮食记录管理（早/中/晚餐与餐品明细）
- AI 菜品识别与营养建议
- 健康顾问聊天（支持流式响应与历史记录）
- 个人信息维护与头像上传（阿里云 OSS）

## 技术栈

### 前端（Ai-Healthy）

- React 19 + TypeScript + Vite
- Ant Design / @ant-design/x / Sass
- React Router + Zustand + Axios
- AI SDK（`ai`、`@ai-sdk/react`、`@ai-sdk/deepseek`）

### 后端（server）

- Express + Sequelize + MySQL2
- JWT + bcrypt
- multer + ali-oss（文件上传与对象存储）
- OpenAI SDK / AI SDK（模型调用）

## 快速开始

### 1) 安装依赖

```bash
# 前端依赖
cd Ai-Healthy
npm install

# 后端依赖
cd ../server
npm install
```

### 2) 配置环境变量

在 `server/.env` 中至少配置以下变量：

```env
ALIYUN_REGION=
ALIYUN_ACCESS_KEY_ID=
ALIYUN_ACCESS_KEY_SECRET=
ALIYUN_BUCKET=
PORT=3080
```

说明：

- 后端默认端口代码中为 `3001`，但前端代理配置为 `http://localhost:3080`。
- 推荐将后端 `PORT` 配置为 `3080`，保持前后端联调一致。

### 3) 启动项目

```bash
# 启动后端（在 server 目录）
npm start

# 启动前端（新开终端，在 Ai-Healthy 目录）
npm run dev
```

前端默认访问地址：`http://localhost:5173`

## 常用脚本

### 前端（Ai-Healthy）

- `npm run dev`：本地开发
- `npm run build`：构建生产包
- `npm run preview`：预览构建结果
- `npm run lint`：代码检查

### 后端（server）

- `npm start`：启动服务（nodemon）

## 接口前缀

后端接口统一以 `/api` 开头，主要模块包括：

- `/api/login`
- `/api/sign_up`
- `/api/dashboard`
- `/api/analysis`
- `/api/chat`
- `/api/person`

## 说明

- 当前仓库包含前后端两个独立 Node 项目，请分别安装依赖并分别启动。
- 若需要更换后端端口，请同步修改 `Ai-Healthy/vite.config.ts` 中的代理地址。
