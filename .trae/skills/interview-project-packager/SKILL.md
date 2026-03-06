---
name: "interview-project-packager"
description: "Builds interview-ready project documentation and resume-ready narratives. Invoke when user asks to summarize project work for interviews, resume polishing, or Q&A prep."
---

# Interview Project Packager

## Purpose
把已完成项目整理成“可投递 + 可面试口述 + 可追问应答”的材料包，避免只写功能清单。

## When to invoke
- 用户要求“写项目文档用于面试”
- 用户要求“优化简历项目经历”
- 用户要求“准备面试高频问题回答”
- 用户已有代码仓库，希望从真实实现提炼亮点

## Inputs checklist
- 项目代码仓库（前端/后端）
- 现有简历项目描述（可选）
- 目标岗位（前端/后端/全栈，校招/实习/社招）
- 可公开的指标数据（可为空，用占位符）

## Output package
默认输出到 `项目文档/`：
1. `项目名-面试项目文档.md`
2. `简历优化建议.md`

## Required structure for 面试项目文档
1. 项目定位（30秒版本）
2. 业务闭环（端到端流程）
3. 技术架构（前端/后端/数据模型）
4. 个人贡献与关键实现（3-5条）
5. 难点与解法（AI可控性、一致性、体验等）
6. 高频面试问题与答题框架（至少5问）
7. 可量化表达模板（真实数据优先）
8. 风险与可优化点（体现工程成熟度）
9. 1分钟/3分钟口述稿

## Resume rewriting rules
- 先写业务价值，再写技术动作，最后写结果
- 禁止纯技术名词堆叠
- 每条经历包含“动作 + 对象 + 收益”
- 将绝对化措辞替换为可验证措辞
- 无真实指标时使用占位符（X%、Xms），并显式标注待替换

## Evidence-driven extraction method
1. 扫描路由、API层、状态层、核心页面、后端路由与模型
2. 提取“实现证据点”：鉴权、缓存、幂等、错误处理、AI链路
3. 把每个亮点映射到具体业务价值
4. 输出“可被追问”的技术细节与边界说明

## Quality bar
- 介绍不是功能罗列，必须有问题-方案-结果叙事
- 文档可直接用于简历粘贴与口头表达
- 问答覆盖“为什么这样做、替代方案、边界和风险”
- 风格简洁、可复述、可落地

## Anti-patterns
- 只写“用了什么技术”，不写“解决了什么问题”
- 只写“我参与了”，不写“我主导了什么”
- 只讲理想流程，不讲异常与兜底
- 夸大效果且无指标依据
