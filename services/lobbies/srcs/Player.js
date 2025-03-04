import { Lobby } from "./Lobby.js";
import { GameModes } from "./GameModes.js";
import { LobbyErrorMessage } from "./LobbyMessages.js";

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
      target.socket.close(1000, "Kicked from lobby");
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
  }

  disconnect() {
    console.log(`Player ${this.account_id} disconnected`);
    this.lobby.removePlayer(this);
    this.players.delete(this.account_id);
    if (this.lobby.shouldDestroy()) {
      console.log(`Destroying lobby ${this.lobby.joinSecret}`);
      this.lobbies.delete(this.lobby.joinSecret);
    }
    if (this.connected) this.socket.close(1000, "Disconnected");
    this.connected = false;
  }

  messageMember() {
    return { account_id: this.account_id, profile: this.profile };
  }

  send(message) {
    this.socket.send(JSON.stringify(message));
  }

  // receive a message from client
  receive(message) {
    try {
      if (typeof message.event !== "string")
        throw new Error("Invalid message format, expected event string");
      if (!Player.playerMessages.includes(message.event) && this != this.lobby.getOwner())
        throw new Error("Only the lobby owner can send this message type");
      let handler = Player.messageHanlers[message.event];
      if (!handler) handler = Player.messageHanlers["unrecognized"];
      handler(message.data, this);
    } catch (e) {
      this.send(new LobbyErrorMessage(e.message));
    }
  }
}
