"use strict";

import Database from "better-sqlite3";
const db = new Database("/database/2fa.sqlite");

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS otpauth (
    account_id INTEGER UNIQUE,
    secret TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TRIGGER IF NOT EXISTS replace_if_inactive
  BEFORE INSERT ON otpauth
  FOR EACH ROW
    WHEN EXISTS (SELECT 1 FROM otpauth WHERE account_id = NEW.account_id AND active = 0)
    BEGIN
      DELETE FROM otpauth WHERE account_id = NEW.account_id;
    END;
`);

export default db;

export const generate = db.prepare(`INSERT INTO otpauth (account_id, secret) VALUES (?, ?)`);

export const deactivate = db.prepare("DELETE FROM otpauth WHERE account_id = ?");

export const activate = db.prepare(`
  UPDATE otpauth
  SET active = TRUE
  WHERE account_id = ?
    AND active = FALSE
`);

export const getInactiveSecret = db.prepare(`
  SELECT *
  FROM otpauth
  WHERE account_id = ?
    AND active = FALSE
`);

export const getActiveSecret = db.prepare(`
  SELECT *
  FROM otpauth
  WHERE account_id = ?
    AND active = TRUE
`);
