"use strict";

import { GameModes } from "../GameModes.js";
import { ConnectionManager } from "../ConnectionManager.js";
import { WsCloseError } from "yatt-ws";

const connection_manager = new ConnectionManager();

export default function router(fastify, opts, done) {
  fastify.get("/join", { websocket: true }, async (socket, req) => {
    try {
      let player, oldplayer;
      try {
        const connect = await connection_manager.checkConnection(socket, fastify, req);
        player = connect.player;
        oldplayer = connect.oldplayer;
      }
      catch (err) {
        console.error(err);
        if (err instanceof WsCloseError) {
          err.close(socket);
          return;
        }
        socket.close(1008, err.message);
        return;
      }
      if (player) // player is undefined if it was a reconnect
        await connection_manager.joinLobby(socket, req, player, oldplayer);
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
