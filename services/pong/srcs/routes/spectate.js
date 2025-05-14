"use strict";

import { WsCloseError } from "yatt-ws";
import { HttpError } from "yatt-utils";

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

  fastify.get("/", { schema, websocket: true }, async (socket, request) => {
    const { match_id, access_token } = request.query;

    try {
      await fastify.jwt.spectator.verify(access_token);
    }
    catch (err) {
      WsCloseError.Unauthorized.close(socket);
      return;
    }

    let match = fastify.games.getGame(match_id);
    if (!match) {
      WsCloseError.NotFound.close(socket);
      return;
    }

    match.setSpectator(socket);

    socket.on("close", () => {
      match.setSpectator(null);
    });

  });

  fastify.get("/sync", { schema },  async (request, reply) => {
    const { match_id, access_token } = request.query;

    try {
      await fastify.jwt.spectator.verify(access_token);
    }
    catch (err) {
      throw new HttpError.Unauthorized();
    }

    let match = fastify.games.getGame(match_id);
    if (!match) {
      throw new HttpError.NotFound();
    }

    return { event: "sync", data: { match } };
  });

  done();
};
