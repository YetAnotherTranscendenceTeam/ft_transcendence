import { GameMode, GameModeType, IGameMode } from "./GameMode";

export interface IPlayer {
  account_id: number;
  profile?: {
    account_id: number;
    username: string;
    avatar: string;
    created_at: string;
    updated_at: string;
  };
}

export interface ITeam {
  name: string | null;
  players: IPlayer[];
}

export enum LobbyStateType {
  WAITING = "waiting",
  QUEUED = "queued",
  PLAYING = "playing",
}

export interface ILobbyState {
  type: LobbyStateType;
  joinable: boolean;
  stats?: {
    players: number;
    lobbies: number;
  },
  match?: number
}


export enum PongEventType {
  NONE = 0,
	MULTIBALL,
	ATTRACTOR,
	ICE,
	BIGPADDLE,
	SMALLPADDLE,
}

export interface IMatchParameters {
  obstacles: boolean;
  events: PongEventType[];
  ball_speed: number;
  point_to_win: number;
};

export interface ILobby {
  join_secret: string;
  team_names: string[];
  players: IPlayer[];
  mode: IGameMode;
  state: ILobbyState,
  leader_account_id: number | null;
  match_parameters: IMatchParameters;
}

export const matchParametersSchema = {
  type: "object",
  required: ["obstacles", "events", "ball_speed", "point_to_win"],
  additionalProperties: false,
  properties: {
    obstacles: {
      type: "boolean"
    },
    events: {
      type: "array",
      items: {
        type: "number",
        enum: Object.values(PongEventType)
      }
    },
    ball_speed: { type: "number", minimum: 0 },
    point_to_win: { type: "number", minimum: 1 },
  },
}

export const defaultMatchParameters: IMatchParameters = {
  obstacles: true,
  events: [
    PongEventType.MULTIBALL,
    PongEventType.ATTRACTOR,
    PongEventType.ICE,
  ],
  ball_speed: 1,
  point_to_win: 3
}

export enum QueueStatus {
  CAN_QUEUE = 0,
  BAD_LOBBY = 1,
  FEW_TEAMS = 2,
  NO_OPPONENT = 3,
  UNCOMPLETE_TEAM = 4,
}

export class Lobby implements ILobby {

  join_secret: string;
  team_names: string[];
  players: IPlayer[];
  mode: GameMode;
  state: ILobbyState;
  leader_account_id: number | null;
  match_parameters: IMatchParameters;

  constructor(join_secret: string, mode: IGameMode);
  constructor(data: ILobby);
  constructor(data: ILobby | string, mode?: IGameMode) {
    if (typeof data === "string") {
      this.join_secret = data;
      this.players = [];
      if (!mode) {
        throw new Error("Missing mode");
      }
      this.mode = new GameMode(mode);
      this.team_names = new Array<string>(this.getTeamCount());
      this.state = {type: LobbyStateType.WAITING, joinable: true};
      this.leader_account_id = null;
      this.match_parameters = defaultMatchParameters;
      return;
    }
    this.join_secret = data.join_secret;
    this.team_names = data.team_names;
    this.players = data.players;
    this.mode = new GameMode(data.mode);
    this.state = data.state;
    this.leader_account_id = data.leader_account_id;
    this.match_parameters = data.match_parameters;
  }

  updateTeamNames(new_team_count: number): this {
    this.team_names.length = new_team_count;
    return this;
  }

  removePlayer(rm_index: number): this {
    const old_team_count = this.getTeamCount();
    const team_count = this.getTeamCount() - (this.players.length % this.mode.team_size == 1 ? 1 : 0);
    const rm_team_index = rm_index % old_team_count;
    const rm_team_position = Math.floor(rm_index / old_team_count);
    let new_players = new Array<IPlayer>(this.players.length - 1);
    for (let i = 0; i < this.players.length; i++) {
      let team_index = i % old_team_count;
      let team_position = Math.floor(i / old_team_count);
      if (i == rm_index)
        continue;
      let new_index = team_index + team_count * team_position;
      if (team_index == old_team_count - 1 && team_position == (new_players.length % this.mode.team_size)) {
        new_index = rm_team_index + team_count * rm_team_position;
      }
      new_players[new_index] = this.players[i];
    }
    this.players = new_players;
    this.updateTeamNames(team_count);
    return this;
  }

  addPlayer(player: IPlayer): this {
    if (this.players.length % this.mode.team_size == 0) {
      const old_team_count = this.getTeamCount();
      const team_count = this.getTeamCount() + 1;
      let new_players = new Array<IPlayer>(this.players.length + 1);
      for (let i = 0; i < this.players.length; i++) {
        let team_index = i % old_team_count;
        let team_position = Math.floor(i / old_team_count);
        let new_index = team_index + team_count * team_position;
        new_players[new_index] = this.players[i];
      }
      new_players[old_team_count] = player;
      this.players = new_players;
      this.updateTeamNames(team_count);
    }
    else
      this.players.push(player);
    return this;
  }

  getTeamCount(): number {
    return Math.ceil(this.players.length / this.mode.team_size);
  }

  getTeams(): ITeam[] {
    let teams: { name: string | null, players: IPlayer[] }[] = [];
    const team_count = this.getTeamCount();
    for (let i = 0; i < team_count; i++) {
      let name = this.team_names[i] || null;
      let team_players: IPlayer[] = [];
      for (let j = i; j < this.players.length; j += team_count) {
        team_players.push(this.players[j]);
      }
      teams.push({ name, players: team_players });
    }
    return teams;
  }

  getCapacity(): number {
    return this.mode.getLobbyCapacity();
  }

  setTeamName(team_index: number, name: string): this {
    this.team_names[team_index] = name;
    return this;
  }

  setState(state: ILobbyState): this {
    this.state = state;
    return this;
  }

  setMode(mode: IGameMode): this {
    if (mode instanceof GameMode)
      this.mode = mode;
    else
      this.mode = new GameMode(mode);
    this.updateTeamNames(this.getTeamCount());
    return this;
  }

  isMatchCustomizable(): boolean {
    return this.mode.type == GameModeType.CUSTOM || this.mode.type == GameModeType.TOURNAMENT;
  }

  getFinalMatchParameters(): IMatchParameters {
    if (this.isMatchCustomizable()) {
      return this.match_parameters;
    }
    return defaultMatchParameters;
  }

  setLeader(leader_account_id: number): this {
    this.leader_account_id = leader_account_id;
    return this;
  }

  setPlayers(players: IPlayer[]): this {
    this.players = players;
    return this;
  }

  areTeamsFull(): boolean {
    return this.players.length % this.mode.team_size === 0;
  }

  canQueue(): number {
    if (this.state.type != LobbyStateType.WAITING) {
      return QueueStatus.BAD_LOBBY;
    }
    if (this.mode.type == GameModeType.TOURNAMENT && this.getTeamCount() < 3) {
      return QueueStatus.FEW_TEAMS;
    }
    if (this.mode.type == GameModeType.CUSTOM && this.getTeamCount() != 2) {
      return QueueStatus.NO_OPPONENT;
    }
    if ([GameModeType.TOURNAMENT, GameModeType.CUSTOM].includes(this.mode.type) && !this.areTeamsFull()) {
      return QueueStatus.UNCOMPLETE_TEAM;
    }
    return QueueStatus.CAN_QUEUE;
  }

  setMatchParameters(parameters: IMatchParameters): this {
    this.match_parameters = parameters;
    return this;
  }
}
