import YATT, { HttpError } from "yatt-utils";
import db from "../../app/database.js";
import { MatchState } from "../../Match.js";
import { GameModes } from "../../GameModes.js";
import { GameModeType } from "yatt-lobbies";

const update_match_state = db.prepare(
  `
  UPDATE matches
  SET state = ?
  WHERE match_id = ?
  RETURNING gamemode
  `);

const update_team_score = db.prepare(
  `
  UPDATE match_teams
  SET score = ?
  WHERE match_id = ? AND team_index = ?
  `
);

const update_rating = db.prepare(`
  UPDATE matchmaking_users
    SET
      rating = rating
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
    matchmaking_users.rating,
    matchmaking_users.match_count,
    matchmaking_users.updated_at
`);

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
    async function handler(request, reply) {
      let updated = {};
      if (request.body.state !== undefined) {
        updated = update_match_state.get(request.body.state, request.params.match_id);
      }
      if (!updated) {
        throw new HttpError.NotFound("Match not found");
      }
      const { score_0, score_1} = request.body;
      if (score_0) {
        update_team_score.run(score_0, request.params.match_id, 0);
      }
      if (score_1) {
        update_team_score.run(score_1, request.params.match_id, 1);
      }

      const tournamentMatch = fastify.tournaments.getTournamentMatch(request.params.match_id);
      if (tournamentMatch)
        await tournamentMatch.updateMatch(request.body);
      if (request.body.state === MatchState.DONE && GameModes[updated.gamemode].type === GameModeType.RANKED) {
        const winning_team = score_0 > score_1 ? 0 : 1;
        update_rating.all({winning_team}, request.params.match_id, updated.gamemode);
      }
      reply.status(200).send(updated);
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
