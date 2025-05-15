import { GameModeType, defaultMatchParameters } from "yatt-lobbies";
import { GameModes, GameMode } from "./GameModes.js";
import YATT from "yatt-utils";
import db from "./app/database.js";
import { MatchTeam } from "./MatchTeam.js";
import { Lobby } from "./Lobby.js";

export const MatchState = {
  RESERVED: 0,
  PLAYING: 1,
  DONE: 2,
  CANCELLED: 3,
};

export class Match {
  static deleteMatch = db.prepare(
    `
    DELETE FROM matches WHERE match_id = ?
    `
  )
  
  static fromQueryResult(qresult) {
    return new Match(qresult);
  }

  players = [];

  /**
   * @type {MatchTeam}
   */
  teams = [];

  /**
   * @type {GameMode}
   */
  gamemode = null;

  /**
   * @type {string}
   */
  gamemode_name;

  /**
   * @type {number?}
   */
  tournament_id;

  /**
   * @type {number}
   */
  state = MatchState.RESERVED;

  fastify;

  /**
   * @type {IMatchParameters}
   */
  match_parameters = defaultMatchParameters;

  /**
   * 
   * @param {Lobby[][]} teams 
   * @param {GameMode} gamemode 
   * @param {number} tournament_id? 
   */
  constructor(teams, gamemode, tournament_id = null, fastify = null) {
    this.fastify = fastify;
    this.players = [];
    if (teams.length === 1) {
      this.match_parameters = teams[0][0].match_parameters;
      this.teams = teams[0][0].getTeams().map((team, team_index) => {
        this.players.push(...team.players);
        return new MatchTeam(this.match_id, team_index, team.players, team.name);
      });
    }
    else {
      this.teams = teams.map((team, team_index) => {
        if (Array.isArray(team)) {
          let name = null;
          const players = team.map((lobby) => {
            const lobby_team = lobby.getTeams()[0];
            this.players.push(...lobby_team.players);
            this.fastify = lobby.queue.fastify;
            if (lobby_team.name) name = lobby_team.name;

            return lobby_team.players;
          });
          return new MatchTeam(this.match_id, team_index, players.flat(), name);
        }
        else {
          this.players.push(...team.players);
          return new MatchTeam(this.match_id, team_index, team.players, team.name);
        }
      });
    }
    this.gamemode = gamemode;
    for (let team of this.teams) {
      for (let i = 0; i < team.players.length; i++) {
        const player = team.players[i];
        player.team_index = team.team_index;
        player.player_index = i;
      }
    }
    if (this.gamemode.type === GameModeType.RANKED) {
      for (let player of this.players) {
        player.win_probability = this.players.filter((p) => p.team_index !== player.team_index).reduce(
          (acc, p) => acc + ((player.rating - p.rating) * 0.009) + 1,
          0
        ) / this.gamemode.team_size;
        player.win_probability = Math.min(2, Math.max(0, player.win_probability));
      }
    }
    this.tournament_id = tournament_id;
    // gamemode name is saved in case the gamemode doesn't exist anymore
    this.gamemode_name = gamemode.name;
    this.state = MatchState.RESERVED;
  }

  insert() {
    const insert = db
    .prepare(
      `
      INSERT INTO matches (gamemode, state, tournament_id) VALUES (?, ?, ?)
      RETURNING *
      `
    ).get(this.gamemode_name, this.state, this.tournament_id);
    this.match_id = insert.match_id;
    for (const team of this.teams) {
      team.match_id = this.match_id;
      team.insert();
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

  delete() {
    Match.deleteMatch.run(this.match_id);
    this.state = MatchState.CANCELLED;
  }

  async reserve(lobbyConnection, lobbies) {
    await YATT.fetch(`http://pong:3000/matches`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.fastify.tokens.get("pong")}`,
      },
      body: JSON.stringify({
        match_id: this.match_id,
        gamemode: this.gamemode,
        teams: this.teams.map((team) => ({
          players: team.players,
          name: team.name,
        })),
        match_parameters: this.match_parameters
      })
    });
    this.fastify.matches.addMatch(this, lobbies, lobbyConnection);
    console.log("Reserved match for matchid", this.match_id);
  }
}
