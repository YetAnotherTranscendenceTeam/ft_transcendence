import request from "supertest";
import { createUsers, users } from "../../dummy/dummy-account";
import { apiURL } from "../../URLs";

const MAX_FOLLOWS = 50;
createUsers(MAX_FOLLOWS + 2);

describe('Social limits', () => {
  describe('Friend limit', () => {
    it("send requests up to the limit", async () => {
      for (let i = 2; i < users.length; ++i) {
        const response = await request(apiURL)
          .post(`/social/requests/${users[i].account_id}`)
          .set('Authorization', `Bearer ${users[0].jwt}`)

        expect(response.statusCode).toBe(204);
      }

    });

    it("add one more", async () => {
      const response = await request(apiURL)
        .post(`/social/requests/${users[1].account_id}`)
        .set('Authorization', `Bearer ${users[0].jwt}`)

      expect(response.statusCode).toBe(403);
      expect(response.body.code).toBe("MAX_FRIENDS");
    });

    it("convert some to friends", async () => {
      for (let i = 2; i < 10; ++i) {
        const response = await request(apiURL)
          .post(`/social/requests/${users[0].account_id}`)
          .set('Authorization', `Bearer ${users[i].jwt}`)

        expect(response.statusCode).toBe(204);
      }
    });

    it("try to add one again", async () => {
      const response = await request(apiURL)
        .post(`/social/requests/${users[1].account_id}`)
        .set('Authorization', `Bearer ${users[0].jwt}`)

      expect(response.statusCode).toBe(403);
      expect(response.body.code).toBe("MAX_FRIENDS");
    });

    it("delete one", async () => {
      const response = await request(apiURL)
        .delete(`/social/friends/${users[2].account_id}`)
        .set('Authorization', `Bearer ${users[0].jwt}`)

      expect(response.statusCode).toBe(204);
    });

    it("retry to add one more", async () => {
      const response = await request(apiURL)
        .post(`/social/requests/${users[1].account_id}`)
        .set('Authorization', `Bearer ${users[0].jwt}`)

      expect(response.statusCode).toBe(204);
    });

    it("delete all", async () => {
      for (let i = 3; i < 10; ++i) {
        const response = await request(apiURL)
          .delete(`/social/friends/${users[i].account_id}`)
          .set('Authorization', `Bearer ${users[0].jwt}`)

        expect(response.statusCode).toBe(204);
      }
      for (let i = 10; i < users.length; ++i) {
        const response = await request(apiURL)
          .delete(`/social/requests/${users[i].account_id}`)
          .set('Authorization', `Bearer ${users[0].jwt}`)

        expect(response.statusCode).toBe(204);
      }
    });
  });

  describe('blocks limit', () => {
    it("block up to the limit", async () => {
      for (let i = 2; i < users.length; ++i) {
        const response = await request(apiURL)
          .post(`/social/blocks/${users[i].account_id}`)
          .set('Authorization', `Bearer ${users[0].jwt}`)

        expect(response.statusCode).toBe(204);
      }

    });

    it("add one more", async () => {
      const response = await request(apiURL)
        .post(`/social/blocks/${users[1].account_id}`)
        .set('Authorization', `Bearer ${users[0].jwt}`)

      expect(response.statusCode).toBe(403);
      expect(response.body.code).toBe("MAX_BLOCKS");
    });

    it("delete one", async () => {
      const response = await request(apiURL)
        .delete(`/social/blocks/${users[2].account_id}`)
        .set('Authorization', `Bearer ${users[0].jwt}`)

      expect(response.statusCode).toBe(204);
    });

    it("retry to add one more", async () => {
      const response = await request(apiURL)
        .post(`/social/blocks/${users[1].account_id}`)
        .set('Authorization', `Bearer ${users[0].jwt}`)

      expect(response.statusCode).toBe(204);
    });

    it("delete all", async () => {
      for (let i = 3; i < users.length; ++i) {
        const response = await request(apiURL)
          .delete(`/social/blocks/${users[i].account_id}`)
          .set('Authorization', `Bearer ${users[0].jwt}`)

        expect(response.statusCode).toBe(204);
      }
    });
  });
});
