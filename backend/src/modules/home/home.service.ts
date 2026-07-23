import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../database/prisma/prisma.service.js'

@Injectable()
export class HomeService {
  constructor(private readonly db: PrismaService) {}

  async getHomeData() {
    try {
      const [petsResult, highlightsResult] = await Promise.all([
        this.db.pool.query(`
          SELECT id, name, type, breed, age, image, tags, status
          FROM pets
          ORDER BY id ASC
          LIMIT 20
        `),
        this.db.pool.query(`
          SELECT id, title, description, icon, color
          FROM highlights
          ORDER BY id ASC
          LIMIT 10
        `),
      ])
      return { pets: petsResult.rows, highlights: highlightsResult.rows }
    } catch (error) {
      console.error('[HomeService getHomeData error]', error)
      throw new Error(error instanceof Error ? error.message : String(error))
    }
  }

  async getPets() {
    try {
      const result = await this.db.pool.query(`
        SELECT id, name, type, breed, age, image, tags, status
        FROM pets
        ORDER BY id ASC
      `)
      return result.rows
    } catch (error) {
      console.error('[HomeService getPets error]', error)
      throw new Error(error instanceof Error ? error.message : String(error))
    }
  }

  async getHighlights() {
    try {
      const result = await this.db.pool.query(`
        SELECT id, title, description, icon, color
        FROM highlights
        ORDER BY id ASC
      `)
      return result.rows
    } catch (error) {
      console.error('[HomeService getHighlights error]', error)
      throw new Error(error instanceof Error ? error.message : String(error))
    }
  }
}