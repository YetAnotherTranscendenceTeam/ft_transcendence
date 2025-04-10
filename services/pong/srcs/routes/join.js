import { WsCloseError, WsError } from "yatt-ws";
import { gameEvents } from "../gameevents.js";

export default function router(fastify, opts, done) {
  fastify.get("/", { websocket: true }, async (socket, req) => {
    const { match_id, token } = req.query;
    let account_id = null;
    try {
      account_id = await fastify.jwt.verify(token);
    }
    catch(e) {
      WsCloseError.Unauthorized.close(socket);
      return;
    }

    let match = gameManager.getMatch(match_id);
    if (!match) {
      WsCloseError.NotFound.close(socket);
      return;
    }

    let player = match.getPlayer(account_id);
    if (!player) {
      WsCloseError.Inaccessible.close(socket);
      return;
    }

    player.socket = socket;
    socket.on("message", (message) => {
      try {
        const msgOBJ = JSON.parse(message)
        gameEvents.receive(socket, msgOBJ, match, player);
      }
      catch(e) {
        if (e instanceof SyntaxError) {
          WsCloseError.InvalidPayload.close(socket);
          return;
        }
        if (e instanceof WsError) {
          e.close(socket);
          return;
        }
        console.error(e);
      }
    });
  });
  done();
}
