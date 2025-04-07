import request from "supertest";
import { createUsers, users } from "../../../dummy/dummy-account";
import { apiURL } from "../../../URLs";

createUsers(1);

describe('Settings Router', () => {
  describe("PATCH /settings/account", () => {
    describe("password_auth", () => {
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
        console.error(users[0].password);
        const response = await request(apiURL)
          .patch("/settings/account")
          .set("Authorization", `Bearer ${users[0].jwt}`)
          .send({
            auth_method: "password_auth",
            old_password: users[0].password,
          })

          expect(response.statusCode).toBe(204);
      });

      it("password unchanged ?", async () => {
        console.error(users[0].password);
        const response = await request(apiURL)
          .patch("/settings/account")
          .set("Authorization", `Bearer ${users[0].jwt}`)
          .send({
            auth_method: "password_auth",
            old_password: users[0].password,
          })

          expect(response.statusCode).toBe(204);
      });

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
