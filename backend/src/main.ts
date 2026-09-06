import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import session = require('express-session');

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);

  const isProduction =
    config.get<string>('NODE_ENV') === 'production';

  if (isProduction) {
    app
      .getHttpAdapter()
      .getInstance()
      .set('trust proxy', 1);
  }

  app.enableCors({
    origin:
      config.get<string>('FRONTEND_URL') ||
      'http://localhost:3200',

    credentials: true,
  });

  app.use(
    session({
      secret:
        config.get<string>('SESSION_SECRET') ||
        'development-secret-change-me',

      resave: false,
      saveUninitialized: false,

      cookie: {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge:
          1000 * 60 * 60 * 24 * 7,
      },
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = Number(
    config.get<string>('PORT') || 3001,
  );

  await app.listen(
    port,
    '0.0.0.0',
  );

  console.log(
    `NokshiLane API running at http://localhost:${port}`,
  );
}

bootstrap();
