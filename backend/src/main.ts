import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { DomainExceptionFilter } from './shared/filters/domain-exception.filter';

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT:', err);
});

process.on('unhandledRejection', (err) => {
  console.log('REJECTION:', err);
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  console.log(process.env.CORS_ORIGIN);

  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5174',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('File Manager API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  app.useGlobalFilters(new DomainExceptionFilter());

  const port = process.env.PORT;

  console.log('STARTS ON PORT: ', port);

  await app.listen(Number(port), '0.0.0.0');
}

void bootstrap();
