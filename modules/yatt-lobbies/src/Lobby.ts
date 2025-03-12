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

export interface ILobbyState {
  type: "waiting" | "queued" | "playing";
  joinable: boolean;
  stats?: {
    players: number;
    lobbies: number;
  },
  match?: number
}

export interface ILobby {
  join_secret: string;
  players: IPlayer[];
  mode: IGameMode;
  state: ILobbyState,
  leader_account_id: number;
}
