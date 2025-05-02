"use strict";

import { activityEvents } from "../ActivityEvents.js";

export default function router(fastify, opts, done) {

  fastify.get("/notify", async function handler(request, reply) {
    activityEvents.addSubscription(reply);

    request.socket.on("close", () => {
      activityEvents.removeSubscription(reply);
    });
  });

  done();
};
