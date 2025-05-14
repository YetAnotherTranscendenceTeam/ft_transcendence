"use strict";

import crypto from "crypto";
import request from "supertest";
import Fastify from "fastify";
import jwt from "@fastify/jwt"
import { apiURL, avatarsURL, credentialsURL, profilesURL, tokenManagerURL } from "../URLs";

export const app = Fastify();
app.register(jwt, { secret: process.env.AUTHENTICATION_SECRET });
app.register(jwt, { secret: process.env.TWO_FA_SECRET, namespace: "two_fa" });
app.register(jwt, { secret: process.env.TOKEN_MANAGER_SECRET, namespace: "token_manager" });
app.register(jwt, { secret: process.env.ACTIVITY_SSE_SECRET, namespace: "activity_sse" });
app.register(jwt, { secret: process.env.PONG_SECRET, namespace: "pong" });
app.register(jwt, { secret: process.env.SPECTATOR_SECRET, namespace: "spectator" });

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const registerUrL = "http://127.0.0.1:4012";
const authUrl = "http://127.0.0.1:4022";

export let users = [];

const CREATION_TIMEOUT = 60000;

export function createUsers(count=10) {
  afterAll(async () => {
    for (const user of users) {
      // Delete account from credentials database
      let response = await request(credentialsURL)
        .delete(`/${user.account_id}`)
        .set("Authorization", `Bearer ${user.jwt}`);

      expect(response.statusCode).toBe(204);

      // Revoke all refresh_tokens for this account
      response = await request(tokenManagerURL)
        .delete(`/${user.account_id}`)
        .set("Authorization", `Bearer ${app.jwt.token_manager.sign({})}`);

      expect(response.statusCode).toBe(204);

      // Get avatars
      const avatars = await request(avatarsURL)
        .get("/")
        .set("Authorization", `Bearer ${user.jwt}`);

      expect(avatars.statusCode).toBe(200);
      expect(avatars.body).toEqual({
        default: expect.any(Array),
        user: expect.any(Array),
      });

      // Delete avatars uploaded by this account
      for (const url of avatars.body.user) {
        response = await request(apiURL)
          .delete(`/avatars?url=${url}`)
          .set("Authorization", `Bearer ${user.jwt}`);

        expect(response.statusCode).toBe(204);
      }

      response = await request(profilesURL)
        .delete(`/${user.account_id}`);

      expect(response.statusCode).toBe(204);
    }
  });
  const USER_COUNT = count;
  beforeAll(async () => {
    await app.ready();
    const create_account = async (dummy) => {
      let response = await request(registerUrL)
        .post("/")
        .send({
          email: dummy.email,
          password: dummy.password,
        })
        .expect(201)
        .expect("Content-Type", /json/);
      
      dummy.jwt = response.body.access_token;
      dummy.account_id = app.jwt.decode(response.body.access_token).account_id;

      response = await request(authUrl)
        .post("/")
        .send({
          email: dummy.email,
          password: dummy.password,
        })
        .expect(200)
        .expect("Content-Type", /json/);
      dummy.jwt = response.body.access_token;

      response = await request(profilesURL)
        .patch(`/${dummy.account_id}`)
        .send({ username: dummy.username })
        .set('Authorization', `Bearer ${dummy.jwt}`)
        .expect(200)
        .expect("Content-Type", /json/);
      dummy.profile = response.body;
      return dummy;
    };
    for (let i = 0; i < USER_COUNT; i++) {
      const dummy = {
        account_id: null,
        jwt: null,
        email: `dummy-account.${crypto.randomBytes(10).toString("hex")}@jest.com`,
        password: crypto.randomBytes(4).toString("hex"),
        username: `DUMMY-${crypto.randomBytes(4).toString("hex")}`,
      };
      await create_account(dummy);
      users.push(dummy);
    }
    
  }, CREATION_TIMEOUT);
}
