import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { APP_CONSTANTS } from '@vericred/shared';
import authRoutes from './modules/auth/auth.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import institutionRoutes from './modules/institutions/institution.routes.js';
import studentRoutes from './modules/students/student.routes.js';
import credentialRoutes from './modules/credentials/credential.routes.js';
import presentationRoutes from './modules/presentations/presentation.routes.js';
import verificationRoutes from './modules/verification/verification.routes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authRateLimiter, verifyRateLimiter } from './middleware/rateLimiter.js';

export function createApp(): Express {
  const app: Express = express();

  // Defense-in-Depth Security Headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'", 'http://localhost:*', 'https://*'],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: [],
        },
      },
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      frameguard: { action: 'deny' },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    })
  );

  const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim());

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Blocked by CORS policy'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );
  app.use(cookieParser());
  app.use(express.json({ limit: '5mb' }));

  // Health checks
  app.get('/health/live', (_req, res) => {
    res.json({ status: 'UP', timestamp: new Date().toISOString() });
  });

  app.get('/health/ready', (_req, res) => {
    res.json({
      status: 'READY',
      checks: {
        database: 'UP',
        redis: 'UP',
      },
    });
  });

  // Base API info
  app.get('/api/v1', (_req, res) => {
    res.json({
      success: true,
      data: {
        name: APP_CONSTANTS.APP_NAME,
        tagline: APP_CONSTANTS.TAGLINE,
        version: APP_CONSTANTS.VERSION,
      },
    });
  });

  // Mount API modules with defense-in-depth rate limiting
  app.use('/api/v1/auth', authRateLimiter, authRoutes);
  app.use('/api/v1/admin', adminRoutes);
  app.use('/api/v1/institutions', institutionRoutes);
  app.use('/api/v1/students', studentRoutes);
  app.use('/api/v1/credentials', credentialRoutes);
  app.use('/api/v1/presentations', verifyRateLimiter, presentationRoutes);
  app.use('/api/v1/verify', verifyRateLimiter, verificationRoutes);

  // Global Error Handler
  app.use(errorHandler);

  return app;
}

const app = createApp();

const PORT = process.env.PORT || 4000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`VERICRED API Server running on port ${PORT}`);
  });
}

export default app;
