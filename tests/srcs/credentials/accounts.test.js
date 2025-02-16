import request from "supertest";
import crypto from "crypto";

const baseUrl = "http://127.0.0.1:7002";

describe("GET /:email", () => {
  it("bad email", async () => {
    const response = await request(baseUrl)
      .get('/not-an-email')
      .expect(400)
      .expect("Content-Type", /json/);

    expect(response.body).toEqual({
      statusCode: 400,
      code: "FST_ERR_VALIDATION",
      error: "Bad Request",
      message: "params/email must match format \"email\"",
    });
  });

  it("nonexisting", async () => {
    const response = await request(baseUrl)
      .get('/doesnoexist@email.com')
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

describe("DELETE /:id", () => {
  it("bad id", async () => {
    const response = await request(baseUrl)
      .delete('/not-an-id')
      .expect(400)
  });

  it("id 0", async () => {
    const response = await request(baseUrl)
      .delete('/0')
      .expect(400)
  });

  it("nonexisting", async () => {
    const response = await request(baseUrl)
      .get('/doesnoexist@email.com')
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
