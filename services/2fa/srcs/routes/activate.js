"use strict";

import { activate, getInactiveSecret, confirm } from "../app/database.js";
import { HttpError, properties } from "yatt-utils";
import crypto from "node:crypto";

export default function router(fastify, opts, done) {
  fastify.get("/activate", { preHandler: fastify.verifyBearerAuth }, async function handler(request, reply) {
    const { account_id } = request;

    try {
      const secret = BigInt(`0x${crypto.randomBytes(20).toString('hex')}`).toString(32);
      activate.run(account_id, secret);
      reply.send({ secret });
    } catch (err) {
      if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
        throw new HttpError.Conflict();
      }
      console.error(err);
      throw err;
    }
  });

  const schema = {
    body: {
      type: "object",
      properties: {
        code: properties.twofactor_code,
      },
      required: ["code"],
      additionalProperties: false,
    }
  }

  fastify.post("/activate/verify", { schema, preHandler: fastify.verifyBearerAuth }, async function handler(request, reply) {
    const { account_id } = request;

    // db.transaction(() => {
    const secret = getInactiveSecret.get(account_id)?.secret;
    if (!secret) {
      throw new HttpError.Forbidden();
    }

    confirm.run(account_id);
    console.log("activated!!", secret);
    // })
    reply.code(204);
  });

  done();
}

