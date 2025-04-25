"use strict";

import { HttpError } from "yatt-utils";
import db from "../app/database.js";

export function selectRequestsSent(account_id) {
  return select_requests_from.all(account_id);
}

export function selectRequestsReceived(account_id) {
  return select_requests_to.all(account_id);
}

// Create a friend request from a user to another,
// or a friendship if the receiving user has one pending
export const handleFriendRequest = db.transaction((from, to) => {
  if (is_friendship.get(Math.min(from, to), Math.max(from, to))) {
    throw new HttpError.Forbidden().setCode("IS_FRIEND");
  }
  if (is_blocked.get(from, to)) {
    throw new HttpError.Forbidden().setCode("IS_BLOCKED");
  }
  insert_request.run(from, to);
  const reverse = get_reverse_request.get(from, to);
  if (reverse) {
    delete_request.run({ from_user: from, to_user: to });
    insert_friendship.run(Math.min(from, to), Math.max(from, to));
    return 0;
  }
  return 1;
});

// Remove a pending friend request between two users
export function cancelFriendRequest(from, to) {
  return delete_request.run({ from_user: from, to_user: to });
};

const select_requests_from = db.prepare(`
  SELECT to_user as account_id FROM friend_requests WHERE from_user = ?  
`);

const select_requests_to = db.prepare(`
  SELECT from_user as account_id FROM friend_requests WHERE to_user = ?  
`);

const insert_request = db.prepare(`
  INSERT INTO friend_requests (from_user, to_user) VALUES (?, ?)
`);

const get_reverse_request = db.prepare(`
  SELECT 1 FROM friend_requests WHERE to_user = ? AND from_user = ?
`);

const delete_request = db.prepare(`
  DELETE FROM friend_requests 
  WHERE (from_user = @from_user AND to_user = @to_user)
    OR (from_user = @to_user AND to_user = @from_user)
`);

// Retreive the friendship of a user
export function selectFriendships(account_id) {
  return select_friends.all({ account_id });
}

// Delete a friendship between two users
export function removeFriend(from, to) {
  return delete_friendship.run(Math.min(from, to), Math.max(from, to));
}

const select_friends = db.prepare(`
  SELECT user2 AS account_id FROM friendships WHERE user1 = @account_id
  UNION
  SELECT user1 AS account_id FROM friendships WHERE user2 = @account_id
`);

const is_friendship = db.prepare(`
  SELECT 1 FROM friendships WHERE user1 = ? AND user2 = ?
`);

const insert_friendship = db.prepare(`
  INSERT INTO friendships (user1, user2) VALUES (?, ?)
`);

const delete_friendship = db.prepare(`
  DELETE FROM friendships WHERE user1 = ? AND user2 = ?
`);

/*
 * BLOCKS
 */

export const handleBlock = db.transaction((blocker, blocked) => {
  if (is_friendship.get(Math.min(blocker, blocked), Math.max(blocker, blocked))) {
    throw new HttpError.Forbidden().setCode("FRIENDSHIP");
  }
  return insert_block.run(blocker, blocked);
});

export function selectBlocks(account_id) {
  return get_blocked.all(account_id);
}

export function isBlocked(blocker_id, blocked_id) {
  return is_blocked.get(blocker_id, blocked_id)
}

export function insertBlock(blocker_id, blocked_id) {
  return insert_block.run(blocker_id, blocked_id);
};

export function deleteBlock(blocker_id, blocked_id) {
  return delete_block.run(blocker_id, blocked_id);
};

const get_blocked = db.prepare(`
  SELECT blocked AS account_id FROM blocks WHERE blocker = ?
`)

const is_blocked = db.prepare(`
  SELECT 1 FROM blocks WHERE blocker = ? AND blocked = ? 
`)

const insert_block = db.prepare(`
  INSERT INTO blocks (blocker, blocked) VALUES (?, ?)  
`);

const delete_block = db.prepare(`
  DELETE FROM blocks WHERE blocker = ? AND blocked = ?
`);
