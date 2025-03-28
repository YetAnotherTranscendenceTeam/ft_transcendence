"use strict";

import { HttpError, objects, properties } from "yatt-utils";
import getInfos from "../utils/getInfos.js";

export default function router(fastify, opts, done) {
  fastify.get("/me", async function handler(request, reply) {
    const account_id = request.account_id;

    try {
      const user = await getInfos(account_id, true);
      reply.send(user);
    } catch (err) {
      console.log(err);
      if (err instanceof HttpError) {
        if (err.statusCode === 404) {
          reply.code(404).send(objects.accountNotFound);
        } else {
          err.send(reply);
        }
      } else {
        throw err;
      }
    }
  });

  done();
}
