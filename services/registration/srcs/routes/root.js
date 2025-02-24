import YATT, { HttpError, objects, properties } from "yatt-utils";
import { token_manager_secret } from "../app/env.js";

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
    response: {
      201: {
        description: "Successfull account creation",
        type: "object",
        properties: {
          access_token: properties.access_token,
          expire_at: properties.expire_at,
        },
        required: ["access_token", "expire_at"],
      },
      409: {
        description: "Email address is already associated with an account",
        type: "object",
        properties: {
          statusCode: properties.statusCode,
          code: properties.code,
          error: properties.error,
          message: properties.message,
        },
        required: ["statusCode", "code", "error", "message"],
      },
    },
  };

  fastify.post("/", { schema }, async function handler(request, reply) {
    const { email, password } = request.body;

    const hash = await YATT.crypto.hashPassword(password, pepper);
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
  done();
}

const pepper = process.env.PASSWORD_PEPPER
if (!pepper) {
  console.error("Missing environment variable: PASSWORD_PEPPER");
  process.exit(1);
}

async function authenticate(reply, account_id) {
  const auth = await YATT.fetch(`http://token-manager:3000/token/${account_id}`, {
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
  delete auth.refresh_token;
  reply.code(201).send(auth);
}
