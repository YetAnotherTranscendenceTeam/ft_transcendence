'use strict';

import Database from "better-sqlite3";
const db = new Database("/database/credentials.sqlite");

db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

// Accounts 
db.exec(`
  CREATE TABLE IF NOT EXISTS accounts (
    account_id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    auth_method TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TRIGGER IF NOT EXISTS update_accounts_updated_at
  AFTER UPDATE ON accounts
  FOR EACH ROW
  BEGIN
    UPDATE accounts SET updated_at = CURRENT_TIMESTAMP WHERE account_id = OLD.account_id;
  END;
`)

// Password authentication
db.exec(`
  CREATE TABLE IF NOT EXISTS password_auth (
    account_id INTEGER PRIMARY KEY,
    hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    FOREIGN KEY (account_id) REFERENCES accounts(account_id) ON DELETE CASCADE
  )
`);

// Google sign-in authentication
db.exec(`
  CREATE TABLE IF NOT EXISTS google_auth (
    account_id INTEGER PRIMARY KEY,
    google_id TEXT UNIQUE NOT NULL,
    FOREIGN KEY (account_id) REFERENCES accounts(account_id) ON DELETE CASCADE
  )
`);

// 42intra authentication
db.exec(`
  CREATE TABLE IF NOT EXISTS fortytwo_auth (
    account_id INTEGER PRIMARY KEY,
    intra_user_id INTEGER UNIQUE NOT NULL,
    FOREIGN KEY (account_id) REFERENCES accounts(account_id) ON DELETE CASCADE
  )
`);

export default db;
