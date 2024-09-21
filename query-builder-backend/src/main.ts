import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './all-exceptions.filter';
import * as session from 'express-session';
import { createClient } from 'redis';
import RedisStore from 'connect-redis';
import { MyLoggerService } from './my-logger/my-logger.service';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true
  });

  app.useLogger(new MyLoggerService());

  const config = new DocumentBuilder()
  .setTitle("QBee API Documentation")
  .setDescription("API Documentation for QBee")
  .setVersion("1.0")
  .addTag("QBee")
  .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

  app.setGlobalPrefix('api');

  let redisClient = await createClient({
    socket: {
      host: `${process.env.REDIS_HOST}`,
      port: 6379
    }
  })
    .on('error', (err) => {
      throw err;
    })
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
