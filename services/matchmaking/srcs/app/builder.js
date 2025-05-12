"use strict";

import Fastify from "fastify";
import fastifyFormbody from "@fastify/formbody";
import websocket from '@fastify/websocket';
import sse from "yatt-sse"
import router from "./router.js";
import JwtGenerator from "yatt-jwt";
import jwt from "@fastify/jwt";
import { AUTHENTICATION_SECRET, MATCH_MANAGEMENT_SECRET, MATCHMAKING_SECRET, PONG_SECRET } from "./env.js";
import bearerAuth from "@fastify/bearer-auth";
import qs from "qs";
import db from "./database.js";
import cors from "@fastify/cors";
import { fastifySchedule } from '@fastify/schedule';
import { SimpleIntervalJob, AsyncTask } from 'toad-scheduler';

import { TournamentManager } from "../TournamentManager.js";
import { computeLeaderboards } from "../computeLeaderboards.js";
import { ActiveMatchManager } from "../ActiveMatchManager.js";

export default function build(opts = {}) {
  const app = Fastify({ ...opts, querystringParser: (str) => qs.parse(str) });

  app.register(cors, {
    origin: process.env.CORS_ORIGIN || false,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
    maxAge: 600,
  });

  app.register(jwt, { secret: AUTHENTICATION_SECRET });
  app.register(jwt, { secret: MATCHMAKING_SECRET, namespace: "matchmaking" });
  app.register(jwt, { secret: MATCH_MANAGEMENT_SECRET, namespace: "match_management" });
  app.register(jwt, { secret: PONG_SECRET, namespace: "pong" });
  app.decorate("tokens", new JwtGenerator());
  app.addHook('onReady', async function () {
    this.tokens.register(app.jwt.pong, "pong");
  });

  app.register(sse);

  const serviceAuthorization = (token, request) => {
    try {
      const decoded = app.jwt.verify(token);
      request.token = token;
      request.account_id = decoded.account_id;
    } catch (err) {
      return false;
    }
    return true;
  };

  app.register(bearerAuth, {
    auth: serviceAuthorization,
    addHook: false,
    errorResponse: (err) => {
      return new HttpError.Unauthorized().json();
    },
  });

  app.decorate("tournaments", new TournamentManager(app));
  app.decorate("matches", new ActiveMatchManager(app));
  app.register(fastifyFormbody);
  app.register(websocket);

  // Leaderboard computation schedule
  app.register(fastifySchedule);
  app.decorate("leaderboards", new Array());
  const task = new AsyncTask('compute-leaderboards', async () => {
    app.leaderboards = await computeLeaderboards();
    // console.log(`SCHEDULE: Leaderboard updated`);
  });

  const updateLeaderboards = new SimpleIntervalJob(
    { seconds: 20 },
    task,
    { id: 'compute-leaderboards' }
  );

  app.ready().then(async () => {
    app.leaderboards = await computeLeaderboards();
    console.log("Leaderboards computed");
    app.scheduler.addSimpleIntervalJob(updateLeaderboards);
    console.log("Leaderboards update job scheduled");
  });

  app.register(router);

  app.get("/ping", async function (request, reply) {
    reply.code(204).send();
  });

  app.addHook('onClose', async (instance) => {
    // Cleanup instructions for a graceful shutdown
    await instance.tournaments.cancel();
    await instance.matches.cancel();
    db.close();
  });

  const serverShutdown = (signal) => {
    console.log(`Received ${signal}. Shutting down...`);
    app.close(() => {
      process.exit(0);
    });
  };

  process.on('SIGINT', serverShutdown);
  process.on('SIGTERM', serverShutdown);

  return app;
}
