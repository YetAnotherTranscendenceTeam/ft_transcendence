export class TournamentManger {
	constructor() {
		this.tournaments = [];
	}

	registerTournament(tournament) {
		this.tournaments.push(tournament);
	}
}
