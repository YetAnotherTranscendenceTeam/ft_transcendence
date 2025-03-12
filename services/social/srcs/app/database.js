"use strict";

import Database from "better-sqlite3";
const db = new Database("/database/social.sqlite");

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS follows (
    account_id INTEGER NOT NULL,
    following INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (account_id, following)
  )
`);

const MAX_FOLLOWS = 50;

db.exec(`
  CREATE TRIGGER IF NOT EXISTS check_max_follows
  BEFORE INSERT ON follows
  BEGIN
    SELECT CASE
      WHEN (SELECT COUNT(*) FROM follows WHERE account_id = NEW.account_id) >= ${MAX_FOLLOWS}
      THEN RAISE(ABORT, 'Maximum number of follows reached for this account')
    END;
  END;
`)

export default db;
