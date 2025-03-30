import { EventEmitter } from 'events';

const MatchState = {
	WAITING: 'waiting',
	PLAYING: 'playing',
	DONE: 'done'
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

export class Tournament extends EventEmitter {
  teams = [];
  matches = [];
  subscribers = new Set();
  gamemode;

  constructor(teams, gamemode) {
    super();
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
    };
  }

  getPlayerFromAccountID(account_id) {
    return this.teams.find(team => team.players.some(player => player.account_id === account_id));
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
