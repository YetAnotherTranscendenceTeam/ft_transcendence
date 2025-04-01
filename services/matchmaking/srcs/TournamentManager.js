export class TournamentManger {

	nextTournamentID = 0;
	tournaments = new Map();

	constructor() {
	}

	getTournament(id) {
		return this.tournaments.get(id);
	}

	registerTournament(tournament) {
		const id = this.nextTournamentID++;
		tournament.id = id;
		this.tournaments.set(id, tournament);
		return id;
	}
}
