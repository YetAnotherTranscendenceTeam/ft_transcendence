import YATT, { HttpError, objects, properties } from "yatt-utils";
import { PASSWORD_PEPPER } from "../app/env.js";

export default function routes(fastify, opts, done) {
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

    const hash = await YATT.crypto.hashPassword(password, PASSWORD_PEPPER);
    // Add account to database
    try {
      const newAccount = await YATT.fetch(`http://credentials:3000/password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          hash: hash.hash,
          salt: hash.salt,
        }),
      });
      console.log("ACCOUNT CREATED:", {
        account_id: newAccount.account_id,
        email: email,
        "auth-method": "password",
      });
      return authenticate(reply, newAccount.account_id);
    } catch (err) {
      if (err instanceof HttpError) {
        if (err.statusCode == 409) {
          return reply.code(409).send(objects.emailInUse);
        }
        // console.error(err);
        return err.send(reply);
      }
      // console.error(err);
      throw err;
    }
  });

  async function authenticate(reply, account_id) {
    const tokens = await YATT.fetch(`http://token-manager:3000/${account_id}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${fastify.tokens.get()}`,
      },
    }
    );
    YATT.setRefreshTokenCookie(reply, tokens);
    reply.code(201).send({
      access_token: tokens.access_token,
      expire_at: tokens.expire_at
    });
  };

  done();
}
