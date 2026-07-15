# Animals_H

这是一个前后端分离改造中的项目。

## 目录结构

- `frontend/`：前端项目（已迁移现有 Vue 代码）
- `backend/`：后端项目（已补齐基础服务）
- `tests/`：测试代码
- `docs/`：项目文档

## 当前状态

- 前端：已移动到 `frontend/`，可在该目录独立开发和构建
- 后端：已创建基础 Node.js 服务，可先用于接口开发

## 启动方式

### 前端

```bash
cd frontend
npm run dev
```

### 后端

```bash
cd backend
npm run dev
```

## 后续建议

1. 继续完善 `backend/` 的 API 结构
2. 前后端通过 HTTP API 对接
3. 需要时再在根目录补充统一启动脚本
