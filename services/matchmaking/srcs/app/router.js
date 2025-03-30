"use strict";

import root from "../routes/root.js";
import users from "../routes/users.js"
import matches from "../routes/matches.js"
import ws from "../routes/lobbieconnection.js"
import tournaments from "../routes/tournaments.js"

export default function router(fastify, opts, done) {
  fastify.register(root);
  fastify.register(users, {prefix: "/users"});
  fastify.register(matches, {prefix: "/matches"});
  fastify.register(tournaments, {prefix: "/tournaments"});
  fastify.register(ws, {prefix: "/lobbieconnection"});
  done();
}
