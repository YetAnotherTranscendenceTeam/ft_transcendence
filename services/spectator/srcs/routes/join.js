"use strict";

import { GameConnection } from "../utils/GameConnection.js";

import { WsCloseError } from "yatt-ws";

export default function router(fastify, opts, done) {
  const schema = {
    querystring: {
      type: "object",
      properties: {
        match_id: { type: "number" },
        access_token: { type: "string" }
      },
      required: ["match_id", "access_token"],
    },
  };

  fastify.get("/join", { schema, websocket: true }, async (socket, request) => {
    const { match_id, access_token } = request.query;

    try {
      await fastify.jwt.authentication.verify(access_token);
    }
    catch (err) {
      WsCloseError.Unauthorized.close(socket);
      return;
    }

    const game = fastify.games.get(match_id) || new GameConnection(match_id, fastify);
    if (game)
      game.subscribe(socket);
  });

  done();
};
