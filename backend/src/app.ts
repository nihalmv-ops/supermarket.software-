import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import healthRoutes from './routes/healthRoutes.js';
import { notFoundHandler, errorHandler } from './middlewares/errorHandler.js';

const app: Application = express();

// Middlewares
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// API Routes
const apiPrefix: string = process.env.API_PREFIX || '/api/v1';
app.use(`${apiPrefix}`, healthRoutes);

// Fallback Root Route
app.get('/', (_req: Request, res: Response) => {
  res.json({
    name: 'Silver Business Suite API',
    status: 'Running',
    version: '1.0.0',
    runtime: 'TypeScript',
    documentation: `${apiPrefix}/health`,
  });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
