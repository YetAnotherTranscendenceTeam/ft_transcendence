import { IGameMode } from "./GameMode";

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
  leader_account_id: number;
}
