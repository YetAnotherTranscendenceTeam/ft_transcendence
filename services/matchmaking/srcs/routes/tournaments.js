import on from "events"
import { HttpError, properties } from "yatt-utils";

export default function router(fastify, opts, done) {
  fastify.get("/", {preHandler: fastify.verifyBearerAuth}, async (request, reply) => {
    reply.send(fastify.tournaments.tournaments);
  });
  fastify.get("/:id/notify", {preHandler: fastify.verifyBearerAuth}, async function handler(request, reply) {
    const tournament = fastify.tournaments.getTournament(request.params.id);
    if (!tournament)
      return new HttpError.NotFound().send(reply);
    const player = tournament.getPlayerFromAccountID(request.account_id);
    if (!player)
      return new HttpError.Forbidden().send(reply);
    // TODO: implement SSE
  });
  done();
}
