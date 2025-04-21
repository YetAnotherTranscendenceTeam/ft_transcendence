"use strict";

import { HttpError, properties } from "yatt-utils";
import db from "../app/database.js";
import YATT from "yatt-utils";
import { MatchState } from "../Match.js";
import { GameModes } from "../GameModes.js";

export default function router(fastify, opts, done) {
  fastify.get("/:account_id", function handler(request, reply) {
    const matchmaking_users = db
      .prepare("SELECT gamemode, elo, created_at, updated_at FROM matchmaking_users WHERE account_id = ?")
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
    reply.send({matchmaking_users, last_match, last_tournament});
  });
  fastify.get("/:account_id/matches", {
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
            },
            additionalProperties: false,
          },
          order: {
            type: "object",
            properties: {
              match_id: properties.sort,
              gamemode: properties.sort,
              score_0: properties.sort,
              score_1: properties.sort,
              state: properties.sort,
              created_at: properties.sort,
              updated_at: properties.sort,
            },
            additionalProperties: false,
          },
          additionalProperties: false,
        }
      }
    }
  }, function handler(request, reply) {
    const { filterClause, filterParams } = YATT.filterToSql(request.query.filter);
    const { orderClause, orderParams } = YATT.orderToSql(request.query.order);
    const matches = db
      .prepare(
        `
        SELECT 
          matches.*,
          json_object(
            'account_id', match_players.account_id,
            'team_index', match_players.team_index
          ) as player
        FROM
          match_players
        JOIN
          matches
        ON
          matches.match_id = match_players.match_id
        WHERE match_players.account_id = ?
        ${filterClause ? `AND ${filterClause}` : ""}
        ORDER BY ${orderClause ? orderClause : "matches.created_at DESC"}
        LIMIT ?
        OFFSET ?
        `
      )
      .all(request.params.account_id, ...filterParams, ...orderParams, request.query.limit, request.query.offset);
    for (const match of matches) {
      match.player = JSON.parse(match.player);
    }
    reply.send(matches);
  });
  done();
}
