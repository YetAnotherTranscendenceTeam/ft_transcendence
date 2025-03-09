import {
  LobbyCopyMessage,
  LobbyErrorMessage,
  LobbyJoinMessage,
  LobbyLeaveMessage,
  LobbyModeMessage,
  LobbyStateMessage,
  SwapPlayersMessage,
} from "./LobbyMessages.js";
import { Player } from "./Player.js";
import { GameModes } from "./GameModes.js";
import MatchmakingConnection from "./MatchmakingConnection.js";

export const LobbyState = {
  waiting: () => ({ type: "waiting", joinable: true }),
  queued: (stats) => ({ type: "queued", joinable: false, stats }),
  playing: (match) => ({ type: "playing", joinable: false, match }),
};

// export this to be used when the secret is already used
export function generateJoinSecret() {
  const SECRET_LENGTH = 8;
  const SECRET_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  let joinSecret = "";
  for (let i = 0; i < SECRET_LENGTH; i++) {
    joinSecret += SECRET_CHARS.at(Math.floor(Math.random() * SECRET_CHARS.length));
  }
  return joinSecret;
}

const LOBBY_DESTRUCTION_DELAY = 2000;

export class Lobby {
  // owner is always the first player
  /**
   * @type {Player[]}
   */
  players = [];

  joinSecret = generateJoinSecret();

  mode = Object.values(GameModes)[0];
  state = LobbyState.waiting();

  destruction_timeout = null;

  constructor(modename, lobbies) {
    this.lobbies = lobbies;
    if (modename) {
      const mode = GameModes[modename];
      if (!mode) throw new Error("Invalid gamemode");
      this.mode = mode;
    }
  }

  toJSON() {
    return {
      players: this.players,
      joinSecret: this.joinSecret,
      mode: this.mode,
      state: this.state,
    };
  }

  getOwner() {
    return this.players[0];
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
    console.log(`Lobby ${this.joinSecret} destroyed`);
    if (this.state.type == "queuing") this.unqueue();
    this.lobbies.delete(this.joinSecret);
  }

  addPlayer(player) {
    if (this.destruction_timeout) {
      clearTimeout(this.destruction_timeout);
      this.destruction_timeout = null;
    }
    this.players.push(player);
    this.broadbast(new LobbyJoinMessage(player));
    player.send(new LobbyCopyMessage(this));
  }

  removePlayer(player) {
    this.players = this.players.filter((p) => p != player);
    if (this.state.type == "queuing") this.unqueue();
    this.broadbast(new LobbyLeaveMessage(player));
    if (this.shouldScheduleDestruction()) this.scheduleDestruction();
  }

  // swaps the positions of 2 players
  swapPlayers({ account_ids }) {
    const indexes = [];
    if (!Array.isArray(account_ids) || account_ids.length != 2)
      throw new Error("Expected element 'indexes' to be an array of 2 element");
    for (let i = 0; i < account_ids.length; i++) {
      let account_id = account_ids[i];
      if (typeof account_id != "number") throw new Error("Invalid account_id, expected a number");
      let index = this.players.findIndex((p) => p.account_id == account_id);
      if (index == -1) throw new Error("Account_id is not part of this lobby");
      indexes.push(index);
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

  getLobbyCapacity() {
    return this.mode.getLobbyCapacity();
  }

  setGameMode(mode) {
    if (!mode) throw new Error("Invalid gamemode");
    if (this.players.length > mode.getLobbyCapacity())
      throw new Error("Too many players in lobby to change to this gamemode");
    this.mode = mode;
    this.broadbast(new LobbyModeMessage(mode));
  }

  setState(state) {
    this.state = state;
    this.broadbast(new LobbyStateMessage(state));
  }

  isJoinable() {
    if (!this.state.joinable) return false;
    return this.players.length < this.getLobbyCapacity();
  }

  matchFound(match) {
    this.setState(LobbyState.playing(match));
  }

  forcedUnqueue(reason) {
    this.broadbast(new LobbyErrorMessage(reason));
    this.setState(LobbyState.waiting());
  }

  queue() {
    if (this.state.type != "waiting") throw new Error("Lobby is not waiting");
    if (!MatchmakingConnection.getInstance().isReady) {
      throw new Error("Matchmaking service is currently not available");
    }
    MatchmakingConnection.getInstance().queue(this);
  }

  confirmQueue(stats) {
    this.setState(LobbyState.queued(stats));
  }

  unqueue() {
    if (this.state.type != "queued") throw new Error("Lobby is not queued");
    if (MatchmakingConnection.getInstance().isReady)
      MatchmakingConnection.getInstance().unqueue(this);
  }

  confirmUnqueue() {
    this.setState(LobbyState.waiting());
  }
}
