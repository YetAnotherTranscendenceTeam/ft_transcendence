"use strict";

import YATT, { HttpError, properties } from "yatt-utils";

export default function router(fastify, opts, done) {
  const schema = {
    body: {
      type: 'object',
      properties: {
        username: properties.username,
        avatar: properties.avatar,
      },
      additionalProperties: false,
      anyOf: [
        { required: ['username'] },
        { required: ['avatar'] }
      ]
    }
  }

  fastify.patch("/profile", { schema }, async function handler(request, reply) {
    const { username, avatar } = request.body;

    try {
      if (avatar) {
        // Check that the requested avatar is available to the access_token bearer
        const available = await YATT.fetch(`http://avatars:3000/`, {
          headers: {
            "Authorization": `Bearer ${request.access_token}`,
          },
        });
        if (!available.default.find(e => e === avatar) && !available.user.find(e => e === avatar)) {
          return new HttpError.Forbidden().send(reply);
        }
      }
      // Update the profile database
      await YATT.fetch(`http://db-profiles:3000/${request.account_id}`, {
        method: "PATCH",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({ username, avatar }),
      });
      console.log(`id#${request.account_id} updated their profile `, { username, avatar });
      reply.code(204).send();
    } catch (err) {
      if (err instanceof HttpError) {
        err.send(reply);
      } else {
        throw err;
      }
    }
  });

  done();
}
