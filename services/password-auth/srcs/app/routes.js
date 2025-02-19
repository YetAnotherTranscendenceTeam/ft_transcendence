"use strict";

import verifyPassword from "../verifyPassword.js";
import YATT, { HttpError, objects, properties } from "yatt-utils";

export default function passwordRoutes(fastify, opts, done) {
  let schema = {
    summary: "Authenticate using password",
    description: "",
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
        const token = fastify.jwt.sign(
          { id: account.id },
          { expiresIn: "15m" }
        );
        const decoded = fastify.jwt.decode(token);
        reply.setCookie("access_token", token, {
          httpOnly: true,
          secure: true,
          sameSite: "strict",
          path: "/",
        });
        return reply.send({
          access_token: token,
          expire_at: new Date(decoded.exp * 1000).toISOString(),
        });
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
