import request from "supertest";
import { app, createUsers, users } from "../../../dummy/dummy-account";
import { apiURL, credentialsURL } from "../../../URLs";
import crypto from "crypto";
import { randomEmail, randomFortytwoUser, randomGoogleUser } from "../../../dummy/generate";

createUsers(1);

describe('Settings Router', () => {
  describe("PATCH /settings/account", () => {
    describe("general", () => {
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
    })
    describe("password_auth", () => {
      describe("Bad requests", () => {
        it("without old_password", async () => {
          await request(apiURL)
            .patch("/settings/account")
            .set("Authorization", `Bearer ${users[0].jwt}`)
            .send({
              auth_method: "password_auth",
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
              auth_method: "password_auth",
              email: "user@example.com",
              password: "newPassword123",
              old_password: "oldPassword123",
            })
            .expect(403); // Forbiden
        });

        it("nothing to do", async () => {
          const response = await request(apiURL)
            .patch("/settings/account")
            .set("Authorization", `Bearer ${users[0].jwt}`)
            .send({
              auth_method: "password_auth",
              old_password: users[0].password,
            })

          expect(response.statusCode).toBe(400);
        });
      })


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
              auth_method: "password_auth",
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
              auth_method: "password_auth",
              password: new_password,
              old_password: users[0].password,
            })

          expect(response.statusCode).toBe(204);
          users[0].password = new_password;
        });

        it("email change", async () => {
          const new_email = `password.test.js-${crypto.randomBytes(10).toString("hex")}@jest.com`;
          const response = await request(apiURL)
            .patch("/settings/account")
            .set("Authorization", `Bearer ${users[0].jwt}`)
            .send({
              auth_method: "password_auth",
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
              auth_method: "password_auth",
              email: new_email,
              password: new_password,
              old_password: users[0].password,
            })

          expect(response.statusCode).toBe(204);
          users[0].email = new_email;
          users[0].password = new_password;
        });

        it("update email with same email", async () => {
          const response = await request(apiURL)
            .patch("/settings/account")
            .set("Authorization", `Bearer ${users[0].jwt}`)
            .send({
              auth_method: "password_auth",
              email: users[0].email,
              old_password: users[0].password,
            })

          expect(response.statusCode).toBe(204);
        });
      })
    });

    describe("google_auth", () => {
      let user;

      beforeEach(async () => {
        user = randomGoogleUser();
        const response = await request(credentialsURL)
          .post(`/google`)
          .send({
            email: user.email,
            google_id: user.google_id,
          });

        expect(response.statusCode).toBe(201);
        expect(response.body).toMatchObject({
          account_id: expect.any(Number)
        })

        const { account_id } = response.body;
        user.account_id = account_id;
        user.jwt = app.jwt.sign({ account_id });
      });

      afterEach(async () => {
        await request(credentialsURL).delete(`/${user.account_id}`).expect(204);
      });

      describe("Forbidden", () => {
        it("wrong auth method", async () => {
          await request(apiURL)
            .patch("/settings/account")
            .set("Authorization", `Bearer ${user.jwt}`)
            .send({
              auth_method: "fortytwo_auth",
            })
            .expect(403);
        });

        it("wrong auth method", async () => {
          await request(apiURL)
            .patch("/settings/account")
            .set("Authorization", `Bearer ${user.jwt}`)
            .send({
              auth_method: "password_auth",
              old_password: "password",
            })
            .expect(403);
        });
      })

      describe("Bad requests", () => {
        it("extra property", async () => {
          const response = await request(apiURL)
            .patch("/settings/account")
            .set("Authorization", `Bearer ${user.jwt}`)
            .send({
              auth_method: "google_auth",
              extra: "property",
            });

          expect(response.statusCode).toBe(400);
        });
      })

      describe("Success", () => {
        it("not implemented", async () => {
          const response = await request(apiURL)
            .patch("/settings/account")
            .set("Authorization", `Bearer ${user.jwt}`)
            .send({
              auth_method: "google_auth",
            });

          expect(response.statusCode).toBe(501);
        });
      })
    });

    describe("fortytwo_auth", () => {
      let user;

      beforeEach(async () => {
        user = randomFortytwoUser();
        const response = await request(credentialsURL)
          .post(`/fortytwo`)
          .send({
            email: user.email,
            intra_user_id: user.intra_user_id,
          });

        expect(response.statusCode).toBe(201);
        expect(response.body).toMatchObject({
          account_id: expect.any(Number)
        })

        const { account_id } = response.body;
        user.account_id = account_id;
        user.jwt = app.jwt.sign({ account_id });
      });

      afterEach(async () => {
        await request(credentialsURL).delete(`/${user.account_id}`).expect(204);
      });

      describe("Forbidden", () => {
        it("wrong auth method", async () => {
          await request(apiURL)
            .patch("/settings/account")
            .set("Authorization", `Bearer ${user.jwt}`)
            .send({
              auth_method: "google_auth",
            })
            .expect(403);
        });

        it("wrong auth method", async () => {
          await request(apiURL)
            .patch("/settings/account")
            .set("Authorization", `Bearer ${user.jwt}`)
            .send({
              auth_method: "password_auth",
              old_password: "password",
            })
            .expect(403);
        });
      })

      describe("Bad requests", () => {
        it("extra property", async () => {
          const response = await request(apiURL)
            .patch("/settings/account")
            .set("Authorization", `Bearer ${user.jwt}`)
            .send({
              auth_method: "fortytwo_auth",
              extra: "property",
            });

          expect(response.statusCode).toBe(400);
        });

        it("nothing to do", async () => {
          const response = await request(apiURL)
            .patch("/settings/account")
            .set("Authorization", `Bearer ${user.jwt}`)
            .send({
              auth_method: "fortytwo_auth",
            });

          expect(response.statusCode).toBe(400);
        });
      })

      describe("Success", () => {
        it("update email", async () => {
          const newEmail = randomEmail("patch");
          const response = await request(apiURL)
            .patch("/settings/account")
            .set("Authorization", `Bearer ${user.jwt}`)
            .send({
              auth_method: "fortytwo_auth",
              email: newEmail,
            });

          expect(response.statusCode).toBe(204);

          const me = await request(apiURL)
            .get("/me")
            .set("Authorization", `Bearer ${user.jwt}`)

          expect(me.statusCode).toBe(200);
          expect(me.body.account_id).toBe(user.account_id);
          expect(me.body.credentials.account_id).toBe(user.account_id);
          expect(me.body.credentials.email).toBe(newEmail);
        });
      })

      describe("Conflict", () => {
        let conflict;

        beforeEach(async () => {
          conflict = randomGoogleUser();
          const response = await request(credentialsURL)
            .post(`/google`)
            .send({
              email: conflict.email,
              google_id: conflict.google_id,
            });

          expect(response.statusCode).toBe(201);
          expect(response.body).toMatchObject({
            account_id: expect.any(Number)
          })

          const { account_id } = response.body;
          conflict.account_id = account_id;
          conflict.jwt = app.jwt.sign({ account_id });
        })

        it("update email", async () => {
          const response = await request(apiURL)
            .patch("/settings/account")
            .set("Authorization", `Bearer ${user.jwt}`)
            .send({
              auth_method: "fortytwo_auth",
              email: conflict.email,
            });

          expect(response.statusCode).toBe(409);

          const me = await request(apiURL)
            .get("/me")
            .set("Authorization", `Bearer ${user.jwt}`)

          expect(me.statusCode).toBe(200);
          expect(me.body.account_id).toBe(user.account_id);
          expect(me.body.credentials.account_id).toBe(user.account_id);
          expect(me.body.credentials.email).toBe(user.email);
        });
      });
    });
  });
});