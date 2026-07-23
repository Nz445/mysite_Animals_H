import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../database/prisma/prisma.service.js'

@Injectable()
export class HomeService {
  private inited = false

  constructor(private readonly db: PrismaService) {}

  private async ensureTables() {
    if (this.inited) return
    try {
      await this.db.pool.query(`
        CREATE TABLE IF NOT EXISTS pets (
          id SERIAL PRIMARY KEY,
          name VARCHAR(64) NOT NULL,
          type VARCHAR(32) NOT NULL,
          breed VARCHAR(128) NOT NULL,
          age VARCHAR(32) NOT NULL,
          image TEXT NOT NULL DEFAULT '',
          tags JSONB NOT NULL DEFAULT '[]'::jsonb,
          status JSONB NOT NULL DEFAULT '{"text":"可领养","color":"green"}'::jsonb,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `)
      await this.db.pool.query(`
        CREATE TABLE IF NOT EXISTS highlights (
          id SERIAL PRIMARY KEY,
          title VARCHAR(128) NOT NULL,
          description TEXT NOT NULL,
          icon VARCHAR(64) NOT NULL DEFAULT 'star',
          color VARCHAR(32) NOT NULL DEFAULT 'blue',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `)
      const petCount = await this.db.pool.query('SELECT COUNT(*) FROM pets')
      if (Number(petCount.rows[0].count) === 0) {
        await this.db.pool.query(`
          INSERT INTO pets (name, type, breed, age, image, tags, status) VALUES
          ('小白', 'dog', '萨摩耶', '2岁', '', '[{"text":"温顺","color":"green"},{"text":"活泼","color":"yellow"}]'::jsonb, '{"text":"可领养","color":"green"}'::jsonb),
          ('橘子', 'cat', '中华田园猫', '1岁', '', '[{"text":"粘人","color":"pink"},{"text":"贪吃","color":"orange"}]'::jsonb, '{"text":"等待领养","color":"yellow"}'::jsonb),
          ('球球', 'rabbit', '荷兰垂耳兔', '6个月', '', '[{"text":"安静","color":"blue"},{"text":"胆小","color":"purple"}]'::jsonb, '{"text":"可领养","color":"green"}'::jsonb),
          ('豆豆', 'dog', '柴犬', '3岁', '', '[{"text":"聪明","color":"blue"},{"text":"独立","color":"purple"}]'::jsonb, '{"text":"已领养","color":"gray"}'::jsonb),
          ('咪咪', 'cat', '英国短毛猫', '2岁', '', '[{"text":"高冷","color":"purple"},{"text":"优雅","color":"pink"}]'::jsonb, '{"text":"可领养","color":"green"}'::jsonb),
          ('毛毛', 'rabbit', '道奇兔', '1岁', '', '[{"text":"活泼","color":"yellow"},{"text":"好奇","color":"orange"}]'::jsonb, '{"text":"等待领养","color":"yellow"}'::jsonb)
        `)
      }
      const hlCount = await this.db.pool.query('SELECT COUNT(*) FROM highlights')
      if (Number(hlCount.rows[0].count) === 0) {
        await this.db.pool.query(`
          INSERT INTO highlights (title, description, icon, color) VALUES
          ('领养须知', '了解领养前需要准备的事项和注意事项，给毛孩子一个温暖的家。', 'heart', 'pink'),
          ('宠物护理', '学习宠物日常护理知识，包括饮食、运动、健康检查等。', 'care', 'green'),
          ('训练技巧', '分享科学的宠物训练方法，建立你和宠物之间的默契。', 'star', 'yellow'),
          ('社区活动', '参与线下宠物聚会、公益活动，认识更多养宠朋友。', 'community', 'blue')
        `)
      }
      this.inited = true
    } catch (e) {
      console.warn('[HomeService ensureTables 建表失败，继续尝试查询]', e)
    }
  }

  async getHomeData() {
    await this.ensureTables()
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
    await this.ensureTables()
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
    await this.ensureTables()
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