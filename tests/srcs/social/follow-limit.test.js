import request from "supertest";
import { createUsers, users } from "../../dummy/dummy-accounts";

const MAX_FOLLOWS = 50;
createUsers(MAX_FOLLOWS + 2);

const baseUrl = 'https://127.0.0.1:7979';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';


describe('Follow limitation', () => {
  it("follow up to limit", async () => {
    for (let i = 2; i < users.length; ++i) {
      const response = await request(baseUrl)
        .post(`/social/follows/${users[i].account_id}`)
        .set('Authorization', `Bearer ${users[0].jwt}`)
        .expect(204);
    }
  });

  it("get follows", async () => {
    const response = await request(baseUrl)
      .get("/social/follows")
      .set('Authorization', `Bearer ${users[0].jwt}`)
      .expect("Content-Type", /json/)
      .expect(200);

    expect(response.body.length).toEqual(50);
  });

  it("add one more", async () => {
    const response = await request(baseUrl)
      .post(`/social/follows/${users[1].account_id}`)
      .set('Authorization', `Bearer ${users[0].jwt}`)
      .expect(409);
  });

  it("delete one", async () => {
    const response = await request(baseUrl)
      .delete(`/social/follows/${users[users.length - 1].account_id}`)
      .set('Authorization', `Bearer ${users[0].jwt}`)
      .expect(204);
  });

  it("retry add one more", async () => {
    const response = await request(baseUrl)
    .post(`/social/follows/${users[1].account_id}`)
      .set('Authorization', `Bearer ${users[0].jwt}`)
      .expect(204);
  });

  it("delete all", async () => {
    for (let i = 1; i < users.length - 1; ++i) {
      const response = await request(baseUrl)
        .delete(`/social/follows/${users[i].account_id}`)
        .set('Authorization', `Bearer ${users[0].jwt}`)
        .expect(204);
    }
  });
});
