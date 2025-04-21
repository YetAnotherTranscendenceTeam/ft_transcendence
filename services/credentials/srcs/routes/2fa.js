"use strict";

import { properties } from "yatt-utils";
import { HttpError } from "yatt-utils";
import db from "../app/database.js";

export default function router(fastify, opts, done) {
  const schema = {
    description: "Modify an account two-factor authentication method",
    params: {
      type: "object",
      properties: {
        account_id: properties.account_id,
      },
      required: ["account_id"],
      additionalProperties: false,
    },
    body: {
      type: "object",
      properties: {
        method: properties.otp_method,
      },
      required: ["method"],
      additionalProperties: false,
    }
  };

  const update2FA = db.prepare(`
    UPDATE accounts
    SET second_factor = ?
    WHERE account_id = ?
  `);

  fastify.patch("/2fa/:account_id", { schema }, async function handler(request, reply) {
    const { account_id } = request.params;
    const { method } = request.body;

    const update = update2FA.run(method, account_id);
    if (update.changes === 0) {
      throw new HttpError.NotFound();
    }
    reply.code(204);
  });

  done();
}
