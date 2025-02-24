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
const credentialsUrl = "http://127.0.0.1:7002"
const authUrl = "http://127.0.0.1:4022"

export const users = [];

const USER_COUNT = 10;

beforeAll(async () => {
  await app.ready();
});

afterAll(async () => {
  for (const user of users) {
    await request(credentialsUrl)
      .delete(`/${user.account_id}`)
      .expect(204);
  }
});

for (let i = 0; i < USER_COUNT; i++) {
  const dummy = {
    account_id: null,
    jwt: null,
    email: `dummy-account.${crypto.randomBytes(10).toString("hex")}@jest.com`,
    password: crypto.randomBytes(4).toString("hex"),
  };

  it("create dummy account", async () => {
    const response = await request(registerUrL)
      .post("/")
      .send({
        email: dummy.email,
        password: dummy.password,
      })
      .expect(201)
      .expect("Content-Type", /json/);
    
    dummy.jwt = response.body.access_token;
    dummy.account_id = app.jwt.decode(response.body.access_token).account_id;
  });

  it("auth using password", async () => {
    const response = await request(authUrl)
      .post("/")
      .send({
        email: dummy.email,
        password: dummy.password,
      })
      .expect(200)
      .expect("Content-Type", /json/);

    dummy.jwt = response.body.access_token;
    expect(response.body).toEqual(
      expect.objectContaining({
        access_token: expect.any(String),
        expire_at: expect.any(String),
      })
    );
  });
  users.push(dummy);
}

