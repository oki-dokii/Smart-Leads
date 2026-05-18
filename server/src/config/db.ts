import mongoose from 'mongoose';

const MAX_RETRIES = 5;
const RETRY_INTERVAL_MS = 5_000;

let retries = 0;

const connectDB = async (): Promise<void> => {
  const uri = process.env['MONGODB_URI'];

  if (!uri) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5_000,
      socketTimeoutMS: 45_000,
    });

    retries = 0;
    console.log(`[db] MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[db] Connection error: ${message}`);

    if (retries < MAX_RETRIES) {
      retries += 1;
      console.warn(`[db] Retrying in ${RETRY_INTERVAL_MS / 1000}s… (${retries}/${MAX_RETRIES})`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL_MS));
      return connectDB();
    }

    throw new Error(`[db] Failed to connect after ${MAX_RETRIES} attempts`);
  }
};

// Graceful shutdown helpers
mongoose.connection.on('disconnected', () => {
  console.warn('[db] MongoDB disconnected');
});

mongoose.connection.on('error', (err: Error) => {
  console.error(`[db] Mongoose error: ${err.message}`);
});

export default connectDB;
