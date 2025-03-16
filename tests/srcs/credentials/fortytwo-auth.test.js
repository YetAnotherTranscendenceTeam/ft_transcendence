import request from "supertest";
import crypto from "crypto";

const baseUrl = "http://127.0.0.1:7002";

describe("fortytwo-auth", () => {
  it("no body", async () => {
    const response = await request(baseUrl)
      .post("/fortytwo")
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
      .post("/fortytwo")
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

  it("no intra_user_id", async () => {
    const response = await request(baseUrl)
      .post("/fortytwo")
      .send({
        email: "",
      })
      .expect(400)
      .expect("Content-Type", /json/);

    expect(response.body).toEqual({
      statusCode: 400,
      code: "FST_ERR_VALIDATION",
      error: "Bad Request",
      message: "body must have required property 'intra_user_id'",
    });
  });

  it("bad email format 1", async () => {
    const response = await request(baseUrl)
      .post("/fortytwo")
      .send({
        email: "",
        intra_user_id: "",
        username: "",
        avatar: "",
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

  it("bad email format 2", async () => {
    const response = await request(baseUrl)
      .post("/fortytwo")
      .send({
        email: "fklfkfjskl",
        intra_user_id: "",
        username: "",
        avatar: "",
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

  it("bad intra_user_id 1", async () => {
    const response = await request(baseUrl)
      .post("/fortytwo")
      .send({
        email: "test@test.com",
        intra_user_id: "",
        username: "",
        avatar: "",
      })
      .expect(400)
      .expect("Content-Type", /json/);

    expect(response.body).toEqual({
      statusCode: 400,
      code: "FST_ERR_VALIDATION",
      error: "Bad Request",
      message: "body/intra_user_id must be integer",
    });
  });

  it("bad intra_user_id 2", async () => {
    const response = await request(baseUrl)
      .post("/fortytwo")
      .send({
        email: "test@test.com",
        intra_user_id: "not-a-number",
        username: "",
        avatar: "",
      })
      .expect(400)
      .expect("Content-Type", /json/);

    expect(response.body).toEqual({
      statusCode: 400,
      code: "FST_ERR_VALIDATION",
      error: "Bad Request",
      message: "body/intra_user_id must be integer",
    });
  });

  const accounts = [];

  for (let i = 0; i < 10; ++i) {
    accounts.push({
      account_id: null,
      email: `password.test.js-${crypto
        .randomBytes(10)
        .toString("hex")}@jest.com`,
      intra_user_id: Math.floor(Math.random() * 2000000),
      username: `ft-${crypto.randomBytes(4).toString('hex')}`,
      avatar: `https://ft-${crypto.randomBytes(4).toString('hex')}.uri`
    });
  }

  accounts.forEach((acc, i) => {
    it(`account creation ${i + 1}`, async () => {
      const response = await request(baseUrl)
        .post("/fortytwo")
        .send({
          email: accounts[i].email,
          intra_user_id: accounts[i].intra_user_id,
          username: accounts[i].username,
          avatar: accounts[i].avatar,
        })
        .expect(201)
        .expect("Content-Type", /json/);

      accounts[i].account_id = response.body.account_id;
      expect(response.body);
    });

    it(`email already used  ${i + 1}`, async () => {
      const response = await request(baseUrl)
        .post("/fortytwo")
        .send({
          email: accounts[i].email,
          intra_user_id: accounts[i].intra_user_id,
          username: accounts[i].username,
          avatar: accounts[i].avatar,
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
      expect(response.body.auth_method).toBe("fortytwo_auth");
      expect(response.body.email).toBe(accounts[rand].email);
    });

    it(`get random password entry ${i + 1}`, async () => {
      const response = await request(baseUrl)
        .get(`/fortytwo/${accounts[rand].intra_user_id}`)
        .expect(200)
        .expect("Content-Type", /json/);

      expect(response.body.account_id).toBe(accounts[rand].account_id);
      expect(response.body.email).toBe(accounts[rand].email);
      expect(response.body.intra_user_id).toBe(accounts[rand].intra_user_id);
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
