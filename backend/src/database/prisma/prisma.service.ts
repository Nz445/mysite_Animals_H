import { Injectable, OnModuleInit } from '@nestjs/common'
import { Pool } from 'pg'

@Injectable()
export class PrismaService implements OnModuleInit {
  readonly pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })

  async onModuleInit() {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        nickname VARCHAR(32) NOT NULL DEFAULT '游客',
        text TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)

    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(32) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        token TEXT UNIQUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)

    await this.pool.query(`
      INSERT INTO chat_messages (nickname, text)
      SELECT '系统', '欢迎来到社区聊天室，大家可以直接聊天。'
      WHERE NOT EXISTS (SELECT 1 FROM chat_messages)
    `)
  }
}
