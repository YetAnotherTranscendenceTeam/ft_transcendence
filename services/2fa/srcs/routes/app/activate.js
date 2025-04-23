"use strict";

import { generate, activate, getInactiveSecret } from "../../app/database.js";
import YATT, { HttpError, properties } from "yatt-utils";
import crypto from "node:crypto";
import { base32 } from "rfc4648";
import { generateOTPAuth } from "../../utils/generateOTPAuth.js";
import { verifyTOTP } from "../../utils/verifyTOTP.js";

export default function router(fastify, opts, done) {
  fastify.get("/app/activate", { preHandler: fastify.verifyBearerAuth }, async function handler(request, reply) {
    const { account_id } = request;

    try {
      const account = await YATT.fetch(`http://credentials:3000/${account_id}`);
      const secret = base32.stringify(crypto.randomBytes(20));
      generate.run(account_id, secret);
      reply.send({ otpauth: generateOTPAuth(secret, { email: account.email }) });
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
        otp: properties.otp,
      },
      required: ["otp"],
      additionalProperties: false,
    }
  }

  fastify.post("/app/activate/verify", { schema, preHandler: fastify.verifyBearerAuth }, async function handler(request, reply) {
    const { account_id } = request;
    const { otp } = request.body;

    // Verify otp
    const otpauth = getInactiveSecret.get(account_id);
    if (!otpauth?.secret || !verifyTOTP(otp, otpauth.secret)) {
      throw new HttpError.Forbidden();
    }

    // Update credential database
    await YATT.fetch(`http://credentials:3000/accounts/${account_id}/otp_methods/app`, {
      method: "POST"
    });

    activate.run(account_id);
    reply.code(204);
  });

  done();
}
