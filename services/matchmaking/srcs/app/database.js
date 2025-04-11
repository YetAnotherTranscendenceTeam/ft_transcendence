"use strict";

import Database from "better-sqlite3";
const db = new Database("/database/matchmaking.sqlite");

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS matchmaking_users (
    account_id INTEGER NOT NULL,
    gamemode TEXT NOT NULL,
    elo INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(account_id, gamemode)
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
    score_0 INTEGER NOT NULL,
    score_1 INTEGER NOT NULL,
    state INTEGER NOT NULL,
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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT,
    PRIMARY KEY (match_id, account_id),
    FOREIGN KEY (match_id) REFERENCES matches(match_id),
    UNIQUE (match_id, account_id)
  )`);

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_match_players
      AFTER UPDATE ON match_players
      FOR EACH ROW
      BEGIN
        UPDATE match_players SET updated_at = CURRENT_TIMESTAMP where match_id = OLD.match_id AND account_id = OLD.account_id;
        UPDATE matches SET updated_at = CURRENT_TIMESTAMP where match_id = OLD.match_id;
      END;
    `);

export default db;
