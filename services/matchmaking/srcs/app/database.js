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
  CREATE TRIGGER IF NOT EXISTS update_matchmaking_users_updated_at
    AFTER UPDATE ON matchmaking_users
    FOR EACH ROW
    BEGIN
      UPDATE matchmaking_users SET updated_at = CURRENT_TIMESTAMP where account_id = OLD.account_id;
    END;
  `);

db.exec(`
  CREATE TABLE IF NOT EXISTS matches (
    match_id INTEGER PRIMARY KEY AUTOINCREMENT,
    gamemode TEXT NOT NULL,
    scores INTEGER[2] NOT NULL,
    state TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

db.exec(`
  CREATE TRIGGER IF NOT EXISTS update_matches_updated_at
    AFTER UPDATE ON matches
    FOR EACH ROW
    BEGIN
      UPDATE matches SET updated_at = CURRENT_TIMESTAMP where match_id = OLD.match_id;
    END;
  `);

// TODO: add player stats
db.exec(`
  CREATE TABLE IF NOT EXISTS match_players (
    match_id INTEGER NOT NULL,
    account_id INTEGER NOT NULL,
    team_index INTEGER NOT NULL,
    PRIMARY KEY (match_id, account_id),
    FOREIGN KEY (match_id) REFERENCES matches(match_id),
    FOREIGN KEY (account_id) REFERENCES matchmaking_users(account_id)
  )`);

export default db;
