import type { NextFunction, Request, Response } from 'express';
import { scrubSensitiveText } from '../utils/sanitize.ts';

export function apiNotFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    status: 404,
    endpoint: req.path,
    timestamp: new Date().toISOString(),
    error: {
      code: 'ENDPOINT_NOT_FOUND',
      message: `The requested API route '${req.path}' does not exist on BESTIE MINI API.`,
    },
  });
}

export function globalErrorHandler(
  err: Error & { status?: number; statusCode?: number },
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const status = err.status || err.statusCode || 500;
  const safeMessage = scrubSensitiveText(err.message || 'Internal server error');

  console.error(`[ERROR] ${req.method} ${req.path} -> ${status}: ${safeMessage}`);

  if (res.headersSent) {
    return;
  }

  res.status(status).json({
    success: false,
    status,
    endpoint: req.path,
    timestamp: new Date().toISOString(),
    error: {
      code: status >= 500 ? 'INTERNAL_SERVER_ERROR' : 'REQUEST_ERROR',
      message: safeMessage,
    },
  });
}
