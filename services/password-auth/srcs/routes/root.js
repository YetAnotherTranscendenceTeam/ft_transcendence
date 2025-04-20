"use strict";

import { PASSWORD_PEPPER } from "../app/env.js";
import YATT, { HttpError, properties } from "yatt-utils";

export default function passwordRoutes(fastify, opts, done) {
  let schema = {
    body: {
      type: "object",
      properties: {
        email: properties.email,
        password: properties.password,
      },
      required: ["email", "password"],
      additionalProperties: false,
    },
  };

  fastify.post("/", { schema }, async function handler(request, reply) {
    const { email, password } = request.body;

    let account;

    try {
      // Retrieve credentials for the requested account
      account = await YATT.fetch(`http://credentials:3000/password/${email}`);
    } catch (err) {
      throw err instanceof HttpError && err.statusCode === 404 ? new HttpError.Unauthorized() : err;
    }

    // Make sure password is correct
    if (!await YATT.crypto.verifyPassword(password, account.hash, account.salt, PASSWORD_PEPPER)) {
      throw new HttpError.Unauthorized();
    }

    // Check for a multi authentication method
    if (account.second_factor !== "none") {
      return require2FA(reply, account.account_id);
    }

    // Send authentication tokens
    await authenticate(reply, account.account_id);
  });

  schema = {
    body: {
      type: "object",
      properties: {
        payload_token: properties.payload_token,
        otp_method: properties.otp_method,
        otp: properties.otp,
      },
      required: ["payload_token", "otp_method", "otp"],
      additionalProperties: false,
    }
  }

  fastify.post("/2fa", { schema }, async function handler(request, reply) {
    const { payload_token, otp_method, otp } = request.body;

    let decode;

    try {
      decode = fastify.jwt.self.verify(payload_token);
    } catch (err) {
      throw new HttpError.Unauthorized();
    }

    // Make sure otp is valid
    await YATT.fetch(`http://2fa:3000/${otp_method}/verify`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${fastify.tokens.get("two_fa")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ account_id: decode.account_id, otp }),
    });

    // Send authentication tokens
    await authenticate(reply, decode.account_id);
  });

  async function require2FA(reply, account_id) {
    const payload_token = fastify.jwt.self.sign({ account_id  }, { expiresIn: "5m" });

    reply.code(202).send({ statusCode: 202, code: "2FA_VERIFICATION", payload_token });
  }

  async function authenticate(reply, account_id) {
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
  }

  done();
}
