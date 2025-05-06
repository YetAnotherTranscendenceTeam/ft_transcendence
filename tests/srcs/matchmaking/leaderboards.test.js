import request from "superwstest";
import { GameModes } from "./gamemodes";
import { apiURL } from "../../URLs";
import { createUsers, users, app } from "../../dummy/dummy-account";

createUsers(1);

describe("GET /matchmaking/leaderboards/", () => {

  describe("Authorization", () => {

    it("no auth header", async () => {
      const response = await request(apiURL)
        .get("/matchmaking/leaderboards")

      expect(response.statusCode).toBe(401);
    });

    it("garbage auth header", async () => {
      const response = await request(apiURL)
        .get("/matchmaking/leaderboards")
        .set("Authorization", "sdfsdf")

      expect(response.statusCode).toBe(401);
    });

    it("invalid jwt", async () => {
      const response = await request(apiURL)
        .get("/matchmaking/leaderboards")
        .set("Authorization", `Bearer ${app.jwt.token_manager.sign({})}`);

      expect(response.statusCode).toBe(401);
    });

    it("valid jwt", async () => {
      const response = await request(apiURL)
        .get("/matchmaking/leaderboards")
        .set("Authorization", `Bearer ${app.jwt.sign({})}`);

      expect(response.statusCode).toBe(200);
    });

  }); //Authorization

  describe("Body", () => {

    const isSortedDescending = (arr) => arr.every((v, i) => i === 0 || v.rating <= arr[i - 1].rating);

    it("ok", async () => {
      const response = await request(apiURL)
        .get("/matchmaking/leaderboards")
        .set("Authorization", `Bearer ${app.jwt.sign({})}`);

      expect(response.statusCode).toBe(200);

      const body = response.body;
      expect(body).toBeInstanceOf(Array);
      expect(body).toEqual([
        { mode: "ranked_1v1", rankings: expect.any(Array) },
        { mode: "ranked_2v2", rankings: expect.any(Array) },
      ]);

      for (const bracket of body) {
        bracket.rankings.forEach(player => {
          expect(player.account_id).toEqual(expect.any(Number));
          expect(player.rating).toEqual(expect.any(Number));
          if (player.profile !== null) {
            const profile = player.profile;

            expect(profile).toEqual({
              account_id: expect.any(Number),
              avatar: expect.any(String),
              created_at: expect.any(String),
              updated_at: expect.any(String),
              username: expect.any(String),
            });
          }
        });

        expect(isSortedDescending(bracket.rankings)).toBe(true);
      }
    });

  }); // Body

});
