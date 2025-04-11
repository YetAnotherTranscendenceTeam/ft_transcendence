import { Lobby } from "./Lobby.js";
import { LobbyCopyMessage, LobbyErrorMessage } from "./LobbyMessages.js";
import { events } from "./playerEvents.js";

export class Player {

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

  disconnect(close) {
    console.log(`Player ${this.account_id} disconnected`);
    this.lobby.removePlayer(this);
    this.players.delete(this.account_id);
    if (this.connected) {
      if (close) close.close(this.socket);
      else this.socket.close(1000, "DISCONNECTED");
    }
    this.connected = false;
  }

  toJSON() {
    return { account_id: this.account_id, profile: this.profile };
  }

  isLeader() {
    return this.lobby.isLeader(this);
  }

  send(message) {
    this.socket.send(JSON.stringify(message));
  }

  syncLobby() {
    this.send(new LobbyCopyMessage(this.lobby));
  }

  // receive a message from client
  async receive(message) {
    try {
      await events.receive(this.socket, message, this);
    } catch (e) {
      console.error(e);
      this.send(new LobbyErrorMessage(e.message));
    }
  }
}
