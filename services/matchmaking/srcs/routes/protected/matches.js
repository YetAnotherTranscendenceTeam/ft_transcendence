import YATT, { HttpError } from "yatt-utils";
import db from "../../app/database.js";
import { MatchState } from "../../Match.js";

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
      fastify.tournaments.getTournamentMatch(request.params.match_id)?.updateMatch(request.body);
      if (request.body.state === MatchState.DONE) {
        // TODO: update player ELO
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
