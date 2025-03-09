import request from "supertest";

const baseUrl = "http://127.0.0.1:4002";

describe("TOKEN GENERATION", () => {
  it("no account id", async () => {
    const response = await request(baseUrl)
      .post("/token")
      .expect(404)
      .expect("Content-Type", /json/);
    expect(response.body).toEqual({
      message: 'Route POST:/token not found',
      error: 'Not Found',
      statusCode: 404
    })
  });

  it("no authorization header", async () => {
    const response = await request(baseUrl)
      .post("/token/45")
      .expect(401)
  });

  it("invalid authorization header 1", async () => {
    const response = await request(baseUrl)
      .post("/token/45")
      .set('Authorization', 'SFSDFSF')
      .expect(401)
      .expect("Content-Type", /json/);
    expect(response.body).toEqual({
      statusCode: 401,
      code: "FST_BEARER_AUTH_INVALID_AUTHORIZATION_HEADER",
      error: "Unauthorized",
      message: "invalid authorization header",
    });
  });

  it("invalid authorization header 2", async () => {
    const response = await request(baseUrl)
      .post("/token/45")
      .set('Authorization', 'Bearer')
      .expect(401)
      .expect("Content-Type", /json/);
    expect(response.body).toEqual({
      statusCode: 401,
      code: "FST_BEARER_AUTH_INVALID_AUTHORIZATION_HEADER",
      error: "Unauthorized",
      message: "invalid authorization header",
    });
  });

  it("invalid authorization header 3", async () => {
    const response = await request(baseUrl)
      .post("/token/45")
      .set('Authorization', 'Bearer d')
      .expect(401)
      .expect("Content-Type", /json/);
    expect(response.body).toEqual({
      statusCode: 401,
      code: "FST_BEARER_AUTH_INVALID_AUTHORIZATION_HEADER",
      error: "Unauthorized",
      message: "invalid authorization header",
    });
  });

  it("bad authorization header", async () => {
    const response = await request(baseUrl)
      .post("/token/45")
      .set('Authorization', `Bearer ${process.env.TOKEN_MANAGER_SECRET}`)
      .expect(200)
      .expect("Content-Type", /json/);
      expect(response.body).toEqual(
        expect.objectContaining({
          access_token: expect.any(String),
          refresh_token: expect.any(String),
          expire_at: expect.any(String),
        })
      );
  });
});
