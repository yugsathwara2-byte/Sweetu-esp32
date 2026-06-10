import { Pool } from 'pg';

// Create a single pool instance to be shared across requests
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ...(process.env.NODE_ENV === 'production' && {
    ssl: {
      rejectUnauthorized: false,
    },
  }),
});

/**
 * Executes a PostgreSQL query using the shared connection pool.
 * @param text The SQL query string
 * @param params Optional array of parameters
 * @returns The query result
 */
export async function query(text: string, params?: any[]) {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res;
  } finally {
    client.release();
  }
}
