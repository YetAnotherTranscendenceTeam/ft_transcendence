"use strict";

import { OAuth2Client } from "google-auth-library";
import { GOOGLE_CLIENT_ID } from "../app/env.js";
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
      const ticket = await google.verifyIdToken({ idToken: token, audience: GOOGLE_CLIENT_ID });
      const payload = ticket.getPayload();
      user = getUser(payload);
    } catch (err) {
      throw err instanceof HttpError ? err : new HttpError.Unauthorized();
    }

    let tokens;

    try {
      // Fetch database for a matching account
      const account = await YATT.fetch(`http://credentials:3000/google/${user.id}`);

      // Check for a multi authentication method
      if (account.otp_methods.length !== 0) {
        return require2FA(reply, account.account_id);
      }

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
    YATT.setRefreshTokenCookie(reply, tokens);
    reply.send({
      access_token: tokens.access_token,
      expire_at: tokens.expire_at,
    });
  });

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

  async function uploadAvatar(url, access_token) {
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

  async function require2FA(reply, account_id) {
    const payload_token = fastify.jwt.auth_2fa.sign({ account_id }, { expiresIn: "5m" });

    reply.code(202).send({ statusCode: 202, code: "2FA_VERIFICATION", payload_token });
  }

  async function authenticate(account_id) {
    const tokens = await YATT.fetch(`http://token-manager:3000/${account_id}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${fastify.tokens.get("token_manager")}`,
      },
    }
    );
    return tokens;
  }

  done();
}
