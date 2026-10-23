import { app } from './app';
import { env } from './config/env';
import { pool } from './db/pool';

const server = app.listen(env.port, '0.0.0.0', () => console.log(`MiniLedger API listening on port ${env.port}`));

async function close() {
  server.close();
  await pool.end();
}
process.on('SIGINT', close);
process.on('SIGTERM', close);
