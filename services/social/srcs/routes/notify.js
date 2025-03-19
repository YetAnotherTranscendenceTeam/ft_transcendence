"use strict";

import { properties } from "yatt-utils";

const schema = {
  querystring: {
    type: 'object',
    properties: {
      access_token: properties.access_token,
    },
    required: ['access_token'],
  },
}

export default function router(fastify, opts, done) {
  fastify.get("/notify", { schema, websocket: true }, async (socket, request) => {
    let client;

    try {
      // Authenticate client using access_token
      const { access_token } = request.query;

      const decoded = fastify.jwt.verify(access_token);
      // Associate the socket with an account_id
      client = await fastify.clients.connect(socket, parseInt(decoded.account_id));
    } catch (err) {
      console.error(err);
      return socket.close(3000, "Unauthorized");
    }

    socket.on('close', () => {
      fastify.clients.disconnect(client, socket, fastify.clients);
    });

    socket.on('message', message => {
      try {
        const payload = JSON.parse(message);
        console.log("RECIEVED:", { account_id: client.account_id, ...payload});
        if (payload.event === "goodbye") {
          socket.close(1000, "Normal Closure");
        } else if (payload.event === "ping") {
          client.resetInactivity();
        } else if (payload.event === "update_status") {
          client.setStatus(payload.data);
        }
      } catch (err) {
        console.error(err.message);
        socket.close(1003, "Unsupported Data");
      }
    })
  });

  done();
}
