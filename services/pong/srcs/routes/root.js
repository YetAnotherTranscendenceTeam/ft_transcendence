"use strict";

import { PongServer } from "../PongServer.js";
import { gameEvents } from "../gameevents.js";

const pong = new PongServer();

export default function router(fastify, opts, done) {

  fastify.get("/", { websocket: true }, async (socket, req) => {
    console.log("Client connected");
    socket.send(JSON.stringify({ event: "state", data: { counter: pong.counter } }));
    pong.addClient(socket);
    socket.on("message", (message) => {
      gameEvents.receive(socket, JSON.parse(message), pong);
    });
    socket.on("close", () => {
      pong.removeClient(socket);
      console.log("Client disconnected");
    })
  });

  done();
}
