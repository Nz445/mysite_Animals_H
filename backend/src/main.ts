import 'dotenv/config'
import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module.js'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.enableCors({
    origin: (origin, callback) => {
      const allowList = [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'https://wsnz44.top',
        'https://www.wsnz44.top',
        'https://api.wsnz44.top',
      ]
      if (!origin || allowList.includes(origin) || /\.wsnz44\.top$/.test(origin || '')) {
        callback(null, true)
      } else {
        callback(null, true)
      }
    },
    credentials: true,
  })
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidUnknownValues: false }))
  await app.listen(process.env.PORT || 3000, '0.0.0.0')
}

bootstrap()