import request from "supertest";
import { createUsers, users } from "../../dummy/dummy-account";

createUsers(4);

const baseUrl = 'https://127.0.0.1:7979';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

describe('Social Router', () => {
  describe('GET /follows', () => {
    it("get my follows", async () => {
      const response = await request(baseUrl)
        .get("/social/follows")
        .set('Authorization', `Bearer ${users[0].jwt}`)
        .expect("Content-Type", /json/)
        .expect(200);

      expect(response.body.length).toEqual(0);
    });
  });

  describe('POST /follows', () => {
    it("no account_id", async () => {
      for (let i = 1; i < users.length; ++i) {
        const response = await request(baseUrl)
          .post(`/social/follows/`)
          .set('Authorization', `Bearer ${users[0].jwt}`)
          .expect(400);
      }
    });

    it("follow users", async () => {
      for (let i = 1; i < users.length; ++i) {
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

      expect(response.body.length).toEqual(3);
      response.body.forEach(e => {
        expect(e.account_id === users[0].account_id);
      });

      // Get account_ids of users[1], users[2], and users[3]
      const expectedAccountIds = users.slice(1).map(user => user.account_id);
      // Extract follows from the response
      const actualAccountIds = response.body.map(following => following.following);

      // Ensure the arrays match
      expect(actualAccountIds).toEqual(expect.arrayContaining(expectedAccountIds));
    });

    it("no auth", async () => {
      const response = await request(baseUrl)
        .post(`/social/follows/${users[1].account_id}`)
        .expect(401);
    });

    it("follow itself", async () => {
      const response = await request(baseUrl)
        .post(`/social/follows/${users[0].account_id}`)
        .set('Authorization', `Bearer ${users[0].jwt}`)
        .expect(400);
    });

    it("refollow", async () => {
      for (let i = 1; i < users.length; ++i) {
        const response = await request(baseUrl)
          .post(`/social/follows/${users[i].account_id}`)
          .set('Authorization', `Bearer ${users[0].jwt}`)
          .expect(409);
      }
    });
  });

  describe('DELETE /follows', () => {
    it("no account_id", async () => {
      for (let i = 1; i < users.length; ++i) {
        const response = await request(baseUrl)
          .delete(`/social/follows/`)
          .set('Authorization', `Bearer ${users[0].jwt}`)
          .expect(400);
      }
    });

    it("unfollow users", async () => {
      for (let i = 1; i < users.length; ++i) {
        const response = await request(baseUrl)
          .delete(`/social/follows/${users[i].account_id}`)
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

      expect(response.body.length).toEqual(0);
    });

    it("no auth", async () => {
      const response = await request(baseUrl)
        .delete(`/social/follows/${users[1].account_id}`)
        .expect(401);
    });

    it("unfollow itself", async () => {
      const response = await request(baseUrl)
        .post(`/social/follows/${users[0].account_id}`)
        .set('Authorization', `Bearer ${users[0].jwt}`)
        .expect(400);
    });

    it("unfollow invalid id", async () => {
      const response = await request(baseUrl)
        .delete(`/social/follows/42`)
        .set('Authorization', `Bearer ${users[0].jwt}`)
        .expect(406);
    });
  });
});
