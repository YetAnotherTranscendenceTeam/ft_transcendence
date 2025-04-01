import { HttpError } from "yatt-utils";

export default function router(fastify, opts, done) {
  fastify.get("/:id/notify", {
    preHandler: fastify.verifyBearerAuth,
    schema: {
      params: {type: "object", properties: {id: {type: "number"}}},
    }
}, async function handler(request, reply) {
    const tournament = fastify.tournaments.getTournament(request.params.id);
    if (!tournament)
      return new HttpError.NotFound().send(reply);
    const player = tournament.getPlayerFromAccountID(request.account_id);
    if (!player)
      return new HttpError.Forbidden().send(reply);
    console.log(player);
    reply.sse({event: "sync", data: JSON.stringify(tournament)});
    player.addSubscription(reply);
    request.socket.on("close", () => {
      player.removeSubscription(reply);
    });
  });
  done();
}
