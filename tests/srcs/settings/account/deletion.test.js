import request from "supertest";
import { apiURL } from "../../../URLs";
import crypto from "crypto";
import { avatarPNG } from "../../avatars/b64avatars";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

describe('Account Deletion', () => {
  const dummy = {
    account_id: null,
    jwt: null,
    email: `dummy-account.${crypto.randomBytes(10).toString("hex")}@jest.com`,
    password: crypto.randomBytes(4).toString("hex"),
    avatar: null,
  };

  it("create account", async () => {
    const response = await request(apiURL)
      .post("/register")
      .send({
        email: dummy.email,
        password: dummy.password,
      })
      .expect(201)
      .expect("Content-Type", /json/);

    dummy.jwt = response.body.access_token;
  });

  it("auth using password", async () => {
    const response = await request(apiURL)
      .post("/auth")
      .send({
        email: dummy.email,
        password: dummy.password,
      })
      .expect(200)
      .expect("Content-Type", /json/);

    dummy.jwt = response.body.access_token;
    expect(response.body).toEqual(
      expect.objectContaining({
        access_token: expect.any(String),
        expire_at: expect.any(String),
      })
    );
  });

  it("/me", async () => {
    const response = await request(apiURL)
      .get("/me")
      .set("Authorization", `Bearer ${dummy.jwt}`)
      .expect(200)
      .expect("Content-Type", /json/);

    expect(response.body).toEqual(
      expect.objectContaining({
        account_id: expect.any(Number),
        avatar: expect.any(String),
      })
    );

    dummy.account_id = response.body.account_id;
    dummy.avatar = response.body.avatar;
  });

  it('upload an avatar', async () => {
    const response = await request(apiURL)
      .post('/avatars')
      .set("Authorization", `Bearer ${dummy.jwt}`)
      .set('Content-Type', 'text/plain')
      .send(avatarPNG);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('url');
    dummy.uploadedAvatar = response.body.url.replace("cdn-nginx", "localhost");
  });

  it("test avatar url", async () => {
    const response = await request(dummy.uploadedAvatar)
      .get("")
      .set("Authorization", `Bearer ${dummy.jwt}`)
      .expect(200)
      .expect("Content-Type", /image/);
  });

  it('call deletion route', async () => {
    const response = await request(apiURL)
      .delete('/settings/account')
      .set("Authorization", `Bearer ${dummy.jwt}`)

    expect(response.status).toBe(204);
  });

  it("should not be able to auth again", async () => {
    const response = await request(apiURL)
      .post("/auth")
      .send({
        email: dummy.email,
        password: dummy.password,
      })
      .expect(401)
  });

  it("/me should not work anymore", async () => {
    const response = await request(apiURL)
      .get("/me")
      .set("Authorization", `Bearer ${dummy.jwt}`)
      .expect(404)
      .expect("Content-Type", /json/);
  });

  it("previously uploaded avatar should not exist anymore", async () => {
    const response = await request(dummy.uploadedAvatar)
      .get("")
      .set("Authorization", `Bearer ${dummy.jwt}`)
      .expect(404)
  });
});
