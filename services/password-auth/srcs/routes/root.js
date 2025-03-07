"use strict";

import { pepper, token_manager_secret } from "../app/env.js";
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
    try {
      const account = await YATT.fetch(
        `http://credentials:3000/password/${email}`
      );
      if (await YATT.crypto.verifyPassword(password, account.hash, account.salt, pepper)) {
        const auth = await YATT.fetch(
          `http://token-manager:3000/token/${account.account_id}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token_manager_secret}`,
            },
          }
        );
        reply.setCookie("refresh_token", auth.refresh_token, {
          httpOnly: true,
          secure: true,
          sameSite: "strict",
          path: "/token/refresh",
        });
        return reply.send(auth);
      }
    } catch (err) {
      if (err instanceof HttpError) {
        if (err.statusCode !== 404) return err.send(reply);
      } else {
        throw err;
      }
    }
    new HttpError.Unauthorized().send(reply);
  });

  done();
}
