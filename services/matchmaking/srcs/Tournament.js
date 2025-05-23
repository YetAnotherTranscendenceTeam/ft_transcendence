import db from "./app/database.js";
import { GameModes } from "./GameModes.js";
import { Match, MatchState } from "./Match.js";

const TournamentMatchState = {
  WAITING: "waiting",
  PLAYING: "playing",
  DONE: "done",
  CANCELLED: "cancelled",
};

class TournamentPlayer {
  account_id;
  rating;
  matchmaking_user;
  profile;
  tournament;

  subscriptions = new Set();

  constructor(iplayer, tournament, team_index, player_index) {
    this.account_id = iplayer.account_id;
    this.team_index = team_index;
    this.player_index = player_index;
    this.rating = iplayer.rating;
    this.matchmaking_user = iplayer.matchmaking_user;
    this.profile = iplayer.profile;
    this.tournament = tournament;
  }

  insert() {
    db.prepare(
      `
      INSERT INTO tournament_players (tournament_id, account_id, team_index, player_index) 
      VALUES (?, ?, ?, ?)
      `
    ).run(this.tournament.id, this.account_id, this.team_index, this.player_index);
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
      rating: this.rating,
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

  insert() {
    db.prepare(
      `
      INSERT INTO tournament_matches (tournament_id, state, stage, match_index, team_0_index, team_1_index)
      VALUES (?, ?, ?, ?, ?, ?)
      `
    ).run(
      this.tournament.id,
      this.state,
      this.stage,
      this.index,
      this.team_ids[0],
      this.team_ids[1]
    );
  }

  updateDB() {
    db.prepare(
      `
      UPDATE tournament_matches
      SET state = ?, match_id = ?, team_0_index = ?, team_1_index = ?
      WHERE tournament_id = ? AND match_index = ?
      `
    ).run(this.state, this.internal_match?.match_id, this.team_ids[0], this.team_ids[1], this.tournament.id, this.index);
  }

  shouldStart() {
    return this.team_ids.every((team_id) => team_id !== null);
  }

  async setState(state) {
    if (this.state === state) return;
    if (state === TournamentMatchState.PLAYING) {
      await this.createInternalMatch();
    }
    // createInternalMatch will set the state to cancelled if it fails
    if (this.state === TournamentMatchState.CANCELLED) {
      this.updateDB();
      this.tournament.cancel();
      return;
    }
    this.state = state;
    this.tournament.broadcast("match_update", {
      match: this,
    });
    this.updateDB();
  }

  async createInternalMatch() {
    this.internal_match = new Match(
      [
        this.tournament.teams[this.team_ids[0]],
        this.tournament.teams[this.team_ids[1]],
      ],
      this.tournament.gamemode,
      this.tournament.id,
      this.tournament.manager.fastify,
    );
    this.internal_match.match_parameters = this.tournament.match_parameters;
    this.internal_match.insert();
    try {
      await this.internal_match.reserve(this.tournament.lobbyConnection, []);
      this.tournament.manager.registerTournamentMatch(this);
      return this.internal_match;
    }
    catch(e) {
      this.internal_match.delete();
      this.internal_match = null;
      this.state = TournamentMatchState.CANCELLED;
      return null;
    }
  }

  async updateMatch({ state, score_0, score_1 }) {
    this.internal_match.teams[0].score = score_0;
    this.internal_match.teams[1].score = score_1;
    if (!state) {
      state = this.internal_match.state;
    }
    this.internal_match.state = state;
    const states = {
      [MatchState.RESERVED]: TournamentMatchState.PLAYING,
      [MatchState.PLAYING]: TournamentMatchState.PLAYING,
      [MatchState.DONE]: TournamentMatchState.DONE,
      [MatchState.CANCELLED]: TournamentMatchState.CANCELLED,
    };
    const newState = states[state];
    const oldState = this.state;
    this.state = newState;
    this.tournament.broadcast("match_update", {
      match: this,
    });
    if (newState == TournamentMatchState.CANCELLED) {
      this.updateDB();
      this.tournament.cancel();
      return;
    }
    if (newState == TournamentMatchState.DONE && oldState != newState) {
      this.updateDB();
      this.tournament.manager.unregisterTournamentMatch(this);
      const winner_team = this.internal_match.teams[0].score > this.internal_match.teams[1].score ? 0 : 1;
      if (!this.nextMatch) {
        this.tournament.finish();
        return;
      }
      this.nextMatch.team_ids[this.nextMatchTeamIndex] = this.team_ids[winner_team];
      if (this.nextMatch.shouldStart())
          await this.nextMatch.setState(TournamentMatchState.PLAYING);
      else {
        this.nextMatch.updateDB();
        this.tournament.broadcast("match_update", {
          match: this.nextMatch,
        });
      }
      this.tournament.updateToLobbyConnection();
    }
    else
      this.updateDB();
  }

  toJSON() {
    return {
      state: this.state,
      stage: this.stage,
      index: this.index,
      team_ids: this.team_ids,
      scores: [this.internal_match?.teams[0].score ?? null, this.internal_match?.teams[1].score ?? null],
      match_id: this.internal_match?.match_id ?? null,
    };
  }
}

export class Tournament {
  manager;
  teams = [];
  matches = [];
  subscribers = new Set();
  stageCount;
  gamemode;
  lobbyConnection;

  constructor(teams, gamemode, manager, match_parameters, lobbyConnection, lobbySecret) {
    teams.forEach((team, index) => {
      team.players = team.players.map((player, pindex) => new TournamentPlayer(player, this, index, pindex));
    });
    this.teams = teams.sort(
      (a, b) => b.players.reduce((a, b) => a + b.rating, 0) - a.players.reduce((a, b) => a + b.rating, 0)
    );
    this.stageCount = Math.ceil(Math.log2(this.teams.length));
    const goodHalf = Tournament.sortGoodHalf(
      this.teams
      .slice(0, Math.pow(2, this.stageCount - 1))
    );
    const badHalf = this.teams
      .slice(goodHalf.length)
      .sort(
        () => Math.random() - 0.5
      );
    this.teams = goodHalf.concat(badHalf);
    
    this.gamemode = gamemode;
    this.manager = manager;
    this.match_parameters = match_parameters;
    this.lobbyConnection = lobbyConnection;
    this.lobbySecret = lobbySecret;
  }

  // sorts the good half of the teams
  // the 2 best teams will play against each other in the final
  static sortGoodHalf(goodHalf) {
    if (goodHalf.length < 4)
      return goodHalf;
    let newGoodHalf = [];

    const firstHalf = goodHalf.slice(0, 4);
    const secondHalf = goodHalf.slice(4);
    const fourth = Math.ceil(secondHalf.length / 2);

    newGoodHalf.push(firstHalf[0]);
    newGoodHalf = newGoodHalf.concat(secondHalf.slice(0, fourth));
    newGoodHalf.push(firstHalf[3]);
    newGoodHalf.push(firstHalf[2]);
    newGoodHalf = newGoodHalf.concat(secondHalf.slice(fourth));
    newGoodHalf.push(firstHalf[1]);
    return newGoodHalf.filter((team) => team !== undefined);
  }

  async insert() {
    db.transaction(async () => {
      let obj = db
        .prepare(
          `
        INSERT INTO tournaments (gamemode, active) VALUES (?, ?)
        RETURNING tournament_id
        `
        )
        .get(this.gamemode.name, 1);
      this.id = obj.tournament_id;
      const team_insert = db.prepare(`
        INSERT INTO tournament_teams (tournament_id, team_index, name)
        VALUES (?, ?, ?)
        `);
      for (let i = 0; i < this.teams.length; i++) {
        const team = this.teams[i];
        team_insert.run(this.id, i, team.name);
        for (let player of this.teams[i].players) {
          player.team_index = i;
          player.insert();
        }
      }
    })();
    return await this.createMatches();
  }

  async createMatches() {
    let stageMatchCount = 1;
    const stages = [];
    let previousStage = null;
    // create stages as if there were enough teams to fill all matches
    for (let stage = 0; stage < this.stageCount; stage++) {
      const stageMatches = [];
      for (let i = 0; i < stageMatchCount; i++) {
        const match = new TournamentMatch(
          this,
          stage,
          previousStage ? previousStage[Math.floor(i / 2)] : null,
          i % 2
        );
        stageMatches.push(match);
      }
      stages.push(stageMatches);
      this.matches.push(...stageMatches);
      previousStage = stageMatches;
      stageMatchCount *= 2;
    }
    let teamIndex = 0;
    const prevStageLength = previousStage.length;
    const toStart = [];
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
          if (match.nextMatch.shouldStart()) toStart.push(match.nextMatch);
        }
        previousStage[i] = null;
        this.matches[matchIndex] = null;
      } else {
        match.team_ids = [teamIndex, team2Index];
        toStart.push(match);
      }
      teamIndex++;
    }
    this.matches = this.matches.filter((match) => !!match);
    this.matches.forEach((m, i) => {
      m.index = i;
      m.insert();
    });
    for (let match of toStart) {
      await match.setState(TournamentMatchState.PLAYING);
      if (match.state === TournamentMatchState.CANCELLED) {
        return false;
      }
    };
    return true;
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

  cancel() {
    this.finish();
  }

  delete() {
    db.prepare(
      `
      DELETE FROM tournaments
      WHERE tournament_id = ?
      `
    ).run(this.id);
    this.manager.unregisterTournament(this);
  }

  updateToLobbyConnection(active=true) {
    this.lobbyConnection.send({
      event: "tournament_update",
      data: {
        tournament_id: this.id,
        // TODO: handle eliminated players/teams
        players: this.teams.flatMap((team) => team.players.map((player) => player.account_id)),
        team_count: this.teams.length,
        lobby_secret: this.lobbySecret,
        gamemode: this.gamemode,
        stage: this.matches.find((match) => match.state === TournamentMatchState.PLAYING)?.stage,
        active
      },
    })
  }

  finish() {
    db.prepare(
      `
      UPDATE tournaments
      SET active = ?
      WHERE tournament_id = ?
      `
    ).run(0, this.id);
    for (let match of this.matches) {
      if (match.internal_match) {
        this.manager.unregisterTournamentMatch(match);
      }
    }
    this.manager.unregisterTournament(this);
    this.broadcast(
      "finish",
      {
        tournament: this,
      },
      (subscriber) => {
        subscriber.raw.end();
      }
    );
    this.updateToLobbyConnection(false);
  }

  getMatch(match_id) {
    return this.matches.find((match) => match.internal_match?.match_id === match_id);
  }

  broadcast(event, data, cb) {
    const dataStr = JSON.stringify(data);
    for (let subscriber of this.subscribers) {
      subscriber.sse({ event, data: dataStr });
      cb?.(subscriber);
    }
  }
}
