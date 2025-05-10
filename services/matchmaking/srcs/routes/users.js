"use strict";

import { HttpError, properties } from "yatt-utils";
import db from "../app/database.js";
import YATT from "yatt-utils";
import { MatchState } from "../Match.js";
import { GameModes } from "../GameModes.js";
import { GameModeType } from "yatt-lobbies";

// get elo datapoints per gamemode for a user based on match history
// limit to n datapoints that are evenly spaced
const getEloDatapoints = db.prepare(
`
  WITH ranked_matches AS (
    SELECT
      begin_rating,
      end_rating,
      matches.match_id,
      matches.gamemode,
      matches.created_at,
      matches.updated_at,
      NTILE(20) OVER win AS rn
    FROM matches
    JOIN match_players
    ON matches.match_id = match_players.match_id
    WHERE
      match_players.account_id = ?
      AND match_players.end_rating IS NOT NULL
    WINDOW win AS (PARTITION BY matches.gamemode ORDER BY matches.match_id DESC)
  ),
  LAGGED_RANKED_MATCHES AS (
    SELECT
      *,
      LAG(rn, 1, 0) OVER (PARTITION BY gamemode ORDER BY match_id DESC) AS prev_rn,
      LEAD(rn, 1, 0) OVER (PARTITION BY gamemode ORDER BY match_id DESC) AS next_rn,
      LAST_VALUE(rn) OVER (PARTITION BY gamemode ORDER BY match_id DESC) AS last_rn
    FROM ranked_matches
  )
  SELECT end_rating as rating, gamemode
  FROM LAGGED_RANKED_MATCHES
  WHERE
   (rn = last_rn AND next_rn = 0)
    OR (NOT rn = prev_rn)
  ORDER BY match_id DESC
`
)

export default function router(fastify, opts, done) {
  fastify.get("/:account_id", {
    preHandler: fastify.verifyBearerAuth,
  }, function handler(request, reply) {
    const matchmaking_users = db
      .prepare("SELECT gamemode, rating, match_count, created_at, updated_at FROM matchmaking_users WHERE account_id = ?")
      .all(request.params.account_id);
    let last_match = db
      .prepare(`
        SELECT
          matches.*
        FROM
          match_players
        JOIN
          matches
        ON
          matches.match_id = match_players.match_id
        WHERE match_players.account_id = ?
        ORDER BY matches.match_id DESC
        LIMIT 1
      `)
      .get(request.params.account_id) || null;
    let last_tournament = db.prepare(`
      SELECT
        tournaments.*
      FROM
        tournament_players
      JOIN
        tournaments
      ON
        tournaments.tournament_id = tournament_players.tournament_id
      WHERE tournament_players.account_id = ?
      ORDER BY tournaments.tournament_id DESC
      LIMIT 1
    `).get(request.params.account_id) || null;

    const elo_datapoints = getEloDatapoints.all(request.params.account_id);
    for (let user of matchmaking_users) {
      if (GameModes[user.gamemode]?.type === GameModeType.RANKED) {
        user.elo_datapoints = elo_datapoints.filter((datapoint) => datapoint.gamemode === user.gamemode)
        .map((datapoint) => Math.floor(datapoint.rating));
      }
    }
    reply.send({matchmaking_users, last_match, last_tournament});
  });
  fastify.get("/:account_id/matches", {
    preHandler: fastify.verifyBearerAuth,
    schema: {
      query: {
        type: "object",
        properties: {
          limit: properties.limit,
          offset: properties.offset,
          filter: {
            type: "object",
            properties: {
              state: { type: "array", items: {
                type:"number",
                enum: Object.values(MatchState)
              }},
              gamemode: { type: "array", items: {
                type: "string",
                enum: Object.keys(GameModes)
              }},
              winning: { type: "array", items: {
                type: "number",
                enum: [0, 1]
              }},
              player_index: { type: "array", items: {
                type: "number"
              }},
            },
            additionalProperties: false,
          },
          order: {
            type: "object",
            properties: {
              match_id: properties.sort,
              gamemode: properties.sort,
              winning: properties.sort,
              player_index: properties.sort,
              state: properties.sort,
            },
            additionalProperties: false,
          },
          additionalProperties: false,
        }
      }
    }
  }, async function handler(request, reply) {
    const { filterClause, filterParams } = YATT.filterToSql(request.query.filter);
    const { orderClause, orderParams } = YATT.orderToSql(request.query.order);
    const { matches_json, total_count } = db
      .prepare(
        `
        WITH filtered_matches AS (
          SELECT DISTINCT matches.match_id, matches.tournament_id, matches.gamemode,
                          matches.state, matches.created_at, matches.updated_at
          FROM match_players
          JOIN matches ON matches.match_id = match_players.match_id
          JOIN match_teams ON match_teams.match_id = matches.match_id
                          AND match_teams.team_index = match_players.team_index
          WHERE match_players.account_id = ?
            ${filterClause ? `AND ${filterClause}` : ""}
        ),
        total_count AS (
          SELECT COUNT(*) AS count FROM filtered_matches
        ),
        paginated_matches AS (
          SELECT * FROM filtered_matches
          ORDER BY ${orderClause ? orderClause : "match_id DESC"}
          LIMIT ? OFFSET ?
        )
        SELECT
          (SELECT count FROM total_count) AS total_count,
          json_group_array(json_object(
            'match_id', m.match_id,
            'tournament_id', m.tournament_id,
            'gamemode', m.gamemode,
            'state', m.state,
            'created_at', m.created_at,
            'updated_at', m.updated_at,
            'teams', (
              SELECT json_group_array(
                json_object(
                  'team_index', t.team_index,
                  'name', t.name,
                  'score', t.score,
                  'winning', t.winning
                )
              )
              FROM match_teams t
              WHERE t.match_id = m.match_id
            ),
            'players', (
              SELECT json_group_array(
                json_object(
                  'account_id', p.account_id,
                  'team_index', p.team_index,
                  'player_index', p.player_index,
                  'win_probability', p.win_probability,
                  'begin_rating', p.begin_rating,
                  'end_rating', p.end_rating,
                  'created_at', p.created_at,
                  'updated_at', p.updated_at
                )
              )
              FROM match_players p
              WHERE p.match_id = m.match_id
            )
          )) AS matches_json
        FROM paginated_matches m;

        `
      )
      .get(request.params.account_id, ...filterParams, ...orderParams, request.query.limit, request.query.offset);

    const matches = JSON.parse(matches_json);
    const players = [];
    for (const match of matches) {
      for (const player of match.players) {
        players.push(player);
      }
    }
    const profiles = await YATT.fetch(
      `http://profiles:3000/?filter[account_id]=${players.map((player) => player.account_id).join(",")}`
    );
    for (let player of players) {
      player.profile = profiles.find((profile) => profile.account_id === player.account_id);
    }
    reply.header("X-Total-Count", total_count);
    reply.header("X-Count", matches.length);
    reply.header("Access-Control-Expose-Headers", "X-Total-Count, X-Count");
    reply.send(matches);
  });
  done();
}
