import pool from '../db/pool.js'

// 根据路径返回对应的数据库数据，由 server.js 调用。
export async function registerHomeRoutes(pathname) {
  if (pathname === '/api/home') {
    const [petsResult, highlightsResult] = await Promise.all([
      pool.query('SELECT * FROM pets ORDER BY id ASC'),
      pool.query('SELECT * FROM highlights ORDER BY id ASC')
    ])
    return { pets: petsResult.rows, highlights: highlightsResult.rows }
  }

  if (pathname === '/api/pets') {
    const result = await pool.query('SELECT * FROM pets ORDER BY id ASC')
    return { pets: result.rows }
  }

  if (pathname === '/api/highlights') {
    const result = await pool.query('SELECT * FROM highlights ORDER BY id ASC')
    return { highlights: result.rows }
  }

  return null
}
