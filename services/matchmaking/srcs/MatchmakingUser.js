import db from "./app/database.js";

export class MatchmakingUser {
  constructor(account_id, gamemode) {
    this.account_id = account_id;
    this.gamemode = gamemode;
    this.rating = 200;
    this.created_at = new Date();
    this.updated_at = new Date();
  }

  insert() {
    db.prepare(
      `
	  INSERT INTO matchmaking_users (account_id, gamemode, rating)
	  VALUES (?, ?, ?)
	  `
    ).run(this.account_id, this.gamemode, this.rating);
  }
}
