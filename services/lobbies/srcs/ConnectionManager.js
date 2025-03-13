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
      this.lobbies.set(lobby.join_secret, lobby);
      return lobby;
    }
    return this.lobbies.get(req.query.secret);
  }

  // Checks if the connection is valid and returns the corresponding lobby
  // Throws an error if the connection is invalid
  async checkConnection(socket, fastify, req) {
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
    const lobby = this.getLobby(req);
    if (!lobby)
      throw new Error("Invalid secret");
    let other = this.players.get(req.account_id);
    let disconnect_other = false;
    if (!lobby.isJoinable()) {
      if (other?.lobby === lobby)
        disconnect_other = true;
      else if (lobby.isFull())
        throw new Error("Lobby is full");
      else
        throw new Error(`Lobby is not in a joinable state: ${lobby.state.type}`);
    }
    else if (other)
      disconnect_other = true;
    if (disconnect_other) {
      if (other.lobby === lobby) {
        other.socket.close(1008, "Logged in from another location");
        other.socket = socket;
        other.connected = false;
        other.syncLobby();
        return {player: other, oldplayer: other};
      }
      else
        other.disconnect(1008, "Logged in from another location");
    }
    const profile = await this.getProfile(req.account_id);
    let player = new Player(socket, req, lobby, this, profile);
    player.lobby = lobby;
    return {player};
  }

  async joinLobby(socket, req, player, oldplayer) {
    if (!oldplayer) {
      this.players.set(player.account_id, player);
      player.lobby.addPlayer(player);
    }
    console.log(`Player ${player.account_id} joined lobby ${player.lobby.join_secret}`);
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
      player.connected = true;
    });
  }

}
