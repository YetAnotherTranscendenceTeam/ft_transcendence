"use strict";

import { getActiveSecret, deactivate } from "../../app/database.js";
import YATT, { HttpError, properties } from "yatt-utils";
import { verifyTOTP } from "../../utils/verifyTOTP.js";

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

  fastify.post("/app/deactivate", { schema, preHandler: fastify.verifyBearerAuth }, async function handler(request, reply) {
    const { account_id } = request;
    const { otp } = request.body;

    // Verify otp
    const otpauth = getActiveSecret.get(account_id);
    if (!otpauth?.secret || !verifyTOTP(otp, otpauth.secret)) {
      throw new HttpError.Forbidden();
    }

    // Update credential database
    await YATT.fetch(`http://credentials:3000/accounts/${account_id}/otp_methods/app`, {
      method: "DELETE"
    });

    deactivate.run(account_id);
    reply.code(204);
  });

  done();
}
