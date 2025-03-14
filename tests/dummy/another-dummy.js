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
const dbprofilesUrL = "http://127.0.0.1:7001";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export const dummy = {
  account_id: null,
  jwt: null,
  email: `dummy-account.${crypto.randomBytes(10).toString("hex")}@jest.com`,
  password: crypto.randomBytes(4).toString("hex"),
  username: crypto.randomBytes(4).toString("hex"),
  avatar: null,
};

const USER_COUNT = 10;

beforeAll(async () => {
  await app.ready();
});

afterAll(async () => {
  await request(credentialsUrl)
    .delete(`/${dummy.account_id}`)
    .expect(204);

  await request(dbprofilesUrL)
    .delete(`/${dummy.account_id}`)
    .expect(204);

  const response = await request(dbprofilesUrL)
    .delete(`/${dummy.account_id}`)
    .expect(404);

  expect(response.body).toEqual({
    statusCode: 404,
    code: 'ACCOUNT_NOT_FOUND',
    error: 'Account Not Found',
    message: 'The requested account does not exist'
  })

  const avatars = await request("https://127.0.0.1:7979")
    .get("/avatars")
    .set('Authorization', `Bearer ${dummy.jwt}`);

  for (const url of avatars.body.user) {
    const deleteavatar = await request("https://127.0.0.1:7979")
    .delete(`/avatars?url=${url}`)
    .set('Authorization', `Bearer ${dummy.jwt}`)
    .expect(204);
  }
});

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

it("patch profile", async () => {
  const myavatars = await request("https://127.0.0.1:7979")
    .get('/avatars')
    .set('Authorization', `Bearer ${dummy.jwt}`)
    .expect(200);

  const minCeiled = Math.ceil(0);
  const maxFloored = Math.floor(myavatars.body.default.length);
  const rand = Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
  dummy.avatar = myavatars.body.default[rand];

  const response = await request(dbprofilesUrL)
    .patch(`/${dummy.account_id}`)
    .send({
      username: dummy.username,
      avatar: dummy.avatar,
    })
    .set('Authorization', `Bearer ${dummy.jwt}`)
    .expect(200)
    .expect("Content-Type", /json/);

  expect(response.body).toEqual(
    expect.objectContaining({
      account_id: dummy.account_id,
      avatar: dummy.avatar,
      username: dummy.username,
    })
  );
});

export const dummy2 = dummy;