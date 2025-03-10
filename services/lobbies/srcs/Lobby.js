import {
  LobbyCopyMessage,
  LobbyJoinMessage,
  LobbyLeaveMessage,
  LobbyModeMessage,
  LobbyStateMessage,
} from "./LobbyMessages.js";
import Player from "./Player.js";

export const GameModes = {
  "1v1": { name: "1v1", team_size: 1 },
  "2v2": { name: "2v2", team_size: 2 },
};

export const LobbyState = {
  waiting: () => ({ type: "waiting", joinable: true }),
  queued: () => ({ type: "queued", joinable: false }),
  playing: (matchid) => ({ type: "playing", joinable: false, matchid }),
};

// export this to be used when the secret is already used
export function generateJoinSecret() {
  const SECRET_LENGTH = 8;
  const SECRET_CHARS =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  let joinSecret = "";
  for (let i = 0; i < SECRET_LENGTH; i++) {
    joinSecret += SECRET_CHARS.at(
      Math.floor(Math.random() * SECRET_CHARS.length)
    );
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

  mode = GameModes["1v1"];
  state = LobbyState.waiting();

  constructor() {
  }

  messageMember() {
	return {
		players: this.players.map(player => player.messageMember()),
		joinSecret: this.joinSecret,
		mode: this.mode,
		state: this.state
	}
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

  broadbast(message) {
    for (let player of this.players) {
      player.send(message);
    }
  }

  setGameMode(mode) {
	if (!mode)
		throw new Error("Invalid gamemode");
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
