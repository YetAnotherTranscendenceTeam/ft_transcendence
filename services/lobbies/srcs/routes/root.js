"use strict";

import { Lobby } from "../Lobby.js";
import { GameModes } from "../GameModes.js";
import Player from "../Player.js";

/**
 * @type {Map<string, Lobby>}
 */
const lobbies = new Map();

/**
 * @type {Map<number, Player>}
 */
const players = new Map();

export default function router(fastify, opts, done) {
  fastify.get("/join", { websocket: true }, (socket, req) => {
    try {
      /**
       * @type {Lobby | null}
       */
      let lobby;
      if (!req.query.token)
        return socket.close(1008, "Missing token");
      try {
        const token = req.query.token;
        const decoded = fastify.jwt.verify(token)
        req.account_id = decoded.account_id;
      } catch (err) {
        return socket.close(1008, "Invalid token");
      }
      if (players.has(req.account_id)) {
        console.log(`Player ${req.account_id} already in a lobby`);
        return socket.close(1008, "Already in a lobby");
      }
      if (!req.query.secret) {
        let gamemode = req.query.gamemode;
        if (gamemode && !GameModes[gamemode])
          return socket.close(1008, "Invalid gamemode");
        lobby = new Lobby(gamemode);
        lobbies.set(lobby.joinSecret, lobby);
        console.log("Creating lobby", lobby.joinSecret);
      } else
        lobby = lobbies.get(req.query.secret);
      if (!lobby)
        return socket.close(1008, "Invalid secret");
      if (!lobby.isJoinable())
          return socket.close(1008, "Lobby is not joinable");
      let player = new Player(socket, req, lobby, { lobbies, players });
      players.set(player.account_id, player);
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
    } catch (e) {
      console.error(e);
    }
  });

  fastify.get("/", async (req, res) => {
    res.send({ status: "ok" });
  });

  fastify.get("/gamemodes", async (req, res) => {
    res.send(GameModes);
  });

  fastify.get("/stats", async (req, res) => {
    res.send({
      lobby_count: lobbies.size,
      player_count: players.size,
    });
  });

  done();
}
