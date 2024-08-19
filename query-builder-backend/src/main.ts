import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './all-exceptions.filter';
import * as session from 'express-session';
import { createClient } from 'redis';
import RedisStore from 'connect-redis';
import { MyLoggerService } from './my-logger/my-logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new MyLoggerService('Main');

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

  app.setGlobalPrefix('api');

  let redisClient = await createClient({
    socket: {
      host: `${process.env.REDIS_HOST}`,
      port: 6379
    }
  })
    .on('error', (err) => logger.log('Redis Client Error', err))
    .connect();

  redisClient.flushAll();

  let redisStore = new RedisStore({
    client: redisClient,
    ttl: 3600
  });

  app.use(
    session({
      store: redisStore,
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false
    })
  );

  app.enableCors({
    origin: `${process.env.FRONTEND_URL}`,
    methods: 'GET,PUT,PATCH,POST,DELETE', 
    credentials: true
  });
  await app.listen(55555);
}
bootstrap();
