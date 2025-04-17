"use strict";

import { HttpError, properties } from "yatt-utils";
import db, { getActiveSecret } from "../app/database.js";
import { generateTOTP } from "../utils/verify.js";

export default function router(fastify, opts, done) {
  let schema = {
    body: {
      type: "object",
      properties: {
        code: properties.twofactor_code,
      },
      required: ["code"],
      additionalProperties: false,
    }
  };

  fastify.post("/verify", { schema, preHandler: fastify.verifyBearerAuth }, async function handler(request, reply) {
    const { account_id } = request;

    const secret = getActiveSecret.get(account_id)?.secret;
    if (!secret) {
      throw new HttpError.Forbidden();
    }

    generateTOTP(request.body.code, secret);

    throw new HttpError.NotImplemented();
  });

  done();
}
