import { Controller, Get, Res, HttpStatus } from '@nestjs/common'
import { Response } from 'express'
import { HomeService } from './home.service.js'

@Controller('api')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get('home')
  async getHome(@Res() res: Response) {
    try {
      const data = await this.homeService.getHomeData()
      return res.status(HttpStatus.OK).json(data)
    } catch (error) {
      console.error('[HomeController /api/home error]', error)
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        ok: false,
        message: error instanceof Error ? error.message : String(error),
      })
    }
  }

  @Get('pets')
  async getPets(@Res() res: Response) {
    try {
      const pets = await this.homeService.getPets()
      return res.status(HttpStatus.OK).json({ pets })
    } catch (error) {
      console.error('[HomeController /api/pets error]', error)
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        ok: false,
        message: error instanceof Error ? error.message : String(error),
      })
    }
  }

  @Get('highlights')
  async getHighlights(@Res() res: Response) {
    try {
      const highlights = await this.homeService.getHighlights()
      return res.status(HttpStatus.OK).json({ highlights })
    } catch (error) {
      console.error('[HomeController /api/highlights error]', error)
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        ok: false,
        message: error instanceof Error ? error.message : String(error),
      })
    }
  }
}