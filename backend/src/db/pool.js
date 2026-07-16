import { Pool } from 'pg'

// PostgreSQL 连接池：通过环境变量配置，默认值仅用于本地开发。
const pool = new Pool({
  host: process.env.PGHOST || '127.0.0.1',
  port: Number(process.env.PGPORT || 5432),
  user: process.env.PGUSER || 'animals_user',
  password: process.env.PGPASSWORD || '你的密码',
  database: process.env.PGDATABASE || 'animals_h',
})

export default pool
