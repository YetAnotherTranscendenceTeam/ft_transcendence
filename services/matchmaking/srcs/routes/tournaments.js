import { HttpError } from "yatt-utils";

export default function router(fastify, opts, done) {
  fastify.get("/:id/notify", {
    schema: {
      params: {type: "object", properties: {id: {type: "number"}}},
      query: {
        type: "object",
        required: ["token"],
        properties: {
          token: { type: "string" }
        }
      },
    }
}, async function handler(request, reply) {
    try {
      request.account_id = fastify.jwt.decode(request.query.token).account_id;
      if (!request.account_id)
        return new HttpError.Unauthorized().send(reply);
    }
    catch (err) {
      return new HttpError.Unauthorized().send(reply);
    }
    const tournament = fastify.tournaments.getTournament(request.params.id);
    if (!tournament)
      return new HttpError.NotFound().send(reply);
    const player = tournament.getPlayerFromAccountID(request.account_id);
    if (!player)
      return new HttpError.Forbidden().send(reply);
    reply.sse({event: "sync", data: JSON.stringify({tournament})});
    player.addSubscription(reply);
    request.socket.on("close", () => {
      player.removeSubscription(reply);
    });
  });
  done();
}
