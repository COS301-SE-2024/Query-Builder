import { NestFactory, HttpAdapterHost } from "@nestjs/core";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./all-exceptions.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.setGlobalPrefix("api");
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

  app.enableCors();
  await app.listen(55555);
}
bootstrap();
