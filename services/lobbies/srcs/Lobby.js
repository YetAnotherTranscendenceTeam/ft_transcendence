import {
  LobbyCopyMessage,
  LobbyJoinMessage,
  LobbyLeaveMessage,
  LobbyModeMessage,
  LobbyStateMessage,
  MovePlayerMessage
} from "./LobbyMessages.js";
import { Player } from "./Player.js";
import { GameModes } from "./GameModes.js";

export const LobbyState = {
  waiting: () => ({ type: "waiting", joinable: true }),
  queued: () => ({ type: "queued", joinable: false }),
  playing: (matchid) => ({ type: "playing", joinable: false, matchid }),
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

export class Lobby {
  // owner is always the first player
  /**
   * @type {Player[]}
   */
  players = [];

  joinSecret = generateJoinSecret();

  mode = Object.values(GameModes)[0];
  state = LobbyState.waiting();

  constructor(modename) {
    if (modename) {
      const mode = GameModes[modename];
      if (!mode) throw new Error("Invalid gamemode");
      this.mode = mode;
    }
  }

  messageMember() {
    return {
      players: this.players.map((player) => player.messageMember()),
      joinSecret: this.joinSecret,
      mode: this.mode,
      state: this.state,
    };
  }

  getOwner() {
    return this.players[0];
  }

  shouldDestroy() {
    return this.players.length === 0;
  }

  addPlayer(player) {
    this.players.push(player);
    this.broadbast(new LobbyJoinMessage(player));
    player.send(new LobbyCopyMessage(this));
  }

  removePlayer(player) {
    this.players = this.players.filter((p) => p != player);
    this.broadbast(new LobbyLeaveMessage(player));
  }

  movePlayer({account_id, index}) {
	if (typeof index != "number" || index < 0 || index >= this.players.length)
		throw new Error("Invalid index");
	const player = this.players.find((player) => player.account_id == account_id);
	if (!player) throw new Error("Player not found");
	this.players = this.players.filter((p) => p != player);
	this.players.splice(index, 0, player);
	this.broadbast(new MovePlayerMessage(player, index));
  }

  broadbast(message) {
    for (let player of this.players) {
      player.send(message);
    }
  }

  setGameMode(mode) {
    if (!mode) throw new Error("Invalid gamemode");
    this.mode = mode;
    this.broadbast(new LobbyModeMessage(mode));
  }

  setState(state) {
    this.state = state;
    this.broadbast(new LobbyStateMessage(state));
  }

  isJoinable() {
    return this.state.joinable;
  }

  queue() {
    this.setState(LobbyState.queued());
    // TODO: matchmake
  }

  unqueue() {
    this.setState(LobbyState.waiting());
    // TODO: unqueue from matchmaking
  }
}
