"use strict";

import { PASSWORD_PEPPER } from "../app/env.js";
import YATT, { HttpError, properties } from "yatt-utils";

export default function passwordRoutes(fastify, opts, done) {
  let schema = {
    body: {
      oneOf: [
        {
          type: "object",
          properties: {
            email: properties.email,
            password: properties.password,
          },
          required: ["email", "password"],
          additionalProperties: false,
        },
        {
          type: "object",
          properties: {
            payload: { type: "string" },
            otp: properties.otp,
          },
          required: ["payload", "otp"],
          additionalProperties: false,
        }
      ]
    },
  };

  fastify.post("/", { schema }, async function handler(request, reply) {
    const { email, password, payload, otp } = request.body;
    let account_id;

    // Handle as a regular request
    if (!payload) {
      let account;
      try {
        account = await YATT.fetch(`http://credentials:3000/password/${email}`);
      } catch (err) {
        throw err instanceof HttpError && err.statusCode === 404 ? new HttpError.Unauthorized() : err;
      }

      // Make sure the password is correct
      if (!await YATT.crypto.verifyPassword(password, account.hash, account.salt, PASSWORD_PEPPER)) {
        throw new HttpError.Unauthorized();
      }

      // Check second authentication method
      if (account.second_factor !== "none") {
        return require2FA(reply, account.account_id, account.second_factor);
      }
      account_id = account.account_id;
    }

    // Handle as a 2FA request
    else {
      let decode;
  
      try {
        decode = fastify.jwt.two_fa.verify(payload);
      } catch (err) {
        throw new HttpError.Unauthorized();
      }

      await YATT.fetch(`http://2fa:3000/${decode.method}/verify`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${fastify.tokens.get("two_fa")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ account_id: decode.account_id, otp }),
      });
      account_id = decode.account_id;
    }

    // Generate tokens
    const tokens = await YATT.fetch(`http://token-manager:3000/${account_id}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${fastify.tokens.get("token_manager")}`,
      },
    });

    // Set refresh_token cookie
    reply.setCookie("refresh_token", tokens.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/token",
    });

    // Send access_token
    reply.send({ access_token: tokens.access_token, expire_at: tokens.expire_at });
  });

  async function require2FA(reply, account_id, method) {
    const payload = fastify.jwt.two_fa.sign({ account_id, method });

    reply.code(202).send({ statusCode: 202, code: "2FA_VERIFICATION", payload })
  }

  done();
}
