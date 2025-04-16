"use strict";

import { HttpError } from "yatt-utils";
import db from "../app/database.js";

export default function router(fastify, opts, done) {
  let schema = {};

  fastify.post("/", { schema }, async function handler(request, reply) {
    throw new HttpError.NotImplemented();
  });

  done();
}
