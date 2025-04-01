"use strict";

import db from "../app/database.js";

export default function router(fastify, opts, done) {
  fastify.get("/:match_id", function handler(request, reply) {
    const match = db
      .prepare("SELECT * FROM matches WHERE match_id = ?")
      .all(request.params.match_id);
    if (!match) new HttpError.NotFound().send(reply);
    reply.send(match);
  });
  fastify.patch(
    "/:match_id",
    {
      schema: {
        params: { type: "object", properties: { match_id: { type: "number" } } },
        body: {
          type: "object",
          properties: {
            scores: { type: "array", items: { type: "number" } },
            state: { type: "string", enum: ["reserved", "playing", "done"] },
          },
        },
      },
    },
    function handler(request, reply) {
      const { scores, state } = request.body;
      if (!scores && !state) return new HttpError.BadRequest().send(reply);

      reply.send();
    }
  );
  // TODO: handle stats
  fastify.patch(
    "/:match_id/players/:account_id",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            match_id: { type: "number" },
            account_id: { type: "number" }
          },
        },
        body: {
          type: "object",
          properties: {},
        },
      },
    },
    function handler(request, reply) {
      new HttpError.NotImplemented().send();
    }
  );
  done();
}
