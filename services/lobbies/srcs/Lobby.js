import {
  LobbyErrorMessage,
  LobbyJoinMessage,
  LobbyLeaveMessage,
  LobbyModeMessage,
  LobbyStateMessage,
  SwapPlayersMessage,
  LobbyLeaderMessage,
  TeamNameMessage,
} from "./LobbyMessages.js";
import { GameModes } from "./GameModes.js";
import MatchmakingConnection from "./MatchmakingConnection.js";
import { LobbyStateType, Lobby as LobbyBase, GameModeType} from "yatt-lobbies";
import { activityEvents } from "./ActivityEvents.js";

export const LobbyState = {
  waiting: () => ({ type: LobbyStateType.WAITING, joinable: true }),
  queued: (stats) => ({ type: LobbyStateType.QUEUED, joinable: false, stats }),
  playing: (match) => ({ type: LobbyStateType.PLAYING, joinable: false, match }),
};

// export this to be used when the secret is already used
export function generateJoinSecret() {
  const SECRET_LENGTH = 8;
  const SECRET_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let join_secret = "";
  for (let i = 0; i < SECRET_LENGTH; i++) {
    join_secret += SECRET_CHARS.at(Math.floor(Math.random() * SECRET_CHARS.length));
  }
  return join_secret;
}

const LOBBY_DESTRUCTION_DELAY = 2000;

export class Lobby extends LobbyBase {

  destruction_timeout = null;

  constructor(modename, lobbies) {
    let mode = Object.values(GameModes)[0];
    if (modename) {
      mode = GameModes[modename];
      if (!mode) throw new Error("Invalid gamemode");
    }
    super(generateJoinSecret(), mode);
    this.lobbies = lobbies;
    this.setGameMode(this.mode);
  }

  toJSON() {
    return {
      players: this.players,
      join_secret: this.join_secret,
      mode: this.mode,
      state: this.state,
      leader_account_id: this.leader_account_id,
      team_names: this.team_names,
    };
  }

  setTeamName(player, name) {
    const index = this.players.findIndex((p) => p.account_id == player.account_id);
    if (index == -1) throw new Error("Player not in lobby");
    const team_index = index % this.getTeamCount();
    this.team_names[team_index] = name;
    this.broadbast(new TeamNameMessage(team_index, name));
  }

  isLeader(player) {
    return this.leader_account_id === player.account_id;
  }

  setLeader(player) {
    if (!player) this.leader_account_id = null;
    else this.leader_account_id = player.account_id;
    this.broadbast(new LobbyLeaderMessage(this.leader_account_id));
  }

  shouldScheduleDestruction() {
    return this.players.length === 0;
  }

  scheduleDestruction() {
    this.destruction_timeout = setTimeout(() => {
      this.destroy();
    }, LOBBY_DESTRUCTION_DELAY);
  }

  destroy() {
    console.log(`Lobby ${this.join_secret} destroyed`);
    if (this.state.type == LobbyStateType.QUEUED) this.unqueue();
    this.lobbies.delete(this.join_secret);
  }

  addPlayer(player) {
    if (this.destruction_timeout) {
      clearTimeout(this.destruction_timeout);
      this.destruction_timeout = null;
    }
    if (this.leader_account_id === null) this.setLeader(player);
    this.broadbast(new LobbyJoinMessage(player));
    super.addPlayer(player);
    player.syncLobby();
    activityEvents.update(this);
  }

  removePlayer(player) {
    const rm_index = this.players.findIndex((p) => p.account_id == player.account_id);
    if (rm_index == -1) return;
    if (this.isLeader(player)) this.setLeader(rm_index == 0 ? this.players[1] : this.players[0]);
    super.removePlayer(rm_index);
    if (this.state.type == LobbyStateType.QUEUED) this.unqueue();
    this.broadbast(new LobbyLeaveMessage(player));
    if (this.shouldScheduleDestruction()) this.scheduleDestruction();
    activityEvents.leave(this, player.account_id);
  }

  // swaps the positions of 2 players
  swapPlayers(sender, { account_ids }) {
    const indexes = [];
    for (let i = 0; i < account_ids.length; i++) {
      let account_id = account_ids[i];
      let index = this.players.findIndex((p) => p.account_id == account_id);
      if (index == -1) throw new Error("Account_id is not part of this lobby");
      indexes.push(index);
    }
    if (!this.isLeader(sender)) {
      const team_count = this.getTeamCount();
      if (!account_ids.includes(sender.account_id) || indexes[0] % team_count != indexes[1] % team_count)
        throw new Error("Non-leaders can only swap themselves with another player from their team");
    }
    // swap players with a temp value
    let player = this.players[indexes[0]];
    this.players[indexes[0]] = this.players[indexes[1]];
    this.players[indexes[1]] = player;
    this.broadbast(new SwapPlayersMessage(account_ids));
  }

  broadbast(message) {
    for (let player of this.players) {
      player.send(message);
    }
  }

  getCapacity() {
    return this.mode.getLobbyCapacity();
  }

  setGameMode(mode) {
    if (!mode) throw new Error("Invalid gamemode");
    const lobby_capacity = mode.getLobbyCapacity();
    if (this.players.length > lobby_capacity)
      throw new Error("Too many players in lobby to change to this gamemode");
    super.setMode(mode);
    this.team_names.length = lobby_capacity / mode.team_size;
    this.broadbast(new LobbyModeMessage(mode));
    activityEvents.update(this);
  }

  setState(state) {
    this.state = state;
    this.broadbast(new LobbyStateMessage(state));
    activityEvents.update(this);
  }

  isFull() {
    return this.players.length >= this.getCapacity();
  }

  isJoinable() {
    if (!this.state.joinable) return false;
    return this.players.length < this.getCapacity();
  }

  matchFound(match) {
    this.setState(LobbyState.playing(match));
  }

  forcedUnqueue(reason) {
    this.broadbast(new LobbyErrorMessage(reason));
    this.setState(LobbyState.waiting());
  }

  queue() {
    if (this.state.type != LobbyStateType.WAITING) throw new Error("Lobby is not waiting");
    if (this.mode.type == GameModeType.TOURNAMENT && this.getTeamCount() < 3) throw new Error("Lobby requires at least 3 teams to start a tournament");
    if (this.mode.type == GameModeType.CUSTOM && this.getTeamCount() != 2) throw new Error("Custom lobbies require 2 teams to start");
    if (!MatchmakingConnection.getInstance().isReady) {
      throw new Error("Matchmaking service is currently not available");
    }
    MatchmakingConnection.getInstance().queue(this);
  }

  confirmQueue(stats) {
    this.setState(LobbyState.queued(stats));
  }

  unqueue() {
    if (this.state.type != LobbyStateType.QUEUED) throw new Error("Lobby is not queued");
    if (MatchmakingConnection.getInstance().isReady)
      MatchmakingConnection.getInstance().unqueue(this);
  }

  confirmUnqueue(reason) {
    if (reason) {
      this.broadbast(new LobbyErrorMessage(reason));
    }
    this.setState(LobbyState.waiting());
  }
}
