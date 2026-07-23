import { Body, Controller, Get, Post, Headers } from '@nestjs/common'
import { ChatService } from './chat.service.js'

@Controller('api/chat/messages')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  async listMessages() {
    return { messages: await this.chatService.listMessages() }
  }

  @Post()
  async sendMessage(
    @Body() body: { nickname?: string; text?: string; token?: string },
    @Headers('authorization') authorization = '',
  ) {
    const token = body.token || (authorization.startsWith('Bearer ') ? authorization.slice(7) : '')
    if (!token) return { ok: false, message: '请先登录' }
    const text = String(body.text || '').trim()
    const nickname = String(body.nickname || '游客').trim() || '游客'
    if (!text) return { ok: false, message: '消息不能为空' }
    return { ok: true, message: await this.chatService.sendMessage(nickname, text) }
  }
}
