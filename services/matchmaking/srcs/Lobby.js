import db from "./app/database.js";
import { GameMode } from "./GameModes.js";
import { Queue } from "./Queue.js";

const NEW_USER_ELO = 1000;
const WEIGHT_ELO_DIFF = 1.0;
const WEIGHT_PLAYER_COUNT_DIFF = 1.0;

export class Lobby {
  /**
   * @type {GameMode}
   */
  gamemode;

  /**
   *
   * @param {*} lobby The lobbies service lobby intance
   * @param {Queue} queue The matchmaking queue
   */
  constructor(lobby, queue) {
    this.gamemode = lobby.mode;
    this.joinSecret = lobby.joinSecret;
    this.players = lobby.players;
    const maxLobbySize = this.gamemode.ranked
      ? this.gamemode.team_size
      : this.gamemode.team_size * this.gamemode.team_count;
    if (this.players.length > maxLobbySize)
      throw new Error(
        `Too many players in lobby, expected max ${maxLobbySize}, got ${this.players.length}`
      );
    this.matchmaking_users = db
      .prepare(
        `SELECT * FROM matchmaking_users WHERE account_id IN (${this.players
          .map(() => "?")
          .join(",")}) AND gamemode = ?`
      )
      .all(
        this.players.map((player) => player.account_id),
        this.gamemode.name
      );
    for (let player of this.players) {
      let matchmaking_user = this.matchmaking_users.find(
        (matchmaking_user) => matchmaking_user.account_id === player.account_id
      );
      if (matchmaking_user) continue;
      matchmaking_user = {
        account_id: player.account_id,
        gamemode: this.gamemode.name,
        elo: NEW_USER_ELO,
      };
      this.matchmaking_users.push(matchmaking_user);
    }
    this.queue = queue;
    this.tolerance = 0.0;
  }

  toJSON() {
    return {
      players: this.players,
      matchmaking_users: this.matchmaking_users,
      gamemode: this.gamemode,
      tolerance: this.tolerance,
      joinSecret: this.joinSecret,
    };
  }

  // the lower the better, 0 is a perfect match
  getMatchRating(other) {
    let rating = 0;
    for (let matchmaking_user of this.matchmaking_users) {
      for (let otherUser of other.matchmaking_users) {
        rating += Math.abs(matchmaking_user.elo - otherUser.elo) * WEIGHT_ELO_DIFF;
      }
    }
    rating += Math.abs(this.players.length - other.players.length) * WEIGHT_PLAYER_COUNT_DIFF;
    console.log(`Match rating between ${this.joinSecret} and ${other.joinSecret} is ${rating}`);
    return rating;
  }
}
