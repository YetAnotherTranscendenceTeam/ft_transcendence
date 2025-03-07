import { fetchGameModes, GameModes } from "./GameModes.js";
import { EventEmitter } from "events";

const MATCHMAKING_RETY_TIMEOUT = 1000;

export default class MatchmakingConnection extends EventEmitter {
  static instance = null;
  static getInstance() {
    return MatchmakingConnection.instance;
  }

  socket = null;
  isReady = false;
  queuedLobbies = new Set();

  constructor(fastify) {
    super();
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
          lobby.forcedUnqueue(event.reason);
        });
        this.queuedLobbies.clear();
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
    this.queuedLobbies.add(lobby);
    this.send({
      event: "queue_lobby",
      data: {
        lobby: lobby,
      },
    });
  }

  unqueue(lobby) {
    this.queuedLobbies.delete(lobby);
    this.send({
      event: "unqueue_lobby",
      data: {
        lobby: lobby,
      },
    });
  }
}
