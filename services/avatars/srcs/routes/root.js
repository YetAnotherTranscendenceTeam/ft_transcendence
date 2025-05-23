"use strict";

import { HttpError } from "yatt-utils";
import YATT from "yatt-utils";
import db from "../app/database.js";
import { CDN_URL } from "../app/env.js"
import { imageSize } from 'image-size';

export default function router(fastify, opts, done) {
  fastify.get("/", async function handler(request, reply) {
    try {
      reply.send({
        default: db
          .prepare("SELECT * FROM avatars WHERE account_id = -1")
          .all()
          .map(avatar => avatar.url),
        user: db
          .prepare("SELECT * FROM avatars WHERE account_id = ? ORDER BY created_at DESC ")
          .all(request.account_id)
          .map(avatar => avatar.url),
      });
    } catch (err) {
      if (err instanceof HttpError) {
        return err.send(reply);
      }
      throw err;
    }
  });

  const maxAvatarPerUser = 5;

  let schema = {
    body: {
      type: 'string',
      contentMediaType: 'text/plain',
      minLength: 1,
    }
  };
  fastify.post("/", { schema }, async function handler(request, reply) {
    const image = request.body;
    let infos;

    try {
      const count = db.prepare("SELECT COUNT(*) as count FROM avatars WHERE account_id = ?")
        .get(request.account_id).count;
      if (count >= maxAvatarPerUser) {
        throw new HttpError.Forbidden("Avatar limit reached").send(reply);
      }

      const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      try {
        infos = imageSize(buffer);
      } catch {
        throw new HttpError.BadRequest().send(reply);
      }
      validateImageFormat(infos);

      const token = fastify.jwt.cdn.sign({});
      const upload = await YATT.fetch(`${CDN_URL}/api/avatars`, {
        method: "POST",
        headers: {
          'authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: request.body,
          extension: infos.type,
        }),
      });
      db.prepare("INSERT INTO avatars (account_id, url) VALUES (?, ?)")
        .run(request.account_id, CDN_URL + upload.uri);
      reply.code(201).send({ url: CDN_URL + upload.uri });
    } catch (err) {
      if (err instanceof HttpError) {
        err.send(reply);
      }
      throw err;
    }
  });

  schema = {
    querystring: {
      type: 'object',
      properties: {
        url: { type: 'string', format: 'uri' }
      },
      required: ['url'],
    },
  }

  fastify.delete("/", { schema }, async function handler(request, reply) {
    const { url } = request.query;

    if (!db.prepare("SELECT * FROM avatars WHERE account_id = ? AND url = ?").get(request.account_id, url)) {
      return new HttpError.NotFound().send(reply);
    }
    try {
      const token = fastify.jwt.cdn.sign({});
      await YATT.fetch(url.replace(CDN_URL, `${CDN_URL}/api/`), {
        method: "DELETE",
        headers: {
          'authorization': `Bearer ${token}`,
        }
      });
      db.prepare("DELETE FROM avatars WHERE account_id = ? AND url = ?").run(request.account_id, url);
      console.log(`id#${request.account_id} deleted avatar ${url}`);
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

const allowedTypes = ["jpg", "png", "gif", "webp"];

function validateImageFormat(infos) {
  const { width, height, type } = infos;
  if (!allowedTypes.find(ext => ext === type)
    || width < 32 || height < 32) {
    throw new HttpError.BadRequest();
  }
}
