import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { pool } from './pool';

async function migrate() {
  const migrationsPath = join(process.cwd(), 'migrations');
  const files = (await readdir(migrationsPath)).filter((file) => file.endsWith('.sql')).sort();
  for (const file of files) await pool.query(await readFile(join(migrationsPath, file), 'utf8'));
  console.log('Database migration completed.');
}

migrate().catch((error: unknown) => {
  console.error('Database migration failed.', error);
  process.exitCode = 1;
}).finally(() => pool.end());
