"use strict";

import root from "../routes/root.js";
import users from "../routes/users.js"
import matches from "../routes/matches.js"
import protected_matches from "../routes/protected/matches.js"
import ws from "../routes/lobbieconnection.js"
import tournaments from "../routes/tournaments.js"
import leaderboards from "../routes/leaderboards.js";

import bearerAuth from "@fastify/bearer-auth";
import { HttpError } from "yatt-utils";

function protected_router(fastify, opts, done) {
  
  const serviceAuthorization = (token, request) => {
    try {
      fastify.jwt.match_management.verify(token);
      request.token = token;
    } catch (err) {
      return false;
    }
    return true;
  };
  fastify.register(bearerAuth, {
    auth: serviceAuthorization,
    errorResponse: (err) => {
      return new HttpError.Unauthorized().json();
    },
  });
  fastify.register(protected_matches, {prefix: "/matches"});
  done();
}

export default function router(fastify, opts, done) {
  fastify.register(root);
  fastify.register(users, {prefix: "/users"});
  fastify.register(matches, {prefix: "/matches"});
  fastify.register(tournaments, {prefix: "/tournaments"});
  fastify.register(ws, {prefix: "/lobbieconnection"});
  fastify.register(leaderboards);
  fastify.register(protected_router);
  done();
}
