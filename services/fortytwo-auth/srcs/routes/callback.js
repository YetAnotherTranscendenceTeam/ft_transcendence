"use strict";

import {
  client_id,
  client_secret,
  frontend_url,
  redirect_uri,
} from "../app/env.js";
import YATT, { HttpError } from "yatt-utils";

export default function routes(fastify, opts, done) {
  let schema = {
    summary: "Process 42 API OAuth callback and set JWT",
    description:
      "Redirect to frontend 42 API authentication page. On success url query parameters include \
      an `access_token` and it's associated `expire_at` timestamp. It also sets a `refresh_token` cookie. \
      On error, the query parameters include a `statusCode`, `code`, `error` and `message`",
    tags: ["Authentication"],
    query: {
      type: "object",
      required: ["code"],
      properties: {
        code: { type: "string", description: "OAuth authorization code" },
      },
    },
    response: {
      302: {
        description: "Redirect to frontend with JWT",
        headers: {
          Location: { type: "string", format: "uri" },
        },
      },
    },
  };

  fastify.get("/callback", { schema }, async function handler(request, reply) {
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
        return err.redirect(reply, `${frontend_url}/fortytwo`);
      }
      console.error(err);
      throw err;
    }
  });

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
    console.error(err);
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
    throw new HttpError.BadGateway();
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
  reply.setCookie("refresh_token", null /*TODO*/, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
  });
  reply.redirect(
    `${frontend_url}/fortytwo?token=${token}&expire_at=${new Date(
      decoded.exp * 1000
    ).toISOString()}`
  );
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
