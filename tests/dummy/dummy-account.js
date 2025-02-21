"use strict";

import crypto from "crypto";
import request from "supertest";

const registerUrL = "http://127.0.0.1:4012";
const credentialsUrl = "http://127.0.0.1:7002";
const authUrl = "http://127.0.0.1:4022";

export const users = [];

export const USER_COUNT = 20;

afterAll(async () => {
  for (const user of users) {
    await request(credentialsUrl).delete(`/${user.account_id}`).expect(204);
  }
});

describe("Dummy account creation", () => {
  it(`create dummy accounts`, async () => {
    const requests = [];
    for (let i = 0; i < USER_COUNT; i++) {
      const dummy = {
        account_id: null,
        jwt: null,
        email: `dummy-account.${crypto
          .randomBytes(10)
          .toString("hex")}@jest.com`,
        password: crypto.randomBytes(4).toString("hex"),
      };
      const req = request(registerUrL)
        .post("/")
        .send({
          email: dummy.email,
          password: dummy.password,
        })
        .expect(201)
        .expect("Content-Type", /json/)
        .then ((response) => {;
          dummy.account_id = response.body.account.account_id;
          users.push(dummy);
        });
      requests.push(req);
    }
    await Promise.all(requests);
    expect(users.length).toBe(USER_COUNT);
  });

  it(`auth dummy accounts`, async () => {
    const requests = [];
    for (let i = 0; i < USER_COUNT; i++) {
      const dummy = users[i];
      const req = await request(authUrl)
        .post("/")
        .send({
          email: dummy.email,
          password: dummy.password,
        })
        .expect(200)
        .expect("Content-Type", /json/)
        .then((response) => {
          dummy.jwt = response.body.access_token;
          expect(response.body).toEqual(
            expect.objectContaining({
              access_token: expect.any(String),
              expire_at: expect.any(String),
            })
          );
        });
      requests.push(req);
    }
    await Promise.all(requests);
    expect(users.length).toBe(USER_COUNT);
  });
});
