"use strict";

import YATT, { HttpError } from "yatt-utils";
import db from "../app/database.js";

const getMatch = db.prepare(`
SELECT json_object(
  'match_id', m.match_id,
  'tournament_id', m.tournament_id,
  'gamemode', m.gamemode,
  'state', m.state,
  'created_at', m.created_at,
  'updated_at', m.updated_at,
  'teams', json_group_array(
    json_object(
      'team_index', mt.team_index,
      'name', mt.name,
      'score', mt.score,
      'winning', mt.winning
    )
  ),
  'players', (
    SELECT json_group_array(
      json_object(
        'account_id', match_players.account_id,
        'team_index', match_players.team_index,
        'player_index', match_players.player_index,
        'win_probability', match_players.win_probability,
        'begin_rating', match_players.begin_rating,
        'end_rating', match_players.end_rating,
        'created_at', match_players.created_at,
        'updated_at', match_players.updated_at
      )
    )
    FROM match_players
    WHERE match_players.match_id = m.match_id
  )
) AS match_json
FROM matches m
JOIN match_teams mt ON mt.match_id = m.match_id
WHERE m.match_id = ?
GROUP BY m.match_id;
  `);

export default function router(fastify, opts, done) {
  fastify.get(
    "/:match_id",
    {
      schema: {
        params: {
          type: "object",
          required: ["match_id"],
          properties: {
            match_id: {
              type: "number"
            }
          }
        },
      },
    },
    async function handler(request, reply) {
      const match_Id = request.params.match_id;
      const query_res = getMatch.get(match_Id);
      if (!query_res) return new HttpError.NotFound().send(reply);

      const match = JSON.parse(query_res.match_json);
      const players = [];
      for (const player of match.players) {
        players.push(player);
      }
      const profiles = await YATT.fetch(
        `http://profiles:3000/?filter[account_id]=${players.map((player) => player.account_id).join(",")}`
      );
      for (let player of players) {
        player.profile = profiles.find((profile) => profile.account_id === player.account_id);
      }
      reply.send(match);
    }
  );
  done();
}
