import request from "supertest";
import { createUsers, users } from "../dummy/dummy-account.js";
import { usersURL } from "../URLs.js";

createUsers(1);

describe("USERS", () => {
  it("bad account_id", async () => {
    const response = await request(usersURL)
      .get("/salut")
      .set('Authorization', `Bearer ${users[0].jwt}`)
      .expect(400);

    expect(response.body).toEqual({
      statusCode: 400,
      code: 'FST_ERR_VALIDATION',
      error: 'Bad Request',
      message: "params/account_id must be integer"
    })
  });

  it("get profile", async () => {
    const response = await request(usersURL)
      .get(`/${users[0].account_id}`)
      .set('Authorization', `Bearer ${users[0].jwt}`)
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        account_id: users[0].account_id,
        avatar: expect.any(String),
        username: users[0].username,
      })
    );
    expect(response.body.credentials).toEqual(undefined);
  });

  it("invalid account_id", async () => {
    const response = await request(usersURL)
      .get(`/${users[0].account_id + 1000}`)
      .set('Authorization', `Bearer ${users[0].jwt}`)

    expect(response.statusCode).toBe(404);
  });

  it("/me", async () => {
    const response = await request(usersURL)
      .get(`/me`)
      .set('Authorization', `Bearer ${users[0].jwt}`)
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        account_id: users[0].account_id,
        avatar: expect.any(String),
        username: users[0].username,
        credentials: expect.objectContaining({
          account_id: users[0].account_id,
          auth_method: 'password_auth',
          email: users[0].email,
        })
      })
    );
  });
})
