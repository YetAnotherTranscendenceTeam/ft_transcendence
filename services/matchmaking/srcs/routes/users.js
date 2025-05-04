"use strict";

import { HttpError, properties } from "yatt-utils";
import db from "../app/database.js";
import YATT from "yatt-utils";
import { MatchState } from "../Match.js";
import { GameModes } from "../GameModes.js";

export default function router(fastify, opts, done) {
  fastify.get("/:account_id", function handler(request, reply) {
    const matchmaking_users = db
      .prepare("SELECT gamemode, rating, created_at, updated_at FROM matchmaking_users WHERE account_id = ?")
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
              score: properties.sort,
              winning: properties.sort,
              player_index: properties.sort,
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
  }, async function handler(request, reply) {
    const { filterClause, filterParams } = YATT.filterToSql(request.query.filter);
    const { orderClause, orderParams } = YATT.orderToSql(request.query.order);
    const {matches_json} = db
      .prepare(
        `
        SELECT json_group_array(json_object(
          'match_id', matches.match_id,
          'tournament_id', matches.tournament_id,
          'gamemode', matches.gamemode,
          'state', matches.state,
          'created_at', matches.created_at,
          'updated_at', matches.updated_at,
          'teams', (
            SELECT json_group_array(
              json_object(
                'team_index', match_teams.team_index,
                'name', match_teams.name,
                'score', match_teams.score,
                'winning', match_teams.winning
              )
            )
            FROM match_teams
            WHERE match_teams.match_id = matches.match_id
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
            WHERE match_players.match_id = matches.match_id
          )
        )) as matches_json
        FROM
          match_players
        JOIN
          matches
        ON
          matches.match_id = match_players.match_id
        JOIN
          match_teams
        ON
          match_teams.match_id = matches.match_id
          AND match_teams.team_index = match_players.team_index
        WHERE
          match_players.account_id = ?
          ${filterClause ? `AND ${filterClause}` : ""}
        ORDER BY ${orderClause ? orderClause : "matches.match_id DESC"}
        LIMIT ?
        OFFSET ?
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
    reply.send(matches);
  });
  done();
}
