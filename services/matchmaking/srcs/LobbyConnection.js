import { GameModes } from "./GameModes.js";
import { Queue } from "./Queue.js";
import { Lobby } from "./Lobby.js";

const SCHEDULER_INTERVAL = 5000;

export class LobbyConnection {
  static messageHandlers = {
    queue_lobby: (lobbyConnection, message) => {
      let queue = lobbyConnection.queues.get(message.data.lobby.mode.name);
      if (!queue) {
        throw new Error("Invalid gamemode");
      }
      lobbyConnection.queue(message.data.lobby, queue);
    },
    unqueue_lobby: (lobbyConnection, message) => {
      let queue = lobbyConnection.queues.get(message.data.lobby.mode.name);
      if (!queue) {
        throw new Error("Invalid gamemode");
      }
      queue.unqueue(message.data.lobby);
    }
  };

  /**
   * @type {Map<string, Queue>}
   */
  queues = new Map();

  scheduler = null;

  constructor(socket) {
    this.scheduler = setInterval(() => {
      this.queues.forEach((queue) => {
        queue.matchmake();
      });
    }, SCHEDULER_INTERVAL);
    Object.values(GameModes).forEach((mode) => {
      this.queues.set(mode.name, new Queue(mode, this));
    });
    this.socket = socket;
    this.socket.on("close", (code, reason) => {
      console.log("Lobby connection closed");
      console.log(code, reason);
      clearInterval(this.scheduler);
    });
    this.socket.on("message", (message) => {
      try {
        this.handleMessage(JSON.parse(message));
      } catch (e) {
        console.error(e);
        this.socket.close(1008, e.message);
      }
    });
  }

  handleMessage(message) {
    if (typeof message.event !== "string")
      throw new Error("Invalid message format, expected event string");
    if (!LobbyConnection.messageHandlers[message.event]) throw new Error("Invalid event");
    LobbyConnection.messageHandlers[message.event](this, message);
  }

  queue(lobby, queue) {
    queue.queue(new Lobby(lobby, queue));
  }
}
