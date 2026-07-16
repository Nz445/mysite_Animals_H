import { Pool } from 'pg'

// PostgreSQL 连接池
const pool = new Pool({
  host: process.env.PGHOST || '127.0.0.1',
  port: Number(process.env.PGPORT || 5432),
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || '123456',
  database: process.env.PGDATABASE || 'animals_user',
})

export default pool
