"use strict";

import YATT, { HttpError } from "yatt-utils";
import { generateTokens } from "../utils/generate.js";
import db from "../app/database.js";

export default function router(fastify, opts, done) {
  let schema = {
    headers: {
      type: 'object',
      properties: {
        'Cookie': { type: 'string' }
      },
      required: ['Cookie']
    },
  };

  fastify.post("/refresh", { schema }, async function handler(request, reply) {
    const token = request.cookies.refresh_token;
    let account_id;

    try {
      const decode = fastify.jwt.refresh.verify(token);
      account_id = decode.account_id;
    } catch (err) {
      reply.clearCookie("refresh_token", { path: "/token" });
      return new HttpError.Forbidden().send(reply);
    }
    // Remove refresh_token from the white list for one-time validity
    const deletion = db
      .prepare("DELETE FROM refresh_tokens WHERE account_id = ? AND token = ?")
      .run(account_id, token);
    if (deletion.changes === 0) {
      reply.clearCookie("refresh_token", { path: "/token" });
      return new HttpError.Forbidden().send(reply);
    }

    const tokens = generateTokens(fastify, account_id);

    // Set new refresh_token cookie
    YATT.setRefreshTokenCookie(reply, tokens);

    // Send fresh access_token
    reply.send({
      access_token: tokens.access_token,
      expire_at: tokens.expire_at
    });
    //console.log("REFRESH:", { account_id });
  });

  done();
}
