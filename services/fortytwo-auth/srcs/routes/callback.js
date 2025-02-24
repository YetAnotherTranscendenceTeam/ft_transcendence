"use strict";

import {
  client_id,
  client_secret,
  frontend_url,
  redirect_uri,
  token_manager_secret,
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

    if (!code) {
      return new HttpError.Unauthorized().redirect(reply, `${frontend_url}/fortytwo`)
    }
    try {
      const user = await getIntraUser(code);
      try {
        const account = await YATT.fetch(`http://credentials:3000/fortytwo/${user.id}`);
        return await authenticate(reply, account.account_id);
      } catch (err) {
        if (err instanceof HttpError && err.statusCode == 404) {
          return await createAccount(reply, user);
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
    if (!user?.email || !user?.id || !user?.login || !user?.image?.link) {
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

async function createAccount(reply, user) {
  const account = await YATT.fetch("http://credentials:3000/fortytwo", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: user.email,
      intra_user_id: user.id,
    }),
  });
  console.log("ACCOUNT CREATED: ", account);
  try {
    updateProfile(account.account_id, user.image.link, user.login)
  } catch (err) {
    if (err.statusCode === 409) {
      updateProfile(account.account_id, user.image.link)
    } else {
      throw err;
    }
  }
  await authenticate(reply, account.account_id);
}

async function updateProfile(account_id, avatar, username) {
  await YATT.fetch(`http://db-profiles:3000/${account_id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ avatar, username }),
  })
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
  //TODO: fix expire_at
  reply.redirect(`${frontend_url}/fortytwo?token=${auth.access_token}&expire_at=${new Date().toISOString()}`);
  console.log("AUTH: ", { account_id });
}
