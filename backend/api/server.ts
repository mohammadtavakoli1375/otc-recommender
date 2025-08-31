import 'reflect-metadata';
import express from 'express';
import { Handler } from '@vercel/node';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';

const serverless = require('serverless-http');

let cachedServer: Handler;

async function createServer(): Promise<Handler> {
  const expressApp = express();
  
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
    {
      logger: ['error', 'warn', 'log'],
      cors: false // We'll handle CORS manually
    }
  );

  // Configure CORS
  const origins = process.env.CORS_ORIGINS?.split(',').map(s => s.trim()) || ['*'];
  app.enableCors({
    origin: origins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  await app.init();
  
  return serverless(expressApp, {
    callbackWaitsForEmptyEventLoop: false
  });
}

const handler: Handler = async (req, res) => {
  if (!cachedServer) {
    cachedServer = await createServer();
  }
  return cachedServer(req, res);
};

export default handler;