"use strict";

import db from "../app/database.js";

export default function router(fastify, opts, done) {
  fastify.get("/:match_id", {
    schema: {
      params: { type: "object", properties: { match_id: { type: "number" } } },
    }
  }, function handler(request, reply) {
    const match = db
      .prepare(`
        SELECT 
          matches.*,
          json_group_array(
            json_object(
              'account_id', match_players.account_id,
              'team_index', match_players.team_index
            )
          ) as players
        FROM 
          matches
        JOIN 
          match_players
        ON 
          matches.match_id = match_players.match_id
        WHERE match_players.match_id = ?
        `)
      .get(request.params.match_id);
    if (!match || match.match_id === null)
      return new HttpError.NotFound().send(reply);
    match.players = JSON.parse(match.players);
    reply.send(match);
  });
  done();
}
