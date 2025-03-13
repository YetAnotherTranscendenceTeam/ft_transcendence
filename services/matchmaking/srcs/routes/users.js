"use strict";

import db from "../app/database.js";

export default function router(fastify, opts, done) {
  fastify.get("/users/:account_id", function handler(request, reply) {
    const users = db
      .prepare("SELECT * FROM matchmaking_users WHERE account_id = ?")
      .get(request.params.account_id);
    reply.send(users);
  });
  fastify.get("/users/:account_id/matches", function handler(request, reply) {
    const matches = db
      .prepare("SELECT * FROM matches WHERE players && ARRAY[?]")
      .all(request.params.account_id);
    reply.send(matches);
  });
  done();
}
