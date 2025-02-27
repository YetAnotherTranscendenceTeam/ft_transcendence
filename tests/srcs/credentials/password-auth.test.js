import request from "supertest";
import crypto from "crypto";

const baseUrl = "http://127.0.0.1:7002";

describe("PASSWORD ACCOUNTS", () => {
  it("no body", async () => {
    const response = await request(baseUrl)
      .post("/password")
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
      .post("/password")
      .send({
        username: "testuser",
        password: "testpassword",
      })
      .expect(400)
      .expect("Content-Type", /json/);

    expect(response.body).toEqual({
      statusCode: 400,
      code: "FST_ERR_VALIDATION",
      error: "Bad Request",
      message: "body must have required property 'email'",
    });
  });

  it("no hash", async () => {
    const response = await request(baseUrl)
      .post("/password")
      .send({
        email: "",
      })
      .expect(400)
      .expect("Content-Type", /json/);

    expect(response.body).toEqual({
      statusCode: 400,
      code: "FST_ERR_VALIDATION",
      error: "Bad Request",
      message: "body must have required property 'hash'",
    });
  });

  it("no salt", async () => {
    const response = await request(baseUrl)
      .post("/password")
      .send({
        email: "",
        hash: "",
      })
      .expect(400)
      .expect("Content-Type", /json/);

    expect(response.body).toEqual({
      statusCode: 400,
      code: "FST_ERR_VALIDATION",
      error: "Bad Request",
      message: "body must have required property 'salt'",
    });
  });

  it("bad email format", async () => {
    const response = await request(baseUrl)
      .post("/password")
      .send({
        email: "",
        hash: "",
        salt: "",
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

  it("bad hash 1", async () => {
    const response = await request(baseUrl)
      .post("/password")
      .send({
        email: "test@test.com",
        hash: "",
        salt: "",
      })
      .expect(400)
      .expect("Content-Type", /json/);

    expect(response.body).toEqual({
      statusCode: 400,
      code: "FST_ERR_VALIDATION",
      error: "Bad Request",
      message: "body/hash must NOT have fewer than 128 characters",
    });
  });

  it("bad hash 2", async () => {
    const response = await request(baseUrl)
      .post("/password")
      .send({
        email: "test@test.com",
        hash: "02b1d478517f93d8cee16fa22e15437d58a7629b7aae6916b192f803b4014d74cceabf00e88cb8c8b89de277f75cda6379e7f0576a32ca2f0802d4e77650f68f!",
        salt: "",
      })
      .expect(400)
      .expect("Content-Type", /json/);

    expect(response.body).toEqual({
      statusCode: 400,
      code: "FST_ERR_VALIDATION",
      error: "Bad Request",
      message: "body/hash must NOT have more than 128 characters",
    });
  });

  it("bad salt 1", async () => {
    const response = await request(baseUrl)
      .post("/password")
      .send({
        email: "test@test.com",
        hash: "02b1d478517f93d8cee16fa22e15437d58a7629b7aae6916b192f803b4014d74cceabf00e88cb8c8b89de277f75cda6379e7f0576a32ca2f0802d4e77650f68f",
        salt: "",
      })
      .expect(400)
      .expect("Content-Type", /json/);

    expect(response.body).toEqual({
      statusCode: 400,
      code: "FST_ERR_VALIDATION",
      error: "Bad Request",
      message: "body/salt must NOT have fewer than 64 characters",
    });
  });

  it("bad salt 2", async () => {
    const response = await request(baseUrl)
      .post("/password")
      .send({
        email: "test@test.com",
        hash: "02b1d478517f93d8cee16fa22e15437d58a7629b7aae6916b192f803b4014d74cceabf00e88cb8c8b89de277f75cda6379e7f0576a32ca2f0802d4e77650f68f",
        salt: "c77568641c27c0ec939d5e48e1ce673e2101d4ab187e5151e2feb27828e46365!",
      })
      .expect(400)
      .expect("Content-Type", /json/);

    expect(response.body).toEqual({
      statusCode: 400,
      code: "FST_ERR_VALIDATION",
      error: "Bad Request",
      message: "body/salt must NOT have more than 64 characters",
    });
  });

  const accounts = [];

  for (let i = 0; i < 10; ++i) {
    accounts.push({
      account_id: null,
      email: `password.test.js-${crypto
        .randomBytes(10)
        .toString("hex")}@jest.com`,
      hash: crypto.randomBytes(64).toString("hex"),
      salt: crypto.randomBytes(32).toString("hex"),
    });
  }

  accounts.forEach((acc, i) => {
    it(`account creation ${i + 1}`, async () => {
      const response = await request(baseUrl)
        .post("/password")
        .send({
          email: accounts[i].email,
          hash: accounts[i].hash,
          salt: accounts[i].salt,
        })
        .expect(201)
        .expect("Content-Type", /json/);

      accounts[i].account_id = response.body.account_id;
      expect(response.body);
    });

    it(`email already used  ${i + 1}`, async () => {
      const response = await request(baseUrl)
        .post("/password")
        .send({
          email: accounts[i].email,
          hash: accounts[i].hash,
          salt: accounts[i].salt,
        })
        .expect(409)
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
      const response = await request(baseUrl)
        .get(`/${accounts[rand].account_id}`)
        .expect(200)
        .expect("Content-Type", /json/);

      expect(response.body.account_id).toBe(accounts[rand].account_id);
      expect(response.body.auth_method).toBe("password_auth");
      expect(response.body.email).toBe(accounts[rand].email);
    });

    it(`get random password entry ${i + 1}`, async () => {
      const response = await request(baseUrl)
        .get(`/password/${accounts[rand].email}`)
        .expect(200)
        .expect("Content-Type", /json/);

      expect(response.body.account_id).toBe(accounts[rand].account_id);
      expect(response.body.email).toBe(accounts[rand].email);
      expect(response.body.hash).toBe(accounts[rand].hash);
      expect(response.body.salt).toBe(accounts[rand].salt);
    });
  }

  accounts.forEach((acc, i) => {
    it(`delete account ${i + 1}`, async () => {
      await request(baseUrl).delete(`/${accounts[i].account_id}`).expect(204);
    });
  });

  accounts.forEach((acc, i) => {
    it(`check deletion ${i + 1}`, async () => {
      const response = await request(baseUrl)
        .get(`/${accounts[i].account_id}`)
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
