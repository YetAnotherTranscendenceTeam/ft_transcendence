"use strict";

import { GameModes } from "../GameModes.js";
import { LobbyConnection } from "../LobbyConnection.js";

export default function router(fastify, opts, done) {
  fastify.get("/", {websocket: true}, function handler(connection, request) {
	  const auth = (data) => {
		const message = JSON.parse(data);
		const jwt = message.data.jwt;
		if (message.event != "handshake") {
			connection.close(1008, "Unauthorized - Invalid Event");
			return;
		}
		if (!jwt) {
			connection.close(1008, "Unauthorized - No JWT");
			return;
		}
		try {
			const decoded = fastify.jwt.matchmaking.verify(jwt);
			if (GameModes.equals(decoded.GameModes)) {
				connection.removeListener("message", auth);
				connection.send(JSON.stringify({event: "handshake"}));
				console.log("Lobby connection established");
				new LobbyConnection(connection);
			} else {
				connection.close(1008, "Unauthorized - Invalid GameModes");
			}
		} catch (e) {
			connection.close(1008, "Unauthorized - Invalid JWT");
		}
	}
	connection.on("message", auth)
    
  });
  done();
}
