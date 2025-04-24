import request from "supertest";
import { createUsers, users } from "../../dummy/dummy-account";
import { apiURL } from "../../URLs";
import { testFriendship } from "../../dummy/friendship";

createUsers(10);

describe("Friends router", () => {
  describe("Baic tests", () => {
    it("unauthorized", async () => {
      const response = await request(apiURL)
        .get("/social/friends")

      expect(response.statusCode).toEqual(401);
    });

    it("no friends", async () => {
      const response = await request(apiURL)
        .get("/social/friends")
        .set("Authorization", `Bearer ${users[0].jwt}`)

      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual([]);
    });

    it("self friend request", async () => {
      const friendRequest = await request(apiURL)
        .post(`/social/requests/${users[0].account_id}`)
        .set("Authorization", `Bearer ${users[0].jwt}`)

      expect(friendRequest.statusCode).toEqual(403);
    });

    it("send friend request", async () => {
      const friendRequest = await request(apiURL)
        .post(`/social/requests/${users[1].account_id}`)
        .set("Authorization", `Bearer ${users[0].jwt}`)

      expect(friendRequest.statusCode).toEqual(204);
    });

    it("resend request", async () => {
      const friendRequest = await request(apiURL)
        .post(`/social/requests/${users[1].account_id}`)
        .set("Authorization", `Bearer ${users[0].jwt}`)

      expect(friendRequest.statusCode).toEqual(409);
    });

    it("target sends request back", async () => {
      const friendRequest = await request(apiURL)
        .post(`/social/requests/${users[0].account_id}`)
        .set("Authorization", `Bearer ${users[1].jwt}`)

      expect(friendRequest.statusCode).toEqual(204);
    });

    it("1 friend", async () => {
      const user1 = await request(apiURL)
        .get(`/social/friends`)
        .set("Authorization", `Bearer ${users[0].jwt}`)

      expect(user1.statusCode).toEqual(200);
      expect(user1.body).toEqual([{ account_id: users[1].account_id }]);

      const user2 = await request(apiURL)
        .get(`/social/friends`)
        .set("Authorization", `Bearer ${users[1].jwt}`)

      expect(user2.statusCode).toEqual(200);
      expect(user2.body).toEqual([{ account_id: users[0].account_id }]);
    });

    it("already friends", async () => {
      const friendRequest = await request(apiURL)
        .post(`/social/requests/${users[1].account_id}`)
        .set("Authorization", `Bearer ${users[0].jwt}`)

      expect(friendRequest.statusCode).toEqual(409);
    });
  });

  describe("Cancel / Refuse request", () => {
    let user1;
    let user2;

    beforeAll(() => {
      user1 = users[2];
      user2 = users[3];
    })

    it("1 send request to 2", async () => {
      const response = await request(apiURL)
        .post(`/social/requests/${user2.account_id}`)
        .set("Authorization", `Bearer ${user1.jwt}`)

      expect(response.statusCode).toEqual(204);
    });

    it("1 cancel request", async () => {
      const response = await request(apiURL)
        .delete(`/social/requests/${user2.account_id}`)
        .set("Authorization", `Bearer ${user1.jwt}`)

      expect(response.statusCode).toEqual(204);
    });

    it("2 send request to 1", async () => {
      const response = await request(apiURL)
        .post(`/social/requests/${user1.account_id}`)
        .set("Authorization", `Bearer ${user2.jwt}`)

      expect(response.statusCode).toEqual(204);
    });

    it("no friendship", async () => {
      const response1 = await request(apiURL)
        .get("/social/friends")
        .set("Authorization", `Bearer ${user1.jwt}`)

      expect(response1.statusCode).toEqual(200);
      expect(response1.body).toEqual([]);

      const response2 = await request(apiURL)
        .get("/social/friends")
        .set("Authorization", `Bearer ${user1.jwt}`)

      expect(response2.statusCode).toEqual(200);
      expect(response2.body).toEqual([]);
    });

    it("1 refuse request", async () => {
      const response = await request(apiURL)
        .delete(`/social/requests/${user2.account_id}`)
        .set("Authorization", `Bearer ${user1.jwt}`)

      expect(response.statusCode).toEqual(204);
    });

    it("2 send request to 1", async () => {
      const response = await request(apiURL)
        .post(`/social/requests/${user1.account_id}`)
        .set("Authorization", `Bearer ${user2.jwt}`)

      expect(response.statusCode).toEqual(204);
    });

    it("1 send request to 2", async () => {
      const response = await request(apiURL)
        .post(`/social/requests/${user2.account_id}`)
        .set("Authorization", `Bearer ${user1.jwt}`)

      expect(response.statusCode).toEqual(204);
    });

    it("friendship after all", async () => {
      const response1 = await request(apiURL)
        .get("/social/friends")
        .set("Authorization", `Bearer ${user1.jwt}`)

      expect(response1.statusCode).toEqual(200);
      expect(response1.body).toEqual([{ account_id: user2.account_id }]);

      const response2 = await request(apiURL)
        .get("/social/friends")
        .set("Authorization", `Bearer ${user2.jwt}`)

      expect(response2.statusCode).toEqual(200);
      expect(response2.body).toEqual([{ account_id: user1.account_id }]);
    });
  }); // Cancel / Refuse request

  describe("Remove friend", () => {
    let user1;
    let user2;

    beforeAll(async () => {
      user1 = users[4];
      user2 = users[5];
      await testFriendship(user1, user2);

      const response = await request(apiURL)
        .get("/social/friends")
        .set("Authorization", `Bearer ${user1.jwt}`)

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual([{ account_id: user2.account_id }]);
    });

    it("1 remove 2", async () => {
      const response = await request(apiURL)
        .delete(`/social/friends/${user2.account_id}`)
        .set("Authorization", `Bearer ${user1.jwt}`)

      expect(response.statusCode).toBe(204);
    });

    it("2 remove 1", async () => {
      const response = await request(apiURL)
        .delete(`/social/friends/${user2.account_id}`)
        .set("Authorization", `Bearer ${user1.jwt}`)

      expect(response.statusCode).toBe(404);
    });

    it("2 remove 1", async () => {
      const response = await request(apiURL)
        .delete(`/social/friends/${user1.account_id}`)
        .set("Authorization", `Bearer ${user2.jwt}`)

      expect(response.statusCode).toBe(404);
    });

  }) // Remove friend

  describe("Block / Unblock", () => {
    let user1;
    let user2;

    beforeAll(async () => {
      user1 = users[6];
      user2 = users[7];
      await testFriendship(user1, user2);
    })

    it("1 blocks 2", async () => {
      const response = await request(apiURL)
        .post(`/social/blocks/${user2.account_id}`)
        .set("Authorization", `Bearer ${user1.jwt}`)

      expect(response.statusCode).toBe(403);
      expect(response.body.code).toBe("FRIENDSHIP");
    });

    it("1 unfriend 2", async () => {
      const response = await request(apiURL)
        .delete(`/social/friends/${user2.account_id}`)
        .set("Authorization", `Bearer ${user1.jwt}`)

      expect(response.statusCode).toBe(204);
    });

    it("1 blocks 2", async () => {
      const response = await request(apiURL)
        .post(`/social/blocks/${user2.account_id}`)
        .set("Authorization", `Bearer ${user1.jwt}`)

      expect(response.statusCode).toBe(204);
    });

    it("get blocked by 1", async () => {
      const response = await request(apiURL)
        .get(`/social/blocks`)
        .set("Authorization", `Bearer ${user1.jwt}`)

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual([{ account_id: user2.account_id }]);
    });

    it("1 request 2", async () => {
      const response = await request(apiURL)
        .post(`/social/requests/${user2.account_id}`)
        .set("Authorization", `Bearer ${user1.jwt}`)

      expect(response.statusCode).toBe(403);
      expect(response.body.code).toBe("BLOCKED");
    });

    it("1 request 2", async () => {
      const response = await request(apiURL)
        .post(`/social/requests/${user2.account_id}`)
        .set("Authorization", `Bearer ${user1.jwt}`)

      expect(response.statusCode).toBe(403);
      expect(response.body.code).toBe("BLOCKED");
    });

    it("1 unblock 2", async () => {
      const response = await request(apiURL)
        .delete(`/social/blocks/${user2.account_id}`)
        .set("Authorization", `Bearer ${user1.jwt}`)

      expect(response.statusCode).toBe(204);
    });

    it("1 request 2", async () => {
      const response = await request(apiURL)
        .post(`/social/requests/${user2.account_id}`)
        .set("Authorization", `Bearer ${user1.jwt}`)

      expect(response.statusCode).toBe(204);
    });
  }); // Block / Unblock

  describe("Multiple pending requests", () => {
    let sender;

    beforeAll(async () => {
      sender = users[8];
    })

    for (let i = 0; i < 8; ++i) {
      it(`8 request ${i}`, async () => {
        const response = await request(apiURL)
          .post(`/social/requests/${users[i].account_id}`)
          .set("Authorization", `Bearer ${sender.jwt}`)

        expect(response.statusCode).toBe(204);
      });
    }

    for (let i = 0; i < 8; ++i) {
      it(`${i} request 8`, async () => {
        const response = await request(apiURL)
          .post(`/social/requests/${sender.account_id}`)
          .set("Authorization", `Bearer ${users[i].jwt}`)

        expect(response.statusCode).toBe(204);
      });
    }

    it("Get friends", async () => {
      const response = await request(apiURL)
        .get('/social/friends')
        .set("Authorization", `Bearer ${sender.jwt}`);

      expect(response.body).toEqual(
        expect.arrayContaining(
          users.slice(0, users.length - 2).map(u => {
            return {
              account_id: u.account_id
            }
          })
        )
      );
      expect(response.body.length).toEqual(users.length - 2);
    });
  });
});
