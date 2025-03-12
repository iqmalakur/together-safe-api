import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggerUtil } from './utils/logger.util';
import { PORT } from './config/app.config';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

async function bootstrap() {
  const logger = new LoggerUtil('Main');

  const app: INestApplication = await NestFactory.create(AppModule);
  app.enableCors();
  logger.info('Loaded app modules');

  const swaggerConfig: Omit<OpenAPIObject, 'paths'> = new DocumentBuilder()
    .setTitle('Together Safe API')
    .setDescription('API documentation for Together Safe Application')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'jwt',
    )
    .addTag('Auth')
    .addTag('Incident')
    .build();

  const swaggerDocument: OpenAPIObject = SwaggerModule.createDocument(
    app,
    swaggerConfig,
  );
  SwaggerModule.setup('api', app, swaggerDocument);
  logger.info('Generated Swagger API Documentation');
  logger.info('Access /api to see the API Documentation');
  logger.info('Access /api-json to see the Open API json file');
  logger.info('Access /api-yaml to see the Open API yaml file');

  await app.listen(PORT);
  logger.info(`Application started on port ${PORT}`);
}

bootstrap();
