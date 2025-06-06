import YATT, { HttpError } from "yatt-utils";
import db from "../app/database.js";
import { GameModes } from "../GameModes.js";

const get_match_teams = db
.prepare(
  `
    SELECT
      score,
      team_index,
      matches.match_id
    FROM
      matches
    JOIN
      match_teams
    ON
      match_teams.match_id = matches.match_id
    WHERE
      matches.tournament_id = ?
    ORDER BY
      match_teams.team_index ASC
  `);

export default function router(fastify, opts, done) {
  fastify.get(
    "/:id/notify",
    {
      schema: {
        params: { type: "object", properties: { id: { type: "number" } } },
        query: {
          type: "object",
          required: ["access_token"],
          properties: {
            access_token: { type: "string" },
          },
        },
      },
    },
    async function handler(request, reply) {
      try {
        request.account_id = fastify.jwt.decode(request.query.access_token).account_id;
        if (!request.account_id) return new HttpError.Unauthorized().send(reply);
      } catch (err) {
        return new HttpError.Unauthorized().send(reply);
      }
      const tournament = fastify.tournaments.getTournament(request.params.id);
      if (!tournament) return reply.status(204).send();
      const player = tournament.getPlayerFromAccountID(request.account_id);
      if (!player) return new HttpError.Forbidden().send(reply);
      reply.sse({ event: "sync", data: JSON.stringify({ tournament }) });
      player.addSubscription(reply);
      request.socket.on("close", () => {
        player.removeSubscription(reply);
      });
    }
  );

  fastify.get(
    "/:id",
    {
      schema: {
        params: { type: "object", properties: { id: { type: "number" } } },
      },
      preHandler: fastify.verifyBearerAuth,
    },
    async function handler(request, reply) {
      // include tournament_matches, tournament_teams and tournament_players
      const tournament = db
        .prepare(
          `
            SELECT
              tournaments.*
            FROM
              tournaments
            WHERE
              tournaments.tournament_id = ?
          `
        )
        .get(request.params.id);
      if (!tournament) return new HttpError.NotFound().send(reply);
      tournament.matches = db
        .prepare(
          `
            SELECT
              tournament_matches.*
            FROM
              tournament_matches
            WHERE
              tournament_matches.tournament_id = ?
            ORDER BY
              match_index ASC;
          `
        )
        .all(request.params.id);
      const match_teams = get_match_teams.all(request.params.id);
      tournament.matches = tournament.matches
      .map((match) => ({
        state: match.state,
        stage: match.stage,
        index: match.match_index,
        team_ids: [match.team_0_index, match.team_1_index],
        scores: [
          match_teams.find((team) =>
            team.team_index === 0 && team.match_id === match.match_id
          )?.score,
          match_teams.find((team) =>
            team.team_index === 1 && team.match_id === match.match_id
          )?.score
        ],
        match_id: match.match_id,
      }));
      let players = db
        .prepare(
          `
            SELECT 
              tournament_players.*
            FROM
              tournament_players
            WHERE
              tournament_players.tournament_id = ?
            ORDER BY
              tournament_players.team_index ASC,
              tournament_players.player_index ASC
          `
        )
        .all(request.params.id);
      const profiles = await YATT.fetch(
        `http://profiles:3000/?limit=${players.length > 10 ? players.length : 10}&filter[account_id]=${players
          .map((player) => player.account_id)
          .join(",")}`
      );
      players = players.map((player) => {
        return {
          ...player,
          profile: profiles.find((profile) => profile.account_id === player.account_id),
        };
      });
      const teams = db
        .prepare(
          `
            SELECT 
              tournament_teams.*
            FROM
              tournament_teams
            WHERE
              tournament_teams.tournament_id = ?
          `
        )
        .all(request.params.id);
      tournament.teams = teams
        .sort((a, b) => a.team_index - b.team_index)
        .map((team) => {
          team.players = players.filter((player) => player.team_index === team.team_index);
          return team;
        });
      tournament.id = tournament.tournament_id;
      tournament.tournament_id = undefined;
      tournament.gamemode = GameModes[tournament.gamemode];
      reply.send(tournament);
    }
  );
  done();
}
