"use strict";

import { Lobby } from "../Lobby.js";
import Player from "../Player.js";

const lobbies = new Map();

export default function router(fastify, opts, done) {
  fastify.get("/lobby/:secret", async (req, res) => {
    const lobby = lobbies.get(req.params.secret);
    if (!lobby) res.code(404).send({ error: "Lobby not found" });
    else res.send(lobby);
  });

  fastify.get("/join", { websocket: true }, (socket, req) => {
    try {
      /**
       * @type {Lobby | null}
       */
      let lobby;
      //req.account_id = req.query.id; // debug purpose
      if (!req.query.secret) {
        lobby = new Lobby();
        lobbies.set(lobby.joinSecret, lobby);
        console.log("Creating lobby", lobby.joinSecret)
      }
      else
        lobby = lobbies.get(req.query.secret);
      if (!lobby)
        return socket.close(1008, "Invalid secret");
      if (!lobby.isJoinable())
        return socket.close(1008, "Lobby is not joinable");
      let player = new Player(socket, req, lobby);
      lobby.addPlayer(player);
      player.lobby = lobby;
      socket.on("message", (message) => {
        let obj;
        try {
          obj = JSON.parse(message);
        }
        catch(e) {
          socket.close(1000, "Invalid message format, expected JSON");
          return ;
        }
        player.receive(obj);
      });
      socket.on("close", () => {
        lobby.removePlayer(player);
        if (lobby.shouldDestroy()) {
          console.log("Destroying lobby ", lobby.joinSecret)
          lobbies.delete(lobby.joinSecret);
        }
      });
    } catch (e) {
      console.error(e);
    }
  });

  fastify.get(
    "/",
    {
      schema: {
        tags: ["Status"],
        description: "Returns 200 OK if the service is running",
        response: {
          200: {
            description: "Service is running",
          },
        },
      },
    },
    async (req, res) => {
      res.send({ status: "ok" });
    }
  );

  done();
}
