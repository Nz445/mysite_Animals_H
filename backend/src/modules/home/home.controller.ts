import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common'
import { HomeService } from './home.service.js'

@Controller('api')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get('home')
  async getHome() {
    try {
      return await this.homeService.getHomeData()
    } catch (error) {
      console.error('[HomeController /api/home error]', error)
      throw new HttpException(
        { ok: false, message: error instanceof Error ? error.message : String(error) },
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  @Get('pets')
  async getPets() {
    try {
      return { pets: await this.homeService.getPets() }
    } catch (error) {
      console.error('[HomeController /api/pets error]', error)
      throw new HttpException(
        { ok: false, message: error instanceof Error ? error.message : String(error) },
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  @Get('highlights')
  async getHighlights() {
    try {
      return { highlights: await this.homeService.getHighlights() }
    } catch (error) {
      console.error('[HomeController /api/highlights error]', error)
      throw new HttpException(
        { ok: false, message: error instanceof Error ? error.message : String(error) },
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }
}