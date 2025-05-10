import db from "./app/database.js";
import { Lobby } from "./Lobby.js";
import { Match, MatchState } from "./Match.js";

export class ActiveMatch {
  static cancelMatch = db.prepare(
    `
    UPDATE matches
    SET state = ${MatchState.CANCELLED}
    WHERE match_id = ?
    `
  );

  lobby_secrets;
  tournament_id;
  match_id;
  player_ids;
  lobby_connection;
  gamemode;

  /**
   * 
   * @param {Match} match 
   * @param {Lobby[]} lobbies
   * @param {*} lobby_connection 
   * @param {ActiveMatchManager} manager
   */
  constructor(match, lobbies, lobby_connection, manager) {
    this.tournament_id = match.tournament_id;
    this.gamemode = match.gamemode;
    this.match = match;
    this.match_id = match.match_id;
    this.lobbySecrets = lobbies.map((lobby) => lobby.join_secret);
    this.player_ids = match.players.map((player) => player.account_id);
    this.lobby_connection = lobby_connection;
    this.manager = manager;
  }

  updateMatch({ state }) {
    if (state === MatchState.CANCELLED || state === MatchState.DONE) {
      this.manager.removeMatch(this.match_id);
    }
    this.lobby_connection.send({
      event: "match_update",
      data: {
        match_id: this.match_id,
        players: this.player_ids,
        lobby_secrets: this.lobbySecrets,
        tournament_id: this.tournament_id,
        gamemode: this.gamemode,
        state,
      },
    });
  }

  cancel() {
    ActiveMatch.cancelMatch.run(this.match_id);
    this.updateMatch({
      state: MatchState.CANCELLED
    });
  }
}

export class ActiveMatchManager {
  constructor(fastify) {
    this.fastify = fastify;
    this.activeMatches = new Map();
  }

  addMatch(match, lobbies, lobbyConnection) {
    this.activeMatches.set(match.match_id, new ActiveMatch(
      match,
      lobbies,
      lobbyConnection,
      this
    ));
  }

  getActiveMatch(matchId) {
    return this.activeMatches.get(matchId);
  }

  removeMatch(matchId) {
    this.activeMatches.delete(matchId);
  }

  cancel() {
    this.activeMatches.forEach((match) => {
      match.cancel();
      console.log(`Cancelled match ${match.match_id}`);
    });
  }
}
