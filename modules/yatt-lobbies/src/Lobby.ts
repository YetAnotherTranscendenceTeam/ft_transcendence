import { GameMode, GameModeType, IGameMode } from "./GameMode";

export interface IPlayer {
  account_id: number;
  profile?: {
    account_id: number;
    name: string;
    avatar: string;
    created_at: string;
    updated_at: string;
  };
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

export interface ILobby {
  join_secret: string;
  team_names: string[];
  players: IPlayer[];
  mode: IGameMode;
  state: ILobbyState,
  leader_account_id: number | null;
}

export class Lobby implements ILobby {
  join_secret: string;
  team_names: string[];
  players: IPlayer[];
  mode: GameMode;
  state: ILobbyState;
  leader_account_id: number | null;

  constructor(join_secret: string, mode: IGameMode);
  constructor(data: ILobby);
  constructor(data: ILobby | string, mode?: IGameMode) {
    if (typeof data === "string") {
      this.join_secret = data;
      this.team_names = [];
      this.players = [];
      if (!mode) {
        throw new Error("Missing mode");
      }
      this.mode = new GameMode(mode);
      this.state = {type: LobbyStateType.WAITING, joinable: true};
      this.leader_account_id = null;
      return;
    }
    this.join_secret = data.join_secret;
    this.team_names = data.team_names;
    this.players = data.players;
    this.mode = new GameMode(data.mode);
    this.state = data.state;
    this.leader_account_id = data.leader_account_id;
  }

  removePlayer(rm_index: number) {
    const old_team_count = this.getTeamCount();
    const team_count = this.getTeamCount() - (this.players.length % this.mode.team_size == 1 ? 1 : 0);
    const rm_team_index = rm_index % old_team_count;
    let new_players = new Array<IPlayer>(this.players.length - 1);
    for (let i = 0; i < this.players.length; i++) {
      let team_index = i % old_team_count;
      let team_position = Math.floor(i / old_team_count);
      if (i == rm_index)
        continue;
      if (i > rm_index && team_index == rm_team_index) {
        team_position--;
      }
      else if (team_index == team_count) {
        team_index = rm_index % old_team_count;
        team_position = this.mode.team_size - 1;
      }
      let new_index = team_index + team_count * team_position;
      if (new_index >= new_players.length) {
        new_index = rm_index % old_team_count + team_count * team_position;
      }
      new_players[new_index] = this.players[i];
    }
	  this.players = new_players;
  }

  addPlayer(player: IPlayer) {
    if (this.players.length % this.mode.team_size == 0) {
      const old_team_count = this.getTeamCount();
      const new_team = this.mode.team_size == this.mode.team_size - 1 ? 1 : 0;
      const team_count = this.getTeamCount() + new_team;
      let new_players = new Array<IPlayer>(this.players.length + 1);
      for (let i = 0; i < this.players.length; i++) {
        let team_index = i % old_team_count;
        let team_position = Math.floor(i / old_team_count);
        let new_index = team_index + team_count * team_position;
        new_players[new_index] = this.players[i];
      }
      new_players[this.players.length] = player;
      this.players = new_players;
    }
    else
      this.players.push(player);
  }

  getTeamCount(): number {
    return Math.ceil(this.players.length / this.mode.team_size);
  }

  getTeams(): { team_name: string | null, players: IPlayer[] }[] {
    let teams: { team_name: string | null, players: IPlayer[] }[] = [];
    const team_count = this.getTeamCount();
    for (let i = 0; i < team_count; i++) {
      let team_name = this.team_names[i] || null;
      let team_players = [];
      for (let j = i; i < this.players.length; i += team_count) {
        team_players.push(this.players[j]);
      }
      teams.push({ team_name, players: team_players });
    }
    return teams;
  }
}
