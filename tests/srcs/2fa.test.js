import request from "supertest";
import { createUsers, users } from "../dummy/dummy-account.js";
import { apiURL } from "../URLs.js";

createUsers(2);

describe("2FA Router", () => {
  describe("GET /activate", () => {
    describe("Success", () => {
      it("activate", async () => {
        const response = await request(apiURL)
          .get("/2fa/activate")
          .set('Authorization', `Bearer ${users[0].jwt}`)

        expect(response.statusCode).toBe(200);
      })

      it("Exist but inactive", async () => {
        const response = await request(apiURL)
          .get("/2fa/activate")
          .set('Authorization', `Bearer ${users[0].jwt}`)

        expect(response.statusCode).toBe(200);
      })
    }); // Success

    describe("Failures", () => {
      it("not authorized", async () => {
        const response = await request(apiURL)
          .get("/2fa/activate")

        expect(response.statusCode).toBe(401);
      })

      it("Already active", async () => {
        const activate = await request(apiURL)
          .post("/2fa/activate/verify")
          .set('Authorization', `Bearer ${users[0].jwt}`)
          .send({ code: "123456" });
        
        expect(activate.statusCode).toBe(204);

        const response = await request(apiURL)
          .get("/2fa/activate")
          .set('Authorization', `Bearer ${users[0].jwt}`)

        expect(response.statusCode).toBe(409);
      })
    }); //Failures;


  }); // GET /activate

  describe("POST /activate/verify", () => {
    it("no body", async () => {
      const response = await request(apiURL)
        .post("/2fa/activate/verify")

      expect(response.statusCode).toBe(400);
    })

    it("empty object", async () => {
      const response = await request(apiURL)
        .post("/2fa/activate/verify")

      expect(response.statusCode).toBe(400);
    })

    it("code not a string", async () => {
      const response = await request(apiURL)
        .post("/2fa/activate/verify")
        .send({ code: {} });

      expect(response.statusCode).toBe(400);
    })

    it("code too short", async () => {
      const response = await request(apiURL)
        .post("/2fa/activate/verify")
        .send({ code: "12345" });

      expect(response.statusCode).toBe(400);
    })

    it("code too long", async () => {
      const response = await request(apiURL)
        .post("/2fa/activate/verify")
        .send({ code: "1234567" });

      expect(response.statusCode).toBe(400);
    })

    it("non numerical", async () => {
      const response = await request(apiURL)
        .post("/2fa/activate/verify")
        .send({ code: "a23456" });

      expect(response.statusCode).toBe(400);
    })

    it("not authorized", async () => {
      const response = await request(apiURL)
        .post("/2fa/activate/verify")
        .send({ code: "123456" })

      expect(response.statusCode).toBe(401);
    })

    it("nothing to validate", async () => {
      const response = await request(apiURL)
        .post("/2fa/activate/verify")
        .set('Authorization', `Bearer ${users[1].jwt}`)
        .send({ code: "123456" })

      expect(response.statusCode).toBe(403);
    })

    it("already validated", async () => {
      const activate = await request(apiURL)
      .get("/2fa/activate")
      .set('Authorization', `Bearer ${users[1].jwt}`)

      expect(activate.statusCode).toBe(200);

      const validate = await request(apiURL)
        .post("/2fa/activate/verify")
        .set('Authorization', `Bearer ${users[1].jwt}`)
        .send({ code: "123456" })

      expect(validate.statusCode).toBe(204);

      const response = await request(apiURL)
        .post("/2fa/activate/verify")
        .set('Authorization', `Bearer ${users[1].jwt}`)
        .send({ code: "123456" })

      expect(response.statusCode).toBe(403);
    })
  }); // POST /activate/verify

}); // 2FA Router
