import request from "supertest";
import Fastify from "fastify";
import jwt from "@fastify/jwt";
import { tokenManagerURL } from "../../URLs";

const app = Fastify();
app.register(jwt, { secret: process.env.TOKEN_MANAGER_SECRET });
app.register(jwt, { secret: process.env.REFRESH_TOKEN_SECRET, namespace: "refresh" });

beforeAll(async () => {
  await app.ready();
});

describe("TOKEN GENERATION", () => {
  it("no account id", async () => {
    const response = await request(tokenManagerURL)
      .post("/")
      .expect(400)
      .expect("Content-Type", /json/);
  });

  it("no authorization header", async () => {
    const response = await request(tokenManagerURL)
      .post("/45")
      .expect(401)
  });

  it("invalid authorization header 1", async () => {
    const response = await request(tokenManagerURL)
      .post("/45")
      .set('Authorization', 'SFSDFSF')
      .expect(401)
      .expect("Content-Type", /json/);
    expect(response.body).toEqual({
      statusCode: 401,
      code: "FST_BEARER_AUTH_INVALID_AUTHORIZATION_HEADER",
      error: "Unauthorized",
      message: "invalid authorization header",
    });
  });

  it("invalid authorization header 2", async () => {
    const response = await request(tokenManagerURL)
      .post("/45")
      .set('Authorization', 'Bearer')
      .expect(401)
      .expect("Content-Type", /json/);
    expect(response.body).toEqual({
      statusCode: 401,
      code: "FST_BEARER_AUTH_INVALID_AUTHORIZATION_HEADER",
      error: "Unauthorized",
      message: "invalid authorization header",
    });
  });

  it("invalid authorization header 3", async () => {
    const response = await request(tokenManagerURL)
      .post("/45")
      .set('Authorization', 'Bearer d')
      .expect(401)
      .expect("Content-Type", /json/);
    expect(response.body).toEqual({
      statusCode: 401,
      code: "FST_BEARER_AUTH_INVALID_AUTHORIZATION_HEADER",
      error: "Unauthorized",
      message: "invalid authorization header",
    });
  });

  it("invalid authorization header 4", async () => {
    const response = await request(tokenManagerURL)
      .post("/45")
      .set('Authorization', `Bearer ${process.env.TOKEN_MANAGER_SECRET}`)
      .expect(401)
      .expect("Content-Type", /json/);
    expect(response.body).toEqual({
      statusCode: 401,
      code: "FST_BEARER_AUTH_INVALID_AUTHORIZATION_HEADER",
      error: "Unauthorized",
      message: "invalid authorization header",
    });
  });

  for (let i = 0; i < 10; ++i) {
    it("valid authorization header", async () => {
      const token = app.jwt.sign({}, { expiresIn: "15m" });
      const id = Math.floor(Math.random() * 1000000);
      const response = await request(tokenManagerURL)
        .post(`/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect("Content-Type", /json/);
      expect(response.body).toEqual(
        expect.objectContaining({
          access_token: expect.any(String),
          refresh_token: expect.any(String),
          expire_at: expect.any(String),
        })
      );
      
      const access = app.jwt.decode(response.body.access_token);
      expect(access.account_id).toBe(id);
      const refresh = app.jwt.refresh.decode(response.body.refresh_token);
      expect(refresh.account_id).toBe(id);
    });
  }
});
