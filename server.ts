import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { createApiApp } from './backend/app.ts';
import { config } from './backend/config/env.ts';
import { globalErrorHandler } from './backend/middleware/errorHandler.ts';
import { checkUpstreamHealth } from './backend/services/healthService.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer(): Promise<void> {
  const app = createApiApp();
  const isProd = config.nodeEnv === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    const indexPath = path.join(distDir, 'index.html');

    if (fs.existsSync(distDir)) {
      app.use(express.static(distDir, { index: false }));
      app.get('*', (_req, res) => {
        if (fs.existsSync(indexPath)) {
          res.sendFile(indexPath);
        } else {
          res.status(404).send('Frontend build not found. Run npm run build.');
        }
      });
    }
  }

  app.use(globalErrorHandler);

  const server = app.listen(config.port, '0.0.0.0', () => {
    console.log(
      `[BESTIE MINI API] Server listening on http://0.0.0.0:${config.port} (${config.nodeEnv})`,
    );
    // Warm initial upstream health check in background
    void checkUpstreamHealth(true);
  });

  const shutdown = (signal: string) => {
    console.log(`[BESTIE MINI API] Received ${signal}. Closing HTTP server gracefully...`);
    server.close((err) => {
      if (err) {
        console.error('[BESTIE MINI API] Error during shutdown:', err);
        process.exit(1);
      }
      console.log('[BESTIE MINI API] Shutdown complete.');
      process.exit(0);
    });
    setTimeout(() => {
      console.error('[BESTIE MINI API] Forced shutdown after timeout.');
      process.exit(1);
    }, 10_000).unref();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

startServer().catch((err) => {
  console.error('[BESTIE MINI API] Fatal startup error:', err);
  process.exit(1);
});
