# Server（服务端）

## 项目描述
统一 API 服务，负责鉴权、任务编排、模型调用、结果存储与队列处理。

## 技术栈建议
- Node.js + NestJS（或 Python + FastAPI）
- Redis（队列/缓存）
- PostgreSQL（数据持久化）
- 对象存储（图片）

## 目录规范（建议）
- src/modules：业务模块
- src/common：公共组件
- src/config：配置
- src/queue：任务队列
- src/adapters：模型适配器

## 接口规范
- RESTful
- 统一错误码
- 统一响应结构（code/message/data）

## 开发流程
1. 初始化项目
2. 设计数据模型
3. 接入队列与对象存储
4. 接入模型服务
5. 上线监控
