"use strict";

import { token_manager_secret } from "../app/env.js";
import verifyPassword from "../verifyPassword.js";
import YATT, { HttpError, objects, properties } from "yatt-utils";

export default function passwordRoutes(fastify, opts, done) {
  let schema = {
    summary: "Authenticate using password",
    description:
      "Check that the `account_id` accounts exists, and that `password` matches the account credentials. If both of theses parameters are valid, a JWT token is generated",
    tags: ["Authentication"],
    body: {
      type: "object",
      required: ["email", "password"],
      properties: {
        email: properties.email,
        password: properties.password,
      },
      additionalProperties: false,
    },
    response: {
      200: {
        description: "Authorization granted",
        type: "object",
        properties: objects.auth_token,
        required: ["access_token", "expire_at"],
      },
      401: {
        description: "Authorization refused",
        type: "object",
        properties: objects.errorBody,
      },
    },
  };

  fastify.post("/", { schema }, async function handler(request, reply) {
    const { email, password } = request.body;
    try {
      const account = await YATT.fetch(
        `http://credentials:3000/password/${email}`
      );
      if (await verifyPassword(password, account.hash, account.salt)) {
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
          path: "/api/refresh-token",
        });
        return reply.send(auth);
      }
    } catch (err) {
      if (err instanceof HttpError && err.statusCode !== 404) {
        return err.send(reply);
      }
      throw err;
    }
    new HttpError.Unauthorized().send(reply);
  });
  done();
}
