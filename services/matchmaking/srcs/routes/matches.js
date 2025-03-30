"use strict";

import db from "../app/database.js";

export default function router(fastify, opts, done) {
  fastify.get("/:match_id", function handler(request, reply) {
    const match = db
      .prepare("SELECT * FROM matches WHERE match_id = ?")
      .all(request.params.match_id);
    if (!match)
      new HttpError.NotFound().send(reply);
    reply.send(match);
  });
  done();
}
