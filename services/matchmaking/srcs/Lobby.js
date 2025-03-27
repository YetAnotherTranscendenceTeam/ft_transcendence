import db from "./app/database.js";
import { Queue } from "./Queue.js";
import { Lobby as LobbyBase } from "yatt-lobbies";

const NEW_USER_ELO = 1000;
const WEIGHT_ELO_DIFF = 1.0;
const WEIGHT_PLAYER_COUNT_DIFF = 1.0;

export class Lobby extends LobbyBase {

  /**
   *
   * @param {*} lobby The lobbies service lobby intance
   * @param {Queue} queue The matchmaking queue
   */
  constructor(lobby, queue) {
    super(lobby);
    const maxLobbySize = this.getCapacity();
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
        this.mode.name
      );
    for (let player of this.players) {
      let matchmaking_user = this.matchmaking_users.find(
        (matchmaking_user) => matchmaking_user.account_id === player.account_id
      );
      if (matchmaking_user) continue;
      matchmaking_user = {
        account_id: player.account_id,
        gamemode: this.mode.name,
        elo: NEW_USER_ELO,
      };
      this.matchmaking_users.push(matchmaking_user);
    }
    this.queue = queue;
    this.tolerance = 0.0;
  }

  toJSON() {
    return {
      mode: this.mode,
      players: this.players,
      join_secret: this.join_secret,
      team_names: this.team_names,
      matchmaking_users: this.matchmaking_users,
      tolerance: this.tolerance,
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
    return rating;
  }
}
