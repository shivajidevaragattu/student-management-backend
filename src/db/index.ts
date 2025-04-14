import { drizzle } from 'drizzle-orm/neon-http';
import { drizzle as nodeDrizzle } from 'drizzle-orm/node-postgres';
import 'dotenv/config';
import * as schema from './schema';
import { neon } from '@neondatabase/serverless';
import { Pool } from 'pg';

const isTest = process.env.NODE_ENV === 'test';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

export const db = isTest
  ? nodeDrizzle({ client: pool })
  : drizzle<typeof schema>(neon(process.env.DATABASE_URL!), { schema });

export default db;
