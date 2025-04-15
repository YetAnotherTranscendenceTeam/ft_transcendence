import { Match, MatchState } from "./Match.js";

const TournamentMatchState = {
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
  state = TournamentMatchState.WAITING;
  stage;
  index = 0;
  team_ids = [null, null];
  tournament;
  nextMatch = null;

  // the team_ids index in which the winner of this match will be inserted into
  nextMatchTeamIndex = 0;
  internal_match = null;

  constructor(tournament, stage, nextMatch, nextMatchTeamIndex) {
    this.nextMatchTeamIndex = nextMatchTeamIndex;
    this.tournament = tournament;
    this.stage = stage;
    this.nextMatch = nextMatch;
  }

  shouldStart() {
    return this.team_ids.every((team_id) => team_id !== null);
  }

  setState(state) {
    if (state === TournamentMatchState.PLAYING) {
      this.createInternalMatch();
    }
    this.state = state;
    this.tournament.broadcast("match_update", {
      match: this
    });
  }

  createInternalMatch() {
    this.internal_match = new Match([
      ...this.tournament.teams[this.team_ids[0]].players,
      ...this.tournament.teams[this.team_ids[1]].players
    ], this.tournament.gamemode);
    this.internal_match.insert();
    this.tournament.manager.registerTournamentMatch(this);
    return this.internal_match;
  }

  updateMatch({state, score_0, score_1}) {
    this.internal_match.score_0 = score_0;
    this.internal_match.score_1 = score_1;
    this.internal_match.state = state;
    const states = {
      [MatchState.RESERVED]: TournamentMatchState.PLAYING,
      [MatchState.PLAYING]: TournamentMatchState.PLAYING,
      [MatchState.DONE]: TournamentMatchState.DONE,
    }
    const newState = states[state];
    const oldState = this.state;
    this.state = newState;
    this.tournament.broadcast("match_update", {
      match: this
    });
    if (newState == TournamentMatchState.DONE && oldState != newState) {
      this.tournament.manager.unregisterTournamentMatch(this);
      const winner_team = this.internal_match.score_0 > this.internal_match.score_1 ? 0 : 1;
      if (!this.nextMatch) {
        this.tournament.finish();
        return;
      }
      this.nextMatch.team_ids[this.nextMatchTeamIndex] = this.team_ids[winner_team];
      if (this.nextMatch.shouldStart())
        this.nextMatch.setState(TournamentMatchState.PLAYING);
      else
        this.tournament.broadcast("match_update", {
          match: this.nextMatch
        })
    }
  }

  toJSON() {
    return {
      state: this.state,
      stage: this.stage,
      index: this.index,
      team_ids: this.team_ids,
      scores: [this.internal_match?.score_0, this.internal_match?.score_1],
      match_id: this.internal_match?.match_id,
    };
  }
}

export class Tournament {
  manager;
  teams = [];
  matches = [];
  subscribers = new Set();
  gamemode;

  constructor(teams, gamemode, manager) {
    this.teams = teams.forEach((team) => {
      team.players = team.players.map((player) => new TournamentPlayer(player, this));
    });
    this.teams = teams.sort(
      (a, b) => a.players.reduce((a, b) => a + b.elo, 0) - b.players.reduce((a, b) => a + b.elo, 0)
    );
    this.gamemode = gamemode;
    this.manager = manager;
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
        const match = new TournamentMatch(this, stage, previousStage ? previousStage[Math.floor(i / 2)] : null, i % 2);
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
          match.nextMatch.team_ids[match.nextMatchTeamIndex] = teamIndex;
          if (match.nextMatch.shouldStart())
            match.nextMatch.setState(TournamentMatchState.PLAYING);
        }
        previousStage[i] = null;
        this.matches[matchIndex] = null;
      }
      else {
        match.team_ids = [teamIndex, team2Index];
        match.setState(TournamentMatchState.PLAYING);
      }
      teamIndex++;
    }
    this.matches = this.matches.filter(match => match);
    this.matches.forEach((m, i) => m.index = i);
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

  finish() {
    this.manager.unregisterTournament(this);
    this.broadcast("finish", {
      tournament: this
    }, (subscriber) => {
      subscriber.raw.end();
    });
  }

  getMatch(match_id) {
    return this.matches.find(match => match.internal_match?.match_id === match_id);
  }

  broadcast(event, data, cb) {
    const dataStr = JSON.stringify(data);
    for (let subscriber of this.subscribers) {
      subscriber.sse({ event, data: dataStr });
      cb?.(subscriber);
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
