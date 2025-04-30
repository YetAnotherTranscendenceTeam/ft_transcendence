"use strict";

import crypto from "crypto";
import request from "supertest";
import Fastify from "fastify";
import jwt from "@fastify/jwt"
import { apiURL } from "../URLs";

export const app = Fastify();
app.register(jwt, { secret: process.env.AUTHENTICATION_SECRET })
app.register(jwt, { secret: process.env.TWO_FA_SECRET, namespace: "two_fa" })
app.register(jwt, { secret: process.env.ACTIVITY_SSE_SECRET, namespace: "activity_sse" })

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const registerUrL = "http://127.0.0.1:4012";
const authUrl = "http://127.0.0.1:4022";
const dbprofilesUrL = "http://127.0.0.1:7001"

export let users = [];

const CREATION_TIMEOUT = 60000;

export function createUsers(count=10) {
  afterAll(async () => {
    for (const user of users) {
      await request(apiURL)
        .delete(`/settings/account`)
        .set("Authorization", `Bearer ${user.jwt}`)
        .expect(204);
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

      response = await request(dbprofilesUrL)
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
