import { highlights, pets } from '../data/homeData.js'

// 首页相关路由：统一返回宠物与首页亮点数据。
export function registerHomeRoutes(server) {
  server.on('request', (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`)
    if (req.method === 'GET' && url.pathname === '/api/home') {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
      res.end(JSON.stringify({ pets, highlights }))
    }
    if (req.method === 'GET' && url.pathname === '/api/pets') {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
      res.end(JSON.stringify({ pets }))
    }
    if (req.method === 'GET' && url.pathname === '/api/highlights') {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
      res.end(JSON.stringify({ highlights }))
    }
  })
}
