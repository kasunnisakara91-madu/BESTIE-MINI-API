import { Router } from 'express';
import {
  clearSystemLogs,
  getHealth,
  getSystemEndpoints,
  getSystemLogs,
  getSystemStatus,
} from '../controllers/systemController.ts';

export const systemRouter = Router();

systemRouter.get('/health', getHealth);
systemRouter.get('/api/system/status', getSystemStatus);
systemRouter.get('/api/system/endpoints', getSystemEndpoints);
systemRouter.get('/api/system/logs', getSystemLogs);
systemRouter.delete('/api/system/logs', clearSystemLogs);
