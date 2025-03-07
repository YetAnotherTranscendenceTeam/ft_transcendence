"use strict";

import { GameModes } from "../GameModes.js";


export default function router(fastify, opts, done) {

  fastify.get("/gamemodes", async function handler(request, reply) {
	reply.send(GameModes)
  });

  done();
}
