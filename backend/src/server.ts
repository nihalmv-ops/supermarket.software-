import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import http from 'http';

const PORT: number | string = process.env.PORT || 5000;

const server: http.Server = app.listen(PORT, () => {
  console.log(`🚀 [Silver Suite API] Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT} (TypeScript)`);
  console.log(`📡 Health endpoint available at http://localhost:${PORT}${process.env.API_PREFIX || '/api/v1'}/health`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

export default server;
