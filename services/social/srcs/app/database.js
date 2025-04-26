"use strict";

import Database from "better-sqlite3";
const db = new Database("/database/social.sqlite");

const MAX_FRIENDS = 50;
const MAX_BLOCKS = 50;

// Friend request table
db.exec(`
  CREATE TABLE IF NOT EXISTS friend_requests (
    sender INTEGER NOT NULL,
    receiver INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (sender, receiver),
    CHECK(sender != receiver)
  )
`);

db.exec(`
  CREATE TRIGGER IF NOT EXISTS max_friends
  BEFORE INSERT ON friend_requests
  BEGIN
    SELECT CASE
      WHEN
        (SELECT COUNT(*) FROM friend_requests WHERE sender = NEW.sender)
        +
        (SELECT COUNT(*) FROM friendships WHERE user1 = NEW.sender OR user2 = NEW.sender)
        >= ${MAX_BLOCKS}
      THEN RAISE(ABORT, 'MAX_FRIENDS')
    END;
  END;
`)

// Friendship table
db.exec(`
  CREATE TABLE IF NOT EXISTS friendships (
    user1 INTEGER NOT NULL,
    user2 INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (user1, user2),
    CHECK(user1 < user2)
  )
`);

// blocks table
db.exec(`
  CREATE TABLE IF NOT EXISTS blocks (
    blocker INTEGER NOT NULL,
    blocked INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (blocker, blocked),
    CHECK(blocker != blocked)
  )
`);

db.exec(`
  CREATE TRIGGER IF NOT EXISTS max_blocks
  BEFORE INSERT ON blocks
  BEGIN
    SELECT CASE
      WHEN (SELECT COUNT(*) FROM blocks WHERE blocker = NEW.blocker) >= ${MAX_BLOCKS}
      THEN RAISE(ABORT, 'MAX_BLOCKS')
    END;
  END;
`)

export default db;
