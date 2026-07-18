import { WebSocketServer, WebSocket } from 'ws'

// WebSocket 聊天中心：负责实时广播消息、在线人数、系统消息、输入提示。
export function attachChatHub(server, pool) {
  const wss = new WebSocketServer({ noServer: true })
  const clients = new Set()
  const typingUsers = new Set()
  const clientNicknames = new WeakMap()

  //从 URL / Header 取 token
  const getTokenFromRequest = (req) => {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`)
    const authHeader = req.headers.authorization || ''
    return authHeader.startsWith('Bearer ') ? authHeader.slice(7) : url.searchParams.get('token') || ''
  }
  //校验 token 是否有效
  const verifyToken = async (token) => {
    if (!token) return null
    const result = await pool.query('SELECT id, username, token FROM users WHERE token = $1 LIMIT 1', [token])
    return result.rows[0] || null
  }

  const getOnlineCount = () => clients.size

  const broadcast = (payload) => {
    const data = JSON.stringify(payload)
    for (const client of clients) {
      if (client.readyState === WebSocket.OPEN) client.send(data)
    }
  }

  const pushSystem = (text) => {
    broadcast({
      type: 'system',
      message: {
        id: `sys-${Date.now()}`,
        type: 'system',
        text,
        time: new Date().toLocaleString('zh-CN', { hour12: false }),
      },
      onlineCount: getOnlineCount(),
    })
  }

  const formatMessage = (row) => ({
    ...row,
    time: row.time || (row.created_at ? new Date(row.created_at).toLocaleString('zh-CN', { hour12: false }) : ''),
  })

  const sendSnapshot = async (ws) => {
    const result = await pool.query('SELECT id, nickname, text, created_at FROM chat_messages ORDER BY id ASC')
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'snapshot',
        messages: result.rows.map(formatMessage),
        onlineCount: getOnlineCount(),
      }))
    }
  }

  server.on('upgrade', async (req, socket, head) => {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`)
    if (url.pathname !== '/ws/chat') {
      socket.destroy()
      return
    }
     
    const token = getTokenFromRequest(req)
    const user = await verifyToken(token)
    // 没 token 或 token 无效，拒绝升级为 WebSocket
    if (!user) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
      socket.destroy()
      return
    }

    req.user = user

    wss.handleUpgrade(req, socket, head, async (ws) => {
      ws.user = user
      clients.add(ws)
      try {
        // 进来后先发历史消息
        await sendSnapshot(ws)
         // 广播系统消息
        pushSystem(`${user.username} 进入聊天室`)
        broadcast({ type: 'online', onlineCount: getOnlineCount() })
      } catch (error) {
        ws.close(1011, 'Failed to load chat snapshot')
        clients.delete(ws)
        return
      }

      ws.on('message', async (raw) => {
        let data
        try {
          data = JSON.parse(raw.toString() || '{}')
        } catch {
          return
        }

        if (data.type === 'typing') {
          const name = (data.nickname || '游客').trim()
          clientNicknames.set(ws, name)
          if (data.typing) typingUsers.add(name)
          else typingUsers.delete(name)
          broadcast({ type: 'typing', users: Array.from(typingUsers) })
          return
        }

        if (data.type === 'message') {
          const nickname = (data.nickname || user.username || '游客').trim()
          const text = (data.text || '').trim()
          const token = String(data.token || '').trim()
          if (!text) return
          const currentUser = token ? await verifyToken(token) : user
          if (!currentUser) {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'error', message: 'token 无效' }))
            }
            return
          }
          try {
            const result = await pool.query(
              'INSERT INTO chat_messages (nickname, text, created_at) VALUES ($1, $2, NOW()) RETURNING id, nickname, text, created_at',
              [nickname, text]
            )
            broadcast({ type: 'message', message: formatMessage(result.rows[0]), onlineCount: getOnlineCount() })
          } catch {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'error', message: '消息发送失败' }))
            }
          }
        }
      })

      ws.on('close', () => {
        clients.delete(ws)
        const nickname = clientNicknames.get(ws)
        if (nickname) typingUsers.delete(nickname)
        pushSystem('有用户离开聊天室')
        broadcast({ type: 'typing', users: Array.from(typingUsers) })
        broadcast({ type: 'online', onlineCount: getOnlineCount() })
      })
    })
  })
}
