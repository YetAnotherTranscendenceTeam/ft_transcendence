import request from "supertest";
import crypto from "crypto";
import Fastify from "fastify";
import jwt from "@fastify/jwt"
import { apiURL } from "../../URLs.js";
import { TOTP } from "totp-generator";

const app = Fastify();
app.register(jwt, { secret: process.env.AUTHENTICATION_SECRET });
app.register(jwt, { secret: process.env.TWO_FA_SECRET, namespace: "two_fa" });

beforeAll(async () => {
  await app.ready();
});

const baseUrl = "http://127.0.0.1:4022";
const registerUrL = "http://127.0.0.1:4012";

const dummy = {
  account_id: null,
  email: `dummy-account.${crypto.randomBytes(10).toString("hex")}@jest.com`,
  password: crypto.randomBytes(4).toString("hex"),
};

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
      message: expect.any(String),
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
      message: expect.any(String),
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
      message: expect.any(String),
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
      message: expect.any(String),
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
      message: expect.any(String),
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
      message: expect.any(String),
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
      message: expect.any(String),
    });
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

    expect(response.body).toEqual({
      access_token: expect.any(String),
      expire_at: expect.any(String)
    });

    dummy.account_id = app.jwt.decode(response.body.access_token).account_id;
  });

  it("auth using password", async () => {
    const response = await request(baseUrl)
      .post("/")
      .send({ email: dummy.email, password: dummy.password })
      .expect(200)
      .expect("Content-Type", /json/);

    expect(response.body).toEqual(
      expect.objectContaining({
        access_token: expect.any(String),
        expire_at: expect.any(String),
      })
    );

    dummy.access_token = response.body.access_token;
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
});

describe("POST /2fa", () => {
  it("no body", async () => {
    const response = await request(baseUrl)
      .post("/2fa")
      .send()
      .expect(400)
      .expect("Content-Type", /json/);

    expect(response.body).toEqual({
      statusCode: 400,
      code: "FST_ERR_VALIDATION",
      error: "Bad Request",
      message: "body must be object",
    });
  });

  it("empty body", async () => {
    const response = await request(baseUrl)
      .post("/2fa")
      .send({})
      .expect(400)
      .expect("Content-Type", /json/);

    expect(response.body).toEqual({
      statusCode: 400,
      code: "FST_ERR_VALIDATION",
      error: "Bad Request",
      message: "body must have required property 'payload_token'",
    });
  });

  it("no otp method", async () => {
    const response = await request(baseUrl)
      .post("/2fa")
      .send({ payload_token: {} })
      .expect(400)
      .expect("Content-Type", /json/);

    expect(response.body).toEqual({
      statusCode: 400,
      code: "FST_ERR_VALIDATION",
      error: "Bad Request",
      message: "body must have required property 'otp_method'",
    });
  });

  it("no otp", async () => {
    const response = await request(baseUrl)
      .post("/2fa")
      .send({ payload_token: {}, otp_method: {} })
      .expect(400)
      .expect("Content-Type", /json/);

    expect(response.body).toEqual({
      statusCode: 400,
      code: "FST_ERR_VALIDATION",
      error: "Bad Request",
      message: "body must have required property 'otp'",
    });
  });

  it("payload_token not a string", async () => {
    const response = await request(baseUrl)
      .post("/2fa")
      .send({ payload_token: {}, otp_method: {}, otp: {} })
      .expect(400)
      .expect("Content-Type", /json/);

    expect(response.body).toEqual({
      statusCode: 400,
      code: "FST_ERR_VALIDATION",
      error: "Bad Request",
      message: "body/payload_token must be string",
    });
  });

  it("otp_method not a string", async () => {
    const response = await request(baseUrl)
      .post("/2fa")
      .send({ payload_token: "", otp_method: {}, otp: {} })
      .expect(400)
      .expect("Content-Type", /json/);

    expect(response.body).toEqual({
      statusCode: 400,
      code: "FST_ERR_VALIDATION",
      error: "Bad Request",
      message: "body/otp_method must be string",
    });
  });

  it("otp_method not from enum", async () => {
    const response = await request(baseUrl)
      .post("/2fa")
      .send({ payload_token: "", otp_method: "", otp: {} })
      .expect(400)
      .expect("Content-Type", /json/);

    expect(response.body).toEqual({
      statusCode: 400,
      code: "FST_ERR_VALIDATION",
      error: "Bad Request",
      message: "body/otp_method must be equal to one of the allowed values",
    });
  });

  it("otp not a string", async () => {
    const response = await request(baseUrl)
      .post("/2fa")
      .send({ payload_token: "", otp_method: "none", otp: {} })
      .expect(400)
      .expect("Content-Type", /json/);

    expect(response.body).toEqual({
      statusCode: 400,
      code: "FST_ERR_VALIDATION",
      error: "Bad Request",
      message: "body/otp must be string",
    });
  });

  it("otp too short", async () => {
    const response = await request(baseUrl)
      .post("/2fa")
      .send({ payload_token: "", otp_method: "none", otp: "1234" })
      .expect(400)
      .expect("Content-Type", /json/);

    expect(response.body).toEqual({
      statusCode: 400,
      code: "FST_ERR_VALIDATION",
      error: "Bad Request",
      message: "body/otp must NOT have fewer than 6 characters",
    });
  });

  it("otp too long", async () => {
    const response = await request(baseUrl)
      .post("/2fa")
      .send({ payload_token: "", otp_method: "none", otp: "1234567" })
      .expect(400)
      .expect("Content-Type", /json/);

    expect(response.body).toEqual({
      statusCode: 400,
      code: "FST_ERR_VALIDATION",
      error: "Bad Request",
      message: "body/otp must NOT have more than 6 characters",
    });
  });

  it("validation pass", async () => {
    const response = await request(baseUrl)
      .post("/2fa")
      .send({ payload_token: "", otp_method: "none", otp: "123456" })
      .expect(401)
      .expect("Content-Type", /json/);
  });

  it("payload is invalid jwt", async () => {
    const response = await request(baseUrl)
      .post("/2fa")
      .send({ payload_token: app.jwt.sign({}), otp_method: "app", otp: "123456" })

    expect(response.statusCode).toBe(401);
  });

});

describe("2FA full flow", () => {
  it("app", async () => {
    const activate = await request(apiURL)
      .get("/2fa/app/activate")
      .set('Authorization', `Bearer ${dummy.access_token}`)

    expect(activate.statusCode).toBe(200);

    const queryString = activate.body.otpauth.split('?')[1];
    const params = new URLSearchParams(queryString);
    dummy.otpsecret = params.get('secret');

    const validate = await request(apiURL)
      .post("/2fa/app/activate/verify")
      .set('Authorization', `Bearer ${dummy.access_token}`)
      .send({ otp: TOTP.generate(dummy.otpsecret).otp })

    expect(validate.statusCode).toBe(204);

    const authenticate = await request(apiURL)
      .post("/auth")
      .send({ email: dummy.email, password: dummy.password })

    expect(authenticate.statusCode).toBe(202);
    expect(authenticate.body).toMatchObject({
      statusCode: 202,
      code: "2FA_VERIFICATION",
      payload_token: expect.any(String)
    })

    const twofa = await request(apiURL)
      .post("/auth/2fa")
      .send({ otp_method: "app", otp: TOTP.generate(dummy.otpsecret).otp, payload_token: authenticate.body.payload_token })

    expect(twofa.statusCode).toBe(200);
    expect(twofa.body).toEqual({
      access_token: expect.any(String),
      expire_at: expect.any(String),
    })
  })
});
