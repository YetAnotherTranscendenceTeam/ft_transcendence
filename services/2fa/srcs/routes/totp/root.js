"use strict";

import { HttpError, properties } from "yatt-utils";
import db, { getActiveSecret } from "../../app/database.js";
import { generateTOTP } from "../../utils/generateTOTP.js";
import YATT from "yatt-utils";

export default function router(fastify, opts, done) {
  let schema = {
    body: {
      type: "object",
      properties: {
        otp: properties.otp,
      },
      required: ["otp"],
      additionalProperties: false,
    }
  };

  fastify.post("/totp/verify", { schema, preHandler: fastify.verifyBearerAuth }, async function handler(request, reply) {
    const { account_id } = request;
    const { otp } = request.body;

    const otpauth = getActiveSecret.get(account_id);
    console.log("get active", otpauth);
    if (!otpauth?.secret || generateTOTP(otpauth.secret) !== otp) {
      throw new HttpError.Forbidden();
    }

    const tokens = await YATT.fetch(`http://token-manager:3000/${account_id}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${fastify.tokens.get("token_manager")}`,
      },
    });

    reply.setCookie("refresh_token", tokens.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/token",
    });
    reply.send({ access_token: tokens.access_token, expire_at: tokens.expire_at });
  });

  done();
}
