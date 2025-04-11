import request from "supertest";
import crypto from "crypto";
import { credentialsURL, dbprofilesURL, registerURL } from "../../URLs";
import Fastify from "fastify";
import jwt from "@fastify/jwt"

const USER_COUNT = 300;

const app = Fastify();
app.register(jwt, { secret: process.env.AUTHENTICATION_SECRET });

beforeAll(async () => {
  await app.ready();
});

let users = [];

afterAll(async () => {
  for (const user of users) {
    await request(credentialsURL)
      .delete(`/${user.account_id}`)
      .expect(204);
    await request(dbprofilesURL)
      .delete(`/${user.account_id}`)
      .expect(204);
  }
});

describe(`Profile stress`, () => {
  it(`creates ${USER_COUNT} of accounts with defaults usernames`, async () => {
    for (let i = 0; i < USER_COUNT; i++) {
      const dummy = {
        account_id: null,
        jwt: null,
        email: `dummy-account.${crypto.randomBytes(10).toString("hex")}@jest.com`,
        password: crypto.randomBytes(4).toString("hex"),
      };
      users.push(request(registerURL)
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
  }, 15000);
});