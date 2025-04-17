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
    tournament_id INTEGER,
    gamemode TEXT NOT NULL,
    score_0 INTEGER NOT NULL,
    score_1 INTEGER NOT NULL,
    state INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tournament_id) REFERENCES tournaments(tournament_id)
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

db.exec(`
  CREATE TABLE IF NOT EXISTS tournaments (
    tournament_id INTEGER PRIMARY KEY AUTOINCREMENT,
    gamemode TEXT NOT NULL,
    active INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

db.exec(`
  CREATE TRIGGER IF NOT EXISTS update_tournaments_updated_at
    AFTER UPDATE ON tournaments
    FOR EACH ROW
    BEGIN
      UPDATE tournaments SET updated_at = CURRENT_TIMESTAMP where tournament_id = OLD.tournament_id;
    END;
  `);

db.exec(`
  CREATE TABLE IF NOT EXISTS tournament_teams (
    tournament_id INTEGER NOT NULL,
    team_index INTEGER NOT NULL,
    name TEXT,
    PRIMARY KEY (tournament_id, team_index),
    FOREIGN KEY (tournament_id) REFERENCES tournaments(tournament_id)
  )`);

db.exec(`
  CREATE TABLE IF NOT EXISTS tournament_players (
    tournament_id INTEGER NOT NULL,
    account_id INTEGER NOT NULL,
    team_index INTEGER NOT NULL,
    player_index INTEGER NOT NULL,
    PRIMARY KEY (tournament_id, account_id),
    FOREIGN KEY (tournament_id) REFERENCES tournaments(tournament_id),
    FOREIGN KEY (tournament_id, team_index) REFERENCES tournament_teams(tournament_id, team_index)
  )`);

db.exec(`
  CREATE TABLE IF NOT EXISTS tournament_matches (
    tournament_id INTEGER NOT NULL,
    match_id INTEGER UNIQUE,
    state TEXT NOT NULL,
    match_index INTEGER NOT NULL,
    stage INTEGER NOT NULL,
    team_0_index INTEGER,
    team_1_index INTEGER,
    PRIMARY KEY (tournament_id, match_id),
    UNIQUE (tournament_id, match_index),
    FOREIGN KEY (tournament_id) REFERENCES tournaments(tournament_id),
    FOREIGN KEY (match_id) REFERENCES matches(match_id)
  )`)

export default db;
