import { activityEvents } from "./ActivityEvents.js";
import { fetchGameModes, GameModes } from "./GameModes.js";
import { EventEmitter } from "events";
import { Lobby, LobbyState } from "./Lobby.js";

const MATCHMAKING_RETY_TIMEOUT = 1000;

export default class MatchmakingConnection extends EventEmitter {
  static instance = null;
  static getInstance() {
    return MatchmakingConnection.instance;
  }

  messageHandlers = {
    match: (message) => {
      for (const lobby of message.data.lobbies) {
        const lobbyInstance = this.queuedLobbies.get(lobby.join_secret);
        if (lobbyInstance) {
          this.queuedLobbies.delete(lobby.join_secret);
          this.matchedLobbies.set(lobby.join_secret, lobbyInstance);
          lobbyInstance.matchFound(message.data.match);
        }
      }
    },
    confirm_queue: (message) => {
      const lobby = this.queuedLobbies.get(message.data.lobby.join_secret);
      if (lobby) {
        lobby.confirmQueue();
      }
    },
    confirm_unqueue: (message) => {
      const lobby = this.queuedLobbies.get(message.data.lobby.join_secret);
      if (lobby) {
        lobby.confirmUnqueue(message.data.reason);
        this.queuedLobbies.delete(lobby.join_secret);
      }
    },
    match_update: (message) => {
      if (message.data.state === 2 || message.data.state === 3) {
        for (let secret of message.data.lobby_secrets) {
          const lobby = this.matchedLobbies.get(secret);
          if (lobby) {
            lobby.setState(LobbyState.waiting());
            this.matchedLobbies.delete(lobby.join_secret);
          }
        }
      }
      console.log("Match update", message);
      activityEvents.updateMatch(message.data);
    },
    tournament_end: (message) => {
      for (let secret of message.data.lobby_secrets) {
        const lobby = this.matchedLobbies.get(secret);
        if (lobby) {
          lobby.setState(LobbyState.done());
          this.matchedLobbies.delete(lobby.join_secret);
        }
      }
      activityEvents.endTournament(message);
    }
  }

  socket = null;
  isReady = false;
  /**
   * @type {Map<string, Lobby>}
   */
  queuedLobbies = new Map();
  /**
   * @type {Map<string, Lobby>}
   */
  matchedLobbies = new Map();

  constructor(fastify) {
    super();
    this.fastify = fastify;
    const timeoutcb = () => {
      this.connect(fastify).then(() => {
        setTimeout(timeoutcb, MATCHMAKING_RETY_TIMEOUT);
      });
    };
    timeoutcb();
  }

  connect(fastify) {
    return new Promise((resolve, reject) => {
      this.socket = new WebSocket("ws://matchmaking:3000/lobbieconnection");
      this.socket.addEventListener("open", () => {
        console.log("Connected to matchmaking server");
        this.socket.send(
          JSON.stringify({
            event: "handshake",
            data: {
              jwt: fastify.jwt.matchmaking.sign({ GameModes }),
            },
          })
        );
      });
      this.socket.addEventListener("error", (event) => {
        console.error("Matchmaking server connection error");
        console.error(event);
        resolve();
      });
      this.socket.addEventListener("close", async (event) => {
        console.log("Disconnected from matchmaking server");
        console.log(event.code, event.reason);
        this.queuedLobbies.forEach((lobby) => {
          lobby.forcedUnqueue("Connection with matchmaking server lost");
        });
        this.queuedLobbies.clear();
        this.matchedLobbies.forEach((lobby) => {
          lobby.forcedUnqueue("Connection with matchmaking server lost");
        });
        this.matchedLobbies.clear();
        if (event.reason === "Unauthorized - Invalid GameModes") await fetchGameModes();
        this.isReady = false;
        resolve();
      });
      this.socket.addEventListener("message", (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.event === "handshake") {
            console.log("Matchmaking server handshake successful");
            this.isReady = true;
            return;
          }
          let handler = this.messageHandlers[message.event];
          if (handler) {
            handler(message);
          } else {
            console.error(`Unhandled message from matchmaking server: ${message.event}`);
          }
        } catch (e) {
          console.error(e);
        }
      });
    });
  }

  send(message) {
    if (this.isReady) {
      this.socket.send(JSON.stringify(message));
    }
  }

  queue(lobby) {
    this.queuedLobbies.set(lobby.join_secret, lobby);
    this.send({
      event: "queue_lobby",
      data: {
        lobby: lobby,
      },
    });
  }

  unqueue(lobby) {
    this.send({
      event: "unqueue_lobby",
      data: {
        lobby: lobby,
      },
    });
  }
}
