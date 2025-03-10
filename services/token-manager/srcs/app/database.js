"use strict";

import Database from "better-sqlite3";
const db = new Database("/database/refresh-tokens.sqlite");

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS refresh_tokens (
    account_id INTEGER,
    token TEXT NOT NULL,
    expire_at DATETIME NOT NULL
  )
`);

export default db;
