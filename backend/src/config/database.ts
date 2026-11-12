import mongoose from 'mongoose';
import dns from 'dns';
import { env } from './env.js';

// Disable Mongoose command buffering so queries fail fast with clear errors instead of hanging
mongoose.set('bufferCommands', false);

// Resolve Node.js Windows querySrv ECONNREFUSED error on MongoDB Atlas SRV records
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch {
  // Fallback to default resolver if custom servers cannot be set
}

export type DatabaseStatus = 'connected' | 'connecting' | 'disconnected' | 'disconnecting';

/**
 * Mask sensitive credentials from MongoDB connection URI for safe console logging
 */
const maskMongoUri = (uri: string): string => {
  try {
    return uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
  } catch {
    return '***[MASKED URI]***';
  }
};

/**
 * Returns current Mongoose connection status in human-readable format
 */
export const getDatabaseStatus = (): DatabaseStatus => {
  const state = mongoose.connection.readyState;
  switch (state) {
    case 1:
      return 'connected';
    case 2:
      return 'connecting';
    case 3:
      return 'disconnecting';
    case 0:
    default:
      return 'disconnected';
  }
};

/**
 * Connect to MongoDB Atlas / Local MongoDB instance
 */
export const connectDatabase = async (): Promise<boolean> => {
  const uri = env.MONGODB_URI;

  if (!uri || uri.trim() === '' || uri === 'your_mongodb_connection_string') {
    console.warn(
      '⚠️  [Database] MONGODB_URI is not set or contains placeholder. Database connection bypassed for setup.'
    );
    return false;
  }

  // Configure mongoose connection event listeners
  mongoose.connection.on('connected', () => {
    console.log(`✅ [Database] MongoDB connected successfully to [${maskMongoUri(uri)}]`);
  });

  mongoose.connection.on('error', (err: Error) => {
    console.error('❌ [Database] MongoDB runtime connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  [Database] MongoDB connection disconnected');
  });

  try {
    console.log(`📡 [Database] Connecting to MongoDB...`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000, // Timeout after 10s if server unreachable
      autoIndex: env.NODE_ENV !== 'production', // Build indexes in development only
    });
    return true;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown connection error';
    console.error(`❌ [Database] Failed to connect to MongoDB: ${message}`);
    console.warn('💡 [Database] Running server with database status: DISCONNECTED');
    return false;
  }
};

/**
 * Gracefully disconnect Mongoose connection
 */
export const disconnectDatabase = async (): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('🛑 [Database] MongoDB connection closed gracefully');
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error closing connection';
    console.error('❌ [Database] Error during MongoDB disconnection:', message);
  }
};
