import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../database/prisma/prisma.service.js'
import { createToken, hashPassword, usernamePattern } from '../common/utils/chat.utils.js'

@Injectable()
export class AuthService {
  constructor(private readonly db: PrismaService) {}

  async register(username: string, password: string, confirmPassword: string) {
    if (!username || !password) return { ok: false, message: '用户名和密码不能为空' }
    if (!usernamePattern.test(username)) return { ok: false, message: '账号只能包含汉字、字母、数字和下划线' }
    if (password !== confirmPassword) return { ok: false, message: '两次密码不一致' }

    const exists = await this.db.pool.query('SELECT id FROM users WHERE username = $1 LIMIT 1', [username])
    if (exists.rows[0]) return { ok: false, message: '此账号已被注册' }

    const token = createToken()
    const passwordHash = hashPassword(password)
    const result = await this.db.pool.query(
      'INSERT INTO users (username, password_hash, token) VALUES ($1, $2, $3) RETURNING id, username, token, created_at',
      [username, passwordHash, token],
    )

    return { ok: true, user: result.rows[0] }
  }

  async login(username: string, password: string) {
    const result = await this.db.pool.query(
      'SELECT id, username, password_hash, token, created_at FROM users WHERE username = $1 LIMIT 1',
      [username],
    )
    const user = result.rows[0]
    if (!user || user.password_hash !== hashPassword(password)) return { ok: false, message: '用户名或密码错误' }

    const token = user.token || createToken()
    if (!user.token) {
      await this.db.pool.query('UPDATE users SET token = $1 WHERE id = $2', [token, user.id])
    }
    return { ok: true, user: { id: user.id, username: user.username, token, created_at: user.created_at } }
  }

  async me(token: string) {
    if (!token) return { ok: false, message: '未登录' }
    const result = await this.db.pool.query('SELECT id, username, token, created_at FROM users WHERE token = $1 LIMIT 1', [token])
    const user = result.rows[0]
    if (!user) return { ok: false, message: 'token 无效' }
    return { ok: true, user }
  }
}
