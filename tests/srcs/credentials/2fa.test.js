import request from "supertest";
import { createUsers, users } from "../../dummy/dummy-account";

createUsers(1);

const baseUrl = "http://127.0.0.1:7002";

describe("PATCH /2fa/:account_id", () => {
  describe("Bad request", () => {
    it("bad account_id", async () => {
      const response = await request(baseUrl)
        .patch('/2fa/not-an-account_id')

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("params/account_id must be integer");
    })

    it("no account_id", async () => {
      const response = await request(baseUrl)
        .patch('/2fa/')

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("params/account_id must be integer");
    })

    it("no body", async () => {
      const response = await request(baseUrl)
        .patch('/2fa/1')

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("body must be object");
    })

    it("empty body", async () => {
      const response = await request(baseUrl)
        .patch('/2fa/1')
        .send({});

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("body must have required property 'method'");
    })

    it("bad body/method type", async () => {
      const response = await request(baseUrl)
        .patch('/2fa/1')
        .send({ method: {} });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("body/method must be string");
    })

    it("bad body/method type", async () => {
      const response = await request(baseUrl)
        .patch('/2fa/1')
        .send({ method: "kporceil" });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("body/method must be equal to one of the allowed values");
    })

    it("account not found", async () => {
      const response = await request(baseUrl)
        .patch('/2fa/99999999')
        .send({ method: "none" });

      expect(response.statusCode).toBe(404);
    })
  })

  it("set to none", async () => {
    const response = await request(baseUrl)
      .patch(`/2fa/${users[0].account_id}`)
      .send({ method: "none" });

    expect(response.statusCode).toBe(204);

    const verification = await request(baseUrl)
      .get(`/${users[0].account_id}`);

    expect(verification.body).toEqual({
      account_id: users[0].account_id,
      auth_method: "password_auth",
      created_at: expect.any(String),
      updated_at: expect.any(String),
      second_factor: "none",
      email: users[0].email,
    });
  })

  it("set to totp", async () => {
    const response = await request(baseUrl)
      .patch(`/2fa/${users[0].account_id}`)
      .send({ method: "totp" });

    expect(response.statusCode).toBe(204);
    const verification = await request(baseUrl)
      .get(`/${users[0].account_id}`);

    expect(verification.body).toEqual({
      account_id: users[0].account_id,
      auth_method: "password_auth",
      created_at: expect.any(String),
      updated_at: expect.any(String),
      second_factor: "totp",
      email: users[0].email,
    });
  })

}); // PATCH /2fa/:account_id
