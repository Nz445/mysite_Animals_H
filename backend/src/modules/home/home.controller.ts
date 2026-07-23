import { Controller, Get } from '@nestjs/common'
import { HomeService } from './home.service.js'

@Controller('api')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get('home')
  async getHome() {
    return await this.homeService.getHomeData()
  }

  @Get('pets')
  async getPets() {
    return { pets: await this.homeService.getPets() }
  }

  @Get('highlights')
  async getHighlights() {
    return { highlights: await this.homeService.getHighlights() }
  }
}