import request from "supertest";
import crypto from "crypto";
import { properties } from "../../../modules/yatt-utils/srcs";

const baseUrl = "http://127.0.0.1:4012";
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

  const accounts = [];

  for (let i = 0; i < 10; ++i) {
    accounts.push({
      account_id: null,
      email: `password.test.js-${crypto
        .randomBytes(10)
        .toString("hex")}@jest.com`,
      password: crypto.randomBytes(5).toString("hex"),
    });
  }

  accounts.forEach((acc, i) => {
    it(`account creation ${i + 1}`, async () => {
      const response = await request(baseUrl)
        .post("/")
        .send({
          email: accounts[i].email,
          password: accounts[i].password,
        })
        .expect(201)
        .expect("Content-Type", /json/);

      accounts[i].account_id = response.body.account.account_id;
      expect(response.body);
    });

    it(`email already used  ${i + 1}`, async () => {
      const response = await request(baseUrl)
        .post("/")
        .send({
          email: accounts[i].email,
          password: accounts[i].password,
        })
        // .expect(409)
        .expect("Content-Type", /json/);

      expect(response.body).toEqual({
        statusCode: 409,
        code: "AUTH_EMAIL_IN_USE",
        error: "Email Already In Use",
        message: "This email is already associated with an account",
      });
    });
  });

  for (let i = 0; i < 10; ++i) {
    const rand = Math.floor(Math.random() * accounts.length);
    it(`get random account entry ${i + 1}`, async () => {
      const response = await request(credentialsUrl)
        .get(`/${accounts[rand].email}`)
        .expect(200)
        .expect("Content-Type", /json/);

      expect(response.body.account_id).toBe(accounts[rand].account_id);
      expect(response.body.auth_method).toBe("password_auth");
      expect(response.body.email).toBe(accounts[rand].email);
    });

    it(`get random password entry ${i + 1}`, async () => {
      const response = await request(credentialsUrl)
        .get(`/password/${accounts[rand].email}`)
        .expect(200)
        .expect("Content-Type", /json/);

      expect(response.body.account_id).toBe(accounts[rand].account_id);
      expect(response.body.email).toBe(accounts[rand].email);
    });
  }

  accounts.forEach((acc, i) => {
    it(`delete account ${i + 1}`, async () => {
      await request(credentialsUrl)
        .delete(`/${accounts[i].account_id}`)
        .expect(204);
    });
  });

  accounts.forEach((acc, i) => {
    it(`check deletion ${i + 1}`, async () => {
      const response = await request(credentialsUrl)
        .get(`/${accounts[i].email}`)
        .expect(404)
        .expect("Content-Type", /json/);

      expect(response.body).toEqual({
        statusCode: 404,
        code: "ACCOUNT_NOT_FOUND",
        error: "Account Not Found",
        message: "The requested account does not exist",
      });
    });
  });
});
