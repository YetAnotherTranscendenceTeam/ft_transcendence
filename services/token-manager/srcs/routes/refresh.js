"use strict";

import { HttpError } from "yatt-utils";
import { generateTokens } from "../utils/generate.js";

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
      console.error(err);
      return new HttpError.Unauthorized().send(reply);
    }
    const tokens = generateTokens(fastify, account_id);
    reply.setCookie("refresh_token", tokens.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/token/refresh",
    });
    // Send fresh access_token
    delete tokens.refresh_token;
    reply.send(tokens);
    console.log("REFRESH:", { account_id });
  });

  done();
}
