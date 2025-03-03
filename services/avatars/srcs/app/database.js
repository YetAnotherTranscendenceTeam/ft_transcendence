"use strict";

import Database from "better-sqlite3";
const db = new Database("/database/avatars.sqlite");

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS avatars (
    account_id INTEGER,
    url TEXT NOT NULL
  )
`);

export default db;
