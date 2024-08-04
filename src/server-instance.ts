import serverlessExpress from '@codegenie/serverless-express';
import { NestFactory, Reflector } from '@nestjs/core';
import { Handler } from 'aws-lambda';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard } from './guards';

let server: Handler | undefined;

export async function createServer(): Promise<Handler> {
  if (!server) {
    const app = await NestFactory.create(AppModule);

    app.useGlobalGuards(new JwtAuthGuard(app.get(Reflector)));
    app.useGlobalPipes(new ValidationPipe());

    app.enableCors();

    await app.init();

    const expressApp = app.getHttpAdapter().getInstance();
    server = serverlessExpress({ app: expressApp });
  }
  return server;
}
