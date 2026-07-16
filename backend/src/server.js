import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import pool from './db/pool.js';
import { registerHomeRoutes } from './routes/home.js';
import { attachChatHub } from './ws/chatHub.js';

// 后端服务默认端口，可通过环境变量 PORT 覆盖。
const PORT = process.env.PORT || 3000;
// 指向后端 public 目录，用于按需提供静态资源。
const PUBLIC_DIR = new URL('../public/', import.meta.url);

// 文件扩展名到 MIME 类型的映射，帮助浏览器正确解析静态资源。
const mimeTypes = {
  '.json': 'application/json; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif'
};

// 统一返回 JSON，便于后续前后端通过 API 交互。
function sendJson(res, statusCode, data) {
  const body = JSON.stringify(data);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(body);
}

// 返回纯文本响应，当前用于根路径的简单提示页。
function sendText(res, statusCode, text, contentType = 'text/plain; charset=utf-8') {
  res.writeHead(statusCode, {
    'Content-Type': contentType,
    'Access-Control-Allow-Origin': '*'
  });
  res.end(text);
}

// 提供 backend/public 下的静态文件，适合后续存放配置或资源。
async function serveStaticFile(res, pathname) {
  const filePath = join(PUBLIC_DIR.pathname, pathname);
  const ext = extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  try {
    const data = await readFile(filePath);
    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*'
    });
    res.end(data);
  } catch {
    sendJson(res, 404, { message: 'File not found' });
  }
}

// 创建一个最基础的 HTTP 服务，后续可替换成 Express/Fastify。
const server = http.createServer(async (req, res) => {
  if (!req.url) {
    sendJson(res, 400, { message: 'Bad request' });
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  // 处理跨域预检请求，方便前端单独部署后访问接口。
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  // 健康检查接口，用于确认后端是否正常启动。
  if (url.pathname === '/api/health') {
    sendJson(res, 200, { ok: true, service: 'animals-h-backend' });
    return;
  }

  // 简单连通性测试接口，前端联调时可先用它验证请求链路。
  if (url.pathname === '/api/ping') {
    sendJson(res, 200, { message: 'pong' });
    return;
  }

  if (url.pathname === '/api/home' || url.pathname === '/api/pets' || url.pathname === '/api/highlights') {
    const data = await registerHomeRoutes(url.pathname)
    sendJson(res, 200, data)
    return
  }

  if (url.pathname === '/api/chat/messages' && req.method === 'GET') {
    const result = await pool.query('SELECT * FROM chat_messages ORDER BY id ASC')
    sendJson(res, 200, { messages: result.rows })
    return
  }

  if (url.pathname === '/api/chat/messages' && req.method === 'POST') {
    let body = ''
    for await (const chunk of req) body += chunk
    const data = JSON.parse(body || '{}')
    const result = await pool.query(
      'INSERT INTO chat_messages (nickname, text, created_at) VALUES ($1, $2, NOW()) RETURNING *',
      [data.nickname || '游客', data.text || '']
    )
    sendJson(res, 200, { ok: true, message: result.rows[0] })
    return
  }

  // 允许通过 /public/* 访问后端静态资源。
  if (url.pathname.startsWith('/public/')) {
    await serveStaticFile(res, url.pathname.replace('/public/', ''));
    return;
  }

  // 根路径返回简单文本，方便快速确认服务在线。
  if (url.pathname === '/') {
    sendText(res, 200, 'Animals_H backend is running');
    return;
  }

  sendJson(res, 404, { message: 'Not found' });
});

// 挂载 WebSocket 聊天中心。
attachChatHub(server, pool)


// 启动服务并打印访问地址。
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend running at http://0.0.0.0:${PORT}`);
});
