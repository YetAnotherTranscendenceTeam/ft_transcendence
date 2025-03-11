import { Lobby } from "./Lobby.js";
import { GameModes } from "./GameModes.js";
import { LobbyCopyMessage, LobbyErrorMessage } from "./LobbyMessages.js";

export class Player {
  static playerMessages = ["disconnect"];
  static messageHanlers = {
    unrecognized: () => {
      throw new Error("Unrecognized message");
    },
    mode: (msg, player) => player.lobby.setGameMode(GameModes[msg.mode]),
    kick: (msg, player) => {
      const target = player.lobby.players.find((player) => player.account_id == msg.account_id);
      if (!target) return;
      target.disconnect(1000, "Kicked from lobby");
    },
    queue_start: (msg, player) => {
      player.lobby.queue();
    },
    queue_stop: (msg, player) => {
      player.lobby.unqueue();
    },
    disconnect: (msg, player) => {
      player.disconnect();
    },
    swap_players: (msg, player) => {
      player.lobby.swapPlayers(msg);
    },
  };

  constructor(socket, req, lobby, { lobbies, players }, profile) {
    this.socket = socket;
    this.account_id = req.account_id;
    this.profile = profile;
    /**
     * @type {Lobby}
     */
    this.lobby = lobby;
    this.lobbies = lobbies;
    this.players = players;
    this.connected = true;
    this.last_pong = Date.now();
  }

  disconnect(code, reason) {
    console.log(`Player ${this.account_id} disconnected`);
    this.lobby.removePlayer(this);
    this.players.delete(this.account_id);
    if (this.connected) {
      if (code && reason) this.socket.close(code, reason);
      else this.socket.close(code ? code : 1000, "Disconnected");
    }
    this.connected = false;
  }

  toJSON() {
    return { account_id: this.account_id, profile: this.profile };
  }

  send(message) {
    this.socket.send(JSON.stringify(message));
  }

  syncLobby() {
    this.send(new LobbyCopyMessage(this.lobby));
  }

  // receive a message from client
  receive(message) {
    try {
      if (typeof message.event !== "string")
        throw new Error("Invalid message format, expected event string");
      if (!Player.playerMessages.includes(message.event) && !this.lobby.isLeader(this))
        throw new Error("Only the lobby owner can send this message type");
      let handler = Player.messageHanlers[message.event];
      if (!handler) handler = Player.messageHanlers["unrecognized"];
      handler(message.data, this);
    } catch (e) {
      console.error(e);
      this.send(new LobbyErrorMessage(e.message));
    }
  }
}
