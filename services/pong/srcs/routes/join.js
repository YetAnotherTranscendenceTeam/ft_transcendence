import { WsCloseError, WsError } from "yatt-ws";
import { gameEvents } from "../gameevents.js";

export default function router(fastify, opts, done) {
  fastify.get("/", { websocket: true }, async (socket, req) => {
    try {
      const { match_id, access_token } = req.query;
      let account_id = null;
      try {
        const decoded = await fastify.jwt.verify(access_token);
        account_id = decoded.account_id;
      }
      catch(e) {
        WsCloseError.Unauthorized.close(socket);
        return;
      }

      let match = fastify.games.getGame(Number.parseInt(match_id));
      if (!match) {
        WsCloseError.NotFound.close(socket);
        return;
      }

      let player = match.getPlayer(account_id);
      socket.send(JSON.stringify({ event: "sync", data: { match, player } }));

      if (!player) {
        match.spectate(socket);
        return;
      }
  
      if (player.socket) {
        WsCloseError.OtherLocation.close(player.socket);
        player.socket = null;
      }
      player.socket = socket;

      socket.on("close", () => {
        player.socket = null;
      });

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
    }
    catch(e) {
      if (e instanceof WsError) {
        e.close(socket);
        return;
      }
      console.error(e);
    }
  });
  done();
}
