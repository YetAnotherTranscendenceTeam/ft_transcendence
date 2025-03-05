"use strict";

import Fastify from "fastify";
import formbody from "@fastify/formbody";
import jwt from "@fastify/jwt";
import router from "./router.js";
import YATT from "yatt-utils";
import { cdn_jwt_secret, cdn_url } from "./env.js";

export default function build(opts = {}) {
  const app = Fastify(opts);

  if (process.env.ENV !== "production") {
    // DEVELOPEMENT configuration
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

    YATT.setUpSwagger(app, {
      info: {
        title: "[PLACEHOLDER]",
        description: "[PLACEHOLDER]",
        version: "1.0.0",
      },
      servers: [
        { url: "http://localhost:7001", description: "Development network" },
        { url: "http://profiles:3000", description: "Containers network" },
      ],
    });
  }

  app.register(jwt, {
    secret: cdn_jwt_secret,
  })
  app.register(formbody);

  app.register(router);

  app.decorate('defaultAvatar');

  app.addHook('onReady', async () => {
    try {
      const url = await getDefaultAvatar(`${cdn_url}/api/avatars/default`, app);
      if (url) {
        app.defaultAvatar = url;
        console.log(`Default avatar: ${url}`)
      } else {
        console.error('Failed to fetch default avatar');
      }
    } catch (error) {
      console.error('Error setting default avatar:', error);
    }
  });

  app.get("/ping", async function (request, reply) {
    reply.code(204).send();
  });
  
  return app;
}

const getDefaultAvatar = async (endpoint, fastify) => {
  const access_token = fastify.jwt.sign({}, { expireIn: '15m' });
  let attempt = 0;

  while (attempt < 5) {
    try {
      const response = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${access_token}` }
      });
      if (response.ok) {
        const data = await response.json();
        return cdn_url + data[0];
      }
    } catch (err) {
      attempt++;
      console.error(err);
    }
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  return null;
};
