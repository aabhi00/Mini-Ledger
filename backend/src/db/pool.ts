import { Pool, type QueryResultRow } from 'pg';
import { env } from '../config/env';

export const pool = new Pool({ connectionString: env.databaseUrl });

export function query<T extends QueryResultRow>(text: string, values?: unknown[]) {
  return pool.query<T>(text, values);
}
