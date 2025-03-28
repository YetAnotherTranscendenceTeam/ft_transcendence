"use strict";

import { client_id, client_secret, frontend_url, redirect_uri, token_manager_secret } from "../app/env.js";
import YATT, { HttpError } from "yatt-utils";
import { validateToken, validateUser } from "../utils/validate.js";

export default function routes(fastify, opts, done) {
  const schema = {
    query: {
      type: "object",
      properties: {
        code: { type: "string" },
      },
    },
  };

  fastify.get("/callback", { schema }, async function handler(request, reply) {
    const { code } = request.query;

    if (!code) {
      return new HttpError.Unauthorized().redirect(reply, `${frontend_url}/fortytwo`)
    }
    try {
      let tokens;

      // Exchange Intra code for user unformation
      const user = await getIntraUser(code);
      try {
        // Fetch database for a matching account
        const account = await YATT.fetch(`http://credentials:3000/fortytwo/${user.id}`);
        // Authenticate user
        tokens = await authenticate(account.account_id);
      } catch (err2) {
        if (err2 instanceof HttpError && err2.statusCode == 404) {
          // Create an account
          tokens = await createAccount(user);
        } else {
          throw err2;
        }
      }
      // Redirect back to frontend
      reply.setCookie("refresh_token", tokens.refresh_token, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/token",
      });
      reply.redirect(`${frontend_url}/fortytwo?token=${tokens.access_token}&expire_at=${tokens.expire_at}`);
    } catch (err) {
      if (err instanceof HttpError) {
        err.redirect(reply, `${frontend_url}/fortytwo`);
      } else {
        console.error(err);
        throw err;
      }
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

    if (!validateUser(user)) {
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
  if (!validateToken(token)) {
    throw new HttpError.BadGateway();
  }
  return token.access_token;
}

async function createAccount(user) {
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

  const tokens = await authenticate(account.account_id);
  const avatar = await uploadAvatar(user.image.link, tokens.access_token).catch(() => undefined);

  try {
    // Patch profile avatar + 42Intra username as avatar
    await updateProfile(account.account_id, { avatar, username: user.login });
  } catch (err) {
    if (err.statusCode === 409 && avatar) {
      // Username already in use
      try {
        // Patch avatar only
        await updateProfile(account.account_id, { avatar });
      } catch (error) {
        console.error(error);
      }
    }
  }
  return tokens;
}

export async function uploadAvatar(url, access_token) {
  const response = await fetch(url);
  if (!response.ok) {
    throw Error("Failed to download 42Intra profile picture");
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const contentType = response.headers.get('content-type');
  const base64String = buffer.toString('base64');

  const avatar = await YATT.fetch("http://avatars:3000/", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${access_token}`,
      "Content-Type": "text/plain",
    },
    body: `data:${contentType};base64,${base64String}`
  })
  return avatar.url;
}

async function updateProfile(account_id, body) {
  await YATT.fetch(`http://db-profiles:3000/${account_id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
}

async function authenticate(account_id) {
  const tokens = await YATT.fetch(`http://token-manager:3000/${account_id}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token_manager_secret}`,
    },
  }
  );
  return tokens;
}
