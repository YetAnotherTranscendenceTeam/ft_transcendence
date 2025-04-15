export class TournamentManager {
  tournaments = new Map();
  matches = new Map();

  constructor() {}

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

  cancel() {
    for (const match of this.matches.values()) {
      match.updateMatch({ state: MatchState.CANCELED });
    }
  }
}
