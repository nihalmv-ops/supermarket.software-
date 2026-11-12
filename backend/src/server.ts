import dns from 'dns';

// Fix Node.js Windows SRV resolution with MongoDB Atlas (ECONNREFUSED querySrv)
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch {
  // Fallback to system resolver if restricted
}

import http from 'http';
import app from './app.js';
import { env } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';

let server: http.Server | undefined;

const startServer = async (): Promise<void> => {
  // Connect to MongoDB Atlas / Local MongoDB
  await connectDatabase();

  server = app.listen(env.PORT, () => {
    console.log(`🚀 [Server] Silver Business Suite running in [${env.NODE_ENV}] mode on port [${env.PORT}]`);
    console.log(`📡 [Server] API Health check available at: http://localhost:${env.PORT}${env.API_PREFIX}/health`);
  });
};

// Graceful shutdown handler
const gracefulShutdown = async (signal: string): Promise<void> => {
  console.log(`\n🛑 [Server] ${signal} signal received. Initiating graceful shutdown...`);

  if (server) {
    server.close(async () => {
      console.log('🚪 [Server] HTTP server closed');
      await disconnectDatabase();
      console.log('✨ [Server] All services shut down cleanly. Exiting.');
      process.exit(0);
    });

    // Force close if graceful shutdown hangs
    setTimeout(() => {
      console.error('⚠️  [Server] Graceful shutdown timed out. Forcing process exit.');
      process.exit(1);
    }, 10000);
  } else {
    await disconnectDatabase();
    process.exit(0);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason: unknown) => {
  const errorMsg = reason instanceof Error ? reason.stack || reason.message : String(reason);
  console.error('💥 [Server] Unhandled Rejection:', errorMsg);
});

process.on('uncaughtException', (error: Error) => {
  console.error('💥 [Server] Uncaught Exception:', error.stack || error.message);
  process.exit(1);
});

startServer();

export { server, startServer };
export default app;
