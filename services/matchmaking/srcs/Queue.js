import { GameMode } from "./GameModes.js";
import { Lobby } from "./Lobby.js";
import { LobbyConnection } from "./LobbyConnection.js";
import { Match } from "./Match.js";
import { Tournament } from "./Tournament.js";

const LOBBY_TOLERANCE_INCREMENT = 1.0;

export class Queue {
  /**
   * @type {Lobby[]}
   */
  lobbies = [];

  /**
   *
   * @param {GameMode} gamemode
   * @param {LobbyConnection} lobbyConnection
   */
  constructor(gamemode, lobbyConnection, fastify) {
    this.gamemode = gamemode;
    this.lobbyConnection = lobbyConnection;
    this.fastify = fastify;
  }

  queue(lobby) {
    console.log(`Queued lobby ${lobby.join_secret}`);
    this.lobbyConnection.send({
      event: "confirm_queue",
      data: {
        queue_stats: {
          players: this.lobbies.reduce((acc, lobby) => acc + lobby.players.length, lobby.players.length),
          lobbies: this.lobbies.length + 1,
        },
        lobby,
      },
    });
    this.lobbies.push(lobby);
  }

  unqueue(lobby, send = true) {
    const index = this.lobbies.findIndex((other) => other.join_secret === lobby.join_secret);
    if (index === -1) return;
    if (send)
      this.lobbyConnection.send({
        event: "confirm_unqueue",
        data: {
          lobby,
        },
      });
    this.lobbies.splice(index, 1);
  }

  async matchmake() {
    if (this.lobbies.length === 0) return;
    for (let i = 0; i < this.lobbies.length; i++) {
      const teams = [];
      if (this.lobbies[i].players.length > this.gamemode.team_size) {
        await this.matchLobbies([[this.lobbies[i]]]);
        i--;
        continue;
      }
      for (let j = i; teams.length < this.gamemode.team_count && j < this.lobbies.length; j++) {
        const team = this.createTeam(this.lobbies, j, teams);
        if (!team) continue;
        teams.push(team);
      }
      if (teams.length === this.gamemode.team_count) {
        await this.matchLobbies(teams);
        i--;
      }
    }
    for (let lobby of this.lobbies) {
      lobby.tolerance += LOBBY_TOLERANCE_INCREMENT;
      lobby.reserved = false;
    }
  }

  createTeam(lobbies, index, teams) {
    const lobbyMatchTeams = (lobby, teams) => {
      let is_match = true;
      for (let team of teams) {
        for (let other of team) {
          if (other.getMatchRating(lobby) > Math.min(lobby.tolerance, other.tolerance)) {
            is_match = false;
            break;
          }
        }
        if (!is_match)
          break;
      }
      return is_match
    }
    const team = [];
    let team_player_count = 0;
    while (index < lobbies.length && team_player_count < this.gamemode.team_size) {
      const lobby = lobbies[index++];
      if (lobby.reserved)
        continue;
      if (team_player_count + lobby.players.length > this.gamemode.team_size)
        continue;
      if (!lobbyMatchTeams(lobby, teams))
        continue;
      team.push(lobby);
      team_player_count += lobby.players.length;
    }
    if(team_player_count != this.gamemode.team_size)
      return null;
    team.forEach((lobby) => lobby.reserved = true);
    return team;
  }

  /**
   * 
   * @param {Lobby[][]} teams 
   */
  async matchLobbies(teams) {
    console.log(`Matched lobbies`);
    const lobbies = teams.flat();
    lobbies.forEach((lobby) => {
      this.unqueue(lobby, false);
      console.log(` - ${lobby.join_secret}`);
    });
    // handle tournaments
    if (this.gamemode.team_count > 2) {
      const lobby = teams[0][0];
      if (lobby.getTeamCount() > 2) {
        const teams = lobby.getTeams();
        const tournament = new Tournament(teams, this.gamemode, this.fastify.tournaments, lobby.match_parameters, this.lobbyConnection, lobby.join_secret);
        if (!await tournament.insert()) {
          lobbies.forEach((lobby) => {
            this.lobbyConnection.send({
              event: "confirm_unqueue",
              data: {
                lobby,
                reason: "Match reservation failed."
              },
            })
          });
          tournament.delete();
        }
        this.fastify.tournaments.registerTournament(tournament);
        this.lobbyConnection.send({
          event: "match",
          data: {
            lobbies,
            match: {type: "tournament", tournament},
          },
        });
        return;
      }
    }
    const match = new Match(teams, this.gamemode, null, this.fastify);
    match.insert();
    try {
      await match.reserve(this.lobbyConnection, lobbies);
      this.lobbyConnection.send({
          event: "match",
          data: {
            lobbies,
            match: {type: "match", match},
          },
      });
    }
    catch(e) {
      match.delete();
      lobbies.forEach((lobby) => {
        this.lobbyConnection.send({
          event: "confirm_unqueue",
          data: {
            lobby,
            reason: "Match reservation failed."
          },
        })
      });
    }
  }
}
