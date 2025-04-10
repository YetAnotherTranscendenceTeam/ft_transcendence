import request from "supertest";
import { createUsers, users } from "../../../dummy/dummy-account";
import { apiURL } from "../../../URLs";
import crypto from "crypto";

createUsers(1);

describe('Settings Router', () => {
  describe("PATCH /settings/account", () => {
    describe("password_auth", () => {
      describe("Bas requests", () => {
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

        it("wrong auth method", async () => {
          await request(apiURL)
            .patch("/settings/account")
            .set("Authorization", `Bearer ${users[0].jwt}`)
            .send({
              auth_method: "google_auth",
            })
            .expect(403); // Missing required field `old_password`
        });

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

      // it("fortytwo_auth with required fields", async () => {
      //   await request(apiURL)
      //     .patch("/settings/account")
      //     .set("Authorization", `Bearer ${users[0].jwt}`)
      //     .send({
      //       auth_method: "fortytwo_auth",
      //       email: "user@example.com",
      //     })
      //     .expect(204); // Assuming successful update
      // });

      // it("fortytwo_auth missing email field", async () => {
      //   await request(apiURL)
      //     .patch("/settings/account")
      //     .set("Authorization", `Bearer ${users[0].jwt}`)
      //     .send({
      //       auth_method: "fortytwo_auth",
      //     })
      //     .expect(400); // Missing required field `email`
      // });

      // it("google_auth with required fields", async () => {
      //   await request(apiURL)
      //     .patch("/settings/account")
      //     .set("Authorization", `Bearer ${users[0].jwt}`)
      //     .send({
      //       auth_method: "google_auth",
      //     })
      //     .expect(204); // Assuming successful update
      // });

      // it("google_auth with additional properties", async () => {
      //   await request(apiURL)
      //     .patch("/settings/account")
      //     .set("Authorization", `Bearer ${users[0].jwt}`)
      //     .send({
      //       auth_method: "google_auth",
      //       extraField: "notAllowed",
      //     })
      //     .expect(400); // Schema validation should fail due to additional properties
      // });

      // it("auth_method mismatch with stored account method", async () => {
      //   const response = await request(apiURL)
      //     .patch("/settings/account")
      //     .set("Authorization", `Bearer ${users[0].jwt}`)
      //     .send({
      //       auth_method: "google_auth",
      //       email: "user@example.com",
      //     })
      //     .expect(403); // Auth method mismatch (as per handler logic)

      //   expect(response.body.error).toBe("Forbidden");
      // });

      // it("unauthorized request (no token)", async () => {
      //   await request(apiURL)
      //     .patch("/settings/account")
      //     .send({
      //       auth_method: "password_auth",
      //       email: "user@example.com",
      //       password: "newPassword123",
      //       old_password: "oldPassword123",
      //     })
      //     .expect(401); // Unauthorized
      // });

      // it("unauthorized request (invalid token)", async () => {
      //   await request(apiURL)
      //     .patch("/settings/account")
      //     .set("Authorization", "Bearer invalidToken")
      //     .send({
      //       auth_method: "password_auth",
      //       email: "user@example.com",
      //       password: "newPassword123",
      //       old_password: "oldPassword123",
      //     })
      //     .expect(401); // Unauthorized
      // });
    });
  });
});
