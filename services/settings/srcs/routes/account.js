"use strict";

import YATT, { HttpError, properties } from "yatt-utils";
import { PASSWORD_PEPPER } from "../app/env.js";

export default function router(fastify, opts, done) {
  let schema = {
    body: {
      type: "object",
      properties: {
        email: properties.email,
        password: properties.password,
        old_password: properties.password,
      },
      required: ["old_password"],
      additionalProperties: false,
    }
  }

  fastify.patch("/account", { schema }, async function handler(request, reply) {
    const { old_password } = request.body;

    // Make sure at least one change is requested
    if (Object.keys(request.body).length == 1) {
      throw new HttpError.BadRequest();
    }

    // Check user authentication method
    const account = await YATT.fetch(`http://credentials:3000/${request.account_id}`);
    if (account.auth_method !== "password_auth") {
      throw new HttpError.Forbidden();
    }

    // Check that old_password is correct
    const credentials = await YATT.fetch(`http://credentials:3000/password/${account.email}`);
    if (!await YATT.crypto.verifyPassword(old_password, credentials.hash, credentials.salt, PASSWORD_PEPPER)) {
      throw new HttpError.Forbidden();
    }
    delete request.body.old_password;

    // Check for a multi authentication method
    if (account.second_factor !== "none") {
      return require2FA(reply, { account_id: request.account_id, body: request.body });
    }

    await updateCredentials(reply, request);
  });

  async function require2FA(reply, payload) {
    const payload_token = fastify.jwt.self.sign(payload, { expiresIn: "5m" });

    reply.code(202).send({ statusCode: 202, code: "2FA_VERIFICATION", payload_token });
  }

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

  fastify.patch("/account/2fa", { schema }, async function handler(request, reply) {
    const { payload_token, otp_method, otp } = request.body;

    let decode;

    try {
      decode = fastify.jwt.self.verify(payload_token);
    } catch (err) {
      console.error(err);
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

    request.body = decode.body;
    await updateCredentials(reply, request);
  });

  async function updateCredentials(reply, request) {

    // Hash new password
    request.body.password &&= await YATT.crypto.hashPassword(request.body.password, PASSWORD_PEPPER);

    // Update credential database
    await YATT.fetch(`http://credentials:3000/password/${request.account_id}`, {
      method: "PATCH",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(request.body),
    });

    reply.code(204);
  }

  fastify.delete("/account", async function handler(request, reply) {
    const headers = {
      "Authorization": `Bearer ${request.acess_token}`,
    }

    // Delete account from credentials database
    await YATT.fetch(`http://credentials:3000/${request.account_id}`, {
      method: "DELETE"
    });

    // Revoke all refresh_tokens for this account
    await YATT.fetch(`http://token-manager:3000/${request.account_id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${fastify.tokens.get("token_manager")}`,
      }
    });

    // Get avatars
    const avatars = await YATT.fetch(`http://avatars:3000`, { headers });

    // Delete avatars uploaded by this account
    await Promise.all(avatars.user.map(url => {
      YATT.fetch(`http://avatars:3000/?url=${url}`, { method: "DELETE", headers });
    }));
    // Delete from profile database
    await YATT.fetch(`http://db-profiles:3000/${request.account_id}`, {
      method: "DELETE"
    });

    // Get follows
    const follows = await YATT.fetch("http://social:3000/follows", { headers });
    // Delete follows
    await Promise.all(follows.map(follow => {
      YATT.fetch(`http://social:3000/follows/${follow.following}`, { method: "DELETE", headers })
    }))

    reply.clearCookie("refresh_token", { path: "/token" });
    reply.code(204).send();
  });

  done();
}
