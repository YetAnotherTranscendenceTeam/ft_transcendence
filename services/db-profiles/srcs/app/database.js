"use strict";

import Database from "better-sqlite3";
const db = new Database("/database/profiles.sqlite");

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS profiles (
    account_id INTEGER PRIMARY KEY,
    username TEXT UNIQUE DEFAULT NULL,
    avatar TEXT DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TRIGGER IF NOT EXISTS update_profiles_updated_at
  AFTER UPDATE ON profiles
  FOR EACH ROW
  BEGIN
    UPDATE profiles SET updated_at = CURRENT_TIMESTAMP WHERE account_id = OLD.account_id;
  END;
`);

export default db;
