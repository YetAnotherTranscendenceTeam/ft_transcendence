import request from "supertest";

const baseUrl = "http://127.0.0.1:7002";

describe("GET /:account_id", () => {
  it("bad account_id", async () => {
    const response = await request(baseUrl)
      .get('/not-an-account_id')
      .expect(400)
      .expect("Content-Type", /json/);

    expect(response.body).toEqual({
      statusCode: 400,
      code: "FST_ERR_VALIDATION",
      error: "Bad Request",
      message: "params/account_id must be integer",
    });
  });

  it("nonexisting", async () => {
    const response = await request(baseUrl)
      .get('/999999999')
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
      .get('/9999999')
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
