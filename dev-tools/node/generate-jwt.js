"use strict";

import Fastify from "fastify";
import jwt from "@fastify/jwt";

const jwt_secret = process.env.JWT_SECRET;

const app = Fastify();

const start = async () => {
  await app.register(jwt, { secret: jwt_secret });
  await app.ready();
  const payload = { account_id: process.argv[2] };

  console.log("generating jwt:", payload);
  console.log(app.jwt.sign(payload, { expiresIn: '7d' }));
};

start().catch(console.error);
