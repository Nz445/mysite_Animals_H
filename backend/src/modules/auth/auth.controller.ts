import { Body, Controller, Get, Headers, Post } from '@nestjs/common'
import { AuthService } from './auth.service.js'

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: { username?: string; password?: string; confirmPassword?: string }) {
    const result = await this.authService.register(String(body.username || '').trim(), String(body.password || ''), String(body.confirmPassword || ''))
    return result.ok ? { ok: true, user: result.user } : { ok: false, message: result.message }
  }

  @Post('login')
  async login(@Body() body: { username?: string; password?: string }) {
    const result = await this.authService.login(String(body.username || '').trim(), String(body.password || ''))
    return result.ok ? { ok: true, user: result.user } : { ok: false, message: result.message }
  }

  @Get('me')
  async me(@Headers('authorization') authorization = '') {
    const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : ''
    const result = await this.authService.me(token)
    return result.ok ? { ok: true, user: result.user } : { ok: false, message: result.message }
  }
}
