import request from "supertest";
import { createUsers, users } from "../../dummy/dummy-account.js";
import { apiURL } from "../../URLs.js";
import YATT, { properties } from "../../../modules/yatt-utils/srcs/index.js";

createUsers(50);

describe("USERS: GET /", () => {
  describe("limit/offset", () => {
    const save = {
      at: 5
    }

    it("default limit", async () => {
      const response = await request(apiURL)
        .get("/users")
        .set('Authorization', `Bearer ${users[0].jwt}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            account_id: expect.any(Number),
            username: expect.any(String),
            avatar: expect.any(String),
            created_at: expect.any(String),
            updated_at: expect.any(String),
          }),
        ])
      );
      expect(response.body.length).toBe(properties.limit.default);

      save.value = response.body[save.at];
    });

    it("custom limit", async () => {
      const limit = 23;
      const response = await request(apiURL)
        .get(`/users?limit=${limit}`)
        .set('Authorization', `Bearer ${users[0].jwt}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            account_id: expect.any(Number),
            username: expect.any(String),
            avatar: expect.any(String),
            created_at: expect.any(String),
            updated_at: expect.any(String),
          }),
        ])
      );
      expect(response.body.length).toBe(limit);
    });

    it("custom offset", async () => {
      const offset = save.at;
      const response = await request(apiURL)
        .get(`/users?offset=${offset}`)
        .set('Authorization', `Bearer ${users[0].jwt}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            account_id: expect.any(Number),
            username: expect.any(String),
            avatar: expect.any(String),
            created_at: expect.any(String),
            updated_at: expect.any(String),
          }),
        ])
      );
      expect(response.body.length).toBe(properties.limit.default);
      expect(response.body[0]).toMatchObject(save.value);
    });
  })

  describe("username", () => {
    it("one filter", async () => {
      const index = Math.floor(Math.random() * (users.length - 1));
      const username = users[index].username;
      const response = await request(apiURL)
        .get(`/users?filter[username]=${username}`)
        .set('Authorization', `Bearer ${users[0].jwt}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual([
        expect.objectContaining({
          account_id: users[index].account_id,
          username: users[index].username,
          avatar: expect.any(String),
          created_at: expect.any(String),
          updated_at: expect.any(String),
        }),
      ]);
    });

    it("multiple filters", async () => {
      const indexes = [5, 2, 25];
      const response = await request(apiURL)
        .get(`/users?filter[username]=${indexes.map(i => users[i].username).join(",")}`)
        .set('Authorization', `Bearer ${users[0].jwt}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(
        expect.arrayContaining(
          indexes.map(i => {
            return expect.objectContaining({
              account_id: users[i].account_id,
              username: users[i].username,
              avatar: expect.any(String),
              created_at: expect.any(String),
              updated_at: expect.any(String),
            })
          })
        )
      );
    });
  });

  describe("username:match", () => {
    it("one filter", async () => {
      const index = Math.floor(Math.random() * (users.length - 1));
      const username = users[index].username;
      const response = await request(apiURL)
        .get(`/users?filter[username]=${username}`)
        .set('Authorization', `Bearer ${users[0].jwt}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual([
        expect.objectContaining({
          account_id: users[index].account_id,
          username: users[index].username,
          avatar: expect.any(String),
          created_at: expect.any(String),
          updated_at: expect.any(String),
        }),
      ]);
    });

    it("multiple filters", async () => {
      const indexes = [5, 2, 25];
      const response = await request(apiURL)
        .get(`/users?filter[username]=${indexes.map(i => users[i].username).join(",")}`)
        .set('Authorization', `Bearer ${users[0].jwt}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(
        expect.arrayContaining(
          indexes.map(i => {
            return expect.objectContaining({
              account_id: users[i].account_id,
              username: users[i].username,
              avatar: expect.any(String),
              created_at: expect.any(String),
              updated_at: expect.any(String),
            })
          })
        )
      );
    });
  });
});
