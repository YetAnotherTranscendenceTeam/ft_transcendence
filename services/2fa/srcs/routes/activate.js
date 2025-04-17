"use strict";

import { activate, getInactiveSecret, confirm } from "../app/database.js";
import { HttpError, properties } from "yatt-utils";
import crypto from "node:crypto";
import { getQRCode } from "../utils/qrcode.js";
import { base32 } from "rfc4648";

export default function router(fastify, opts, done) {
  fastify.get("/activate", { preHandler: fastify.verifyBearerAuth }, async function handler(request, reply) {
    const { account_id } = request;

    try {
      const secret = base32.stringify(crypto.randomBytes(20));
      console.log(secret);
      activate.run(account_id, secret);
      reply.send({ string: getQRCode(secret) });
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

    const secret = getInactiveSecret.get(account_id)?.secret;
    if (!secret) {
      throw new HttpError.Forbidden();
    }
    reply.code(204);
  });

  done();
}

