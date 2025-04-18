"use strict";

import { getActiveSecret, deactivate } from "../../app/database.js";
import { HttpError, properties } from "yatt-utils";
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

    const otpauth = getActiveSecret.get(account_id);
    if (!otpauth?.secret || generateTOTP(otpauth.secret) !== request.body.otp) {
      throw new HttpError.Forbidden();
    }

    deactivate.run(account_id);
    reply.code(204);
  });

  done();
}
