import request from "supertest";
import { apiURL } from "../URLs";

describe("google-auth Router", () => {
  describe("bad requests", () => {
    it("no body", async () => {
      const response = await request(apiURL)
        .post("/auth/google");

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        statusCode: 400,
        code: 'FST_ERR_VALIDATION',
        error: 'Bad Request',
        message: 'body must be object'
      })
    });

    it("empty body", async () => {
      const response = await request(apiURL)
        .post("/auth/google")
        .send({});

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        statusCode: 400,
        code: 'FST_ERR_VALIDATION',
        error: 'Bad Request',
        message: "body must have required property 'token'"
      })
    });

    it("bad property", async () => {
      const response = await request(apiURL)
        .post("/auth/google")
        .send({ bad: "property" });

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        statusCode: 400,
        code: 'FST_ERR_VALIDATION',
        error: 'Bad Request',
        message: "body must have required property 'token'"
      })
    });

    it("not a string", async () => {
      const response = await request(apiURL)
      .post("/auth/google")
      .send({ token: {} });

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        statusCode: 400,
        code: 'FST_ERR_VALIDATION',
        error: 'Bad Request',
        message: "body/token must be string"
      })
    });
  })
});
