import { Router } from 'express';
import { API_ENDPOINTS } from '../config/endpoints.ts';
import { createProxyHandler } from '../controllers/proxyController.ts';
import { apiRateLimiter } from '../middleware/rateLimiter.ts';
import { validateEndpointParams } from '../middleware/validator.ts';

export const proxyRouter = Router();

for (const endpoint of API_ENDPOINTS) {
  proxyRouter.get(
    endpoint.path,
    apiRateLimiter,
    validateEndpointParams(endpoint),
    createProxyHandler(endpoint),
  );
}
