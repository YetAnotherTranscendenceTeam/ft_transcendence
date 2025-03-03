"use strict";

import { HttpError } from "yatt-utils";
import YATT from "yatt-utils";
import db from "../app/database.js";
import { cdn_url } from "../app/env.js"
import { imageSize } from 'image-size';

export default function router(fastify, opts, done) {
  fastify.get("/", async function handler(request, reply) {
    try {
      const token = fastify.jwt.cdn.sign({ account_id: request.account_id });
      const defaults = await YATT.fetch(`${cdn_url}/api/avatars/default`, {
        headers: {
          authorization: `Bearer ${token}`,
        }
      });
      const user = db.prepare("SELECT * FROM avatars WHERE account_id = ?").all(request.account_id);
      reply.send({
        default: defaults.map(path => cdn_url + path),
        user: user.map(avatar => avatar.url),
      });
    } catch (err) {
      if (err instanceof HttpError) {
        return err.send(reply);
      }
      throw err;
    }
  });
  let schema = {
    body: {
      type: 'string',
      contentMediaType: 'text/plain',
      minLength: 1,
    }
  };

  const maxAvatarPerUser = 5;

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
      const upload = await YATT.fetch(`${cdn_url}/api/avatars`, {
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
        .run(request.account_id, cdn_url + upload.uri);
      reply.code(201).send({ url: cdn_url + upload.uri });
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

    console.log("avatar delition route called");
    if (!db.prepare("SELECT * FROM avatars WHERE account_id = ? AND url = ?").get(request.account_id, url)) {
      return new HttpError.NotFound().send(reply);
    }
    try {
      const token = fastify.jwt.cdn.sign({});
      await YATT.fetch(`${cdn_url}/api/${url.replace(cdn_url, '')}`, {
        method: "DELETE",
        headers: {
          'authorization': `Bearer ${token}`,
        }
      });
      db.prepare("DELETE FROM avatars WHERE account_id = ? AND url = ?").run(request.account_id, url);
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

const allowedTypes = ["jpg", "jpeg", "png", "gif", "webp"];

function validateImageFormat(infos) {
  const { width, height, type } = infos;
  if (!allowedTypes.find(ext => ext === type)
    || width < 128 || height < 128
    || width > 1024 || height > 1024) {
    throw new HttpError.BadRequest();
  }
}
