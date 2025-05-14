import request from "supertest";
import { apiURL, pongURL } from "../../URLs";

import { app } from "../../dummy/dummy-account.js";

beforeAll(async () => {
  await app.ready();
})

describe("pong /spectate router", () => {
  it("no match id param", async () => {
    const response = await request(pongURL)
      .get("/spectate/sync");

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("querystring must have required property 'match_id'");
  });

  it("no match access_token", async () => {
    const response = await request(pongURL)
      .get("/spectate/sync?match_id");

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("querystring must have required property 'access_token'");
  
  });

  it("bad match id", async () => {
    const response = await request(pongURL)
      .get("/spectate/sync?match_id&access_token");

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("querystring/match_id must be number");
  });

  it("bad access_token", async () => {
    const response = await request(pongURL)
      .get("/spectate/sync?match_id=4984654&access_token");

      expect(response.statusCode).toBe(401);
  });

  it("bad access_token", async () => {
    const response = await request(pongURL)
      .get("/spectate/sync?match_id=4984654&access_token=djiofgjhfgd");

      expect(response.statusCode).toBe(401);
  });

  it("access_token from pong secret", async () => {
    const response = await request(pongURL)
      .get(`/spectate/sync?match_id=4984654&access_token=${app.jwt.pong.sign({})}`);

      expect(response.statusCode).toBe(401);
  });

  it("access_token from auth secret", async () => {
    const response = await request(pongURL)
      .get(`/spectate/sync?match_id=4984654&access_token=${app.jwt.sign({})}`);

      expect(response.statusCode).toBe(401);
  });

  it("match not found", async () => {
    const response = await request(pongURL)
      .get(`/spectate/sync?match_id=4984654&access_token=${app.jwt.spectator.sign({})}`);

      expect(response.statusCode).toBe(404);
  });

});
