
import request from "superwstest";

export const matchmakingURL = "http://localhost:4044";
export let GameModes;
it("fetch gamemodes", async () => {
  const response = await request(matchmakingURL).get("/gamemodes").expect(200);
  GameModes = response.body;
});
