import request from "supertest";
import { randomEmail, randomGoogleUser } from "../../dummy/generate";

const baseUrl = "http://127.0.0.1:7002";

describe("GOOGLE AUTH ROUTER", () => {
  describe("POST", () => {
    describe("Bad Requests", () => {
      it("no body", async () => {
        const response = await request(baseUrl)
          .post("/google");

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
          statusCode: 400,
          code: "FST_ERR_VALIDATION",
          error: "Bad Request",
          message: "body must be object",
        });
      });

      it("no email", async () => {
        const response = await request(baseUrl)
          .post("/google")
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

      it("no google_id", async () => {
        const response = await request(baseUrl)
          .post("/google")
          .send({
            email: "",
          })
          .expect(400)
          .expect("Content-Type", /json/);

        expect(response.body).toEqual({
          statusCode: 400,
          code: "FST_ERR_VALIDATION",
          error: "Bad Request",
          message: "body must have required property 'google_id'",
        });
      });

      it("bad email format 1", async () => {
        const response = await request(baseUrl)
          .post("/google")
          .send({
            email: "",
            google_id: {},
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
          .post("/google")
          .send({
            email: "fklfkfjskl",
            google_id: {}
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
          .post("/google")
          .send({
            email: "test@test.com",
            google_id: {}
          })
          .expect(400)
          .expect("Content-Type", /json/);

        expect(response.body).toEqual({
          statusCode: 400,
          code: "FST_ERR_VALIDATION",
          error: "Bad Request",
          message: "body/google_id must be integer",
        });
      });

      it("bad intra_user_id 2", async () => {
        const response = await request(baseUrl)
          .post("/google")
          .send({
            email: "test@test.com",
            intra_user_id: "not-a-number",
            google_id: "45f"
          })
          .expect(400)
          .expect("Content-Type", /json/);

        expect(response.body).toEqual({
          statusCode: 400,
          code: "FST_ERR_VALIDATION",
          error: "Bad Request",
          message: "body/google_id must be integer",
        });
      });
    })


    describe("Success", () => {
      let user;

      beforeEach(() => {
        user = randomGoogleUser()
      });

      afterEach(async () => {
        const deletion = await request(baseUrl).delete(`/${user.account_id}`);
        expect(deletion.statusCode).toBe(204);
      });

      it(`account creation`, async () => {
        const response = await request(baseUrl)
          .post("/google")
          .send({
            email: user.email,
            google_id: user.google_id,
          });

        expect(response.statusCode).toBe(201);
        user.account_id = response.body.account_id;
        expect(response.body);
      });

      it(`email conflict`, async () => {
        const first = await request(baseUrl)
          .post("/google")
          .send({
            email: user.email,
            google_id: user.google_id,
          });

        expect(first.statusCode).toBe(201);
        user.account_id = first.body.account_id;
        expect(first.body);

        const second = await request(baseUrl)
          .post("/google")
          .send({
            email: user.email,
            google_id: user.google_id,
          });

        expect(second.statusCode).toBe(409);
        expect(second.body).toEqual({
          statusCode: 409,
          code: "AUTH_EMAIL_IN_USE",
          error: "Email Already In Use",
          message: "This email is already associated with an account",
        });;
      });

      it(`google_id conflict`, async () => {
        const first = await request(baseUrl)
          .post("/google")
          .send({
            email: user.email,
            google_id: user.google_id,
          });

        expect(first.statusCode).toBe(201);
        user.account_id = first.body.account_id;
        expect(first.body);

        const second = await request(baseUrl)
          .post("/google")
          .send({
            email: randomEmail(),
            google_id: user.google_id,
          });

        expect(second.statusCode).toBe(409);
        expect(second.body).toEqual({
          statusCode: 409,
          code: "AUTH_EMAIL_IN_USE",
          error: "Email Already In Use",
          message: "This email is already associated with an account",
        });;
      });
    });
  })
});
