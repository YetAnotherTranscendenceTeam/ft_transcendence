"use strict";

import Database from "better-sqlite3";
const db = new Database("/database/2fa.sqlite");

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS secrets (
    account_id INTEGER UNIQUE,
    secret TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TRIGGER IF NOT EXISTS replace_if_inactive
  BEFORE INSERT ON secrets
  FOR EACH ROW
    WHEN EXISTS (SELECT 1 FROM secrets WHERE account_id = NEW.account_id AND active = 0)
    BEGIN
      DELETE FROM secrets WHERE account_id = NEW.account_id;
    END;
`);

export default db;

export const activate = db.prepare(`INSERT INTO secrets (account_id, secret) VALUES (?, ?)`);

export const confirm = db.prepare(`
  UPDATE secrets
  SET active = TRUE
  WHERE account_id = ?
    AND active = FALSE`);

export const getInactiveSecret = db.prepare(`
  SELECT secret
  FROM secrets
  WHERE account_id = ?
    AND active = FALSE
`);

export const getActiveSecret = db.prepare(`
  SELECT secret
  FROM secrets
  WHERE account_id = ?
    AND active = FALSE
`);
