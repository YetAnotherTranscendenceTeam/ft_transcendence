"use strict";

import { client_id, client_secret, redirect_uri } from "../app/env.js";
import YATT, { HttpError } from "yatt-utils";

export default function routes(fastify, opts, done) {
  fastify.get(
    "/callback",
    {
      schema: callbackSchema,
      onRequest: async (request, reply) => {
        try {
          await request.jwtVerify({ onlyCookie: true });
        } catch (err) {
          if (err.code == "FST_JWT_NO_AUTHORIZATION_IN_HEADER") return;
          if (err.code === "FST_JWT_AUTHORIZATION_TOKEN_INVALID") {
            reply.clearCookie("access_token", { path: "/" });
            throw new HttpError.Unauthorized("Invalid authorization token");
          }
          return;
        }
        throw new HttpError.BadRequest(
          "You are already authenticated with an active session"
        );
      },
    },
    async function handler(request, reply) {
      const { code } = request.query;

      try {
        const user = await getIntraUser(code);
        try {
          const account = await YATT.fetch(
            `http://credentials:3000/fortytwo/${user.id}`
          );
          console.log(account);
          return await setJWT(fastify, reply, account.id);
        } catch (err) {
          if (err instanceof HttpError && err.statusCode == 404) {
            return await createAccount(fastify, reply, user);
          }
          throw err;
        }
      } catch (err) {
        if (err instanceof HttpError) {
          return err.send(reply);
        }
        throw err;
      }
    }
  );

  done();
}

async function getIntraUser(code) {
  const token = await generateUserToken(code);
  try {
    const user = await YATT.fetch(`https://api.intra.42.fr/v2/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!user || !user.email || !user.id) {
      throw new HttpError.BadGateway();
    }
    return user;
  } catch (err) {
    if (err instanceof HttpError && err.statusCode == 429) {
      throw new HttpError.ServiceUnavailable();
    }
    throw err;
  }
}

async function generateUserToken(code) {
  const token = await YATT.fetch(`https://api.intra.42.fr/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      grant_type: "authorization_code",
      client_id,
      client_secret,
      code,
      redirect_uri,
    }),
  });
  if (!token || !token.access_token) {
    throw new HttpError.BadGatewayError();
  }
  return token.access_token;
}

async function setJWT(fastify, reply, id) {
  const token = fastify.jwt.sign({ id }, { expiresIn: "15m" });
  const decoded = fastify.jwt.decode(token);
  reply.setCookie("access_token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
  });
  return reply.send({
    token,
    expire_at: new Date(decoded.exp * 1000).toISOString(),
  });
}

async function createAccount(fastify, reply, user) {
  const account = await YATT.fetch(`http://credentials:3000/fortytwo`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: user.email,
      intra_user_id: user.id,
    }),
  });
  await setJWT(fastify, reply, account.id);
}

const callbackSchema = {
  query: {
    type: "object",
    required: ["code"],
    properties: {
      code: { type: "string" },
    },
  },
};
