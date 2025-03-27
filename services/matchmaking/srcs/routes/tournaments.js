export default function router(fastify, opts, done) {
  fastify.get("/", { websocket: true }, async (socket, req) => {});
}
