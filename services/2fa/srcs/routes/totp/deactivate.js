"use strict";

import { getActiveSecret, deactivate } from "../../app/database.js";
import YATT, { HttpError, properties } from "yatt-utils";
import { generateTOTP } from "../../utils/generateTOTP.js";

export default function router(fastify, opts, done) {
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

  fastify.post("/totp/deactivate", { schema, preHandler: fastify.verifyBearerAuth }, async function handler(request, reply) {
    const { account_id } = request;

    // Verify otp
    const otpauth = getActiveSecret.get(account_id);
    if (!otpauth?.secret || generateTOTP(otpauth.secret) !== request.body.otp) {
      throw new HttpError.Forbidden();
    }

    // Update credential database
    await YATT.fetch(`http://credentials:3000/2fa/${account_id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ method: "none" }),
    });

    deactivate.run(account_id);
    reply.code(204);
  });

  done();
}
