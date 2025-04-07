export class TournamentManger {
  nextTournamentID = 0;
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
    const id = this.nextTournamentID++;
    tournament.id = id;
    this.tournaments.set(id, tournament);
    return id;
  }
}
