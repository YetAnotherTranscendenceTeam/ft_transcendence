"use strict";

import crypto from "crypto";
import request from "supertest";
import Fastify from "fastify";
import jwt from "@fastify/jwt"

const app = Fastify();
app.register(jwt, {
  secret: process.env.JWT_SECRET
})

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
      await request(credentialsUrl).delete(`/${user.account_id}`).expect(204);
      await request(dbprofilesUrL).delete(`/${user.account_id}`).expect(204);
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
  })
  return users;
}
