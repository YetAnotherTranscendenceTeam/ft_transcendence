"use strict";

import { properties } from "yatt-utils";

const statuses = ['online', 'offline', 'away', 'playing'];

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
      client = fastify.clients.connect(socket, parseInt(decoded.account_id));
      if (client.sockets.size === 1) {
          // Broadcast online status to the followers
          fastify.clients.broadcastStatus(client);
      }
    } catch (err) {
      return socket.close(3000, "Unauthorized");
    }

    socket.on('close', () => {
      fastify.clients.disconnect(client, socket, fastify.clients);
    });

    socket.on('message', message => {
      try {
        const payload = JSON.parse(message);
        console.log("RECIEVED:", payload);
        if (payload.event === "goodbye") {
          socket.close(1000, "Normal Closure");
        }
        // else if (payload.event === "status" && statuses.find(status => status === payload.data)) {
        //   client.status = payload.data;
        //   fastify.clients.broadcastStatus(client)
        // }
      } catch (err) {
        console.error(err);
      }
    })

    try {
      await client.welcome(fastify.clients, socket);
    } catch (err) {
      console.error(err);
    }
  });

  done();
}
