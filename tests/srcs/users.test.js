import request from "supertest";
import { dummy } from "../dummy/one-dummy";

const usersURL = '127.0.0.1:4003'

describe("USERS", () => {
  it("no account_id", async () => {
    const response = await request(usersURL)
      .get("/")
      .set('Authorization', `Bearer ${dummy.jwt}`)
      .expect(400);

    expect(response.body).toEqual({
      statusCode: 400,
      code: 'FST_ERR_VALIDATION',
      error: 'Bad Request',
      message: "params/account_id must be integer"
    })
  });

  it("bad account_id", async () => {
    const response = await request(usersURL)
      .get("/salut")
      .set('Authorization', `Bearer ${dummy.jwt}`)
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
      .get(`/${dummy.account_id}`)
      .set('Authorization', `Bearer ${dummy.jwt}`)
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        account_id: dummy.account_id,
        avatar: dummy.avatar,
        username: dummy.username,
      })
    );
    expect(response.body.credentials).toEqual(undefined);
  });

  it("invalid account_id", async () => {
    const response = await request(usersURL)
    .get(`/${dummy.account_id + 1000}`)
      .set('Authorization', `Bearer ${dummy.jwt}`)
      .expect(404);

      expect(response.body).toEqual({
        statusCode: 404,
        code: 'ACCOUNT_NOT_FOUND',
        error: 'Account Not Found',
        message: "The requested account does not exist"
      })
  });

  it("/me", async () => {
    const response = await request(usersURL)
      .get(`/me`)
      .set('Authorization', `Bearer ${dummy.jwt}`)
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        account_id: dummy.account_id,
        avatar: dummy.avatar,
        username: dummy.username,
        credentials: expect.objectContaining({
            account_id: dummy.account_id,
            auth_method: 'password_auth',
            email: dummy.email,
        })
      })
    );
  });
})
