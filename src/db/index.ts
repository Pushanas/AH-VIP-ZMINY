import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import * as schema from './schema.ts';

// Function to create a new connection pool using the Object Method.
export const createPool = () => {
  const user = process.env.SQL_USER || process.env.SQL_ADMIN_USER;
  const password = process.env.SQL_PASSWORD || process.env.SQL_ADMIN_PASSWORD;

  return new Pool({
    host: process.env.SQL_HOST,
    user: user,
    password: password,
    database: process.env.SQL_DB_NAME,
    connectionTimeoutMillis: 15000,
    idleTimeoutMillis: 10000, // Close idle connections after 10 seconds to avoid stale sockets
    max: 10,                  // Limit maximum active clients to prevent connection exhaustion
    keepAlive: true,          // Enable TCP keep-alive to prevent silent timeouts or closed sockets
  });
};

// Create a pool instance.
const pool = createPool();

// Prevent unhandled pool-level errors from crashing the application.
pool.on('error', (err) => {
  console.error('Unexpected error on idle SQL pool client:', err);
});

// Initialize Drizzle with the pool and schema.
export const db = drizzle(pool, { schema });
