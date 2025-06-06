import { SimpleIntervalJob, AsyncTask } from 'toad-scheduler';
import db from './database.js';

const dbCleanup = db.prepare(`DELETE FROM refresh_tokens WHERE expire_at < datetime('now')`);

const task = new AsyncTask('remove-expired-tokens', async () => {
  const deletion = dbCleanup.run();
  console.log(`SCHEDULE: ${deletion.changes} refresh_tokens deleted from database`);
});

export const removeExpiredTokens = new SimpleIntervalJob({ minutes: 60 }, task, { id: 'token-cleanup' });
