import { SimpleIntervalJob, AsyncTask } from 'toad-scheduler';
import db from './database.js';

const dbCleanup = db.prepare(`DELETE FROM refresh_tokens WHERE expire_at < datetime('now')`);

const task = new AsyncTask('remove-expired-tokens', async () => {
  const deletion = dbCleanup.run();
  if (deletion?.changes) {
    console.log(`CLEANUP: ${deletion.changes} refresh_tokens deleted from database`);
  }
});

export const removeExpiredTokens = new SimpleIntervalJob({ hour: 1 }, task, { id: 'token-cleanup' });
