import db from "./app/database.js";
import { Queue } from "./Queue.js";
import { Lobby as LobbyBase } from "yatt-lobbies";
import { MatchmakingUser } from "./MatchmakingUser.js";
import { MatchState } from "./Match.js";

const WEIGHT_ELO_DIFF = 1.0;
const WEIGHT_PLAYER_COUNT_DIFF = 1.0;

const rank_gamemode_remap = {
  "custom_1v1": "ranked_1v1",
  "custom_2v2": "ranked_2v2",
}

export class Lobby extends LobbyBase {

  /**
   *
   * @param {import("yatt-lobbies").ILobby} lobby The lobbies service lobby intance
   * @param {Queue} queue The matchmaking queue
   */
  constructor(lobby, queue) {
    super(lobby);
    const maxLobbySize = this.getCapacity();
    if (this.players.length > maxLobbySize)
      throw new Error(
        `Too many players in lobby, expected max ${maxLobbySize}, got ${this.players.length}`
      );
    const playersMatches = this.getInGamePlayer();
    if (playersMatches.length > 0) {
      throw new Error(
        `This lobby contains ${playersMatches.length} active matches, please wait for them to finish`
      );
    }
    const rank_name = rank_gamemode_remap[this.mode.name] || this.mode.name;
    this.matchmaking_users = db
      .prepare(
        `SELECT * FROM matchmaking_users WHERE account_id IN (${this.players
          .map(() => "?")
          .join(",")}) AND gamemode = ?`
      )
      .all(
        this.players.map((player) => player.account_id),
        rank_name
      );
    for (let player of this.players) {
      let matchmaking_user = this.matchmaking_users.find(
        (matchmaking_user) => matchmaking_user.account_id === player.account_id
      );
      if (!matchmaking_user) {
        matchmaking_user = new MatchmakingUser(player.account_id, rank_name);
        matchmaking_user.insert();
        this.matchmaking_users.push(matchmaking_user);
      }
      player.matchmaking_user = matchmaking_user;
      player.elo = matchmaking_user.elo;
    }
    this.queue = queue;
    this.tolerance = 0.0;
  }

  getInGamePlayer() {
    const res = db.prepare(
      `
      SELECT * FROM
        match_players
      JOIN
        matches
      ON
        matches.match_id = match_players.match_id
      WHERE
        account_id IN (${this.players.map(() => "?").join(",")})
        AND (matches.state = ? OR matches.state = ?)
      `
    ).all(
      ...this.players.map((player) => player.account_id),
      MatchState.PLAYING,
      MatchState.RESERVED
    );
    return res;
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
