"use strict";

import Database from "better-sqlite3";
const db = new Database("/database/matchmaking.sqlite");

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS matchmaking_users (
    account_id INTEGER PRIMARY KEY,
    gamemode TEXT NOT NULL,
    elo INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

db.exec(`
  CREATE TABLE IF NOT EXISTS matches (
    match_id INTEGER PRIMARY KEY AUTOINCREMENT,
    players INTEGER[4] NULL,
    gamemode TEXT NOT NULL,
    scores INTEGER[2] NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

db.exec(`
  CREATE TRIGGER IF NOT EXISTS update_matchmaking_users_updated_at
  AFTER UPDATE ON matchmaking_users
  FOR EACH ROW
  BEGIN
    UPDATE matchmaking_users SET updated_at = CURRENT_TIMESTAMP where account_id = OLD.account_id;
  END;
`);

export default db;
