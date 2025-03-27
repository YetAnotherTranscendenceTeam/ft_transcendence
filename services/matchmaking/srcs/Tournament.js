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

class Tournament {
  teams = [];
  matches = [];
  gamemode;

  constructor(teams, gamemode) {
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
    for (let stage = 0; stage < stageCount; stage++) {
      const stageMatches = [];
      for (let i = 0; i < stageMatchCount; i++) {
        const match = new TournamentMatch(previousStage ? previousStage[Math.floor(i / 2)] : null, []);
        stageMatches.push(match);
      }
      console.log({stage, stageCount, stageMatchCount, stageMatches});
      stages.push(stageMatches);
      this.matches.push(...stageMatches);
      previousStage = stageMatches;
      stageMatchCount *= 2;
    }
    let teamIndex = 0;
    const prevStageLength = previousStage.length;
    for (let i = 0; i < prevStageLength; i++) {
      const matchIndex = this.matches.length - prevStageLength + i;
      const match = this.matches[matchIndex];
      console.log({i, matchIndex});
      let team2Index = teamIndex + prevStageLength;
      if (team2Index >= this.teams.length) {
        if (match.nextMatch) {
          match.nextMatch.team_ids.push(teamIndex);
          console.log({nextMatch: match.nextMatch});
        }
        previousStage[i] = null;
        this.matches[matchIndex] = null;
      }
      else {
        match.team_ids = [teamIndex, team2Index];
      }
      console.log(this.matches[matchIndex]);
      teamIndex++;
    }
    this.matches = this.matches.filter(match => match);
    console.log(JSON.stringify(stages, null, 2));
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
