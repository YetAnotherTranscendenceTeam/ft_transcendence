"use strict";

import crypto from "crypto";
import request from "supertest";
import Fastify from "fastify";
import jwt from "@fastify/jwt"
import { apiURL } from "../URLs";

const app = Fastify();
app.register(jwt, {
  secret: process.env.JWT_SECRET
})

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const registerUrL = "http://127.0.0.1:4012";
const credentialsUrl = "http://127.0.0.1:7002";
const authUrl = "http://127.0.0.1:4022";
const dbprofilesUrL = "http://127.0.0.1:7001"

beforeAll(async () => {
  await app.ready();
});

export let users = [];

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
  describe(`create ${USER_COUNT} dummy accounts`, () => {
    it("create dummy accounts", async () => {
      for (let i = 0; i < USER_COUNT; i++) {
        const dummy = {
          account_id: null,
          jwt: null,
          email: `dummy-account.${crypto.randomBytes(10).toString("hex")}@jest.com`,
          password: crypto.randomBytes(4).toString("hex"),
          username: crypto.randomBytes(4).toString("hex"),
          avatar: `https://${crypto.randomBytes(8).toString("hex")}.com`,
        };
        users.push(request(registerUrL)
          .post("/")
          .send({
            email: dummy.email,
            password: dummy.password,
          })
          .expect(201)
          .expect("Content-Type", /json/)
          .then((response) => {
            dummy.jwt = response.body.access_token;
            dummy.account_id = app.jwt.decode(response.body.access_token).account_id;
            return dummy;
          })
        )
      }
      users = await Promise.all(users);
    });
    it("auth using password", async () => {
      users = await Promise.all(users.map(async (user) => {
        const response = await request(authUrl)
          .post("/")
          .send({
            email: user.email,
            password: user.password,
          })
          .expect(200)
          .expect("Content-Type", /json/);
  
        user.jwt = response.body.access_token;
        return user;
      }));
    });
    it("patch profiles", async () => {
      users = await Promise.all(users.map(async (user) => {
        const response = await request(dbprofilesUrL)
          .patch(`/${user.account_id}`)
          .send({
            username: user.username,
            avatar: user.avatar,
          })
          .set('Authorization', `Bearer ${user.jwt}`)
          .expect(200)
          .expect("Content-Type", /json/);
  
        expect(response.body).toEqual(
          expect.objectContaining({
            account_id: user.account_id,
            avatar: user.avatar,
            username: user.username,
          })
        );
        return user;
      }));
    });
  })
  return users;
}
