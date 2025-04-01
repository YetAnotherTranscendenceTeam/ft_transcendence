const MatchState = {
	WAITING: 'waiting',
	PLAYING: 'playing',
	DONE: 'done'
}

class TournamentPlayer {
  account_id;
  elo;
  matchmaking_user;
  profile;
  tournament;

  subscriptions = new Set();
  
  constructor(iplayer, tournament) {
    this.account_id = iplayer.account_id;
    this.elo = iplayer.elo;
    this.matchmaking_user = iplayer.matchmaking_user;
    this.profile = iplayer.profile;
    this.tournament = tournament;
  }

  addSubscription(subscription) {
    this.subscriptions.add(subscription);
    this.tournament.subscribers.add(subscription);
  }

  removeSubscription(subscription) {
    this.subscriptions.delete(subscription);
    this.tournament.subscribers.delete(subscription);
  }

  toJSON() {
    return {
      account_id: this.account_id,
      elo: this.elo,
      matchmaking_user: this.matchmaking_user,
      profile: this.profile,
    };
  }
}

class TournamentMatch {
  state = MatchState.WAITING;
  team_ids = [];
  scores = [0, 0];
  nextMatch = null;

  constructor(nextMatch) {
    this.nextMatch = nextMatch;
  }

  toJSON() {
    return {
      state: this.state,
      team_ids: this.team_ids,
      scores: this.scores,
    };
  }
}

export class Tournament {
  teams = [];
  matches = [];
  subscribers = new Set();
  gamemode;

  constructor(teams, gamemode) {
    this.teams = teams.forEach((team) => {
      team.players = team.players.map((player) => new TournamentPlayer(player, this));
    });
    this.teams = teams.sort(
      (a, b) => a.players.reduce((a, b) => a + b.elo, 0) - b.players.reduce((a, b) => a + b.elo, 0)
    );
    this.gamemode = gamemode;
    this.createMatches();
  }

  createMatches() {
    const stageCount = Math.ceil(Math.log2(this.teams.length));
    let stageMatchCount = 1;
    const stages = [];
    let previousStage = null;
    // create stages as if there were enough teams to fill all matches
    for (let stage = 0; stage < stageCount; stage++) {
      const stageMatches = [];
      for (let i = 0; i < stageMatchCount; i++) {
        const match = new TournamentMatch(previousStage ? previousStage[Math.floor(i / 2)] : null, []);
        stageMatches.push(match);
      }
      stages.push(stageMatches);
      this.matches.push(...stageMatches);
      previousStage = stageMatches;
      stageMatchCount *= 2;
    }
    let teamIndex = 0;
    const prevStageLength = previousStage.length;
    // fill the matches with teams
    for (let i = 0; i < prevStageLength; i++) {
      const matchIndex = this.matches.length - prevStageLength + i;
      const match = this.matches[matchIndex];
      let team2Index = teamIndex + prevStageLength;
      // not enough teams to fill the match
      if (team2Index >= this.teams.length) {
        // remove this match and advance the single team to the next stage
        if (match.nextMatch) {
          match.nextMatch.team_ids.push(teamIndex);
        }
        previousStage[i] = null;
        this.matches[matchIndex] = null;
      }
      else {
        match.team_ids = [teamIndex, team2Index];
      }
      teamIndex++;
    }
    this.matches = this.matches.filter(match => match);
  }

  toJSON() {
    return {
      teams: this.teams,
      matches: this.matches,
      gamemode: this.gamemode,
      id: this.id,
    };
  }

  getPlayerFromAccountID(account_id) {
    for (let team of this.teams) {
      for (let player of team.players) {
        if (player.account_id === account_id) {
          return player;
        }
      }
    }
    return null;
  }

  broadcast(event, data) {
    const dataStr = JSON.stringify(data);
    for (let subscriber of this.subscribers) {
      subscriber.sse({ event, data: dataStr });
    }
  }

}
// basic tournament test (TODO: remove)
// const teams = Array.from({ length: 9 }, (_, i) => ({
//   players: [{ elo: i }]
// }));
// function test() {
//   const tournament = new Tournament(teams, {});
//   console.log({tournament, teams: teams.length});
// }
// test();
