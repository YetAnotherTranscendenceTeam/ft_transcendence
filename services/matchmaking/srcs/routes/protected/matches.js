import YATT, { HttpError } from "yatt-utils";
import db from "../../app/database.js";
import { MatchState } from "../../Match.js";
import { GameModes } from "../../GameModes.js";
import { GameModeType } from "yatt-lobbies";

export default function router(fastify, opts, done) {
  fastify.patch(
    "/:match_id",
    {
      schema: {
        params: { type: "object", properties: { match_id: { type: "number" } } },
        body: {
          type: "object",
          properties: {
            score_0: { type: "number", minimum: 0 },
            score_1: { type: "number", minimum: 0 },
            state: {
              type: "number",
              enum: Object.values(MatchState).filter((val) => val != MatchState.RESERVED),
            },
          },
          minProperties: 1,
          additionalProperties: false,
        },
      },
    },
    function handler(request, reply) {
      const { setClause, params } = YATT.patchBodyToSql(request.body);
      if (!setClause) new HttpError.BadRequest().send(reply);

      const updated = db
      .prepare(
        `
        UPDATE matches
        SET
			  ${setClause}
        WHERE match_id = ?
        RETURNING *
        `
      )
      .get(...params, request.params.match_id);
      if (!updated) {
        return new HttpError.NotFound().send(reply);
      }
      const tournamentMatch = fastify.tournaments.getTournamentMatch(request.params.match_id);
      if (tournamentMatch)
        tournamentMatch.updateMatch(request.body);
      if (request.body.state === MatchState.DONE && GameModes[updated.gamemode].type === GameModeType.RANKED) {
        const winning_team = updated.score_0 > updated.score_1 ? 0 : 1;
        const updated_elo = db.prepare(`
          UPDATE matchmaking_users
            SET
              elo = elo
                + ((
                  CASE WHEN match_players.team_index = @winning_team THEN
                    2
                  ELSE
                    0
                  END
                ) - match_players.win_probability)
                * (15
                * (1 + (10 - (SELECT MIN(10, matchmaking_users.match_count))) * 0.3)),
              match_count = match_count + 1
          FROM match_players
          WHERE
            match_players.match_id = ?
            AND match_players.account_id = matchmaking_users.account_id
            AND matchmaking_users.gamemode = ?
          RETURNING 
            matchmaking_users.account_id,
            matchmaking_users.elo,
            matchmaking_users.match_count,
            matchmaking_users.updated_at
        `).all({winning_team}, request.params.match_id, updated.gamemode);
      }
      reply.send(updated);
    }
  );
  // TODO: handle stats (move this into the origin /:match_id request)
  fastify.patch(
    "/:match_id/players/:account_id",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            match_id: { type: "number" },
            account_id: { type: "number" },
          },
        },
        body: {
          type: "object",
          properties: {},
        },
      },
    },
    function handler(request, reply) {
      new HttpError.NotImplemented().send(reply);
    }
  );
  done();
}
