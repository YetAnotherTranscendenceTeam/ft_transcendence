"use strict";

import { GameModes } from "../GameModes.js";
import { ConnectionManager } from "../ConnectionManager.js";

const connection_manager = new ConnectionManager();

export default function router(fastify, opts, done) {
  fastify.get("/join", { websocket: true }, (socket, req) => {
    try {
      let lobby;
      try {
        lobby = connection_manager.checkConnection(fastify, req);
      }
      catch (err) {
        console.error(err);
        socket.close(1008, err.message);
        return;
      }
      connection_manager.joinLobby(socket, req, lobby);
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
      lobby_count: connection_manager.lobbies.size,
      player_count: connection_manager.players.size,
    });
  });

  done();
}
