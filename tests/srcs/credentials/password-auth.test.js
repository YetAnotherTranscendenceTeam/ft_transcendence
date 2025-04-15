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

  describe("PATCH", () => {
    describe("Validation tests", () => {
      it("NaN account_id", async () => {
        const response = await request(baseUrl)
          .patch(`/password/ascii`)
          .send({});

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("params/account_id must be integer");
      });

      it("negative account_id", async () => {
        const response = await request(baseUrl)
          .patch(`/password/-50`)
          .send({});

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("params/account_id must be >= 1");
      });

      it("0 account_id", async () => {
        const response = await request(baseUrl)
          .patch(`/password/0`)
          .send({});

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("params/account_id must be >= 1");
      });

      it("no body", async () => {
        const response = await request(baseUrl)
          .patch(`/password/45`)
          .send();

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("body must be object");
      });

      it("empty body", async () => {
        const response = await request(baseUrl)
          .patch(`/password/1`)
          .send({});

        expect(response.statusCode).toBe(400);
      });

      it("bad email", async () => {
        const response = await request(baseUrl)
          .patch(`/password/1`)
          .send({ email: 4564 });

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("body/email must match format \"email\"");
      });

      it("email ok", async () => {
        const response = await request(baseUrl)
          .patch(`/password/999999999`)
          .send({ email: "test@test.test" });

        expect(response.statusCode).toBe(404);
      });

      it("password not an object", async () => {
        const response = await request(baseUrl)
          .patch(`/password/1`)
          .send({ password: "supersecure!" });

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("body/password must be object");
      });

      it("password empty object", async () => {
        const response = await request(baseUrl)
          .patch(`/password/1`)
          .send({ password: {} });

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("body/password must have required property 'hash'");
      });

      it("password only hash", async () => {
        const response = await request(baseUrl)
          .patch(`/password/1`)
          .send({ password: { hash: "sidgsd" } });

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("body/password must have required property 'salt'");
      });

      it("password ok", async () => {
        const response = await request(baseUrl)
          .patch(`/password/9999999999`)
          .send({
            password: {
              hash: "29582d0fb191354e55a997a97036ca121758a2f0cf1b59dabbd6fb99eac83e40d90da24ca57bc849bc5a10b0da2cdd5aa4253a176d1606cdd83b32fa10a4caa8",
              salt: "4f67470f6d2189ddba3b7c4aa779fecd16e2f1ba16da44e50171c061a549aeac"
            }
          });

        expect(response.statusCode).toBe(404);
      });

      it("password + email ok", async () => {
        const response = await request(baseUrl)
          .patch(`/password/9999999999`)
          .send({
            email: 'test@test.test',
            password: {
              hash: "29582d0fb191354e55a997a97036ca121758a2f0cf1b59dabbd6fb99eac83e40d90da24ca57bc849bc5a10b0da2cdd5aa4253a176d1606cdd83b32fa10a4caa8",
              salt: "4f67470f6d2189ddba3b7c4aa779fecd16e2f1ba16da44e50171c061a549aeac"
            }
          });

        expect(response.statusCode).toBe(404);
      });

      it("account not found", async () => {
        const response = await request(baseUrl)
          .patch(`/password/999999999`)
          .send({ email: "test@test.test" });

        expect(response.statusCode).toBe(404);
      });
    })
    describe("Success", () => {
      let user;

      beforeEach(async () => {
        user = {
          account_id: null,
          email: `password.test.js-${crypto
            .randomBytes(10)
            .toString("hex")}@jest.com`,
          hash: crypto.randomBytes(64).toString("hex"),
          salt: crypto.randomBytes(32).toString("hex"),
        }

        const response = await request(baseUrl)
          .post("/password")
          .send({
            email: user.email,
            hash: user.hash,
            salt: user.salt,
          })
          .expect(201);

        user.account_id = response.body.account_id;
      });

      afterEach(async () => {
        await request(baseUrl).delete(`/${user.account_id}`).expect(204);
      });

      it("edit email", async () => {
        const newMail = `password.test.js-${crypto.randomBytes(10).toString("hex")}@jest.com`;
        const response = await request(baseUrl)
          .patch(`/password/${user.account_id}`)
          .send({ email: newMail });

        expect(response.statusCode).toBe(204);

        const accountVerif = await request(baseUrl).get(`/${user.account_id}`);

        expect(accountVerif.statusCode).toBe(200);
        expect(accountVerif.body).toEqual(
          expect.objectContaining({
            account_id: user.account_id,
            email: newMail,
            auth_method: 'password_auth',
            created_at: expect.any(String),
            updated_at: expect.any(String),
          })
        );

        await request(baseUrl).get(`/password/${user.email}`).expect(404);

        const passwordVerif = await request(baseUrl).get(`/password/${newMail}`);

        expect(passwordVerif.statusCode).toBe(200);
        expect(passwordVerif.body).toEqual(
          expect.objectContaining({
            account_id: user.account_id,
            hash: user.hash,
            salt: user.salt,
          })
        );
      });

      it("edit password", async () => {
        const newPassword = {
          hash: crypto.randomBytes(64).toString("hex"),
          salt: crypto.randomBytes(32).toString("hex"),
        }
        const response = await request(baseUrl)
          .patch(`/password/${user.account_id}`)
          .send({ password: newPassword });

        expect(response.statusCode).toBe(204);

        const verification = await request(baseUrl).get(`/password/${user.email}`);

        expect(verification.statusCode).toBe(200);
        expect(verification.body).toEqual(
          expect.objectContaining({
            hash: newPassword.hash,
            salt: newPassword.salt
          })
        );
      });

      it("edit password and email", async () => {
        const newPassword = {
          hash: crypto.randomBytes(64).toString("hex"),
          salt: crypto.randomBytes(32).toString("hex"),
        }
        const newMail = `password.test.js-${crypto.randomBytes(10).toString("hex")}@jest.com`;

        const response = await request(baseUrl)
          .patch(`/password/${user.account_id}`)
          .send({ email: newMail, password: newPassword });

        expect(response.statusCode).toBe(204);

        await request(baseUrl).get(`/password/${user.email}`).expect(404);

        const verification = await request(baseUrl).get(`/password/${newMail}`);

        expect(verification.statusCode).toBe(200);
        expect(verification.body).toEqual(
          expect.objectContaining({
            hash: newPassword.hash,
            salt: newPassword.salt
          })
        );
      });
    });
    describe("Failures", () => {
      let users = [];

      beforeEach(async () => {
        for (let i = 0; i < 2; ++i) {
          users.push({
            account_id: null,
            email: `password.test.js-${crypto
              .randomBytes(10)
              .toString("hex")}@jest.com`,
            hash: crypto.randomBytes(64).toString("hex"),
            salt: crypto.randomBytes(32).toString("hex"),
          });

          const response = await request(baseUrl)
            .post("/password")
            .send({
              email: users[i].email,
              hash: users[i].hash,
              salt: users[i].salt,
            })
            .expect(201);

          users[i].account_id = response.body.account_id;
        }

      });

      afterEach(async () => {
        for (let i = 0; i < 2; ++i) {
          await request(baseUrl).delete(`/${users[i].account_id}`).expect(204);
        }
      });

      it("conflicting email", async () => {
        const response = await request(baseUrl)
          .patch(`/password/${users[0].account_id}`)
          .send({ email: users[1].email });

        expect(response.statusCode).toBe(409);

        const accountVerif = await request(baseUrl).get(`/${users[0].account_id}`);

        expect(accountVerif.statusCode).toBe(200);
        expect(accountVerif.body).toEqual(
          expect.objectContaining({
            account_id: users[0].account_id,
            email: users[0].email,
            auth_method: 'password_auth',
            created_at: expect.any(String),
            updated_at: expect.any(String),
          })
        );

        const passwordVerif0 = await request(baseUrl).get(`/password/${users[0].email}`);

        expect(passwordVerif0.statusCode).toBe(200);
        expect(passwordVerif0.body).toEqual(
          expect.objectContaining({
            account_id: users[0].account_id,
            hash: users[0].hash,
            salt: users[0].salt,
          })
        );

        const passwordVerif1 = await request(baseUrl).get(`/password/${users[1].email}`);

        expect(passwordVerif1.statusCode).toBe(200);
        expect(passwordVerif1.body).toEqual(
          expect.objectContaining({
            account_id: users[1].account_id,
            hash: users[1].hash,
            salt: users[1].salt,
          })
        );
      });

      it("password + conflicting email", async () => {
        const newPassword = {
          hash: crypto.randomBytes(64).toString("hex"),
          salt: crypto.randomBytes(32).toString("hex"),
        }
        const response = await request(baseUrl)
          .patch(`/password/${users[0].account_id}`)
          .send({ email: users[1].email, password: newPassword });

        expect(response.statusCode).toBe(409);

        const accountVerif = await request(baseUrl).get(`/${users[0].account_id}`);

        expect(accountVerif.statusCode).toBe(200);
        expect(accountVerif.body).toEqual(
          expect.objectContaining({
            account_id: users[0].account_id,
            email: users[0].email,
            auth_method: 'password_auth',
            created_at: expect.any(String),
            updated_at: expect.any(String),
          })
        );

        const passwordVerif0 = await request(baseUrl).get(`/password/${users[0].email}`);

        expect(passwordVerif0.statusCode).toBe(200);
        expect(passwordVerif0.body).toEqual(
          expect.objectContaining({
            account_id: users[0].account_id,
            hash: users[0].hash,
            salt: users[0].salt,
          })
        );

        const passwordVerif1 = await request(baseUrl).get(`/password/${users[1].email}`);

        expect(passwordVerif1.statusCode).toBe(200);
        expect(passwordVerif1.body).toEqual(
          expect.objectContaining({
            account_id: users[1].account_id,
            hash: users[1].hash,
            salt: users[1].salt,
          })
        );
      });
    });
  });
});
