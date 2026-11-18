import cors from 'cors';
import express, { type Express } from 'express';
import { apiNotFoundHandler, globalErrorHandler } from './middleware/errorHandler.ts';
import { proxyRouter } from './routes/proxyRoutes.ts';
import { systemRouter } from './routes/systemRoutes.ts';

const API_ROUTE_PREFIXES = [
  '/api/',
  '/sinhalasub/',
  '/cinesubz/',
  '/chithrapata/',
  '/pastpapers/',
  '/tinkiri/',
  '/dl/',
];

export function createApiApp(): Express {
  const app = express();

  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  app.use(
    cors({
      origin: true,
      methods: ['GET', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Accept'],
    }),
  );

  app.use(express.json({ limit: '1mb' }));

  // System & health endpoints
  app.use(systemRouter);

  // All 17 upstream proxy endpoints
  app.use(proxyRouter);

  // Return JSON 404 for unknown API paths (let SPA handler handle UI routes)
  app.use((req, res, next) => {
    const isApiPrefix = API_ROUTE_PREFIXES.some((prefix) => req.path.startsWith(prefix));
    if (isApiPrefix) {
      apiNotFoundHandler(req, res);
      return;
    }
    next();
  });

  app.use(globalErrorHandler);

  return app;
}
