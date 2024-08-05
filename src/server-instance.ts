import serverlessExpress from '@codegenie/serverless-express';
import { NestFactory, Reflector } from '@nestjs/core';
import { Handler } from 'aws-lambda';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard } from './guards';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

let server: Handler | undefined;

export async function createServer(): Promise<Handler> {
  if (!server) {
    const app = await NestFactory.create(AppModule);

    const config = new DocumentBuilder()
      .setTitle('Radix Sensor API')
      .setDescription(
        'Estas são as rotas disponíveis para a API do Radix Sensor',
      )
      .setVersion('1.0')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('swagger', app, document);

    app.useGlobalGuards(new JwtAuthGuard(app.get(Reflector)));
    app.useGlobalPipes(new ValidationPipe());

    app.enableCors();

    await app.init();

    const expressApp = app.getHttpAdapter().getInstance();
    server = serverlessExpress({ app: expressApp });
  }
  return server;
}
