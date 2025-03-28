"use strict";

import { OAuth2Client } from "google-auth-library";
import { google_client_id, token_manager_secret } from "../app/env.js";
import { getUser } from "../utils/getUser.js";
import YATT, { HttpError } from "yatt-utils";

const google = new OAuth2Client();

const schema = {
  body: {
    type: "object",
    properties: {
      token: { type: "string" },
    },
    required: ["token"],
    additionalProperties: false,
  }
}

export default function routes(fastify, opts, done) {
  fastify.post("/", { schema }, async function handler(request, reply) {
    const { token } = request.body;

    let user;

    // Decode jwt and extract user informations
    try {
      const ticket = await google.verifyIdToken({
        idToken: token,
        audience: google_client_id,
      });
      const payload = ticket.getPayload();
      user = getUser(payload);
      console.log(user);
    } catch (err) {
      console.log(err);
      if (err instanceof HttpError) {
        return err.send(reply);
      } else {
        return new HttpError.Unauthorized().send(reply);
      }
    }

    let tokens;

    try {
      // Fetch database for a matching account
      const account = await YATT.fetch(`http://credentials:3000/google/${user.id}`);
      // Authenticate user
      tokens = await authenticate(account.account_id);
    } catch (err) {
      if (err instanceof HttpError && err.statusCode == 404) {
        try {
          // Create an account and authenticate it
          tokens = await createAccount(user);
        } catch (err2) {
          if (err2 instanceof HttpError) {
            return err2.send(reply);
          }
          throw err2;
        }
      } else {
        throw err;
      }
    }
    reply.setCookie("refresh_token", tokens.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/token",
    });
    reply.send({
      access_token: tokens.access_token,
      expire_at: tokens.expire_at,
    });
  });

  done();
}

async function createAccount(user) {
  const account = await YATT.fetch("http://credentials:3000/google", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: user.email,
      google_id: user.id,
    }),
  });
  console.log("ACCOUNT CREATED: ", account);

  const tokens = await authenticate(account.account_id);
  const avatar = await uploadAvatar(user.picture, tokens.access_token).catch(() => undefined);

  try {
    // Patch profile avatar + 42Intra username as avatar
    await updateProfile(account.account_id, { avatar, username: user.username });
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
