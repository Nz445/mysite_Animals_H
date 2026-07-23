import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../database/prisma/prisma.service.js'

@Injectable()
export class ChatService {
  constructor(private readonly db: PrismaService) {}

  async listMessages() {
    const result = await this.db.pool.query('SELECT id, nickname, text, created_at FROM chat_messages ORDER BY id ASC')
    return result.rows.map((row) => ({
      ...row,
      time: row.time || (row.created_at ? new Date(row.created_at).toLocaleString('zh-CN', { hour12: false }) : ''),
    }))
  }

  async sendMessage(nickname: string, text: string) {
    const result = await this.db.pool.query(
      'INSERT INTO chat_messages (nickname, text, created_at) VALUES ($1, $2, NOW()) RETURNING id, nickname, text, created_at',
      [nickname, text],
    )
    return {
      ...result.rows[0],
      time: result.rows[0].created_at ? new Date(result.rows[0].created_at).toLocaleString('zh-CN', { hour12: false }) : '',
    }
  }
}
