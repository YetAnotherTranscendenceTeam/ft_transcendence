"use strict";

import Fastify from "fastify";
import jwt from "@fastify/jwt";

const AUTHENTICATION_SECRET = process.env.AUTHENTICATION_SECRET;

const app = Fastify();

const start = async () => {
  await app.register(jwt, { secret: AUTHENTICATION_SECRET });
  await app.ready();
  const payload = { account_id: process.argv[2] };

  console.log("generating jwt:", payload);
  console.log(app.jwt.sign(payload, { expiresIn: '7d' }));
};

start().catch(console.error);
