import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './all-exceptions.filter';
import * as session from 'express-session';
import { createClient } from 'redis';
import RedisStore from 'connect-redis';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.setGlobalPrefix('api');

  let redisClient = await createClient()
    .on('error', (err) => console.log('Redis Client Error', err))
    .connect();
  let redisStore = new RedisStore({
    client: redisClient,
  });

  app.use(
    session({
      // ! the redisStore is needed as we are able to execute functions on expiry of sessions
      // ! but it is also causing an issue as the session now persists after a run of the program - when the program is rerun, sessions are populated but connections are not - causing errors
      // store: redisStore,
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 3600000,
      },
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

  app.enableCors();
  await app.listen(55555);
}
bootstrap();
