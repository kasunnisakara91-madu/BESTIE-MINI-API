import type { NextFunction, Request, Response } from 'express';
import type { ApiEndpointDefinition } from '../config/endpoints.ts';
import { forwardToUpstream } from '../services/upstreamProxy.ts';

export function createProxyHandler(endpoint: ApiEndpointDefinition) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await forwardToUpstream(endpoint, req, res);
    } catch (error) {
      next(error);
    }
  };
}
