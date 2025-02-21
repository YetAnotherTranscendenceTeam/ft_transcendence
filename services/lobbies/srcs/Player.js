import { Lobby, GameModes } from "./Lobby.js";
import { LobbyErrorMessage } from "./LobbyMessages.js";

export default class Player {
  static messageHanlers = {
    "unrecognized": () => {throw new Error("Unrecognized message")},
    "mode": (msg, player) => player.lobby.setGameMode(GameModes[msg.mode]),
    "kick": (msg, player) => {
      const target = player.lobby.players.find(player => player.account_id == msg.account_id);
      if (!target)
        return;
      target.socket.close(1000, "Kicked from lobby");
    },
    "queue_start": (msg, player) => {
      player.lobby.queue();
    },
    "queue_stop": (msg, player) => {
      player.lobby.unqueue();
    }
  }

  constructor(socket, req, lobby) {
    this.socket = socket;
    this.account_id = req.account_id; // TODO: account_id??
    this.profile = null; // TODO profile?? (profile service communication?)
    /**
     * @type {Lobby}
     */
    this.lobby = lobby;
  }

  messageMember() {
    return {account_id: this.account_id, profile: this.profile};
  }

  send(message) {
    this.socket.send(JSON.stringify(message));
  }

  // receive a message from client
  receive(message) {
    try {
      if (this != this.lobby.getOwner())
        throw new Error("Only the lobby owner can send messages");
      let handler = Player.messageHanlers[message.event];
      if (!handler)
        handler = Player.messageHanlers["unrecognized"];
        handler(message.data, this);
      }
    catch(e) {
      this.send(new LobbyErrorMessage(e.message));
    }
  }
}