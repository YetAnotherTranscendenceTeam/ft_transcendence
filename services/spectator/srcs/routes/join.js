"use strict";

import { GameConnection } from "../utils/GameConnection.js";
import { Mutex } from 'async-mutex';
import { WsCloseError } from "yatt-ws";

const mutex = new Mutex();

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

    const release = await mutex.acquire();

    const game = fastify.games.get(match_id) || new GameConnection(match_id, fastify);
    if (game)
      await game.subscribe(socket);

    release();
  });

  done();
};
