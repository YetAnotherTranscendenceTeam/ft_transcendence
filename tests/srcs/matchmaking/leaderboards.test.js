import request from "superwstest";
import { GameModes } from "./gamemodes";
import { apiURL } from "../../URLs";
import { createUsers, users, app } from "../../dummy/dummy-account";

createUsers(1);

describe("GET /matchmaking/leaderboards/", () => {

  describe("Body", () => {

    const isSortedDescending = (arr) => arr.every((v, i) => i === 0 || v.rating <= arr[i - 1].rating);

    it("ok", async () => {
      const response = await request(apiURL)
        .get("/matchmaking/leaderboards")
        .set("Authorization", `Bearer ${app.jwt.sign({})}`);

      expect(response.statusCode).toBe(200);

      const body = response.body;
      expect(body.update_after).toEqual(expect.any(Number));
      expect(body.leaderboards).toBeInstanceOf(Array);
      expect(body.leaderboards).toEqual([
        { mode: "ranked_1v1", rankings: expect.any(Array) },
        { mode: "ranked_2v2", rankings: expect.any(Array) },
      ]);

      for (const bracket of body.leaderboards) {
        bracket.rankings.forEach(player => {
          expect(player).toEqual({
            account_id: expect.any(Number),
            rating: expect.any(Number),
            username: expect.any(String),
          });
        });

        expect(isSortedDescending(bracket.rankings)).toBe(true);
      }
    });

  }); // Body

});
