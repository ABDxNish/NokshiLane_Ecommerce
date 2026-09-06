import {
  ValidationPipe,
} from '@nestjs/common';

import {
  ConfigService,
} from '@nestjs/config';

import {
  NestFactory,
} from '@nestjs/core';

import session = require('express-session');
import connectPgSimple = require('connect-pg-simple');
import {
  AppModule,
} from './app.module';


async function bootstrap() {
  const app =
    await NestFactory.create(
      AppModule,
    );


  const config =
    app.get(
      ConfigService,
    );


  const isProduction =
    config.get<string>(
      'NODE_ENV',
    ) === 'production';


  const frontendUrl =
    config.get<string>(
      'FRONTEND_URL',
    ) ||
    'http://localhost:3200';


  const databaseUrl =
    config.get<string>(
      'DATABASE_URL',
    );


  /*
   * Render runs behind a proxy.
   * Required for secure cookies.
   */
  if (isProduction) {
    app
      .getHttpAdapter()
      .getInstance()
      .set(
        'trust proxy',
        1,
      );
  }


  /*
   * Allow frontend to send
   * session cookies to API.
   */
  app.enableCors({
    origin:
      frontendUrl,

    credentials:
      true,

    methods: [
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'OPTIONS',
    ],

    allowedHeaders: [
      'Content-Type',
      'Authorization',
    ],
  });


  /*
   * PostgreSQL session store.
   *
   * If DATABASE_URL exists,
   * sessions are stored in Neon.
   *
   * Local fallback without
   * DATABASE_URL still uses
   * express-session MemoryStore.
   */
  const PgSession =
    connectPgSimple(
      session,
    );


  const sessionStore =
    databaseUrl
      ? new PgSession({
          conString:
            databaseUrl,

          tableName:
            'user_sessions',

          createTableIfMissing:
            true,
        })
      : undefined;


  app.use(
    session({
      name:
        'nokshilane.sid',

      secret:
        config.get<string>(
          'SESSION_SECRET',
        ) ||
        'development-secret-change-me',

      store:
        sessionStore,

      resave:
        false,

      saveUninitialized:
        false,

      rolling:
        true,

      proxy:
        isProduction,

      cookie: {
        httpOnly:
          true,

        /*
         * HTTPS only in production.
         */
        secure:
          isProduction,

        /*
         * Local:
         * frontend/backend are localhost
         * → lax works.
         *
         * Production:
         * Vercel + Render are different
         * origins → none required.
         */
        sameSite:
          isProduction
            ? 'none'
            : 'lax',

        maxAge:
          1000 *
          60 *
          60 *
          24 *
          7,
      },
    }),
  );


  app.useGlobalPipes(
    new ValidationPipe({
      whitelist:
        true,

      transform:
        true,

      forbidNonWhitelisted:
        true,
    }),
  );


  const port =
    Number(
      config.get<string>(
        'PORT',
      ) ||
      3001,
    );


  await app.listen(
    port,
    '0.0.0.0',
  );


  console.log(
    `NokshiLane API running on port ${port}`,
  );


  console.log(
    databaseUrl
      ? 'Session store: PostgreSQL'
      : 'Session store: MemoryStore',
  );
}


bootstrap();