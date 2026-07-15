# Animals_H Backend

这是当前项目的后端基础目录。

## 现有能力

- `GET /api/health`：健康检查
- `GET /api/ping`：连通性测试
- `GET /`：简单欢迎页

## 启动方式

```bash
cd backend
npm run dev
```

默认监听 `http://localhost:3000`。

## 后续建议

- 接入 Express / Fastify 之类的框架
- 将游戏数据、用户数据、配置数据拆成 API
- 前端通过 `fetch` / `axios` 调用后端接口
