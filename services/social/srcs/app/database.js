"use strict";

import Database from "better-sqlite3";
const db = new Database("/database/social.sqlite");

// Friend request table
db.exec(`
  CREATE TABLE IF NOT EXISTS friend_requests (
    from_user INTEGER NOT NULL,
    to_user INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (from_user, to_user),
    CHECK(from_user != to_user)
  )
`);

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

export default db;
