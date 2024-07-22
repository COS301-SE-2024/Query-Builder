import { NestFactory, HttpAdapterHost } from "@nestjs/core";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./all-exceptions.filter";
import * as session from 'express-session'

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.setGlobalPrefix("api");
  
  app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie:
    {
      maxAge: 3600000,
    }
  }));
  
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

  app.enableCors();
  await app.listen(55555);
}
bootstrap();
