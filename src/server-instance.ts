import serverlessExpress from '@codegenie/serverless-express';
import { NestFactory } from '@nestjs/core';
import { Handler } from 'aws-lambda';
import { AppModule } from './app.module';

let server: Handler | undefined;

export async function createServer(): Promise<Handler> {
  if (!server) {
    const app = await NestFactory.create(AppModule);
    await app.init();
    const expressApp = app.getHttpAdapter().getInstance();
    server = serverlessExpress({ app: expressApp });
  }
  return server;
}
