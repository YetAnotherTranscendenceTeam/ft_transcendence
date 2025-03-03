"use strict";

import fs from "node:fs";
import path from "node:path"
import { HttpError } from "yatt-utils";
import crypto from "node:crypto";

const root = '/app';
const defaultDir = '/avatars/default/';
const usersDir = '/avatars/users/'

export default function router(fastify, opts, done) {
  fastify.get("/default", async function handler(request, reply) {
    const avatars = fs
      .readdirSync(root + defaultDir)
      .map(fileName => {
        return path.join(defaultDir, fileName);
      })
      .filter(file => {
        return fs.lstatSync(root + file).isFile()
      });
    reply.send(avatars);
  });

  fastify.post("/", async function handler(request, reply) {
    const { image, extension } = request.body;
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    const filePath = generateUniqueFilepath(usersDir, `.${extension}`);
    if (!filePath) {
      return new HttpError.ServiceUnavailable().send(reply);
    }
    fs.writeFileSync(root + filePath, buffer);
    reply.send({ uri: filePath });
  });

  done();
}


function generateUniqueFilepath(directory, extension) {  
  let filePath;
  let attempt = 0;

  do {
    if (attempt++ === 100) {
      return null;
    }
    filePath = directory + crypto.randomBytes(15).toString('hex') + extension;
  } while (fs.existsSync(root + filePath))
  return filePath;
}
