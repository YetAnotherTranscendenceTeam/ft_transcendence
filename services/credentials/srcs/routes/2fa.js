"use strict";

import { properties } from "yatt-utils";
import { HttpError } from "yatt-utils";
import db from "../app/database.js";
import * as dbAction from "../utils/dbAction.js";

export default function router(fastify, opts, done) {
  let schema = {
    description: "Enable a two-factor authentication method for an account",
    params: {
      type: "object",
      properties: {
        account_id: properties.account_id,
        method: properties.otp_method,
      },
      required: ["account_id", "method"],
      additionalProperties: false,
    },
  };

  fastify.post("/accounts/:account_id/otp_methods/:method", { schema }, async function handler(request, reply) {
    const { account_id, method } = request.params;

    try {
      return dbAction.addOTPMethod(account_id, method);
    } catch (err) {
      if (err.code == "SQLITE_CONSTRAINT_PRIMARYKEY") {
        throw err = new HttpError.Conflict();
      } else if (err.code == "SQLITE_CONSTRAINT_FOREIGNKEY") {
        throw err = new HttpError.NotFound();
      }
      throw err;
    }
  });

  schema.description = "Disable a two-factor authentication method for an account";

  fastify.delete("/accounts/:account_id/otp_methods/:method", { schema }, async function handler(request, reply) {
    const { account_id, method } = request.params;

    if (dbAction.removeOTPMethod(account_id, method).changes !== 1) {
      throw new HttpError.NotFound();
    }
    reply.code(204);
  });

  done();
}
