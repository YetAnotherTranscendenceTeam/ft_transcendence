import { GameModes } from "./GameModes.js";
import { MatchState } from "./Match.js";
import { Tournament } from "./Tournament.js";

export class TournamentManager {
  tournaments = new Map();
  matches = new Map();

  constructor(fastify) {
    this.fastify = fastify;
  }

  getTournamentMatch(match_id) {
    return this.matches.get(match_id);
  }

  getTournament(id) {
    return this.tournaments.get(id);
  }

  registerTournamentMatch(match) {
    this.matches.set(match.internal_match.match_id, match);
  }

  unregisterTournamentMatch(match) {
    this.matches.delete(match.internal_match.match_id);
  }

  registerTournament(tournament) {
    this.tournaments.set(tournament.id, tournament);
  }

  unregisterTournament(tournament) {
    this.tournaments.delete(tournament.id);
  }

  async cancel() {
    for (const match of this.matches.values()) {
      match.internal_match?.cancel();
      await match.updateMatch({ state: MatchState.CANCELLED });
      console.log(`Match ${match.internal_match?.match_id} cancelled`);
    }
    for (const tournament of this.tournaments.values()) {
      tournament.cancel();
      console.log(`Tournament ${tournament.id} cancelled`);
    }
  }
}
