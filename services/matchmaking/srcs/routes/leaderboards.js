"use strict";

export default function router(fastify, opts, done) {
  fastify.get("/leaderboards", async function handler(connection, request) {
    return fastify.leaderboards;
  });

  done();
};
