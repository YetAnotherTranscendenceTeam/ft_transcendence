"use strict";

import YATT, { HttpError } from "yatt-utils";
import { token_manager_secret } from "../app/env.js";

export default function router(fastify, opts, done) {
  const schema = {
    // TODO: patch validation
  }

  fastify.patch("/account", { schema }, async function handler(request, reply) {
    new HttpError.NotImplemented().send();
  });

  fastify.delete("/account", async function handler(request, reply) {
    const headers = {
      "Authorization": `Bearer ${request.acess_token}`,
    }

    // Delete account from credentials database
    await YATT.fetch(`http://credentials:3000/${request.account_id}`, {
      method: "DELETE"
    });

    // Revoke all refresh_tokens for this account
    await YATT.fetch(`http://token-manager:3000/${request.account_id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token_manager_secret}`,
      }
    });

    // Get avatars
    const avatars = await YATT.fetch(`http://avatars:3000`, { headers });

    // Delete avatars uploaded by this account
    await Promise.all(avatars.user.map(url => {
      YATT.fetch(`http://avatars:3000/?url=${url}`, { method: "DELETE", headers });
    }));
    // Delete from profile database
    await YATT.fetch(`http://db-profiles:3000/${request.account_id}`, {
      method: "DELETE"
    });

    // Get follows
    const follows = await YATT.fetch("http://social:3000/follows", { headers });
    // Delete follows
    await Promise.all(follows.map(follow => {
      YATT.fetch(`http://social:3000/follows/${follow.following}`, { method: "DELETE", headers })
    }))

    reply.clearCookie("refresh_token", { path: "/token" });
    reply.code(204).send();
  });

  done();
}
