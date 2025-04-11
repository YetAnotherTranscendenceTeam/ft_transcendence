import request from "supertest";
import { client_id, FRONTEND_URL, redirect_uri } from "./env";
import url from "url";

const baseUrl = "http://127.0.0.1:4042";

describe("fortytwo-auth tests", () => {
  it("link", async () => {
    const response = await request(baseUrl)
      .get("/link")
      .expect(200)
      .expect("Content-Type", /json/);

    expect(response.body).toEqual({
      link: `https://api.intra.42.fr/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=code&scope=public`,
    });
  });

  it("auth redirection", async () => {
    const response = await request(baseUrl).get("/").expect(302);

    expect(response.headers.location).toBe(
      `https://api.intra.42.fr/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=code&scope=public`
    );
  });

  it("callback no code", async () => {
    const response = await request(baseUrl).get("/callback").expect(302);
  });

  it("callback invalid code", async () => {
    const response = await request(baseUrl)
      .get("/callback")
      .query({ code: "notavalidcode" })
      .expect(302);

    const frontend = url.parse(FRONTEND_URL);
    const redirectUrl = url.parse(response.headers.location, true);
    expect(redirectUrl.protocol).toBe(frontend.protocol);
    expect(redirectUrl.port).toBe(frontend.port);
    expect(redirectUrl.hostname).toBe(frontend.hostname);
    expect(redirectUrl.pathname).toBe("/fortytwo");
    expect(redirectUrl.query).toEqual({
      code: "HTTP_ERROR_401",
      error: "Unauthorized",
      message:
        "Authentication is required and has failed or has not been provided",
      statusCode: "401",
    });
  });
});
