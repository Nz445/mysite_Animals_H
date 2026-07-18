import http from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join } from 'node:path'
import crypto from 'node:crypto'
import pool from './db/pool.js'
import { registerHomeRoutes } from './routes/home.js'
import { attachChatHub } from './ws/chatHub.js'

const ALLOWED_ORIGINS = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://wsnz44.top',
])

const ensureChatMessagesTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id SERIAL PRIMARY KEY,
      nickname VARCHAR(32) NOT NULL DEFAULT '游客',
      text TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
}

const ensureUsersTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(32) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      token TEXT UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
}

const createToken = () => crypto.randomBytes(24).toString('hex')
const hashPassword = (password) => crypto.createHash('sha256').update(password).digest('hex')

// 后端服务默认端口，可通过环境变量 PORT 覆盖。
const PORT = process.env.PORT || 3000
// 指向后端 public 目录，用于按需提供静态资源。
const PUBLIC_DIR = new URL('../public/', import.meta.url)

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
  '.gif': 'image/gif',
}

// 统一返回 JSON，便于后续前后端通过 API 交互。
function getCorsHeaders(origin) {
  const allowOrigin = ALLOWED_ORIGINS.has(origin) ? origin : '*'
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Credentials': 'true',
    Vary: 'Origin',
  }
}

function sendJson(res, statusCode, data, origin = '') {
  const body = JSON.stringify(data)
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    ...getCorsHeaders(origin),
  })
  res.end(body)
}

// 返回纯文本响应，当前用于根路径的简单提示页。
function sendText(res, statusCode, text, origin = '', contentType = 'text/plain; charset=utf-8') {
  res.writeHead(statusCode, {
    'Content-Type': contentType,
    ...getCorsHeaders(origin),
  })
  res.end(text)
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk
    })
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {})
      } catch (error) {
        reject(error)
      }
    })
    req.on('error', reject)
  })
}

// 提供 backend/public 下的静态文件，适合后续存放配置或资源。
async function serveStaticFile(res, pathname, origin = '') {
  const filePath = join(PUBLIC_DIR.pathname, pathname)
  const ext = extname(filePath).toLowerCase()
  const contentType = mimeTypes[ext] || 'application/octet-stream'

  try {
    const data = await readFile(filePath)
    res.writeHead(200, {
      'Content-Type': contentType,
      ...getCorsHeaders(origin),
    })
    res.end(data)
  } catch {
    sendJson(res, 404, { message: 'File not found' }, origin)
  }
}

// 创建一个最基础的 HTTP 服务，后续可替换成 Express/Fastify。
const server = http.createServer(async (req, res) => {
  if (req.headers.origin && !ALLOWED_ORIGINS.has(req.headers.origin)) {
    sendJson(res, 403, { message: 'Origin not allowed' }, req.headers.origin)
    return
  }
  if (!req.url) {
    sendJson(res, 400, { message: 'Bad request' }, '')
    return
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`)
  const origin = req.headers.origin || ''

  // 处理跨域预检请求，方便前端单独部署后访问接口。
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      ...getCorsHeaders(origin),
    })
    res.end()
    return
  }

  if (url.pathname === '/api/auth/register' && req.method === 'POST') {
    try {
      const data = await parseJsonBody(req)
      const username = String(data.username || '').trim()
      const password = String(data.password || '')
      const confirmPassword = String(data.confirmPassword || '')

      // 验证用户名和密码是否为空
      if (!username || !password) {
        sendJson(res, 400, { ok: false, message: '用户名和密码不能为空' }, origin)
        return
      }
      // 验证两次密码是否一致
      if (password !== confirmPassword) {
        sendJson(res, 400, { ok: false, message: '两次密码不一致' }, origin)
        return
      }

      const passwordHash = hashPassword(password)
      const token = createToken()

       // 插入用户，并直接返回 token 给前端
      const result = await pool.query(
        'INSERT INTO users (username, password_hash, token) VALUES ($1, $2, $3) RETURNING id, username, token, created_at',
        [username, passwordHash, token]
      )

      sendJson(res, 200, { ok: true, user: result.rows[0] }, origin)
    } catch (error) {
      console.error('POST /api/auth/register failed:', error)
      sendJson(res, 500, { ok: false, message: '注册失败' }, origin)
    }
    return
  }

  if (url.pathname === '/api/auth/login' && req.method === 'POST') {
    try {
      const data = await parseJsonBody(req)
      const username = String(data.username || '').trim()
      const password = String(data.password || '')
      // 先按用户名查用户
      const result = await pool.query(
        'SELECT id, username, password_hash, token, created_at FROM users WHERE username = $1 LIMIT 1',
        [username]
      )

      const user = result.rows[0]

      // 用户不存在或密码不对
      if (!user || user.password_hash !== hashPassword(password)) {
        sendJson(res, 401, { ok: false, message: '用户名或密码错误' }, origin)
        return
      }
      // 没有 token 就补一个
      const token = user.token || createToken()
      if (!user.token) {
        await pool.query('UPDATE users SET token = $1 WHERE id = $2', [token, user.id])
      }

      // 返回 token 给前端保存
      sendJson(res, 200, {
        ok: true,
        user: { id: user.id, username: user.username, token, created_at: user.created_at },
      }, origin)
    } catch (error) {
      console.error('POST /api/auth/login failed:', error)
      sendJson(res, 500, { ok: false, message: '登录失败' }, origin)
    }
    return
  }

  if (url.pathname === '/api/auth/me' && req.method === 'GET') {
    try {
      const authHeader = req.headers.authorization || ''
      const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : new URL(req.url, `http://${req.headers.host || 'localhost'}`).searchParams.get('token') || ''
      if (!token) {
        sendJson(res, 401, { ok: false, message: '未登录' }, origin)
        return
      }
      // 根据 token 查用户
      const result = await pool.query(
        'SELECT id, username, token, created_at FROM users WHERE token = $1 LIMIT 1',
        [token]
      )
      const user = result.rows[0]
      if (!user) {
        sendJson(res, 401, { ok: false, message: 'token 无效' }, origin)
        return
      }
      sendJson(res, 200, { ok: true, user }, origin)
    } catch (error) {
      console.error('GET /api/auth/me failed:', error)
      sendJson(res, 500, { ok: false, message: '校验失败' }, origin)
    }
    return
  }

  // 健康检查接口，用于确认后端是否正常启动。
  if (url.pathname === '/api/health') {
    sendJson(res, 200, { ok: true, service: 'animals-h-backend' }, origin)
    return
  }

  // 简单连通性测试接口，前端联调时可先用它验证请求链路。
  if (url.pathname === '/api/ping') {
    sendJson(res, 200, { message: 'pong' }, origin)
    return;
  }

  if (url.pathname === '/api/home' || url.pathname === '/api/pets' || url.pathname === '/api/highlights') {
    const data = await registerHomeRoutes(url.pathname)
    sendJson(res, 200, data, origin)
    return
  }

  if (url.pathname === '/api/chat/messages' && req.method === 'GET') {
    const result = await pool.query('SELECT id, nickname, text, created_at FROM chat_messages ORDER BY id ASC')
    sendJson(res, 200, { messages: result.rows.map((row) => ({
      ...row,
      time: row.time || (row.created_at ? new Date(row.created_at).toLocaleString('zh-CN', { hour12: false }) : ''),
    })) }, origin)
    return
  }

  if (url.pathname === '/api/chat/messages' && req.method === 'POST') {
    try {
      const data = await parseJsonBody(req)
      const nickname = String(data.nickname || '游客').trim() || '游客'
      const text = String(data.text || '').trim()
      const token = String(data.token || req.headers.authorization?.replace('Bearer ', '') || '').trim()

      if (!token) {
        sendJson(res, 401, { ok: false, message: '请先登录' }, origin)
        return
      }

      const userResult = await pool.query(
        'SELECT id FROM users WHERE token = $1 LIMIT 1',
        [token]
      )
      if (!userResult.rows[0]) {
        sendJson(res, 401, { ok: false, message: 'token 无效' }, origin)
        return
      }

      if (!text) {
        sendJson(res, 400, { ok: false, message: '消息不能为空' }, origin)
        return
      }
      // 写入聊天记录
      const result = await pool.query(
        'INSERT INTO chat_messages (nickname, text, created_at) VALUES ($1, $2, NOW()) RETURNING id, nickname, text, created_at',
        [nickname, text]
      )
      sendJson(res, 200, { ok: true, message: result.rows[0] }, origin)
    } catch (error) {
      console.error('POST /api/chat/messages failed:', error)
      sendJson(res, 500, { ok: false, message: '发送失败' }, origin)
    }
    return
  }

  // 允许通过 /public/* 访问后端静态资源。
  if (url.pathname.startsWith('/public/')) {
    await serveStaticFile(res, url.pathname.replace('/public/', ''), origin)
    return;
  }

  // 根路径返回简单文本，方便快速确认服务在线。
  if (url.pathname === '/') {
    sendText(res, 200, 'Animals_H backend is running', origin)
    return;
  }

  sendJson(res, 404, { message: 'Not found' }, origin)
});


// 启动服务并打印访问地址。
ensureChatMessagesTable()
  .then(() => {
    attachChatHub(server, pool)
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Backend running at http://0.0.0.0:${PORT}`)
    })
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error)
    process.exit(1)
  })
