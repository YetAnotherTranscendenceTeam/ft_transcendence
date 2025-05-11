"use strict";

import YATT from "yatt-utils";

export default function router(fastify, opts, done) {
  fastify.get("/me", async function handler(request, reply) {
    const account_id = request.account_id;

    // Get base profile
    const profile = await YATT.fetch(`http://profiles:3000/${account_id}`);

    // Add credentials
    profile.credentials = await YATT.fetch(`http://credentials:3000/${account_id}`);
    try {
      // Add game related infos
      const { last_match, last_tournament, matchmaking_users } = await YATT.fetch(`http://matchmaking:3000/users/${account_id}`,
        {
          headers: {
            Authorization: request.headers.authorization,
          },
        }
      );

      profile.last_match = last_match;
      profile.last_tournament = last_tournament;
      profile.matchmaking_users = matchmaking_users;
    } catch (err) {
      profile.last_match = null;
      profile.last_tournament = null;
      profile.matchmaking_users = [];
    }

    reply.send(profile);
  });

  done();
}
