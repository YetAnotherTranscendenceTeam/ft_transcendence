import { GameModeType } from "yatt-lobbies";
import { GameModes, GameMode } from "./GameModes.js";
import db from "./app/database.js";

export const MatchState = {
  RESERVED: 0,
  PLAYING: 1,
  DONE: 2,
  CANCELLED: 3,
};

export class Match {
  static fromQueryResult(qresult) {
    return new Match(qresult);
  }

  constructor(players, gamemode, tournament_id = null) {
    if (Array.isArray(players) && gamemode instanceof GameMode) {
      this.tournament_id = tournament_id;
      this.players = players.map((player, index) => ({
        ...player,
        team_index: Math.floor(index / gamemode.team_size),
        player_index: index % gamemode.team_size,
      }));
      this.gamemode = gamemode;
      // gamemode name is saved in case the gamemode doesn't exist anymore
      this.gamemode_name = gamemode.name;
      this.state = MatchState.RESERVED;
      this.score_0 = 0;
      this.score_1 = 0;
    } else if (typeof players === "object" && gamemode === undefined) {
      const match = players;
      this.match_id = match.match_id;
      this.tournament_id = match.tournament_id;
      this.gamemode = GameModes[match.gamemode];
      this.gamemode_name = match.gamemode;
      this.players = match.players;
      this.state = match.state;
      this.score_0 = match.score_0;
      this.score_1 = match.score_1;
      this.created_at = match.created_at;
      this.updated_at = match.updated_at;
    } else throw new Error("Invalid arguments");
    if (this.gamemode.type !== GameModeType.RANKED)
      return ;
    for (let player of this.players) {
      player.win_probability = this.players.filter((p) => p.team_index !== player.team_index).reduce(
        (acc, p) => acc + player.elo / p.elo,
        0
      ) / this.gamemode.team_size;
      Math.
      player.win_probability = Math.min(2, Math.max(0, player.win_probability));
    }
  }

  insert() {
    const insert = db
    .prepare(
      `
      INSERT INTO matches (gamemode, score_0, score_1, state, tournament_id) VALUES (?, ?, ?, ?, ?)
      RETURNING *
      `
    ).get(this.gamemode_name, this.score_0, this.score_1, this.state, this.tournament_id);
    this.match_id = insert.match_id;
    const player_insert = db.prepare(
      `
      INSERT INTO match_players (match_id, account_id, team_index, player_index, win_probability)
      VALUES (?, ?, ?, ?, ?)
      `
    );
    for (const player of this.players) {
      player_insert.run(this.match_id, player.account_id, player.team_index, player.player_index, player.win_probability);
    }
    this.created_at = insert.created_at;
    this.updated_at = insert.updated_at;
  }

  cancel() {
    db.prepare(
      `
      UPDATE matches SET state = ? WHERE match_id = ?
      `
    ).run(MatchState.CANCELLED, this.match_id);
    this.state = MatchState.CANCELLED;
  }
}
