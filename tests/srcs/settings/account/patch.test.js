import request from "supertest";
import { createUsers, users } from "../../../dummy/dummy-account";
import { apiURL } from "../../../URLs";
import crypto from "crypto";
import { createUsers_2fa, users_2fa } from "../../../dummy/dummy-account_2fa";

createUsers(1);
createUsers_2fa(2);

const patch_2fa = {};

describe('Settings Router', () => {
  describe("PATCH /settings/account", () => {
    describe("Bad request", () => {
      it("no body", async () => {
        await request(apiURL)
          .patch("/settings/account")
          .set("Authorization", `Bearer ${users[0].jwt}`)
          .send()
          .expect(400); // Schema validation should fail
      });

      it("missing required fields", async () => {
        await request(apiURL)
          .patch("/settings/account")
          .set("Authorization", `Bearer ${users[0].jwt}`)
          .send({})
          .expect(400); // Schema validation should fail
      });

      it("invalid auth_method value", async () => {
        await request(apiURL)
          .patch("/settings/account")
          .set("Authorization", `Bearer ${users[0].jwt}`)
          .send({ auth_method: "invalid_auth" })
          .expect(400); // Schema validation should fail
      });

      it("without old_password", async () => {
        await request(apiURL)
          .patch("/settings/account")
          .set("Authorization", `Bearer ${users[0].jwt}`)
          .send({
            email: "user@example.com",
            password: "newPassword123",
          })
          .expect(400); // Missing required field `old_password`

      });

      it("wrong password", async () => {
        await request(apiURL)
          .patch("/settings/account")
          .set("Authorization", `Bearer ${users[0].jwt}`)
          .send({
            email: "user@example.com",
            password: "newPassword123",
            old_password: "oldPassword123",
          })
          .expect(403); // Forbidden
      });

      it("nothing to do", async () => {
        const response = await request(apiURL)
          .patch("/settings/account")
          .set("Authorization", `Bearer ${users[0].jwt}`)
          .send({
            old_password: users[0].password,
          })

        expect(response.statusCode).toBe(400);
      });
    });

    describe("Success", () => {
      afterEach(async () => {
        const response = await request(apiURL)
          .post("/auth").send({
            email: users[0].email,
            password: users[0].password,
          })

        expect(response.statusCode).toBe(200);
      });

      it("password unchanged", async () => {
        const response = await request(apiURL)
          .patch("/settings/account")
          .set("Authorization", `Bearer ${users[0].jwt}`)
          .send({
            password: users[0].password,
            old_password: users[0].password,
          })

        expect(response.statusCode).toBe(204);
      });

      it("password change", async () => {
        const new_password = crypto.randomBytes(5).toString('hex');
        const response = await request(apiURL)
          .patch("/settings/account")
          .set("Authorization", `Bearer ${users[0].jwt}`)
          .send({
            password: new_password,
            old_password: users[0].password,
          })

        expect(response.statusCode).toBe(204);
        const old_password = users[0].password;
        users[0].password = new_password;

        const auth = await request(apiURL)
          .post("/auth")
          .send({ email: users[0].email, password: users[0].password });

        expect(auth.statusCode).toBe(200);

        const baddpwd = await request(apiURL)
          .post("/auth")
          .send({ email: users[0].email, password: old_password });

        expect(baddpwd.statusCode).toBe(401);
      });

      it("email change", async () => {
        const new_email = `password.test.js-${crypto.randomBytes(10).toString("hex")}@jest.com`;
        const response = await request(apiURL)
          .patch("/settings/account")
          .set("Authorization", `Bearer ${users[0].jwt}`)
          .send({
            email: new_email,
            old_password: users[0].password,
          })

        expect(response.statusCode).toBe(204);
        users[0].email = new_email;
      });

      it("email change + password change", async () => {
        const new_email = `password.test.js-${crypto.randomBytes(10).toString("hex")}@jest.com`;
        const new_password = crypto.randomBytes(5).toString('hex');
        const response = await request(apiURL)
          .patch("/settings/account")
          .set("Authorization", `Bearer ${users[0].jwt}`)
          .send({
            email: new_email,
            password: new_password,
            old_password: users[0].password,
          })

        expect(response.statusCode).toBe(204);
        users[0].email = new_email;
        const old_password = users[0].password;
        users[0].password = new_password;

        const auth = await request(apiURL)
          .post("/auth")
          .send({ email: users[0].email, password: users[0].password });

        expect(auth.statusCode).toBe(200);

        const baddpwd = await request(apiURL)
          .post("/auth")
          .send({ email: users[0].email, password: old_password });

        expect(baddpwd.statusCode).toBe(401);
      });

      it("update email with same email", async () => {
        const response = await request(apiURL)
          .patch("/settings/account")
          .set("Authorization", `Bearer ${users[0].jwt}`)
          .send({
            email: users[0].email,
            old_password: users[0].password,
          })

        expect(response.statusCode).toBe(204);
      });
    });

    describe("2FA activated", () => {
      afterEach(async () => {
        const auth = await request(apiURL)
          .post("/auth")
          .send({ email: users_2fa[0].email, password: users_2fa[0].password });

        expect(auth.statusCode).toBe(202);
      })

      describe("Bad request", () => {
        it("no body", async () => {
          await request(apiURL)
            .patch("/settings/account")
            .set("Authorization", `Bearer ${users_2fa[0].jwt}`)
            .send()
            .expect(400); // Schema validation should fail
        });

        it("missing required fields", async () => {
          await request(apiURL)
            .patch("/settings/account")
            .set("Authorization", `Bearer ${users_2fa[0].jwt}`)
            .send({})
            .expect(400); // Schema validation should fail
        });

        it("invalid auth_method value", async () => {
          await request(apiURL)
            .patch("/settings/account")
            .set("Authorization", `Bearer ${users_2fa[0].jwt}`)
            .send({ auth_method: "invalid_auth" })
            .expect(400); // Schema validation should fail
        });

        it("without old_password", async () => {
          await request(apiURL)
            .patch("/settings/account")
            .set("Authorization", `Bearer ${users_2fa[0].jwt}`)
            .send({
              email: "user@example.com",
              password: "newPassword123",
            })
            .expect(400); // Missing required field `old_password`
        });

        it("wrong password", async () => {
          await request(apiURL)
            .patch("/settings/account")
            .set("Authorization", `Bearer ${users_2fa[0].jwt}`)
            .send({
              email: "user@example.com",
              password: "newPassword123",
              old_password: "oldPassword123",
            })
            .expect(403); // Forbidden
        });

        it("nothing to do", async () => {
          const response = await request(apiURL)
            .patch("/settings/account")
            .set("Authorization", `Bearer ${users_2fa[0].jwt}`)
            .send({ old_password: users_2fa[0].password })

          expect(response.statusCode).toBe(400);
        });
      }); // Bad request

      it("password unchanged", async () => {
        const response = await request(apiURL)
          .patch("/settings/account")
          .set("Authorization", `Bearer ${users_2fa[0].jwt}`)
          .send({
            password: users_2fa[0].password,
            old_password: users_2fa[0].password,
          })

        expect(response.statusCode).toBe(202);
      });

      it("password change", async () => {
        const new_password = crypto.randomBytes(5).toString('hex');
        const response = await request(apiURL)
          .patch("/settings/account")
          .set("Authorization", `Bearer ${users_2fa[0].jwt}`)
          .send({
            password: new_password,
            old_password: users_2fa[0].password,
          })

        expect(response.statusCode).toBe(202);
      });

      it("email change", async () => {
        const new_email = `password.test.js-${crypto.randomBytes(10).toString("hex")}@jest.com`;
        const response = await request(apiURL)
          .patch("/settings/account")
          .set("Authorization", `Bearer ${users_2fa[0].jwt}`)
          .send({
            email: new_email,
            old_password: users_2fa[0].password,
          })

        expect(response.statusCode).toBe(202);
      });

      it("email change + password change", async () => {
        const new_email = `password.test.js-${crypto.randomBytes(10).toString("hex")}@jest.com`;
        const new_password = crypto.randomBytes(5).toString('hex');
        const response = await request(apiURL)
          .patch("/settings/account")
          .set("Authorization", `Bearer ${users_2fa[0].jwt}`)
          .send({
            email: new_email,
            password: new_password,
            old_password: users_2fa[0].password,
          })

        expect(response.statusCode).toBe(202);
        patch_2fa.payload_token = response.body.payload_token;
        patch_2fa.email = new_email;
        patch_2fa.password = new_password;
      });

      it("update email with same email", async () => {
        const response = await request(apiURL)
          .patch("/settings/account")
          .set("Authorization", `Bearer ${users_2fa[0].jwt}`)
          .send({
            email: users_2fa[0].email,
            old_password: users_2fa[0].password,
          })

        expect(response.statusCode).toBe(202);
      });
    })
  }); // 2FA activated

  describe("PATCH /settings/account/2fa", () => {
    describe("Bad Request", () => {
      let error = "body must be object"
      it(error, async () => {
        const response = await request(apiURL)
          .patch("/settings/account/2fa")
          .set("Authorization", `Bearer ${users_2fa[0].jwt}`)
          .send();

        expect(response.statusCode).toBe(400);
      });

      error = "body must have required property 'payload_token'";
      it(error, async () => {
        const response = await request(apiURL)
          .patch("/settings/account/2fa")
          .set("Authorization", `Bearer ${users_2fa[0].jwt}`)
          .send({});

        expect(response.statusCode).toBe(400);
      });

      error = "body must have required property 'otp_method'"
      it(error, async () => {
        const response = await request(apiURL)
          .patch("/settings/account/2fa")
          .set("Authorization", `Bearer ${users_2fa[0].jwt}`)
          .send({ payload_token: {} });

        expect(response.statusCode).toBe(400);
      });

      error = "body must have required property 'otp'"
      it(error, async () => {
        const response = await request(apiURL)
          .patch("/settings/account/2fa")
          .set("Authorization", `Bearer ${users_2fa[0].jwt}`)
          .send({ payload_token: {}, otp_method: {} });

        expect(response.statusCode).toBe(400);
      });

      error = "body/payload_token must be string"
      it(error, async () => {
        const response = await request(apiURL)
          .patch("/settings/account/2fa")
          .set("Authorization", `Bearer ${users_2fa[0].jwt}`)
          .send({ payload_token: {}, otp_method: {}, otp: {} });

        expect(response.statusCode).toBe(400);
      });

      error = "body/otp_method must be string"
      it(error, async () => {
        const response = await request(apiURL)
          .patch("/settings/account/2fa")
          .set("Authorization", `Bearer ${users_2fa[0].jwt}`)
          .send({ payload_token: "", otp_method: {}, otp: {} });

        expect(response.statusCode).toBe(400);
      });

      error = "body/otp_method must be equal to one of the allowed values"
      it(error, async () => {
        const response = await request(apiURL)
          .patch("/settings/account/2fa")
          .set("Authorization", `Bearer ${users_2fa[0].jwt}`)
          .send({ payload_token: "", otp_method: "", otp: {} });

        expect(response.statusCode).toBe(400);
      });

      error = "body/otp must be string"
      it(error, async () => {
        const response = await request(apiURL)
          .patch("/settings/account/2fa")
          .set("Authorization", `Bearer ${users_2fa[0].jwt}`)
          .send({ payload_token: "", otp_method: "app", otp: {} });

        expect(response.statusCode).toBe(400);
      });

      error = "body/otp must NOT have fewer than 6 characters"
      it(error, async () => {
        const response = await request(apiURL)
          .patch("/settings/account/2fa")
          .set("Authorization", `Bearer ${users_2fa[0].jwt}`)
          .send({ payload_token: "", otp_method: "app", otp: "1234567" });

        expect(response.statusCode).toBe(400);
      });
    }) // Bad Request

    it("invalid payload_token", async () => {
      const response = await request(apiURL)
        .patch("/settings/account/2fa")
        .set("Authorization", `Bearer ${users_2fa[0].jwt}`)
        .send({ payload_token: "45645", otp_method: "app", otp: "123456" });

      expect(response.statusCode).toBe(401);
    });

    it("authentication token", async () => {
      const response = await request(apiURL)
        .patch("/settings/account/2fa")
        .set("Authorization", `Bearer ${users_2fa[0].jwt}`)
        .send({ payload_token: users_2fa[0].jwt, otp_method: "app", otp: "123456" });

      expect(response.statusCode).toBe(401);
    });

    it("bad otp", async () => {
      const response = await request(apiURL)
        .patch("/settings/account/2fa")
        .set("Authorization", `Bearer ${users_2fa[0].jwt}`)
        .send({ payload_token: patch_2fa.payload_token, otp_method: "app", otp: "123456" });

      expect(response.statusCode).toBe(403);
    });

    it("Success", async () => {
      const response = await request(apiURL)
        .patch("/settings/account/2fa")
        .set("Authorization", `Bearer ${users_2fa[0].jwt}`)
        .send({ payload_token: patch_2fa.payload_token, otp_method: "app", otp: users_2fa[0].otp() });

      expect(response.statusCode).toBe(204);

      const old_auth = await request(apiURL)
        .post("/auth")
        .send({ email: users_2fa[0].email, password: users_2fa[0].password });

      expect(old_auth.statusCode).toBe(401);

      const new_auth = await request(apiURL)
        .post("/auth")
        .send({ email: patch_2fa.email, password: patch_2fa.password });

      expect(new_auth.statusCode).toBe(202);
    });
  });
});
