import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pool } from './pool';

async function migrate() {
  const sql = await readFile(join(process.cwd(), 'migrations', '001_initial.sql'), 'utf8');
  await pool.query(sql);
  console.log('Database migration completed.');
}

migrate().catch((error: unknown) => {
  console.error('Database migration failed.', error);
  process.exitCode = 1;
}).finally(() => pool.end());
