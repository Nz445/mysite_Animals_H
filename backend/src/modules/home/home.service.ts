import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../database/prisma/prisma.service.js'

@Injectable()
export class HomeService {
  constructor(private readonly db: PrismaService) {}

  private normalizePet(row: any) {
    return {
      id: row.id ?? null,
      name: row.name ?? '',
      type: row.type ?? '',
      breed: row.breed ?? '',
      age: row.age ?? '',
      image: row.image ?? '',
      tags: row.tags ?? [],
      status: row.status ?? { text: '', color: 'gray' },
    }
  }

  private normalizeHighlight(row: any) {
    return {
      id: row.id ?? null,
      title: row.title ?? '',
      description: row.description ?? '',
      icon: row.icon ?? '',
      color: row.color ?? 'blue',
    }
  }

  async getHomeData() {
    try {
      const [petsResult, highlightsResult] = await Promise.all([
        this.db.pool.query(`SELECT * FROM pets ORDER BY id ASC LIMIT 20`),
        this.db.pool.query(`SELECT * FROM highlights ORDER BY id ASC LIMIT 10`),
      ])
      return {
        pets: petsResult.rows.map((r: any) => this.normalizePet(r)),
        highlights: highlightsResult.rows.map((r: any) => this.normalizeHighlight(r)),
      }
    } catch (error) {
      console.error('[HomeService getHomeData error]', error)
      throw new Error(error instanceof Error ? error.message : String(error))
    }
  }

  async getPets() {
    try {
      const result = await this.db.pool.query(`SELECT * FROM pets ORDER BY id ASC`)
      return result.rows.map((r: any) => this.normalizePet(r))
    } catch (error) {
      console.error('[HomeService getPets error]', error)
      throw new Error(error instanceof Error ? error.message : String(error))
    }
  }

  async getHighlights() {
    try {
      const result = await this.db.pool.query(`SELECT * FROM highlights ORDER BY id ASC`)
      return result.rows.map((r: any) => this.normalizeHighlight(r))
    } catch (error) {
      console.error('[HomeService getHighlights error]', error)
      throw new Error(error instanceof Error ? error.message : String(error))
    }
  }
}