import { Module } from '@nestjs/common'
import { AuthModule } from './modules/auth/auth.module.js'
import { ChatModule } from './modules/chat/chat.module.js'
import { UserModule } from './modules/user/user.module.js'
import { DbModule } from './database/db.module.js'

@Module({
  imports: [DbModule, AuthModule, ChatModule, UserModule],
})
export class AppModule {}
