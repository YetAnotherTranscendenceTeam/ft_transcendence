import request from "supertest";
import { dummy } from "../dummy/one-dummy";

const host = "http://127.0.0.1";

describe("pings", () => {
  it("ping credentials", async () => {
    const response = await request(`${host}:7002`).get("/ping").expect(204);
  });

  it("ping registration", async () => {
    const response = await request(`${host}:4012`).get("/ping").expect(204);
  });

  it("ping auth-password", async () => {
    const response = await request(`${host}:4022`).get("/ping").expect(204);
  });

  it("ping fortytwo-auth", async () => {
    const response = await request(`${host}:4042`).get("/ping").expect(204);
  });

  it("ping token-manager", async () => {
    const response = await request(`${host}:4002`).get("/ping").expect(204);
  });

  it("ping db-profiles", async () => {
    const response = await request(`${host}:7001`).get("/ping").expect(204);
  });

  it("ping users", async () => {
    const response = await request(`${host}:4003`).get("/ping").expect(401);
  });
  it("ping users with authorization", async () => {
    const response = await request(`${host}:4003`).get("/ping").set('Authorization', `Bearer ${dummy.jwt}`).expect(204);
  });

  it("ping avatars", async () => {
    const response = await request(`${host}:4113`).get("/ping").expect(401);
  });
  it("ping avatars with authorization", async () => {
    const response = await request(`${host}:4113`).get("/ping").set('Authorization', `Bearer ${dummy.jwt}`).expect(204);
  });

  it("ping settings", async () => {
    const response = await request(`${host}:4004`).get("/ping").expect(401);
  });
  it("ping settings with authorization", async () => {
    const response = await request(`${host}:4004`).get("/ping").set('Authorization', `Bearer ${dummy.jwt}`).expect(204);
  });
});
