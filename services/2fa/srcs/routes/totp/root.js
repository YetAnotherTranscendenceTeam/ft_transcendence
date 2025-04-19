"use strict";

import { HttpError, properties } from "yatt-utils";
import { getActiveSecret } from "../../app/database.js";
import { verifyTOTP } from "../../utils/verifyTOTP.js";

export default function router(fastify, opts, done) {
  let schema = {
    body: {
      type: "object",
      properties: {
        account_id: properties.account_id,
        otp: properties.otp,
      },
      required: ["account_id", "otp"],
      additionalProperties: false,
    }
  };

  fastify.post("/totp/verify", { schema }, async function handler(request, reply) {
    const { account_id, otp } = request.body;

    const otpauth = getActiveSecret.get(account_id);
    console.log("get active", otpauth);
    if (!otpauth?.secret || !verifyTOTP(otp, otpauth.secret)) {
      throw new HttpError.Forbidden();
    }

    reply.code(204);
  });

  done();
}
