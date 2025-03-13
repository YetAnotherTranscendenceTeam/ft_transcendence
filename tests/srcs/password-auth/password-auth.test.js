import request from "supertest";
import { properties } from "../../../modules/yatt-utils/srcs";
import crypto from "crypto";
import Fastify from "fastify";
import jwt from "@fastify/jwt"

const app = Fastify();
app.register(jwt, {
  secret: process.env.JWT_SECRET
})

beforeAll(async () => {
  await app.ready();
});

const baseUrl = "http://127.0.0.1:4022";
const registerUrL = "http://127.0.0.1:4012";
const credentialsUrl = "http://127.0.0.1:7002";

describe("POST /", () => {
  it("root", async () => {
    const response = await request(baseUrl)
      .get("/")
      .expect(404)
      .expect("Content-Type", /json/);
  });

  it("no body", async () => {
    const response = await request(baseUrl)
      .post("/")
      .expect(400)
      .expect("Content-Type", /json/);

    expect(response.body).toEqual({
      statusCode: 400,
      code: "FST_ERR_VALIDATION",
      error: "Bad Request",
      message: "body must be object",
    });
  });

  it("no email", async () => {
    const response = await request(baseUrl)
      .post("/")
      .send({})
      .expect(400)
      .expect("Content-Type", /json/);

    expect(response.body).toEqual({
      statusCode: 400,
      code: "FST_ERR_VALIDATION",
      error: "Bad Request",
      message: "body must have required property 'email'",
    });
  });

  it("no password", async () => {
    const response = await request(baseUrl)
      .post("/")
      .send({
        email: "",
      })
      .expect(400)
      .expect("Content-Type", /json/);

    expect(response.body).toEqual({
      statusCode: 400,
      code: "FST_ERR_VALIDATION",
      error: "Bad Request",
      message: "body must have required property 'password'",
    });
  });

  it("bad email type", async () => {
    const response = await request(baseUrl)
      .post("/")
      .send({
        email: {},
        password: "",
      })
      .expect(400)
      .expect("Content-Type", /json/);

    expect(response.body).toEqual({
      statusCode: 400,
      code: "FST_ERR_VALIDATION",
      error: "Bad Request",
      message: "body/email must be string",
    });
  });

  it("bad email format", async () => {
    const response = await request(baseUrl)
      .post("/")
      .send({
        email: "",
        password: "",
      })
      .expect(400)
      .expect("Content-Type", /json/);

    expect(response.body).toEqual({
      statusCode: 400,
      code: "FST_ERR_VALIDATION",
      error: "Bad Request",
      message: 'body/email must match format "email"',
    });
  });

  it("password too short", async () => {
    const response = await request(baseUrl)
      .post("/")
      .send({
        email: "test@test.com",
        password: "",
      })
      .expect(400)
      .expect("Content-Type", /json/);

    expect(response.body).toEqual({
      statusCode: 400,
      code: "FST_ERR_VALIDATION",
      error: "Bad Request",
      message: `body/password must NOT have fewer than ${properties.password.minLength} characters`,
    });
  });

  it("password too long", async () => {
    const response = await request(baseUrl)
      .post("/")
      .send({
        email: "test@test.com",
        password: "QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ",
      })
      .expect(400)
      .expect("Content-Type", /json/);

    expect(response.body).toEqual({
      statusCode: 400,
      code: "FST_ERR_VALIDATION",
      error: "Bad Request",
      message: `body/password must NOT have more than ${properties.password.maxLength} characters`,
    });
  });

  const dummy = {
    account_id: null,
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
    
    expect(response.body).toEqual({
      access_token: expect.any(String),
      expire_at: expect.any(String)
    });

    dummy.account_id = app.jwt.decode(response.body.access_token).account_id;
  });

  it("auth using password", async () => {
    const response = await request(baseUrl)
      .post("/")
      .send({
        email: dummy.email,
        password: dummy.password,
      })
      .expect(200)
      .expect("Content-Type", /json/);

    expect(response.body).toEqual(
      expect.objectContaining({
        access_token: expect.any(String),
        expire_at: expect.any(String),
      })
    );
  });

  it("bad password", async () => {
    const response = await request(baseUrl)
      .post("/")
      .send({
        email: dummy.email,
        password: dummy.password + 5,
      })
      .expect(401)
      .expect("Content-Type", /json/);
  });

  it("remove dummy account", async () => {
    const response = await request(credentialsUrl)
      .delete(`/${dummy.account_id}`)
      .expect(204);
  });
});
