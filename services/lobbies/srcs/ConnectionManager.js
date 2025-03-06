import { Lobby } from "./Lobby.js";
import { Player } from "./Player.js";
import { GameModes } from "./GameModes.js";
import YATT from "yatt-utils";

export class ConnectionManager {
  /**
   * @type {Map<string, Lobby>}
   */
  lobbies = new Map();

  /**
   * @type {Map<number, Player>}
   */
  players = new Map();

  constructor() {
    this.interval = setInterval(() => {
      this.ping();
    }, 30000);
  }

  ping() {
    this.players.forEach((player) => {
      player.socket.ping();
    });
  }

  async getProfile(account_id) {
    try {
      return await YATT.fetch(`http://db-profiles:3000/${account_id}`);
    }
    catch(err) {
      console.error(err);
      return null;
    }
  }

  canConnect(account_id) {
    return !this.players.has(account_id);
  }

  getLobby(req) {
    if (!req.query.secret) {
      let gamemode = req.query.gamemode;
      if (gamemode && !GameModes[gamemode])
        throw new Error("Invalid gamemode");
      let lobby = new Lobby(gamemode, this.lobbies);
      this.lobbies.set(lobby.joinSecret, lobby);
      return lobby;
    }
    return this.lobbies.get(req.query.secret);
  }

  // Checks if the connection is valid and returns the corresponding lobby
  // Throws an error if the connection is invalid
  checkConnection(fastify, req) {
    if (!req.query.token)
      throw new Error("Missing token");
    try {
      const token = req.query.token;
      const decoded = fastify.jwt.verify(token);
      req.account_id = decoded.account_id;
    }
    catch (err) {
      throw new Error("Invalid token");
    }
    if (this.players.has(req.account_id))
      throw new Error("Already in a lobby");
    const lobby = this.getLobby(req);
    if (!lobby)
      throw new Error("Invalid secret");
    if (!lobby.isJoinable())
      throw new Error("Lobby is not in a joinable state");
    return lobby;
  }

  async joinLobby(socket, req, lobby) {
    const profile = await this.getProfile(req.account_id);
    let player = new Player(socket, req, lobby, this, profile);
    this.players.set(player.account_id, player);
    player.lobby = lobby;
    lobby.addPlayer(player);
    console.log(`Player ${player.account_id} joined lobby ${lobby.joinSecret}`);
    socket.on("message", (message) => {
      let obj;
      try {
        obj = JSON.parse(message);
      } catch (e) {
        socket.close(1000, "Invalid message format, expected JSON");
        return;
      }
      player.receive(obj);
    });
    socket.on("close", (reason) => {
      if (player.connected) player.disconnect(); // perform cleanups: remove from player map and from lobby
    });
  }

}
