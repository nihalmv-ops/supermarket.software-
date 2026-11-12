import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import healthRoutes from './routes/health.routes.js';
import authRoutes from './routes/auth.routes.js';
import businessRoutes from './routes/business.routes.js';
import superAdminRoutes from './routes/superAdmin.routes.js';
import { requireDatabaseConnection } from './middleware/dbCheck.middleware.js';
import { notFoundMiddleware } from './middleware/not-found.middleware.js';
import { errorMiddleware } from './middleware/error.middleware.js';

const app: Application = express();

// 1. Helmet Security Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// 2. CORS Configuration
const allowedOrigins = [env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'];
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-business-id'],
  })
);

// 3. Cookie Parser Middleware
app.use(cookieParser(env.COOKIE_SECRET));

// 4. Rate Limiting Middleware
const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
});
app.use('/api', limiter);

// 5. Request Logging
if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// 6. Body Parsing Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 7. API Route Mounting
app.use(env.API_PREFIX, healthRoutes);

// Guard all database-dependent API routes against disconnected state
app.use(`${env.API_PREFIX}/auth`, requireDatabaseConnection, authRoutes);
app.use(`${env.API_PREFIX}/business`, requireDatabaseConnection, businessRoutes);
app.use(`${env.API_PREFIX}/super-admin`, requireDatabaseConnection, superAdminRoutes);

// 8. Base Root Route
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    name: 'Silver Business Suite API',
    status: 'Operational',
    version: '1.0.0',
    documentation: `${env.API_PREFIX}/health`,
  });
});

// 9. 404 & Centralized Error Handling
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
